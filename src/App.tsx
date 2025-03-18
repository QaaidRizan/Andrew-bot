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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
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
      <header className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <img
            src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
            alt="Bot"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold dark:text-white">Andrew Tate AI Assistant</h1>
        </div>
        <ThemeToggle isDark={isDark} onToggle={handleToggle} />
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Footer */}
      <footer className="p-4 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
        </div>
        <p className="text-center">&copy; 2025 My App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
