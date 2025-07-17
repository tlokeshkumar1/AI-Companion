import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, RotateCcw, Trash2, ArrowLeft, Bot, User } from 'lucide-react';
import { sendMessage, getChatHistory, getBotById, deleteChatHistory } from '../services/api';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
}

export default function ChatPage() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [bot, setBot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    if (botId) {
      loadBotData();
      loadChatHistory();
    }
  }, [userId, botId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadBotData = async () => {
    try {
      const response = await getBotById(botId!);
      console.log('Bot data loaded:', response.data);
      console.log('Avatar path:', response.data.avatar);
      setBot(response.data);
    } catch (error) {
      console.error('Error loading bot data:', error);
    }
  };

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await getChatHistory(userId!, botId!);
      setChat(response.data);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const response = await sendMessage({ 
        user_id: userId, 
        bot_id: botId, 
        message: userMessage 
      });
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: userMessage,
        response: response.data.response,
        timestamp: new Date().toISOString()
      };
      
      setChat(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      try {
        await deleteChatHistory(userId!, botId!);
        setChat([]);
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const handleRestartChat = () => {
    if (window.confirm('Are you sure you want to restart this chat?')) {
      handleDeleteChat();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          {bot && (
            <div className="flex items-center">
              {bot.avatar ? (
                <img
                  src={bot.avatar.startsWith('http') ? bot.avatar : `http://localhost:8000/uploads/${bot.avatar}`}
                  alt={bot.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(e) => {
                    console.error('Error loading avatar:', bot.avatar);
                    // Fallback to default avatar if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{bot.name}</h1>
                <p className="text-sm text-slate-600">{bot.type_of_bot}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRestartChat}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Restart Chat"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={handleDeleteChat}
            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Chat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chat.length === 0 && bot?.first_message && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {bot.avatar ? (
                <img
                  src={bot.avatar.startsWith('http') ? bot.avatar : `http://localhost:8000/uploads/${bot.avatar}`}
                  alt={bot.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Error loading avatar:', bot.avatar);
                    // Fallback to default avatar if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-slate-100 rounded-lg p-4 max-w-md">
                <p className="text-slate-800">{bot.first_message}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">Just now</p>
            </div>
          </div>
        )}

        {chat.map((message) => (
          <div key={message.id} className="space-y-4">
            {/* User Message */}
            <div className="flex items-start space-x-3 justify-end">
              <div className="flex-1 text-right">
                <div className="bg-blue-600 text-white rounded-lg p-4 max-w-md ml-auto">
                  <p>{message.message}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Bot Response */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {bot?.avatar ? (
                  <img
                    src={`http://localhost:8000/${bot.avatar}`}
                    alt={bot.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-slate-100 rounded-lg p-4 max-w-md">
                  <p className="text-slate-800">{message.response}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {bot?.avatar ? (
                <img
                  src={`http://localhost:8000/${bot.avatar}`}
                  alt={bot.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-slate-100 rounded-lg p-4 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-slate-500 text-sm">Typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}