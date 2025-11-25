import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmails, chatWithAgent, generateReplies, sendEmail, updateEmail } from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, MessageSquare, Zap, Send, X, Bot, FileText, CheckSquare, Sparkles, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat State
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hi! I\'ve analyzed this email. How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Collapsible state
  const messagesEndRef = useRef(null);

  // Reply State
  const [replyOptions, setReplyOptions] = useState(null);
  const [generatingReplies, setGeneratingReplies] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null); // For modal
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const allEmails = await fetchEmails();
        const found = allEmails.find(e => e._id === id);
        
        if (found) {
          setEmail(found);
        } else {
          setError('Email not found');
        }
      } catch (error) {
        console.error('Failed to load email', error);
        setError('Failed to load email details');
      } finally {
        setLoading(false);
      }
    };
    loadEmail();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleTodo = async (index) => {
    if (!email) return;
    
    const updatedActionItems = [...email.actionItems];
    updatedActionItems[index].completed = !updatedActionItems[index].completed;
    
    // Optimistic update
    const previousEmail = { ...email };
    setEmail({ ...email, actionItems: updatedActionItems });

    try {
      await updateEmail(id, { actionItems: updatedActionItems });
    } catch (error) {
      console.error('Failed to update todo', error);
      // Revert on failure
      setEmail(previousEmail);
      alert('Failed to update task status');
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const data = await chatWithAgent(input, id);
      const agentMsg = { role: 'agent', content: data.response };
      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateReplies = async () => {
    setGeneratingReplies(true);
    try {
      const replies = await generateReplies(id);
      setReplyOptions(replies);
    } catch (error) {
      console.error('Failed to generate replies', error);
      alert('Failed to generate replies.');
    } finally {
      setGeneratingReplies(false);
    }
  };

  const openReplyModal = (type, content) => {
    setSelectedReply({ type, content });
  };

  const handleSendEmail = async () => {
    if (!selectedReply) return;
    setSending(true);
    try {
      await sendEmail({
        to: email.sender, // Assuming sender is email address for now
        subject: `Re: ${email.subject}`,
        body: selectedReply.content,
        emailId: id
      });
      alert('Email sent successfully!');
      setSelectedReply(null);
      setReplyOptions(null);
      // Ideally refresh email status here
    } catch (error) {
      console.error('Failed to send email', error);
      alert('Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (action) => {
    let query = '';
    if (action === 'summarize') query = 'Summarize this email for me.';
    if (action === 'tasks') query = 'What are the action items and deadlines?';
    if (action === 'reply') query = 'Draft a professional reply to this email.';
    
    setInput(query);
    // Trigger send immediately for better UX
    setTimeout(() => sendQuery(query), 0);
  };

  const sendQuery = async (query) => {
    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const data = await chatWithAgent(query, id);
      const agentMsg = { role: 'agent', content: data.response };
      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    </Layout>
  );

  if (error || !email) return (
    <Layout>
      <div className="flex flex-col justify-center items-center h-full text-slate-400">
        <p className="text-xl mb-4">{error || 'Email not found'}</p>
        <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 flex items-center">
          <ArrowLeft className="mr-2" size={20} /> Back to Inbox
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex h-full overflow-hidden bg-slate-950">
        {/* Left: Email Content */}
        <div className={`transition-all duration-300 ease-in-out ${isChatOpen ? 'w-1/2' : 'w-full'} border-r border-slate-800 p-8 overflow-y-auto`}>
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white flex items-center transition-colors group">
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform mr-2" size={20} /> Back to Inbox
            </button>
            {!isChatOpen && (
              <button onClick={() => setIsChatOpen(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                <MessageSquare className="mr-2" size={16} /> Open Assistant
              </button>
            )}
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-3 tracking-tight">{email.subject}</h1>
            <div className="flex justify-between items-center text-sm text-slate-400 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                  {email.sender[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-200 font-medium">{email.sender}</p>
                  <p className="text-xs text-slate-500">To: You</p>
                </div>
              </div>
              <p>{new Date(email.timestamp).toLocaleString()}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">{email.category}</span>
              {email.isProcessed && <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Processed by AI</span>}
            </div>
          </div>

          <div 
            className="bg-white text-slate-900 p-6 rounded-xl shadow-sm overflow-auto max-w-none mb-10 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }}
          />

          {/* Action Items */}
          {email.actionItems && email.actionItems.length > 0 && (
            <div className="mb-10 p-6 bg-slate-900/50 rounded-xl border border-slate-800">
              <h3 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider flex items-center">
                <Zap className="mr-2" size={16} /> Action Items
              </h3>
              <ul className="space-y-3">
                {email.actionItems.map((item, idx) => (
                  <li key={idx} className={`flex items-start p-3 rounded-lg transition-colors ${item.completed ? 'bg-slate-800/30 opacity-50' : 'hover:bg-slate-800/50'}`}>
                    <input 
                      type="checkbox" 
                      checked={item.completed || false}
                      onChange={() => handleToggleTodo(idx)}
                      className="mt-1 mr-3 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-offset-slate-900 cursor-pointer" 
                    />
                    <div className={item.completed ? 'line-through text-slate-500' : ''}>
                      <p className="text-sm text-slate-200 font-medium">{item.task}</p>
                      {item.deadline && item.deadline !== 'None' && (
                        <p className="text-xs text-rose-400 mt-1 font-medium">Due: {item.deadline}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reply Section */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-200">Quick Replies</h3>
              <button 
                onClick={handleGenerateReplies}
                disabled={generatingReplies}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
              >
                {generatingReplies ? 'Generating...' : '✨ Generate Options'}
              </button>
            </div>

            {replyOptions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(replyOptions).map(([type, content]) => (
                  <div 
                    key={type} 
                    onClick={() => openReplyModal(type, content)}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all group hover:shadow-lg hover:shadow-indigo-500/5"
                  >
                    <h4 className="text-indigo-400 font-medium capitalize mb-2 group-hover:text-indigo-300">{type}</h4>
                    <p className="text-slate-400 text-sm line-clamp-4 leading-relaxed">{content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Agent Chat (Collapsible) */}
        <div className={`transition-all duration-300 ease-in-out flex flex-col bg-slate-900 border-l border-slate-800 ${isChatOpen ? 'w-1/2 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur min-w-[300px]">
            <h2 className="font-semibold text-slate-200 flex items-center">
              <span className="mr-2 text-xl">🤖</span> Agent Assistant
            </h2>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 mr-2">
                <button onClick={() => handleQuickAction('summarize')} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 transition-colors">Summarize</button>
                <button onClick={() => handleQuickAction('tasks')} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 transition-colors">Tasks</button>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-[300px] bg-slate-950/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-700">
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

          <div className="p-4 border-t border-slate-800 bg-slate-900 min-w-[300px]">
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700 px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this email..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || chatLoading}
                className="ml-2 text-indigo-500 hover:text-indigo-400 disabled:opacity-50 p-1"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Reply Modal */}
      {selectedReply && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-8 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Edit Reply</h2>
                <p className="text-sm text-indigo-400 capitalize font-medium mt-1">{selectedReply.type} Draft</p>
              </div>
              <button onClick={() => setSelectedReply(null)} className="text-slate-500 hover:text-white text-2xl transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 p-8 bg-slate-950">
              <textarea
                value={selectedReply.content}
                onChange={(e) => setSelectedReply({ ...selectedReply, content: e.target.value })}
                className="w-full h-full bg-transparent text-slate-300 text-lg leading-relaxed focus:outline-none resize-none font-sans placeholder-slate-700"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end space-x-4">
              <button 
                onClick={() => setSelectedReply(null)}
                className="px-6 py-3 rounded-lg text-slate-400 hover:text-white font-medium transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={sending}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/30 flex items-center transition-all hover:scale-[1.02]"
              >
                {sending ? 'Sending...' : <><Send className="mr-2" size={18} /> Send Reply</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default EmailDetail;
