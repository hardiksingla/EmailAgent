import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Inbox, CheckSquare, Brain, MessageSquare, User, Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { label: 'Inbox', path: '/', icon: <Inbox size={20} /> },
    { label: 'Todos', path: '/todos', icon: <CheckSquare size={20} /> },
    { label: 'General Chat', path: '/chat', icon: <MessageSquare size={20} /> },
    { label: 'Prompt Brain', path: '/brain', icon: <Brain size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 relative z-20 flex flex-col border-r border-[var(--border-color)] transition-colors duration-300">
        {/* Glass Background for Sidebar */}
        <div className="absolute inset-0 glass -z-10"></div>
        
        {/* Logo Area */}
        <div className="relative p-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Ocean AI
              </h1>
              <p className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">PRO SUITE</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-4 space-y-2 py-4">
          <p className="px-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'text-white shadow-lg shadow-indigo-500/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-100"></div>
                )}
                <span className={`relative z-10 mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10 font-medium text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Theme Toggle */}
        <div className="relative p-4 m-4 mt-auto space-y-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-all"
          >
            <span className="text-sm font-medium flex items-center">
              {theme === 'dark' ? <Moon size={16} className="mr-2 text-indigo-400" /> : <Sun size={16} className="mr-2 text-amber-500" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
            </div>
          </button>

          <div className="rounded-2xl bg-gradient-to-br from-[var(--border-color)] to-transparent border border-[var(--border-color)] backdrop-blur-sm">
            <div className="flex items-center p-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 p-[2px]">
                  <div className="w-full h-full rounded-full bg-[var(--bg-sidebar)] flex items-center justify-center">
                     <User size={20} className="text-indigo-400" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-sidebar)]"></div>
              </div>
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">Hardik</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-[var(--bg-app)] transition-colors duration-300">
        {/* Dynamic Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[150px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[150px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="relative z-10 flex-1 overflow-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
