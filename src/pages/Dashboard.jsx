import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

// Configure API base URL - adjust to your backend URL
const API_BASE_URL = 'http://localhost:8000';

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyInput, setCompanyInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Fetch profiles from backend
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/profile`);
      
      // Note: In production, retrieve token from your auth system
      const token = sessionStorage.getItem('token') || '';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          console.error('Unauthorized - please login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate new profile
  const handleGenerateProfile = async () => {
    if (!companyInput.trim()) return;
    
    setGenerating(true);
    try {
      const token = sessionStorage.getItem('token') || '';
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          company_name: companyInput,
          website: companyInput.includes('.') ? companyInput : ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newProfile = await response.json();
      setProfiles([newProfile, ...profiles]);
      setCompanyInput('');
    } catch (error) {
      console.error('Error generating profile:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Navigate to detail page
  const viewDetails = (profileId) => {
    console.log('Viewing profile:', profileId);
    // In production: window.location.href = `/detail/${profileId}`;
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 Day Ago';
    if (diffDays < 7) return `${diffDays} Days Ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} Weeks Ago`;
    return `${Math.floor(diffDays / 30)} Months Ago`;
  };

  return (
    <div className="min-h-screen bg-[#0F1113] text-white flex">
      {/* Sidebar */}
      <aside className="w-48 bg-[#1A1D21] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="text-3xl font-bold">SI⚡T</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'dashboard' 
                ? 'bg-[#5B9FED] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'favorites' 
                ? 'bg-[#5B9FED] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'history' 
                ? 'bg-[#5B9FED] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            History
          </button>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition flex items-center gap-2">
            Settings
            <span className="text-xs">...</span>
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition flex items-center gap-2">
            Logout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#1A1D21] border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-[#2A2D33] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-600 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="text-right">
                <div className="text-sm font-medium">Esun</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400 text-sm">
              Start profiling a company or view your saved prospects.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-8 mb-10">
            <label className="block text-sm font-medium mb-4">
              Enter a company name or Website
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter here"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateProfile()}
                disabled={generating}
                className="flex-1 bg-[#2A2D33] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#5B9FED] transition disabled:opacity-50"
              />
              <button
                onClick={handleGenerateProfile}
                disabled={generating || !companyInput.trim()}
                className="bg-[#5B9FED] hover:bg-[#4A8DD9] px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {generating ? 'Generating...' : 'Generate Profile'}
              </button>
            </div>
          </div>

          {/* Recent Prospects */}
          <div>
            <h2 className="text-xl font-bold mb-6">Recent Prospects</h2>

            {loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 animate-pulse">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && profiles.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-500 mb-4">No profiles yet</div>
                <p className="text-gray-600 text-sm">
                  Start by generating your first company profile above
                </p>
              </div>
            )}

            {!loading && profiles.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.slice(0, 6).map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 hover:border-[#5B9FED] transition-all"
                  >
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {profile.company_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Company Name */}
                    <h3 className="text-center text-lg font-semibold mb-1">
                      {profile.company_name}
                    </h3>

                    {/* Date */}
                    <p className="text-center text-xs text-gray-500 mb-4">
                      Created: {formatRelativeTime(profile.created_at)}
                    </p>

                    {/* Summary */}
                    <p className="text-sm text-gray-400 mb-5 line-clamp-2 text-center">
                      {profile.summary || 'Large tech company investing in microservices. Strong signals for cloud & devops needs.'}
                    </p>

                    {/* View Details Button */}
                    <button
                      onClick={() => viewDetails(profile.id)}
                      className="w-full bg-[#4A5568] hover:bg-[#5A6578] text-white px-4 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}