import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Copy, User } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const copyMessage = () => {
    navigator.clipboard.writeText(message.text);
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] group`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          ) : (
            <img
              src="https://w0.peakpx.com/wallpaper/78/57/HD-wallpaper-andrew-tate-s-top-5-most-controversial-statements.jpg"
              alt="Bot"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
        </div>
        
        <div className="flex flex-col">
          <div className={`relative px-4 py-2 rounded-lg ${
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            <button 
              onClick={copyMessage}
              className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded hover:bg-black/10 transition-opacity"
              title="Copy message"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};