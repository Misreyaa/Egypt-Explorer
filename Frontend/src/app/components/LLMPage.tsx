import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageSquare, Send, Bot, User, Lock, History, Plus } from 'lucide-react';
import { askRag, healthCheck, login } from '../api/rag';
import { useUser } from '../context/UserContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

const sampleResponses = [
  "That's a great question about Egypt! Based on your interests, I'd recommend...",
  "Egyptian culture is rich and diverse. Let me share some insights...",
  "The best time to visit depends on what you want to experience. Summer can be hot, but...",
  "Ancient Egyptian history spans over 3000 years. Here are the key periods you should know...",
  "For authentic Egyptian cuisine, you must try koshari, ful medames, and ta'ameya...",
];

export const LLMPage: React.FC = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Egyptian Culture Chat',
      messages: [
        {
          role: 'assistant',
          content: "Hello! I'm your Egyptian culture assistant. Ask me anything about Egypt - from travel tips to historical facts, cultural customs, or recommendations for your trip!",
          timestamp: new Date(),
        },
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('1');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession.messages, isTyping]);

  // Initialize backend & token
  useEffect(() => {
    let cancelled = false;

    const initializeBackend = async () => {
      try {
        const ok = await healthCheck();
        if (!cancelled) setBackendOnline(ok);
      } catch {
        if (!cancelled) setBackendOnline(false);
      }
    };

    const initializeToken = async () => {
      try {
        let currentToken = localStorage.getItem('ragToken');
        if (!currentToken) {
          currentToken = await login();
          if (!cancelled) {
            setToken(currentToken);
            localStorage.setItem('ragToken', currentToken);
          }
        } else {
          if (!cancelled) setToken(currentToken);
        }
      } catch (err) {
        console.error('Failed to initialize token:', err);
        if (!cancelled) setError('Failed to connect to authentication service.');
      }
    };

    initializeBackend();
    initializeToken();

    return () => { cancelled = true; };
  }, []);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `New Chat ${sessions.length + 1}`,
      messages: [
        {
          role: 'assistant',
          content: "How can I help you with Egyptian culture today?",
          timestamp: new Date()
        }
      ]
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setSessions(prev =>
      prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMessage] } : s)
    );

    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      let currentToken = token;
      if (!currentToken) {
        currentToken = await login();
        setToken(currentToken);
        localStorage.setItem('ragToken', currentToken);
      }

      // Ask RAG backend
      console.log(currentToken)
      const answer = await askRag({ query: userMessage.content, limit: 5 });
      const assistantMessage: Message = {
        role: 'assistant',
        content: answer.response,
        timestamp: new Date(),
      };

      setSessions(prev =>
        prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMessage] } : s)
      );
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong contacting the assistant.');

      // Fallback to sample response
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      const fallbackMessage: Message = {
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };
      setSessions(prev =>
        prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, fallbackMessage] } : s)
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-muted/20 flex flex-col shrink-0">
        <div className="p-4 border-b bg-background/50">
          <Button onClick={handleNewChat} className="w-full gap-2 shadow-sm" variant="outline">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <History className="h-3 w-3" /> Chat History
            </div>
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all truncate ${activeSessionId === session.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted font-medium text-muted-foreground'
                  }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        <header className="h-16 border-b flex items-center px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 leading-none">Egypt Explorer AI</h2>
              <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-tighter">Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {activeSession.messages.map((message, index) => (
              <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                    <AvatarFallback className="bg-emerald-50 text-emerald-600">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  <span className={`text-[10px] mt-2 block font-medium ${message.role === 'user' ? 'opacity-60' : 'text-slate-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                    <AvatarFallback className="bg-slate-100 text-slate-600">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 border shadow-sm shrink-0">
                  <AvatarFallback className="bg-emerald-50 text-emerald-600">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-duration:0.8s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Input */}
        <footer className="p-6 bg-background border-t">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <Input
                placeholder="Message Egypt Explorer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-14 py-7 rounded-2xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50/50 shadow-inner text-base"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 h-11 w-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors p-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
              Powered by your Egyptian Culture Guide • History is saved to your session
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};