import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Settings, Globe, Lock } from 'lucide-react';
import { getMyBots, getPublicBots } from '../services/api';
import BotCard from '../components/BotCard';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-bots');
  const [myBots, setMyBots] = useState([]);
  const [publicBots, setPublicBots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');
  const fullName = localStorage.getItem('full_name');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    loadBots();
  }, [userId, navigate]);

  const loadBots = async () => {
    try {
      const [myBotsRes, publicBotsRes] = await Promise.all([
        getMyBots(userId!),
        getPublicBots()
      ]);
      setMyBots(myBotsRes.data);
      setPublicBots(publicBotsRes.data);
    } catch (error) {
      console.error('Error loading bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {fullName}
          </h1>
          <p className="mt-2 text-slate-600">Manage your AI companions and discover new ones</p>
        </div>
        <Link
          to="/createbot"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Bot
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-bots')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'my-bots'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-1" />
            My Bots ({myBots.length})
          </button>
          <button
            onClick={() => setActiveTab('public-bots')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'public-bots'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-1" />
            Public Bots ({publicBots.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'my-bots' ? (
        <div>
          {myBots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No bots yet</h3>
              <p className="text-slate-600 mb-4">Create your first AI companion to get started</p>
              <Link
                to="/createbot"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bot
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBots.map((bot: any) => (
                <BotCard key={bot.bot_id} bot={bot} isOwner={true} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {publicBots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No public bots available</h3>
              <p className="text-slate-600">Be the first to create a public bot for the community!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicBots.map((bot: any) => (
                <BotCard key={bot.bot_id} bot={bot} isOwner={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}