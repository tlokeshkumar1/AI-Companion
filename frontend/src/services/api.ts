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

export const updateBot = (botId: string, formData: FormData, signal?: AbortSignal) =>
  API.put(`/bots/${botId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
  });

export const getBotById = (id: string, signal?: AbortSignal) =>
  API.get(`/bots/${id}`, signal ? { signal } : undefined);

export const getMyBots = (userId: string, signal?: AbortSignal) =>
  API.get(`/bots/my?user_id=${userId}`, signal ? { signal } : undefined);

export const getPublicBots = (signal?: AbortSignal) => 
  API.get('/bots/public', signal ? { signal } : undefined);

// ======================
// Chat Endpoints
// ======================
export const sendMessage = (payload: {
  user_id: string;
  bot_id: string;
  message: string;
}) => API.post('/chat/ask', payload);

export const getChatHistory = async (userId: string, botId: string, signal?: AbortSignal) => {
  try {
    console.log('Fetching chat history with params:', { userId, botId });
    const config = {
      params: { 
        user_id: userId, 
        bot_id: botId 
      },
      ...(signal && { signal })
    };
    const response = await API.get(`/chat/history`, config);
    console.log('Chat history response:', response.data);
    return response.data;
  } catch (error: any) {
    // Don't log cancellation errors
    if (axios.isCancel(error) || error?.message === 'canceled') {
      throw error; // Re-throw to be handled by the caller
    }
    
    // Log other errors
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return { status: 'error', data: [], message: error.message };
  }
};

export const deleteChatHistory = (userId: string, botId: string) =>
  API.delete(`/chat/restart?user_id=${userId}&bot_id=${botId}`);

export default API;
