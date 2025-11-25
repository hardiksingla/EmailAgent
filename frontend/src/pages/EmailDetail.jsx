import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmailById, generateReply, chatWithAgent, sendEmail, updateEmail } from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, Sparkles, Send, Loader2, User, Clock, Tag, AlertCircle, MessageSquare, X, Bot, CheckCircle, Circle } from 'lucide-react';
import DOMPurify from 'dompurify';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reply State
  const [reply, setReply] = useState('');
  const [replyOptions, setReplyOptions] = useState(null);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const data = await fetchEmailById(id);
        setEmail(data);
      } catch (error) {
        console.error('Failed to load email', error);
      } finally {
        setLoading(false);
      }
    };
    loadEmail();
  }, [id]);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, showChat]);

  const handleGenerateReply = async () => {
    setGeneratingReply(true);
    setReplyOptions(null);
    try {
      const response = await generateReply(id);
      setReplyOptions(response);
      // Default to professional if available, otherwise first option
      const defaultReply = response.professional || Object.values(response)[0] || '';
      setReply(defaultReply);
    } catch (error) {
      console.error('Failed to generate reply', error);
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSendingEmail(true);
    try {
        await sendEmail({
            to: email.sender, // Assuming sender is the email address for now
            subject: `Re: ${email.subject}`,
            body: reply,
            emailId: id
        });
        // alert('Reply sent successfully!');
        navigate('/');
    } catch (error) {
        console.error('Failed to send reply', error);
        // alert('Failed to send reply.');
    } finally {
        setSendingEmail(false);
    }
  };

  const handleQuickQuestion = async (question) => {
    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const data = await chatWithAgent(userMessage.content, id);
      const botMessage = { role: 'assistant', content: data.response };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat failed', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    
    const query = chatQuery;
    setChatQuery(''); // Clear input immediately
    await handleQuickQuestion(query);
  };

  const handleToggleAction = async (index) => {
    if (!email || !email.actionItems) return;

    const updatedActionItems = [...email.actionItems];
    const item = updatedActionItems[index];

    // Handle both string and object formats
    if (typeof item === 'string') {
        updatedActionItems[index] = {
            task: item,
            completed: true
        };
    } else {
        updatedActionItems[index] = {
            ...item,
            completed: !item.completed
        };
    }

    // Optimistic update
    setEmail(prev => ({ ...prev, actionItems: updatedActionItems }));

    try {
        await updateEmail(id, { actionItems: updatedActionItems });
    } catch (error) {
        console.error('Failed to update action item', error);
        // Revert on failure
        setEmail(prev => ({ ...prev, actionItems: email.actionItems }));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-md"></div>
                </div>
            </div>
        </div>
      </Layout>
    );
  }

  if (!email) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-200">Email not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            Return to Inbox
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col relative">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center mb-6">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group px-4 py-2 rounded-xl hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border-color)]"
            >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Inbox</span>
            </button>

            <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center px-4 py-2 rounded-xl border transition-all ${
                    showChat 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                    : 'bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--border-color)]'
                }`}
            >
                {showChat ? <X className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                <span className="font-medium">{showChat ? 'Close Chat' : 'Ask AI about this email'}</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            {/* Email Header Card */}
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <User className="w-48 h-48 text-indigo-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-3 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {email.category || 'Uncategorized'}
                        </span>
                        {email.actionItems && email.actionItems.length > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" /> {email.actionItems.length} Actions
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
                        {email.subject || '(No Subject)'}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[var(--border-color)] pt-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0">
                                {email.sender ? email.sender.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-semibold text-[var(--text-primary)] truncate">{email.sender || 'Unknown Sender'}</p>
                                <p className="text-xs text-[var(--text-secondary)]">To: Me</p>
                            </div>
                        </div>
                        <div className="flex items-center text-[var(--text-secondary)] bg-[var(--bg-app)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] w-fit text-sm">
                            <Clock className="h-3.5 w-3.5 mr-2 shrink-0" />
                            <span className="font-medium">
                                {email.timestamp ? new Date(email.timestamp).toLocaleString() : 'Date unknown'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 relative">
                {/* Email Content & Actions Column */}
                <div className={`flex flex-col gap-4 h-full min-h-0 transition-all duration-300 ${showChat ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
                    
                    {/* Tabs */}
                    <div className="flex p-1 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] w-fit">
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'email'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            Email Body
                        </button>
                        {email.actionItems && email.actionItems.length > 0 && (
                            <button
                                onClick={() => setActiveTab('actions')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                                    activeTab === 'actions'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                Action Items
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'actions' ? 'bg-white/20 text-white' : 'bg-[var(--bg-app)] text-[var(--text-secondary)]'}`}>
                                    {email.actionItems.length}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="glass-card p-6 rounded-3xl overflow-y-auto custom-scrollbar bg-[var(--card-bg)] flex-1 min-h-0">
                        {activeTab === 'email' ? (
                            email.body ? (
                                <div 
                                    className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-a:text-indigo-400 prose-strong:text-[var(--text-primary)] prose-li:text-[var(--text-primary)]"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="w-20 h-20 mb-6 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center shadow-inner">
                                        <span className="text-4xl opacity-50">📄</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Content Available</h3>
                                    <p className="text-[var(--text-secondary)] max-w-xs mx-auto">
                                        This email appears to be empty or the content could not be loaded.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="space-y-4 h-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center">
                                        <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                                        Action Items
                                    </h3>
                                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                                        {email.actionItems.filter(i => typeof i === 'string' ? false : i.completed).length}/{email.actionItems.length} Completed
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {email.actionItems.map((item, idx) => {
                                        const isCompleted = typeof item === 'string' ? false : item.completed;
                                        const taskText = typeof item === 'string' ? item : item.task;
                                        
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`flex items-start p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${
                                                    isCompleted 
                                                    ? 'bg-green-500/5 border-green-500/20' 
                                                    : 'bg-[var(--bg-app)] border-[var(--border-color)] hover:border-indigo-500/30'
                                                }`}
                                                onClick={() => handleToggleAction(idx)}
                                            >
                                                <div className={`mt-0.5 mr-4 shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-[var(--text-secondary)] group-hover:text-indigo-400'}`}>
                                                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-base font-medium ${isCompleted ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                                                        {taskText}
                                                    </p>
                                                    {typeof item !== 'string' && item.deadline && (
                                                        <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center bg-[var(--card-bg)] w-fit px-2 py-1 rounded-lg border border-[var(--border-color)]">
                                                            <Clock className="w-3 h-3 mr-1" /> Due: {item.deadline}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Panel (Conditionally Rendered/Visible) */}
                {showChat && (
                    <div className="lg:col-span-1 glass-card flex flex-col rounded-3xl border border-indigo-500/20 overflow-hidden animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-app)] flex items-center">
                            <Bot className="h-5 w-5 text-indigo-400 mr-2" />
                            <h3 className="font-bold text-[var(--text-primary)]">Email Assistant</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--glass-bg)]">
                            {chatHistory.length === 0 && (
                                <div className="text-center text-[var(--text-secondary)] mt-10 px-4">
                                    <p className="mb-4 font-medium">Ask me anything about this email!</p>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            "Summarize this email",
                                            "What are the action items?",
                                            "Draft a professional reply",
                                            "Who is the sender?"
                                        ].map((question, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setChatQuery(question);
                                                    handleQuickQuestion(question);
                                                }}
                                                className="text-xs py-2 px-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 transition-all text-left"
                                            >
                                                "{question}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)]'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--card-bg)] rounded-2xl px-4 py-2 border border-[var(--border-color)]">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 bg-[var(--bg-app)] border-t border-[var(--border-color)]">
                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatQuery}
                                    onChange={(e) => setChatQuery(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                                <button type="submit" disabled={chatLoading} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50">
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Reply Section */}
                <div className={`glass-card p-1 rounded-3xl flex flex-col bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 h-full ${showChat ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
                    <div className="flex-1 bg-[var(--glass-bg)] backdrop-blur-xl rounded-[22px] p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
                                AI Reply
                            </h3>
                            <button
                                onClick={handleGenerateReply}
                                disabled={generatingReply}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {generatingReply ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    'Generate Drafts'
                                )}
                            </button>
                        </div>

                        {/* Reply Options */}
                        {replyOptions && (
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                {Object.keys(replyOptions).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setReply(replyOptions[key])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all border ${
                                            reply === replyOptions[key]
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                                            : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                                        }`}
                                    >
                                        {key.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] p-4 mb-4 relative group min-h-[200px]">
                            <textarea
                                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-secondary)] leading-relaxed text-sm"
                                placeholder="AI generated reply will appear here..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                            ></textarea>
                            {!reply && !generatingReply && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-[var(--text-secondary)] text-sm">Click "Generate Drafts" to start</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={handleSendReply}
                                disabled={sendingEmail || !reply}
                                className="w-full px-6 py-3 bg-white text-midnight-950 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sendingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                {sendingEmail ? 'Sending...' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailDetail;
