import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Inbox, CheckSquare, Brain, MessageSquare } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Inbox', path: '/', icon: <Inbox size={20} /> },
    { label: 'Todos', path: '/todos', icon: <CheckSquare size={20} /> },
    { label: 'General Chat', path: '/chat', icon: <MessageSquare size={20} /> },
    { label: 'Prompt Brain', path: '/brain', icon: <Brain size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">
            Ocean AI
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname === item.path
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={`mr-3 transition-transform group-hover:scale-110 ${location.pathname === item.path ? 'scale-110' : ''}`}>{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-700"></div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">Hardik</p>
              <p className="text-xs text-slate-500 truncate">07hardiksingla@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 relative">
        {/* Subtle Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-900/5 blur-[120px]"></div>
          <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-slate-800/10 blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
