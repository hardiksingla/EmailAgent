import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inbox from './pages/Inbox';
import EmailDetail from './pages/EmailDetail';
import PromptBrain from './pages/PromptBrain';
import Todos from './pages/Todos';
import GeneralChat from './pages/GeneralChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inbox />} />
        <Route path="/email/:id" element={<EmailDetail />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/chat" element={<GeneralChat />} />
        <Route path="/brain" element={<PromptBrain />} />
      </Routes>
    </Router>
  );
}

export default App;
