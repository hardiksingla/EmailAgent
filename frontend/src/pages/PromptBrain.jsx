import React, { useState, useEffect } from 'react';
import { getPrompts, updatePrompt } from '../services/api';
import Layout from '../components/Layout';
import { Brain, Save, Edit3, CheckCircle, AlertCircle } from 'lucide-react';

const PromptBrain = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const data = await getPrompts();
      setPrompts(data);
      if (data.length > 0 && !selectedPrompt) {
        selectPrompt(data[0]);
      }
    } catch (error) {
      console.error('Failed to load prompts', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setEditContent(prompt.templateContent);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!selectedPrompt) return;
    setSaving(true);
    try {
      const updated = await updatePrompt(selectedPrompt._id, editContent);
      // Update local state
      setPrompts(prompts.map(p => p._id === updated._id ? updated : p));
      setSelectedPrompt(updated);
      setMessage({ type: 'success', text: 'Prompt updated successfully!' });
      
      // Clear message after 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update prompt.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center">
            <Brain className="mr-3 text-indigo-500" size={32} /> Prompt Brain
          </h2>
          <p className="text-slate-400 mt-1">Configure the AI's behavior by editing the system prompts.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="flex flex-1 gap-8 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-900">
                <h3 className="font-semibold text-slate-300">Prompt Types</h3>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {prompts.map(prompt => (
                  <button
                    key={prompt._id}
                    onClick={() => selectPrompt(prompt)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedPrompt?._id === prompt._id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="font-medium capitalize flex items-center">
                      <Edit3 size={14} className="mr-2 opacity-70" />
                      {prompt.promptType.replace('_', ' ')}
                    </div>
                    <div className="text-xs opacity-70 truncate mt-1 pl-6">{prompt.templateContent}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Area */}
            <div className="w-2/3 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <h3 className="font-semibold text-slate-300 capitalize flex items-center">
                  Editing: <span className="text-indigo-400 ml-2">{selectedPrompt?.promptType.replace('_', ' ')}</span>
                </h3>
                {message && (
                  <span className={`text-sm flex items-center ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {message.type === 'success' ? <CheckCircle size={16} className="mr-1" /> : <AlertCircle size={16} className="mr-1" />}
                    {message.text}
                  </span>
                )}
              </div>
              
              <div className="flex-1 p-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-slate-700"
                  placeholder="Enter prompt template..."
                />
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving || editContent === selectedPrompt?.templateContent}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                    saving || editContent === selectedPrompt?.templateContent
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  }`}
                >
                  {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PromptBrain;
