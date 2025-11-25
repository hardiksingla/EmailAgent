import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  // baseURL: 'https://emailagent-95h4.onrender.com/api',
});

export const fetchEmails = async () => {
  const response = await api.get('/emails'); 
  return response.data;
};

export const updateEmail = async (id, updates) => {
  const response = await api.patch(`/emails/${id}`, updates);
  return response.data;
};

export const ingestEmails = async () => {
  const response = await api.post('/ingest');
  return response.data;
};

export const chatWithAgent = async (query, emailId = null) => {
  const response = await api.post('/chat', { query, emailId });
  return response.data;
};

export const generalChat = async (query) => {
  const response = await api.post('/general-chat', { query });
  return response.data;
};

export const getPrompts = async () => {
  const response = await api.get('/prompts');
  return response.data;
};

export const updatePrompt = async (id, templateContent) => {
  const response = await api.put(`/prompts/${id}`, { templateContent });
  return response.data;
};

export const generateReplies = async (emailId) => {
  const response = await api.post('/emails/generate-replies', { emailId });
  return response.data;
};

export const generateReply = async (emailId) => {
  const response = await api.post('/emails/generate-replies', { emailId });
  return response.data; // Returns { professional: "...", casual: "...", ... }
};

export const fetchEmailById = async (id) => {
  const response = await api.get(`/emails/${id}`);
  return response.data;
};

export const sendEmail = async ({ to, subject, body, emailId }) => {
  const response = await api.post('/emails/send', { to, subject, body, emailId });
  return response.data;
};

export default api;
