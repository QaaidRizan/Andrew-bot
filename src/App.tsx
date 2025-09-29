import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useClerk } from '@clerk/clerk-react';
import { ChatMessage } from './components/ChatMessage';
import { ThemeToggle } from './components/ThemeToggle';
import { getAIResponse } from './openaiClient';
import { Send } from 'lucide-react';
// import Login from './components/Login';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollButton(!isNearBottom);
    };
    el.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => el.removeEventListener('scroll', onScroll as any);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 320;
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = next + 'px';
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [inputMessage]);

  const handleToggle = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newTheme);
      return newTheme;
    });
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(userMessage);

      const aiId = (Date.now() + Math.random()).toString();
      // Add placeholder AI message
      setMessages(prev => [
        ...prev,
        {
          id: aiId,
          text: '',
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);

      // Hide typing indicator as soon as we start showing the response
      setIsTyping(false);

      // Stream-like word-by-word reveal
      const tokens = aiResponse.match(/\S+|\s+/g) || [aiResponse];
      let idx = 0;
      let accumulated = '';

      const interval = setInterval(() => {
        if (idx >= tokens.length) {
          clearInterval(interval);
          return;
        }
        accumulated += tokens[idx++];
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: accumulated } : m));
      }, 20);
    } catch (e) {
      // On error, show a simple message and stop typing
      const errorId = (Date.now() + Math.random()).toString();
      setMessages(prev => [
        ...prev,
        {
          id: errorId,
          text: 'Sorry, something went wrong generating a response.',
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!isSignedIn) {
      openSignIn({});
      return;
    }
    storeChat(text); // Store user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      openSignIn({});
      return;
    }
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSignedIn) {
        openSignIn({});
        return;
      }
      if (inputMessage.trim()) {
        handleSendMessage(inputMessage.trim());
        setInputMessage('');
      }
    }
  };

  function storeChat(message: string) {
    const chats = JSON.parse(localStorage.getItem('pastChat') || '[]');
    chats.push(message);
    localStorage.setItem('pastChat', JSON.stringify(chats));
  }

  function clearChatHistory() {
    localStorage.removeItem('pastChat');
  }

  // Clear chat history when session ends (component unmount)
  useEffect(() => {
    return () => {
      clearChatHistory();
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/60 backdrop-blur px-4">
        <div className="relative w-full max-w-6xl mx-auto h-14 flex items-center">
          {/* Left side: Icon and Title */}
          <div className="flex items-center gap-3 md:absolute md:left-0 md:[left:-100px]">
            <img
              src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
              alt="Bot"
              className="w-8 h-8 rounded-full object-cover md:-ml-20"
            />
            <h1 className="text-sm font-semibold opacity-90">Andrew Tate AI Assistant</h1>
          </div>
          {/* Right side: ThemeToggle and Auth Buttons */}
          <div className="ml-auto flex items-center gap-3 md:absolute md:right-0 md:[right:-180px]">
            <ThemeToggle isDark={isDark} onToggle={handleToggle} />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
          {/* Centered spacer for layout (desktop only) */}
          <div className="hidden md:flex w-full justify-center"></div>
        </div>
      </header>

      {/* Messages Container (visible even when signed out; sending triggers sign-in) */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="flex flex-col items-center gap-4 mb-8">
                <img
                  src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
                  alt="Andrew Tate AI"
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
                <div>
                  <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                  <p className="text-gray-500 dark:text-gray-400">Ask me anything about success, motivation, fitness, or life advice.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
                {[
                  'Give me advice for getting rich',
                  'How to stay motivated every day',
                  'What is the best workout plan',
                  'What mindset do you recommend for success',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <span className="text-sm font-medium">{s}</span>
                  </button>
                ))}
              </div>
              
              {/* Centered Input for First Conversation */}
              <div className="w-full max-w-3xl">
                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message Andrew Tate AI..."
                      rows={1}
                      className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    aria-label="Send message"
                    className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="py-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex max-w-[85%] group">
                    <div className="flex-shrink-0 mr-3">
                      <img
                        src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
                        alt="Bot"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="relative px-4 py-3 rounded-2xl border shadow-sm bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-1 items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-5 h-10 w-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}

      {/* Input Footer - Only show when there are messages */}
      {messages.length > 0 && (
        <footer className="sticky bottom-0 bg-white/80 dark:bg-black/60 backdrop-blur border-t border-gray-200 dark:border-gray-800 px-4">
          <div className="max-w-3xl mx-auto py-4">
            <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Andrew Tate AI..."
                  rows={1}
                  className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                aria-label="Send message"
                className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
