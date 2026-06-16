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
    <div className="max-w-7xl mx-auto h-[calc(100vh-112px)] px-4 py-7 sm:px-6 lg:px-8">
      <div className="surface-panel flex h-full min-h-[36rem] overflow-hidden">
        <aside className={`flex w-full shrink-0 flex-col border-r border-[#e5d8bd] bg-[#fffaf1] md:w-[22rem] ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="border-b border-[#e5d8bd] bg-white/85 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#871635]">Messages</h1>
                <p className="mt-1 text-xs text-[#665c58]">Private conversations with approved matches</p>
              </div>
              <div className="grid h-10 w-10 place-items-center border border-[#d8bd78] bg-[#fbf3e4] text-[#871635]">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aa9673]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                className="w-full border border-[#e1d2b6] bg-[#fffdf8] py-2.5 pl-9 pr-3 text-sm text-[#322421]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <Loading label="Loading inbox..." />
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#8a7670]">
                No active conversations yet.
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

        <main className={`min-w-0 flex-1 flex-col bg-white ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv ? (
            <>
              <header className="flex items-center justify-between gap-4 border-b border-[#e5d8bd] bg-[#fffaf1] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="button-secondary px-3 py-2 text-xs font-bold md:hidden">
                    Back
                  </button>
                  <Avatar user={selectedConv.otherUser} size="lg" />
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-xl font-bold text-[#871635]">
                      {selectedConv.otherUser.name}
                    </h2>
                    <p className="text-xs font-semibold text-[#665c58]">
                      {typingUsers[selectedConv.otherUser.id]
                        ? 'typing...'
                        : selectedConv.otherUser.isOnline
                          ? 'Online now'
                          : 'Offline'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={blockUser}
                  className="inline-flex items-center gap-2 border border-[#d95656] px-3 py-2 text-xs font-bold uppercase text-[#b23b3b] hover:bg-[#fff4f4]"
                >
                  <Ban className="h-4 w-4" />
                  Block
                </button>
              </header>

              {warning && (
                <div className="flex items-start gap-2 border-b border-[#d9a3a3] bg-[#fff4f5] p-3 text-sm text-[#871635]">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{warning}</span>
                </div>
              )}

              <section className="flex-1 overflow-y-auto bg-[#fcf8ef] p-4">
                {msgsLoading ? (
                  <Loading label="Retrieving conversation..." />
                ) : (
                  <div className="mx-auto flex max-w-3xl flex-col gap-4">
                    <div className="mx-auto inline-flex items-center gap-2 border border-[#e5d8bd] bg-white px-3 py-1.5 text-[11px] font-bold uppercase text-[#665c58]">
                      <Lock className="h-3.5 w-3.5 text-[#b6903f]" />
                      Secure chat session
                    </div>
                    {messages.map((msg) => (
                      <MessageBubble key={msg._id} msg={msg} isMe={String(msg.sender) === String(user.id)} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </section>

              <form onSubmit={handleSend} className="flex gap-3 border-t border-[#e5d8bd] bg-white p-4">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type a respectful message..."
                  className="min-w-0 flex-1 border border-[#e1d2b6] bg-[#fffdf8] px-4 py-3 text-sm text-[#322421]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="button-primary inline-flex min-w-14 items-center justify-center px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="grid h-full place-items-center bg-[#fcf8ef] p-10 text-center">
              <div>
                <Sparkles className="mx-auto h-10 w-10 text-[#b6903f]" />
                <h2 className="mt-4 font-serif text-3xl font-bold text-[#871635]">Select a match</h2>
                <p className="mt-2 max-w-sm text-sm text-[#665c58]">
                  Choose a conversation to continue a private, respectful matchmaking chat.
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
      className={`flex w-full gap-3 border-b border-[#eadfc9] p-4 text-left transition-colors hover:bg-white ${
        selected ? 'bg-white shadow-[inset_4px_0_0_#871635]' : ''
      }`}
    >
      <Avatar user={conv.otherUser} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-serif text-base font-bold text-[#322421]">{conv.otherUser.name}</h3>
          <span className="shrink-0 text-[10px] text-[#9b8c83]">
            {conv.lastMessage?.createdAt
              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
        </div>
        <p className={`mt-1 truncate text-xs ${conv.unreadCount > 0 ? 'font-bold text-[#871635]' : 'text-[#665c58]'}`}>
          {conv.lastMessage?.isMine ? 'You: ' : ''}
          {conv.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
      {conv.unreadCount > 0 && (
        <span className="grid h-5 min-w-5 place-items-center bg-[#871635] px-1 text-[10px] font-bold text-white">
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
          className={`${dimensions} image-fallback object-cover border border-[#e1d2b6]`}
        />
      ) : (
        <div className={`${dimensions} grid place-items-center border border-[#e1d2b6] bg-[#fbf3e4] text-sm font-bold text-[#871635]`}>
          {getInitials(user?.name)}
        </div>
      )}
      {user?.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 border border-white bg-[#18784f]" />}
    </div>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] border px-4 py-3 text-sm shadow-sm ${
          isMe
            ? 'border-[#871635] bg-[#871635] text-white'
            : 'border-[#e5d8bd] bg-white text-[#322421]'
        }`}
      >
        {msg.isFlagged ? (
          <p className="flex items-center gap-2 italic text-[#ffcaca]">
            <ShieldAlert className="h-4 w-4" />
            Message flagged for safety review
          </p>
        ) : (
          <p className="break-words leading-6">{msg.content}</p>
        )}
        <div className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${isMe ? 'text-white/70' : 'text-[#8a7670]'}`}>
          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && <CheckCheck className={`h-3.5 w-3.5 ${msg.status === 'seen' ? 'text-[#d8bd78]' : ''}`} />}
        </div>
      </div>
    </div>
  );
}

function Loading({ label }) {
  return (
    <div className="grid h-full min-h-[12rem] place-items-center text-sm text-[#665c58]">
      <span className="inline-flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[#b6903f]" />
        {label}
      </span>
    </div>
  );
}

