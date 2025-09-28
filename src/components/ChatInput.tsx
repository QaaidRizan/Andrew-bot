import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isTyping }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage('');
      }
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 320; // allow taller inputs like ChatGPT
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = next + 'px';
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' as any : 'hidden' as any;
  }, [message]);

  return (
    <div className="border-t dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-4">
      {isTyping && (
        <div className="flex items-center mb-2 text-gray-500 dark:text-gray-400">
          <div className="flex space-x-1 items-center text-sm">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="ml-2 text-xs">Generating response…</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Andrew Tate AI"
            rows={1}
            className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400"
          />
          <div className="absolute -bottom-5 left-2 text-[10px] text-gray-400">Enter to send • Shift+Enter for newline</div>
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          aria-label="Send"
          className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};