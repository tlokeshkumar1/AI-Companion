import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================
// Auth Endpoints
// ======================
export const signupUser = (data: {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}) => API.post('/auth/signup', data);

export const loginUser = (data: { email: string; password: string }) =>
  API.post('/auth/login', data);

// ======================
// Bot Endpoints
// ======================
export const createBot = (formData: FormData) =>
  API.post('/bots/createbot', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateBot = (botId: string, formData: FormData) =>
  API.put(`/bots/${botId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getBotById = (botId: string) => API.get(`/bots/${botId}`);

export const getMyBots = (userId: string) =>
  API.get(`/bots/my?user_id=${userId}`);

export const getPublicBots = () => API.get('/bots/public');

// ======================
// Chat Endpoints
// ======================
export const sendMessage = (payload: {
  user_id: string;
  bot_id: string;
  message: string;
}) => API.post('/chat/ask', payload);

export const getChatHistory = (userId: string, botId: string) =>
  API.get(`/chat/history?user_id=${userId}&bot_id=${botId}`);

export const deleteChatHistory = (userId: string, botId: string) =>
  API.delete(`/chat/history?user_id=${userId}&bot_id=${botId}`);

export default API;
