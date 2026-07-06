import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getInitials, getProfilePhotoSrc } from '../../lib/profile';
import {
  Ban,
  CheckCheck,
  Loader2,
  Lock,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  UserRound,
  ChevronLeft,
  Crown,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export default function Chat() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { socket, messages, setMessages, typingUsers, sendMessage, sendTyping, markSeen, registerOnMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [inputText, setInputText] = useState('');
  const [convsLoading, setConvsLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [query, setQuery] = useState('');
  const [chatAccess, setChatAccess] = useState(null);
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const messagesEndRef = useRef(null);
  const typingRef = useRef(0);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => conv.otherUser?.name?.toLowerCase().includes(q));
  }, [conversations, query]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.otherUser.id);
      markSeen(selectedConv.conversationId);
    }
  }, [selectedConv?.conversationId]);

  useEffect(() => {
    const unregister = registerOnMessage((msg) => {
      if (selectedConv && msg.conversationId === selectedConv.conversationId) {
        markSeen(selectedConv.conversationId);
      }
      if (msg.chatAccess && selectedConv && msg.conversationId === selectedConv.conversationId) {
        setChatAccess(msg.chatAccess);
      }
      fetchConversations();
    });

    return unregister;
  }, [selectedConv?.conversationId, registerOnMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleFlagged = (data) => {
      setWarning(`Sharing ${data.label || 'contact info'} is blocked for member safety. Repeated flags may suspend the account.`);
      setMessages((prev) => prev.filter((message) => !message._id?.startsWith('temp_')));
    };
    const handleSubscription = (data) => {
      setWarning('Free message limit reached. Upgrade your membership to continue chatting.');
      setMessages((prev) => prev.filter((message) => !message._id?.startsWith('temp_')));
      if (data?.chatAccess) setChatAccess(data.chatAccess);
    };
    const handleError = (data) => {
      setWarning(data.error || 'Message could not be sent.');
      setMessages((prev) => prev.filter((message) => !message._id?.startsWith('temp_')));
      if (data?.chatAccess) setChatAccess(data.chatAccess);
    };
    const handleSentConfirmation = (data) => {
      if (selectedConv && data.conversationId === selectedConv.conversationId) {
        if (data.chatAccess) setChatAccess(data.chatAccess);
      }
    };

    socket.on('message:flagged', handleFlagged);
    socket.on('subscription:required', handleSubscription);
    socket.on('message:error', handleError);
    socket.on('message:sent', handleSentConfirmation);
    socket.on('user:online', updatePresence(true));
    socket.on('user:offline', updatePresence(false));

    return () => {
      socket.off('message:flagged', handleFlagged);
      socket.off('subscription:required', handleSubscription);
      socket.off('message:error', handleError);
      socket.off('message:sent', handleSentConfirmation);
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket, setMessages, selectedConv?.conversationId]);

  const updatePresence = (isOnline) => ({ userId }) => {
    setConversations((prev) => prev.map((conv) => (
      String(conv.otherUser.id) === String(userId)
        ? { ...conv, otherUser: { ...conv.otherUser, isOnline } }
        : conv
    )));
    setSelectedConv((prev) => (
      prev && String(prev.otherUser.id) === String(userId)
        ? { ...prev, otherUser: { ...prev.otherUser, isOnline } }
        : prev
    ));
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setConvsLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    setMsgsLoading(true);
    setWarning('');
    try {
      const res = await fetch(`${API_BASE}/chat/${otherUserId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setChatAccess(data.chatAccess || null);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMsgsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!selectedConv) return;
    setAcceptingInvite(true);
    setWarning('');
    try {
      const res = await fetch(`${API_BASE}/profile/photo-requests/${selectedConv.otherUser.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (!data.success) {
        setWarning(data.message || 'Could not accept request.');
        return;
      }
      await fetchMessages(selectedConv.otherUser.id);
      fetchConversations();
    } catch (_) {
      setWarning('Connection error. Please try again.');
    } finally {
      setAcceptingInvite(false);
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    const content = inputText.trim();
    if (!content || !selectedConv) return;

    setWarning('');
    const clientMessageId = `web_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const tempMsg = {
      _id: `temp_${clientMessageId}`,
      clientMessageId,
      sender: user.id,
      receiver: selectedConv.otherUser.id,
      conversationId: selectedConv.conversationId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, tempMsg]);
    sendMessage(selectedConv.otherUser.id, content, selectedConv.conversationId, clientMessageId);
    setInputText('');
  };

  const blockUser = async () => {
    if (!selectedConv) return;
    if (!window.confirm(`Block ${selectedConv.otherUser.name}? You can manage blocked users from settings later.`)) return;

    try {
      const res = await fetch(`${API_BASE}/profile/block/${selectedConv.otherUser.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedConv(null);
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to block:', err);
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    if (!selectedConv) return;

    const now = Date.now();
    if (now - typingRef.current > 1400) {
      typingRef.current = now;
      sendTyping(selectedConv.otherUser.id);
    }
  };

  const canChat = chatAccess ? chatAccess.canSend : true;
  const needsInviteAcceptance = chatAccess?.reason === 'accept_invite' || (chatAccess?.incomingRequestPending && !chatAccess?.isApproved);
  const waitingForAcceptance = chatAccess?.reason === 'waiting_for_acceptance';
  const needsSubscription = chatAccess?.reason === 'subscription_required';

  return (
    <div className="h-[calc(100vh-130px)] md:h-[calc(100vh-64px)] max-w-7xl mx-auto py-2">
      <div className="glass-panel flex h-full rounded-2xl overflow-hidden shadow-sm relative border border-[#E7DED3] bg-white">
        {/* Soft background decorative radial gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#8A1538]/5 to-transparent blur-3xl pointer-events-none" />

        {/* ==========================================
            LEFT PANEL: CONVERSATIONS LIST
            ========================================== */}
        <aside className={`flex w-full shrink-0 flex-col border-r border-[#E7DED3] bg-white z-10 md:w-[22rem] ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="border-b border-[#E7DED3] p-5 bg-[#FAF7F2]/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl font-black text-[#8A1538] tracking-tight">Chats</h1>
                <p className="mt-0.5 text-xs font-bold text-[#5F6673]/50 uppercase tracking-wider">Approved connections</p>
              </div>
              <div className="grid h-10 w-10 place-items-center border border-[#E7DED3] bg-white text-[#8A1538] rounded-xl shadow-sm">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6673]/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations..."
                className="w-full border border-[#E7DED3] bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-all py-2.5 pl-9 pr-3 text-sm text-[#202124] rounded-xl outline-none placeholder-[#5F6673]/30 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {convsLoading ? (
              <Loading label="Opening secure inbox..." />
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm font-semibold text-[#5F6673]/40 mt-8">
                No active chat connections yet.
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationButton
                  key={conv.conversationId}
                  conv={conv}
                  selected={selectedConv?.conversationId === conv.conversationId}
                  onClick={() => setSelectedConv(conv)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ==========================================
            RIGHT PANEL: MESSAGES WORKSPACE
            ========================================== */}
        <main className={`min-w-0 flex-1 flex-col bg-[#FAF7F2]/30 z-10 ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat Window Header */}
              <header className="flex items-center justify-between gap-4 border-b border-[#E7DED3] bg-white p-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <button 
                    onClick={() => setSelectedConv(null)} 
                    className="btn-premium-secondary px-3 py-2 text-xs font-bold md:hidden rounded-lg flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <Avatar user={selectedConv.otherUser} size="lg" />
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-lg font-black text-[#8A1538]">
                      {selectedConv.otherUser.name}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#5F6673]/45 mt-0.5">
                      {typingUsers[selectedConv.otherUser.id] ? (
                        <span className="text-[#8A1538] animate-pulse">typing...</span>
                      ) : selectedConv.otherUser.isOnline ? (
                        <span className="text-emerald-700">Online now</span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={blockUser}
                  className="inline-flex items-center gap-1.5 border border-red-800/20 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-50 transition-all rounded-lg cursor-pointer"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Block
                </button>
              </header>

              {/* Warnings Callout banner */}
              {warning && (
                <div className="flex items-start gap-3 border-b border-red-800/10 bg-red-50 p-4 text-xs font-semibold text-red-800">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 animate-bounce" />
                  <span>{warning}</span>
                </div>
              )}

              {/* Messages Feed View */}
              <section className="flex-1 overflow-y-auto bg-[#FAF7F2]/20 p-4">
                {msgsLoading ? (
                  <Loading label="Decrypting chat feed..." />
                ) : (
                  <div className="mx-auto flex max-w-3xl flex-col gap-4">
                    <div className="mx-auto inline-flex items-center gap-1.5 border border-[#E7DED3] bg-white px-3.5 py-1.5 text-[10px] font-black uppercase text-[#5F6673]/65 tracking-wider rounded-lg shadow-sm">
                      <Lock className="h-3.5 w-3.5 text-[#245C54]" />
                      End-to-End Encrypted Session
                    </div>
                    {messages.map((msg) => (
                      <MessageBubble key={msg._id} msg={msg} isMe={String(msg.sender) === String(user.id)} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </section>

              {/* Gating Logic Composer Wrapper */}
              {canChat ? (
                /* Message Composer Form */
                <form onSubmit={handleSend} className="flex gap-3 border-t border-[#E7DED3] bg-white p-4 shadow-sm">
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={chatAccess?.sentByMe === 0 ? 'Send a respectful intro message...' : 'Type a respectful partner matchmaking message...'}
                    className="min-w-0 flex-1 border border-[#E7DED3] bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] transition-all px-4 py-3 text-sm text-[#202124] rounded-xl outline-none font-medium placeholder-[#5F6673]/30"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="btn-premium-primary inline-flex min-w-14 items-center justify-center px-5 py-3 rounded-xl disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </form>
              ) : (
                /* Secure Gated Lock Block */
                <div className="flex flex-col items-center justify-center bg-white border-t border-[#E7DED3] p-6 text-center gap-3 shadow-md">
                  <span className="grid h-12 w-12 place-items-center border border-[#8A1538]/20 bg-[#FCE8EF] text-[#8A1538] rounded-full shadow-sm animate-pulse">
                    {needsInviteAcceptance ? (
                      <ShieldCheck className="h-5 w-5 text-[#8A1538]" />
                    ) : needsSubscription ? (
                      <Crown className="h-5 w-5 text-[#8A1538]" />
                    ) : (
                      <Lock className="h-5 w-5 text-[#8A1538]" />
                    )}
                  </span>
                  <div>
                    <h3 className="font-serif font-black text-md text-[#8A1538]">
                      {needsInviteAcceptance
                        ? 'Rishta Invite Received'
                        : needsSubscription
                          ? 'Premium Subscription Required'
                          : 'Approval Pending'}
                    </h3>
                    <p className="mt-1 text-xs text-[#5F6673] font-semibold max-w-md leading-relaxed">
                      {needsInviteAcceptance
                        ? 'Accept this connection invite to view their profile details and reply for free.'
                        : needsSubscription
                          ? 'Both free intro messages are used. Upgrade to a premium plan to continue this conversation.'
                          : 'Your intro has been sent. You can continue after they accept and send a reply.'}
                    </p>
                  </div>
                  {needsInviteAcceptance && (
                    <button
                      onClick={handleAcceptInvite}
                      disabled={acceptingInvite}
                      className="btn-premium-primary px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {acceptingInvite ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Accept Invite'}
                    </button>
                  )}
                  {needsSubscription && (
                    <button
                      onClick={() => navigate('/billing')}
                      className="btn-premium-primary px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      View Packages
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center bg-[#FAF7F2]/10 p-10 text-center">
              <div>
                <Sparkles className="mx-auto h-12 w-12 text-[#8A1538] opacity-35 mb-4" />
                <h2 className="font-serif text-2xl font-black text-[#8A1538]">Select a chat</h2>
                <p className="mt-2 max-w-xs text-sm text-[#5F6673] font-medium">
                  Choose an approved matchmaking connection to continue your private conversation.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ConversationButton({ conv, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full gap-3 border-b border-[#E7DED3]/40 p-4 text-left transition-all duration-200 hover:bg-[#FAF7F2]/45 ${
        selected ? 'bg-[#FCE8EF] shadow-[inset_4px_0_0_#8A1538] bg-gradient-to-r from-[#FCE8EF]/40 to-transparent' : ''
      }`}
    >
      <Avatar user={conv.otherUser} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-serif text-base font-black text-[#202124]">{conv.otherUser.name}</h3>
          <span className="shrink-0 text-[10px] font-bold text-[#5F6673]/50">
            {conv.lastMessage?.createdAt
              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
        </div>
        <p className={`mt-1 truncate text-xs font-semibold ${conv.unreadCount > 0 ? 'font-bold text-[#8A1538]' : 'text-[#5F6673]/65'}`}>
          {conv.lastMessage?.isMine ? 'You: ' : ''}
          {conv.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
      {conv.unreadCount > 0 && (
        <span className="grid h-5 min-w-5 place-items-center bg-[#8A1538] text-white text-[10px] font-black rounded-full shadow-sm ring-2 ring-white">
          {conv.unreadCount}
        </span>
      )}
    </button>
  );
}

function Avatar({ user, size = 'md' }) {
  const dimensions = size === 'lg' ? 'h-12 w-12' : 'h-11 w-11';
  return (
    <div className="relative shrink-0">
      {getProfilePhotoSrc(user) ? (
        <img
          src={getProfilePhotoSrc(user)}
          alt={user?.name || 'Member'}
          onError={(event) => { event.currentTarget.src = '/avatar-placeholder.svg'; }}
          className={`${dimensions} image-fallback object-cover border border-[#E7DED3] rounded-xl shadow-sm`}
        />
      ) : (
        <div className={`${dimensions} grid place-items-center border border-[#E7DED3] bg-[#FAF7F2] text-xs font-black rounded-xl text-[#8A1538] shadow-sm`}>
          {getInitials(user?.name)}
        </div>
      )}
      {user?.isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 border-2 border-white bg-emerald-600 rounded-full shadow-[0_0_8px_#05cd99]" />
      )}
    </div>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 text-sm rounded-2xl shadow-sm border ${
          isMe
            ? 'border-[#8A1538]/20 bg-gradient-to-br from-[#8A1538] to-[#B84A69] text-white rounded-tr-none'
            : 'border-[#E7DED3] bg-white text-[#202124] rounded-tl-none'
        }`}
      >
        {msg.isFlagged ? (
          <p className="flex items-center gap-1.5 italic font-medium text-red-200/90 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-300" />
            Message blocked for verification review
          </p>
        ) : (
          <p className="break-words leading-relaxed font-medium">{msg.content}</p>
        )}
        <div className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] font-bold ${isMe ? 'text-white/65' : 'text-[#5F6673]/60'}`}>
          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && <CheckCheck className={`h-3.5 w-3.5 ${msg.status === 'seen' ? 'text-[#FAF8F5]' : 'text-white/30'}`} />}
        </div>
      </div>
    </div>
  );
}

function Loading({ label }) {
  return (
    <div className="grid h-full min-h-[12rem] place-items-center text-sm text-[#202124]/50">
      <span className="inline-flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#8A1538]" />
        <span className="font-semibold uppercase tracking-wider text-[10px]">{label}</span>
      </span>
    </div>
  );
}
