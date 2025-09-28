import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ThemeToggle } from './components/ThemeToggle';
import { getAIResponse } from './openaiClient';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

      // Stream-like word-by-word reveal
      const tokens = aiResponse.match(/\S+|\s+/g) || [aiResponse];
      let idx = 0;
      let accumulated = '';

      const interval = setInterval(() => {
        if (idx >= tokens.length) {
          clearInterval(interval);
          setIsTyping(false);
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
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    simulateAIResponse(text);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/60 backdrop-blur px-4">
        <div className="max-w-3xl mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
              alt="Bot"
              className="w-8 h-8 rounded-full object-cover"
            />
            <h1 className="text-sm font-semibold opacity-90">Andrew Tate AI Assistant</h1>
          </div>
          <ThemeToggle isDark={isDark} onToggle={handleToggle} />
        </div>
      </header>

      {/* Messages Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-10">
          {messages.length === 0 ? (
            <div className="mt-24 text-center">
              <div className="flex flex-col items-center gap-3">
                <img
                  src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
                  alt="Bot"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">How can I help you today?</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ask anything. Try one of these to start:</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {[
                  'Give me a advice for getting rich',
                  'How to stay motivated every day:',
                  'What is the best workout plan',
                  'What mindset do you recommend for success',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="text-left p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  >
                    <span className="text-sm">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-5 h-10 w-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}

      {/* Input Footer */}
      <footer className="sticky bottom-0 bg-white/80 dark:bg-black/60 backdrop-blur border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
        </div>
      </footer>
    </div>
  );
};

export default App;
