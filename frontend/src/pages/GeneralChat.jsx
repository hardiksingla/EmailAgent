import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generalChat } from '../services/api';
import Layout from '../components/Layout';
import { Send, Bot, User, Loader2, Mail, MessageSquare } from 'lucide-react';

const GeneralChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hello! I can answer questions based on all your emails. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await generalChat(input);
      
      const agentMsg = { 
        role: 'agent', 
        content: data.answer,
        sources: data.sources 
      };
      
      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-950">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Bot className="mr-3 text-indigo-500" size={28} /> 
            General Assistant
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-10">Ask questions across your entire inbox</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-indigo-600 ml-4' : 'bg-slate-800 mr-4'
                }`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-400" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-5 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                        <Mail size={12} className="mr-1.5" /> Sources
                      </p>
                      <div className="space-y-2">
                        {msg.sources.map((source, sIdx) => (
                          <div 
                            key={sIdx}
                            onClick={() => navigate(`/email/${source.emailId}`)}
                            className="flex items-center p-2 rounded bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors border border-slate-700/50 hover:border-indigo-500/30 group"
                          >
                            <div className="w-1 h-full bg-indigo-500 rounded-full mr-3 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-indigo-300 truncate group-hover:text-indigo-200">{source.subject}</p>
                              <p className="text-xs text-slate-500 truncate">From: {source.sender}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-800 ml-14">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your emails..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 shadow-inner transition-all placeholder-slate-500"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default GeneralChat;
