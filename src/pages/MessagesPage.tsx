import { useState, useEffect, useRef, FormEvent } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';

interface Chat {
  id: string;
  participants: string[];
  updatedAt: any;
  lastMessage?: string;
  otherUser?: UserProfile;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

export default function MessagesPage({ user }: { user: User }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch chats
  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = await Promise.all(snapshot.docs.map(async (chatDoc) => {
        const data = chatDoc.data();
        const otherUserId = data.participants.find((id: string) => id !== user.uid);
        
        let otherUser = null;
        if (otherUserId) {
          const userSnap = await getDoc(doc(db, 'users', otherUserId));
          if (userSnap.exists()) {
            otherUser = userSnap.data() as UserProfile;
          }
        }

        return {
          id: chatDoc.id,
          ...data,
          otherUser
        } as Chat;
      }));
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Handle URL query parameter for direct messaging
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetUserId = params.get('userId');
    
    if (targetUserId && targetUserId !== user.uid) {
      const initDirectChat = async () => {
        // Check if chat already exists in local state
        const existingChat = chats.find(c => c.participants.includes(targetUserId));
        if (existingChat) {
          setSelectedChat(existingChat);
          // Remove query param without reloading
          navigate('/messages', { replace: true });
          return;
        }

        // If not in local state, fetch the user and start chat
        try {
          const userSnap = await getDoc(doc(db, 'users', targetUserId));
          if (userSnap.exists()) {
            const otherUser = userSnap.data() as UserProfile;
            await startChat(otherUser);
            navigate('/messages', { replace: true });
          }
        } catch (error) {
          console.error("Error starting direct chat:", error);
        }
      };
      
      // Wait a bit for chats to load before trying to create a new one
      if (chats.length >= 0) {
        initDirectChat();
      }
    }
  }, [location.search, chats, user.uid, navigate]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      scrollToBottom();
      
      // Mark as read
      msgs.forEach(msg => {
        if (!msg.read && msg.senderId !== user.uid) {
          updateDoc(doc(db, 'chats', selectedChat.id, 'messages', msg.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [selectedChat, user.uid]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Fetch all users for new chat
  useEffect(() => {
    if (!showNewChat) return;
    
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== user.uid);
      setUsers(usersData);
    };
    
    fetchUsers();
  }, [showNewChat, user.uid]);

  const startChat = async (otherUser: UserProfile) => {
    // Check if chat already exists
    const existingChat = chats.find(c => c.participants.includes(otherUser.uid));
    if (existingChat) {
      setSelectedChat(existingChat);
      setShowNewChat(false);
      return;
    }

    // Create new chat
    const participants = [user.uid, otherUser.uid].sort();
    const chatId = participants.join('_');
    
    await setDoc(doc(db, 'chats', chatId), {
      participants,
      updatedAt: serverTimestamp(),
      lastMessage: ''
    });

    setSelectedChat({
      id: chatId,
      participants,
      updatedAt: new Date(),
      otherUser
    });
    setShowNewChat(false);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const text = newMessage.trim();
    setNewMessage('');

    await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      read: false
    });

    await updateDoc(doc(db, 'chats', selectedChat.id), {
      updatedAt: serverTimestamp(),
      lastMessage: text
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-[calc(100vh-8rem)]">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-900">Messages</h2>
          <button 
            onClick={() => setShowNewChat(true)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <MessageCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>Aucun message pour le moment.</p>
              <button 
                onClick={() => setShowNewChat(true)}
                className="mt-4 text-indigo-600 font-medium hover:underline"
              >
                Démarrer une conversation
              </button>
            </div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 ${selectedChat?.id === chat.id ? 'bg-indigo-50/50' : ''}`}
              >
                <img 
                  src={chat.otherUser?.photoURL || `https://ui-avatars.com/api/?name=${chat.otherUser?.displayName}&background=random`} 
                  alt={chat.otherUser?.displayName}
                  className="w-12 h-12 rounded-full bg-slate-200 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{chat.otherUser?.displayName}</h3>
                    {chat.updatedAt && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {formatDistanceToNow(chat.updatedAt?.toDate ? chat.updatedAt.toDate() : new Date(), { addSuffix: true, locale: fr })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{chat.lastMessage || 'Nouvelle conversation'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area - Chat View */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
              <button 
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <img 
                src={selectedChat.otherUser?.photoURL || `https://ui-avatars.com/api/?name=${selectedChat.otherUser?.displayName}&background=random`} 
                alt={selectedChat.otherUser?.displayName}
                className="w-10 h-10 rounded-full bg-slate-200 object-cover"
              />
              <div>
                <h3 className="font-semibold text-slate-900">{selectedChat.otherUser?.displayName}</h3>
                <p className="text-xs text-slate-500 capitalize">{selectedChat.otherUser?.role}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map(msg => {
                const isMe = msg.senderId === user.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {msg.createdAt ? formatDistanceToNow(msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(), { addSuffix: true, locale: fr }) : 'à l\'instant'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-slate-100 border-transparent rounded-full px-4 py-2 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <MessageCircle size={48} className="mb-4 opacity-20" />
            <p>Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-lg">Nouvelle conversation</h2>
              <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {users
                .filter(u => u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(u => (
                  <button
                    key={u.uid}
                    onClick={() => startChat(u)}
                    className="w-full p-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                  >
                    <img 
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=random`} 
                      alt={u.displayName}
                      className="w-10 h-10 rounded-full bg-slate-200 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{u.displayName}</h3>
                      <p className="text-xs text-slate-500 capitalize">{u.role}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
