import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchEmails, ingestEmails } from '../services/api';
import Layout from '../components/Layout';
import { Sparkles, Loader2, AlertTriangle, Mail, Search, Filter, RefreshCw } from 'lucide-react';
import DOMPurify from 'dompurify';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const categories = ['All', 'Important', 'Work', 'Personal', 'Newsletter', 'Spam'];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = (
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesCategory = filterCategory === 'All' || email.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const loadEmails = async () => {
    setLoading(true);
    try {
      const data = await fetchEmails();
      setEmails(data);
    } catch (error) {
      console.error('Failed to load emails', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleIngest = async () => {
    setProcessing(true);
    try {
      await ingestEmails();
      await loadEmails(); // Refresh list
    } catch (error) {
      console.error('Ingestion failed', error);
    } finally {
      setProcessing(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'important': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
      case 'newsletter': return 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]';
      case 'work': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]';
      case 'personal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      case 'spam': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Inbox</h2>
            <p className="text-[var(--text-secondary)] font-medium">Manage your emails with AI assistance</p>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
             </div>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex items-center space-x-4 relative z-20">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] h-5 w-5" />
                <input 
                    type="text" 
                    placeholder="Search emails..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
            </div>
            <div className="relative">
                <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`p-3 border rounded-xl transition-colors flex items-center gap-2 ${
                        filterCategory !== 'All' 
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                        : 'bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                    }`}
                >
                    <Filter className="h-5 w-5" />
                    {filterCategory !== 'All' && <span className="text-sm font-medium">{filterCategory}</span>}
                </button>
                
                {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setFilterCategory(category);
                                    setShowFilterMenu(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                                    filterCategory === category 
                                    ? 'bg-indigo-500/10 text-indigo-400' 
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-md"></div>
                </div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)] font-medium animate-pulse">Loading your inbox...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmails.map((email) => (
              <Link
                key={email._id}
                to={`/email/${email._id}`}
                className="block group"
              >
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/5 transition-all duration-500"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${getCategoryColor(email.category)}`}>
                          {email.category || 'Uncategorized'}
                        </span>
                        {email.status === 'Unread' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-app)] px-2 py-1 rounded-lg border border-[var(--border-color)]">
                        {new Date(email.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-indigo-400 transition-colors truncate">
                                {email.subject}
                            </h3>
                            <p className="text-sm font-semibold text-indigo-500 mb-2">{email.sender}</p>
                            <p className="text-[var(--text-secondary)] text-sm line-clamp-2 leading-relaxed">
                                {DOMPurify.sanitize(email.body, { ALLOWED_TAGS: [] }).substring(0, 150)}...
                            </p>
                        </div>
                        
                        {email.actionItems && email.actionItems.length > 0 && (
                            <div className="hidden md:flex flex-col items-end justify-center min-w-[100px]">
                                <span className="text-xs font-bold text-amber-500 flex items-center bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                                    <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> {email.actionItems.length} Actions
                                </span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {filteredEmails.length === 0 && (
              <div className="text-center py-24 glass rounded-3xl border border-dashed border-[var(--border-color)]">
                <div className="w-20 h-20 bg-[var(--card-bg)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-1 ring-white/10">
                    <Mail className="h-10 w-10 text-[var(--text-secondary)]" />
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">No emails found</p>
                <p className="mt-2 text-[var(--text-secondary)]">Your inbox is completely empty.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inbox;
