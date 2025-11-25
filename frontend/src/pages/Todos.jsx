import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmails, updateEmail } from '../services/api';
import Layout from '../components/Layout';
import { CheckSquare, Clock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const emails = await fetchEmails();
      const allTodos = [];
      
      emails.forEach(email => {
        if (email.actionItems && email.actionItems.length > 0) {
          email.actionItems.forEach((item, index) => {
            // Only show incomplete items? Or show all? Let's show all but visually distinguish.
            // Actually user probably wants to see pending items mostly.
            // Let's show all for now.
            allTodos.push({
              ...item,
              emailId: email._id,
              emailSubject: email.subject,
              emailSender: email.sender,
              timestamp: email.timestamp,
              originalIndex: index // Needed for update
            });
          });
        }
      });

      // Sort by deadline if possible, otherwise by email timestamp
      allTodos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setTodos(allTodos);
    } catch (error) {
      console.error('Failed to load todos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (todo) => {
    // Optimistic update
    const updatedTodos = todos.map(t => 
      (t.emailId === todo.emailId && t.originalIndex === todo.originalIndex)
        ? { ...t, completed: !t.completed }
        : t
    );
    setTodos(updatedTodos);

    try {
      // We need to fetch the email, update the specific item, and save back
      // Since we don't have a granular "update item X" API, we have to do this carefully.
      // Ideally the backend should handle "toggle item X".
      // But with our PATCH /:id, we send the whole actionItems array.
      // So we need to find the email in our list (we don't have the full email here, just flattened todos).
      // We need to re-fetch the email or store it.
      
      // Better approach: Fetch the specific email first to ensure we have latest state
      // But that's slow.
      // Let's rely on the fact that we just fetched emails in loadTodos.
      // But we didn't store the full emails structure.
      
      // Let's fetch the full email for this todo
      const emails = await fetchEmails();
      const email = emails.find(e => e._id === todo.emailId);
      
      if (email) {
        const updatedActionItems = [...email.actionItems];
        if (updatedActionItems[todo.originalIndex]) {
          updatedActionItems[todo.originalIndex].completed = !updatedActionItems[todo.originalIndex].completed;
          await updateEmail(todo.emailId, { actionItems: updatedActionItems });
        }
      }
    } catch (error) {
      console.error('Failed to update todo', error);
      // Revert
      setTodos(todos); // This might be stale, but better than broken state. 
      // Actually better to reload
      loadTodos();
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Action Items</h1>
          <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <CheckSquare className="mr-2 h-4 w-4" /> {todos.filter(t => !t.completed).length} Pending
          </span>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-400 text-lg">No action items found. You're all caught up! 🎉</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {todos.map((todo, idx) => (
              <div 
                key={idx} 
                className={`bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group hover:shadow-lg hover:shadow-indigo-500/5 ${todo.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input 
                      type="checkbox" 
                      checked={todo.completed || false}
                      onChange={() => handleToggleTodo(todo)}
                      className="mt-1.5 w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-offset-slate-900 cursor-pointer" 
                    />
                    <div className={todo.completed ? 'line-through text-slate-500' : ''}>
                      <p className="text-lg text-slate-200 font-medium group-hover:text-indigo-300 transition-colors">
                        {todo.task}
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-slate-500">
                        {todo.deadline && todo.deadline !== 'None' && (
                          <span className="flex items-center text-rose-400 bg-rose-900/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <Clock className="mr-1 h-3 w-3" /> Due: {todo.deadline}
                          </span>
                        )}
                        <span 
                          onClick={() => navigate(`/email/${todo.emailId}`)}
                          className="flex items-center hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          <Mail className="mr-1 h-3 w-3" /> From: {todo.emailSubject}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/email/${todo.emailId}`)}
                    className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium flex items-center"
                  >
                    View Email <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Todos;
