import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Info, UserCircle2, TrendingUp, Wrench, Lightbulb, ExternalLink } from 'lucide-react';

// Configure API base URL
const API_BASE_URL = 'http://localhost:8000';

export default function DetailPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);

  const location = useLocation();

  useEffect(() => {
    // Extract company name or ID from URL
    const path = location.pathname.replace('/detail/', '');
    setProfileId(path);
    
    // Fetch profile data if we have a path
    if (path) {
      fetchProfileDetail(path);
    } else {
      setLoading(false);
    }
  }, [location]);

  // Fetch profile detail from API
  const fetchProfileDetail = async (id) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  
  const goBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1113] text-white">
        {/* Header Skeleton */}
        <header className="bg-[#1A1D21] border-b border-gray-800 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
              <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="w-80 space-y-6">
              <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1113] text-white">
      {/* Header */}
      <header className="bg-[#1A1D21] border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <button className="text-gray-500 hover:text-gray-300 transition">
            <svg width="20" height="5" viewBox="0 0 20 5" fill="currentColor">
              <circle cx="2.5" cy="2.5" r="2.5"/>
              <circle cx="10" cy="2.5" r="2.5"/>
              <circle cx="17.5" cy="2.5" r="2.5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Company Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
            {profile?.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={`${profile.company_name} logo`}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="text-4xl font-bold text-green-500">
                {profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : '...'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {profile ? profile.company_name : 'Loading...'}
            </h1>
            <a 
              href={profile?.website ? `https://${profile.website}` : '#'}
              className="text-sm text-gray-400 hover:text-[#5B9FED] transition inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile ? profile.website : 'Loading...'}
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Executive Summary */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  AI Executive Summary
                  <Edit2 size={16} className="text-gray-500" />
                </h2>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed space-y-3">
                {/* Content will be filled by AI Agent via API */}
                <p className="text-gray-500 italic">
                  AI-generated executive summary will appear here...
                </p>
              </div>
            </div>

            {/* Potential Needs & Pain Points */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-[#5B9FED]" />
                <h2 className="text-lg font-semibold">Potential Needs & Pain Points</h2>
              </div>
              <div className="space-y-4">
                {/* Content will be filled by AI Agent via API */}
                <div className="text-gray-500 italic text-sm">
                  AI-generated needs and pain points will appear here...
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={20} className="text-[#5B9FED]" />
                <h2 className="text-lg font-semibold">Tech Stack</h2>
                <Info size={16} className="text-gray-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Tech stack badges will be filled by API */}
                <div className="text-gray-500 italic text-sm">
                  Technology stack will appear here...
                </div>
              </div>
            </div>

            {/* More content sections */}
            <div className="text-center text-gray-600 py-4">
              <svg width="20" height="5" viewBox="0 0 20 5" fill="currentColor" className="mx-auto">
                <circle cx="2.5" cy="2.5" r="2.5"/>
                <circle cx="10" cy="2.5" r="2.5"/>
                <circle cx="17.5" cy="2.5" r="2.5"/>
              </svg>
            </div>

            {/* AI Generated Opening Lines */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-[#5B9FED]" />
                <h2 className="text-lg font-semibold">AI Generated Opening Lines</h2>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">NEW</span>
              </div>
              <div className="space-y-4">
                {/* Opening lines will be filled by AI Agent via API */}
                <div className="text-gray-500 italic text-sm">
                  AI-generated opening lines will appear here...
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <div className="bg-[#2A3441] border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="text-base font-semibold">Quick Facts</h3>
                <Info size={14} className="text-gray-500" />
              </div>
              <div className="space-y-4 text-sm">
                {/* Quick facts will be filled by API */}
                <div>
                  <div className="text-gray-400 mb-1">Industry</div>
                  <div className="text-white font-medium text-gray-500 italic">Loading...</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Employees Count</div>
                  <div className="text-white font-medium text-gray-500 italic">Loading...</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Location</div>
                  <div className="text-white font-medium text-gray-500 italic">Loading...</div>
                </div>
              </div>
            </div>

            {/* Key Contacts */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <UserCircle2 size={20} className="text-[#5B9FED]" />
                <h3 className="text-base font-semibold">Key Contacts</h3>
              </div>
              <div className="space-y-4">
                {/* Key contacts will be filled by API */}
                <div className="text-gray-500 italic text-sm">
                  Key contacts will appear here...
                </div>
              </div>
            </div>

            {/* Recent Signals */}
            <div className="bg-[#3D2644] border border-purple-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={20} className="text-purple-400" />
                <h3 className="text-base font-semibold">Recent Signals</h3>
              </div>
              <div className="space-y-3">
                {/* Recent signals will be filled by API */}
                <div className="text-gray-400 italic text-sm">
                  Recent signals will appear here...
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}