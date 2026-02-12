import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MessageSquare, Send, Bot, User, Lock } from 'lucide-react';
import { askRag, healthCheck, login, PlaceSummary } from '../api/rag';
import { useUser } from '../context/UserContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantMessage extends Message {
  places?: PlaceSummary[] | null;
}

export const LLMPage: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<(Message | AssistantMessage)[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Egyptian culture assistant. Ask me anything about Egypt - from travel tips to historical facts, cultural customs, or recommendations for your trip!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initializeBackend = async () => {
      try {
        const ok = await healthCheck();
        if (!cancelled) {
          setBackendOnline(ok);
        }
      } catch (err) {
        if (!cancelled) {
          setBackendOnline(false);
        }
      }
    };

    // Initialize token on mount
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
          if (!cancelled) {
            setToken(currentToken);
          }
        }
      } catch (err) {
        console.error('Failed to initialize token:', err);
        if (!cancelled) {
          setError('Failed to connect to authentication service.');
        }
      }
    };

    initializeBackend();
    initializeToken();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      let currentToken = token;

      if (!currentToken) {
        // Token might have been cleared, try to refresh
        try {
          currentToken = await login();
          setToken(currentToken);
          localStorage.setItem('ragToken', currentToken);
        } catch (err) {
          throw new Error('Authentication failed. Please refresh the page.');
        }
      }

      try {
        const answer = await askRag(currentToken, {
          query: userMessage.content,
          limit: 5,
        });

        const assistantMessage: AssistantMessage = {
          role: 'assistant',
          content: answer.response,
          timestamp: new Date(),
          places: answer.places ?? null,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        // Token might have expired (401), try to get a new one
        if (err?.message && err.message.includes('Unauthorized')) {
          try {
            currentToken = await login();
            setToken(currentToken);
            localStorage.setItem('ragToken', currentToken);

            // Retry the query with new token
            const answer = await askRag(currentToken, {
              query: userMessage.content,
              limit: 5,
            });

            const assistantMessage: AssistantMessage = {
              role: 'assistant',
              content: answer.response,
              timestamp: new Date(),
              places: answer.places ?? null,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            return;
          } catch (retryErr) {
            throw new Error('Token refresh failed. Please try again.');
          }
        }
        throw err;
      }
    } catch (err: any) {
      const message =
        typeof err?.message === 'string'
          ? err.message
          : 'Something went wrong while contacting the assistant.';
      setError(message);

      const assistantMessage: Message = {
        role: 'assistant',
        content:
          'Sorry, I could not reach the assistant right now. Please try again in a moment.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {!user ? (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>
                  You need to sign in to use the Egyptian culture assistant
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              The LLM assistant is only available for authenticated users. Please sign in or create an account to access this feature.
            </p>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1>Talk to an LLM</h1>
                <p className="text-muted-foreground">Get instant answers about Egyptian culture, travel tips, and more</p>
              </div>
            </div>
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Egypt Culture Assistant
              </CardTitle>
              <CardDescription>
                Ask anything about Egypt and travel. This chat is connected to your FastAPI RAG backend.
              </CardDescription>
              {backendOnline === false && (
                <p className="text-xs text-red-500 mt-1">
                  Backend is not reachable. Please make sure the FastAPI server is running.
                </p>
              )}
              {backendOnline && (
                <p className="text-xs text-emerald-600 mt-1">
                  Connected to backend.
                </p>
              )}
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600">
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <CardContent className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about Egypt, culture, travel tips..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-2">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Try asking about specific destinations, cultural practices, or travel logistics
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Example Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  "What should I wear?" "Best food in Cairo?" "How to bargain in markets?"
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  This is a demo. Real implementation would use OpenAI, Anthropic, or similar APIs
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
