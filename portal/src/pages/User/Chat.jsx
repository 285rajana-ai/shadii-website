import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from 'lucide-react';

export default function Chat() {
  const { token, user } = useAuth();
  const { socket, messages, setMessages, typingUsers, sendMessage, sendTyping, markSeen, registerOnMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [inputText, setInputText] = useState('');
  const [convsLoading, setConvsLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [query, setQuery] = useState('');
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
    const handleSubscription = () => {
      setWarning('Free message limit reached. Upgrade your membership to continue chatting.');
      setMessages((prev) => prev.filter((message) => !message._id?.startsWith('temp_')));
    };
    const handleError = (data) => {
      setWarning(data.error || 'Message could not be sent.');
      setMessages((prev) => prev.filter((message) => !message._id?.startsWith('temp_')));
    };

    socket.on('message:flagged', handleFlagged);
    socket.on('subscription:required', handleSubscription);
    socket.on('message:error', handleError);
    socket.on('user:online', updatePresence(true));
    socket.on('user:offline', updatePresence(false));

    return () => {
      socket.off('message:flagged', handleFlagged);
      socket.off('subscription:required', handleSubscription);
      socket.off('message:error', handleError);
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket, setMessages]);

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
      if (data.success) setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMsgsLoading(false);
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

  return (
    <div className="h-[calc(100vh-130px)] md:h-[calc(100vh-64px)] max-w-7xl mx-auto py-2">
      <div className="glass-panel flex h-full rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Soft atmospheric gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#800020]/5 to-transparent blur-3xl pointer-events-none" />

        {/* ==========================================
            LEFT PANEL: CONVERSATIONS LIST
            ========================================== */}
        <aside className={`flex w-full shrink-0 flex-col border-r border-[#D4AF37]/15 bg-white/70 backdrop-blur-md md:w-[22rem] z-10 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="border-b border-[#D4AF37]/15 p-5 bg-[#FCFBF7]/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl font-black text-[#580820] tracking-tight">Chats</h1>
                <p className="mt-0.5 text-xs font-bold text-[#1F1515]/45 uppercase tracking-wider">Approved connections</p>
              </div>
              <div className="grid h-10 w-10 place-items-center border border-[#D4AF37]/35 bg-[#FAF8F5] text-[#800020] rounded-xl shadow-sm">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1F1515]/30" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations..."
                className="w-full border border-[#D4AF37]/20 bg-white/80 focus:bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all py-2.5 pl-9 pr-3 text-sm text-[#1F1515] rounded-xl outline-none placeholder-[#1F1515]/30 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <Loading label="Opening secure inbox..." />
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm font-semibold text-[#1F1515]/40 mt-8">
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
        <main className={`min-w-0 flex-1 flex-col bg-white/40 backdrop-blur-sm z-10 ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv ? (
            <>
              {/* Chat Window Header */}
              <header className="flex items-center justify-between gap-4 border-b border-[#D4AF37]/15 bg-[#FCFBF7]/90 p-4 shadow-sm">
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
                    <h2 className="truncate font-serif text-lg font-black text-[#580820]">
                      {selectedConv.otherUser.name}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1F1515]/40 mt-0.5">
                      {typingUsers[selectedConv.otherUser.id] ? (
                        <span className="text-[#800020] animate-pulse">typing...</span>
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
                  className="inline-flex items-center gap-1.5 border border-red-800/30 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-50 transition-all rounded-lg cursor-pointer"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Block
                </button>
              </header>

              {/* Warnings Callout banner */}
              {warning && (
                <div className="flex items-start gap-3 border-b border-red-800/20 bg-red-50 p-4 text-xs font-semibold text-red-800">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 animate-bounce" />
                  <span>{warning}</span>
                </div>
              )}

              {/* Messages Feed View */}
              <section className="flex-1 overflow-y-auto bg-[#FCFBF7]/35 p-4">
                {msgsLoading ? (
                  <Loading label="Decrypting chat feed..." />
                ) : (
                  <div className="mx-auto flex max-w-3xl flex-col gap-4">
                    <div className="mx-auto inline-flex items-center gap-1.5 border border-[#D4AF37]/25 bg-white/80 px-3.5 py-1.5 text-[10px] font-black uppercase text-[#1F1515]/65 tracking-wider rounded-lg shadow-sm">
                      <Lock className="h-3.5 w-3.5 text-[#D4AF37]" />
                      End-to-End Encrypted Session
                    </div>
                    {messages.map((msg) => (
                      <MessageBubble key={msg._id} msg={msg} isMe={String(msg.sender) === String(user.id)} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </section>

              {/* Message Composer Form */}
              <form onSubmit={handleSend} className="flex gap-3 border-t border-[#D4AF37]/15 bg-[#FCFBF7]/90 p-4 shadow-inner">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type a respectful partner matchmaking message..."
                  className="min-w-0 flex-1 border border-[#D4AF37]/25 bg-white focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all px-4 py-3 text-sm text-[#1F1515] rounded-xl outline-none font-medium placeholder-[#1F1515]/30"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn-premium-primary inline-flex min-w-14 items-center justify-center px-5 py-3 rounded-xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="grid h-full place-items-center bg-[#FAF8F5]/35 p-10 text-center">
              <div>
                <Sparkles className="mx-auto h-12 w-12 text-[#D4AF37] mb-4" />
                <h2 className="font-serif text-2xl font-black text-[#580820]">Select a chat</h2>
                <p className="mt-2 max-w-xs text-sm text-[#1F1515]/50 font-medium">
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
      className={`flex w-full gap-3 border-b border-[#D4AF37]/10 p-4 text-left transition-all duration-200 hover:bg-white/60 ${
        selected ? 'bg-white shadow-[inset_4px_0_0_#800020] bg-gradient-to-r from-white/80 to-transparent' : ''
      }`}
    >
      <Avatar user={conv.otherUser} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-serif text-base font-black text-[#580820]">{conv.otherUser.name}</h3>
          <span className="shrink-0 text-[10px] font-bold text-[#1F1515]/40">
            {conv.lastMessage?.createdAt
              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
        </div>
        <p className={`mt-1 truncate text-xs font-medium ${conv.unreadCount > 0 ? 'font-bold text-[#800020]' : 'text-[#1F1515]/50'}`}>
          {conv.lastMessage?.isMine ? 'You: ' : ''}
          {conv.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
      {conv.unreadCount > 0 && (
        <span className="grid h-5 min-w-5 place-items-center bg-[#800020] text-white text-[10px] font-black rounded-full shadow-sm ring-2 ring-white">
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
          className={`${dimensions} image-fallback object-cover border border-[#D4AF37]/25 rounded-xl shadow-sm`}
        />
      ) : (
        <div className={`${dimensions} grid place-items-center border border-[#D4AF37]/25 bg-[#FAF8F5] text-xs font-black rounded-xl text-[#800020] shadow-sm`}>
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
            ? 'border-[#800020]/20 bg-gradient-to-br from-[#800020] to-[#580820] text-white rounded-tr-none'
            : 'border-[#D4AF37]/15 bg-white text-[#1F1515] rounded-tl-none'
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
        <div className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] font-bold ${isMe ? 'text-white/60' : 'text-[#1F1515]/45'}`}>
          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && <CheckCheck className={`h-3.5 w-3.5 ${msg.status === 'seen' ? 'text-[#D4AF37]' : 'text-white/30'}`} />}
        </div>
      </div>
    </div>
  );
}

function Loading({ label }) {
  return (
    <div className="grid h-full min-h-[12rem] place-items-center text-sm text-[#1F1515]/50">
      <span className="inline-flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#800020]" />
        <span className="font-semibold uppercase tracking-wider text-[10px]">{label}</span>
      </span>
    </div>
  );
}
