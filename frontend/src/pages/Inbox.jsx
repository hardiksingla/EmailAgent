import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchEmails, ingestEmails } from '../services/api';
import Layout from '../components/Layout';
import { Sparkles, Loader2, AlertTriangle, Mail } from 'lucide-react';
import DOMPurify from 'dompurify';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      case 'important': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'newsletter': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'work': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'personal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'spam': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Inbox</h2>
            <p className="text-slate-400 mt-1">Manage your emails with AI assistance</p>
          </div>
          <button
            onClick={handleIngest}
            disabled={processing}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center border ${
              processing
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20 hover:scale-[1.02]'
            }`}
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Process New Emails
              </>
            )}
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <Link
                key={email._id}
                to={`/email/${email._id}`}
                className="block group"
              >
                <div className="bg-slate-900/50 backdrop-blur-sm p-5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(email.category)}`}>
                        {email.category || 'Uncategorized'}
                      </span>
                      {email.status === 'Unread' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(email.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-indigo-400 transition-colors">
                    {email.subject}
                  </h3>
                  
                  <div className="flex justify-between items-end">
                    <p className="text-slate-400 text-sm truncate w-3/4">
                      <span className="font-medium text-slate-300">{email.sender}</span> — {DOMPurify.sanitize(email.body, { ALLOWED_TAGS: [] }).substring(0, 100)}...
                    </p>
                    {email.actionItems && email.actionItems.length > 0 && (
                      <span className="text-xs text-amber-400 flex items-center bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                        <AlertTriangle className="mr-1 h-3 w-3" /> {email.actionItems.length} Actions
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            
            {emails.length === 0 && (
              <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                <p className="text-xl font-medium">No emails found</p>
                <p className="mt-2 text-sm">Try processing new emails to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inbox;
