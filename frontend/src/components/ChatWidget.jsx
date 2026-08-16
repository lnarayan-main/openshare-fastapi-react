import { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowsPointingOutIcon,   // expand icon
  ArrowsPointingInIcon,     // collapse icon
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from "../contexts/AuthContext";
import { chatAPI } from "../services/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // new state for width
  const scrollRef = useRef(null);
  const { user } = useAuth();

  // Fetch real history when user logs in
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatAPI.chatHistory();
        const loadedMessages = res.data.map(m => ({
          role: m.role,
          text: m.content
        }));
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          // Set default welcome message if no history
          setMessages([{ role: 'ai', text: 'Hi! I am your local AI assistant. How can I help you today?' }]);
        }
      } catch (err) {
        console.error("Could not load history", err);
        setMessages([{ role: 'ai', text: 'Hi! I am your local AI assistant. How can I help you today?' }]);
      }
    };

    if (user) {
      fetchHistory();
    } else {
      // Reset messages if logged out
      setMessages([{ role: 'ai', text: 'Hi! I am your local AI assistant. How can I help you today?' }]);
    }
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend_old = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.requestChat({ message: input });
      const aiText = response.data.reply;
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the local LLM.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Add a placeholder AI message with empty text that will be filled token by token
    setMessages(prev => [...prev, { role: 'ai', text: '', isStreaming: true }]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/chat/send_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // Buffer for partial lines

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n'); // SSE events are separated by double newlines
        
        // Process all complete events
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i];
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              
              if (payload.type === 'token') {
                // Update the last message (the streaming one) by appending the token
                setMessages(prev => {
                  const lastIndex = prev.length - 1;
                  const updatedMessages = [...prev];
                  const lastMsg = updatedMessages[lastIndex];
                  if (lastMsg.role === 'ai' && lastMsg.isStreaming) {
                    // Append token to the existing text
                    updatedMessages[lastIndex] = {
                      ...lastMsg,
                      text: lastMsg.text + payload.data,
                    };
                  }
                  return updatedMessages;
                });
              } else if (payload.type === 'sources') {
                console.log('Sources:', payload.data); // You can store/display these later
              } else if (payload.type === 'done') {
                // Mark the streaming message as complete
                setMessages(prev => {
                  const lastIndex = prev.length - 1;
                  const updatedMessages = [...prev];
                  const lastMsg = updatedMessages[lastIndex];
                  if (lastMsg.role === 'ai' && lastMsg.isStreaming) {
                    updatedMessages[lastIndex] = {
                      ...lastMsg,
                      isStreaming: false,
                    };
                  }
                  return updatedMessages;
                });
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
        // Keep the last incomplete line in the buffer
        buffer = lines[lines.length - 1];
      }
    } catch (err) {
      console.error('Streaming error:', err);
      // Remove the placeholder and show error message
      setMessages(prev => {
        const lastIndex = prev.length - 1;
        if (prev[lastIndex]?.role === 'ai' && prev[lastIndex]?.isStreaming) {
          const updated = [...prev];
          updated[lastIndex] = { role: 'ai', text: 'Sorry, I am having trouble connecting to the local LLM.' };
          return updated;
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded width
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Delete History
  const handleDeleteHistory = async () => {
    if (!window.confirm('Delete all chat history?')) return;
    try {
      await chatAPI.deleteHistory();
      setMessages([{ role: 'ai', text: 'Hi! I am your local AI assistant. How can I help you today?' }]);
    } catch (err) {
      console.error('Failed to delete history', err);
      alert('Could not delete history. Please try again.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button (unchanged) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
          <ChatBubbleLeftRightIcon className="w-7 h-7 relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`flex flex-col h-[80vh] max-h-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 transition-all duration-300 ${
          isExpanded ? 'w-[750px]' : 'w-90 sm:w-106'
        }`}>
          {/* Header with Expand/Collapse button */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div>
              <h3 className="font-bold">Llama Assistant</h3>
              <p className="text-xs text-indigo-100">Powered by RAG</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Delete button */}
              <button onClick={handleDeleteHistory} className="hover:text-gray-200">
                <TrashIcon className="w-5 h-5" />
              </button>
              {/* Toggle Expand button */}
              <button onClick={toggleExpand} className="hover:text-gray-200">
                {isExpanded ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
              {/* Close button */}
              <button onClick={() => setIsOpen(false)}>
                <XMarkIcon className="w-6 h-6 hover:text-gray-200" />
              </button>
            </div>
          </div>

          {/* Message Area (unchanged) */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))} */}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-800 border border-gray-100'
                }`}>
                  {msg.text || (msg.isStreaming ? '\u200B' : '')} {/* Zero-width space to keep height */}
                  {msg.isStreaming && (
                    <span className="inline-block w-1 h-4 ml-0.5 bg-gray-400 animate-pulse">|</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area (unchanged) */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="text-indigo-600 hover:text-indigo-800">
              <PaperAirplaneIcon className="w-6 h-6 rotate-45" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}