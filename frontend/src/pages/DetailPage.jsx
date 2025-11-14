import {
  ArrowLeft,
  Edit2,
  ExternalLink,
  Info,
  Lightbulb,
  TrendingUp,
  UserCircle2,
  Wrench,
  Database,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { profileAPI } from "../services/api";

export default function DetailPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchProfileDetail(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  // Fetch profile detail from API
  const fetchProfileDetail = async (profileId) => {
    setLoading(true);
    try {
      const data = await profileAPI.getProfileById(profileId);
      setProfile(data);
      console.log("Fetched profile data:", data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/dashboard");
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
              <circle cx="2.5" cy="2.5" r="2.5" />
              <circle cx="10" cy="2.5" r="2.5" />
              <circle cx="17.5" cy="2.5" r="2.5" />
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
                {profile?.company_name
                  ? profile.company_name.charAt(0).toUpperCase()
                  : "..."}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {profile ? profile.company_name : "Loading..."}
            </h1>
            <a
              href={
                profile?.overview?.website
                  ? profile.overview.website.startsWith("http")
                    ? profile.overview.website
                    : `https://${profile.overview.website}`
                  : "#"
              }
              className="text-sm text-gray-400 hover:text-[#5B9FED] transition inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile?.website || profile?.overview?.website || "Loading..."}
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
                {profile?.last_analyzed_at && (
                  <span className="text-xs text-gray-500">
                    Analyzed:{" "}
                    {new Date(profile.last_analyzed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-300 leading-relaxed space-y-3">
                {profile?.executive_summary ? (
                  <p>{profile.executive_summary}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    AI-generated executive summary will appear here...
                  </p>
                )}
              </div>
            </div>

            {/* Potential Needs & Pain Points */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-[#5B9FED]" />
                <h2 className="text-lg font-semibold">
                  Potential Needs & Pain Points
                </h2>
              </div>
              <div className="space-y-4">
                {profile?.pain_points &&
                Array.isArray(profile.pain_points) &&
                profile.pain_points.length > 0 ? (
                  <ul className="space-y-3">
                    {profile.pain_points.map((point, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-[#5B9FED] mt-1">•</span>
                        <div>
                          <div className="font-medium text-white">
                            {point.title || point}
                          </div>
                          {point.description && (
                            <div className="text-sm text-gray-400 mt-1">
                              {point.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    AI-generated needs and pain points will appear here...
                  </div>
                )}
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
                {profile?.tech_stack &&
                Array.isArray(profile.tech_stack) &&
                profile.tech_stack.length > 0 ? (
                  profile.tech_stack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#2A2D33] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-[#5B9FED] transition"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    Technology stack will appear here...
                  </div>
                )}
              </div>
            </div>

            {/* AI Generated Opening Lines */}
            <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-[#5B9FED]" />
                <h2 className="text-lg font-semibold">
                  AI Generated Opening Lines
                </h2>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  NEW
                </span>
              </div>
              <div className="space-y-4">
                {profile?.opening_lines &&
                typeof profile.opening_lines === "object" &&
                Object.keys(profile.opening_lines).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(profile.opening_lines).map(
                      ([key, data], idx) => (
                        <div
                          key={key}
                          className="bg-[#2A2D33] border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-[#5B9FED]/20 text-[#5B9FED] px-2 py-1 rounded text-xs font-medium">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-white mb-1">
                                {data.role ||
                                  key
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </div>
                              {data.context && (
                                <p className="text-xs text-gray-500 mb-2 italic">
                                  {data.context}
                                </p>
                              )}
                              <p className="text-sm text-gray-300 leading-relaxed">
                                "{data.message || data}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    AI-generated opening lines will appear here...
                  </div>
                )}
              </div>
            </div>

            {/* Data Sources */}
            {profile?.data_sources &&
              Array.isArray(profile.data_sources) &&
              profile.data_sources.length > 0 && (
                <div className="bg-[#1A1D21] border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Database size={20} className="text-[#5B9FED]" />
                    <h2 className="text-lg font-semibold">Data Sources</h2>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {profile.data_sources.length} sources
                    </span>
                  </div>
                  <div className="space-y-2">
                    {profile.data_sources.slice(0, 5).map((source, idx) => (
                      <a
                        key={idx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#5B9FED] transition group"
                      >
                        <ExternalLink size={14} className="flex-shrink-0" />
                        <span className="truncate group-hover:underline">
                          {source}
                        </span>
                      </a>
                    ))}
                    {profile.data_sources.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        + {profile.data_sources.length - 5} more sources
                      </p>
                    )}
                  </div>
                </div>
              )}
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
                <div>
                  <div className="text-gray-400 mb-1">Industry</div>
                  <div className="text-white font-medium">
                    {profile?.overview?.industry || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Employees Count</div>
                  <div className="text-white font-medium">
                    {profile?.overview?.employee_count || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Location</div>
                  <div className="text-white font-medium">
                    {profile?.overview?.location || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Founded</div>
                  <div className="text-white font-medium">
                    {profile?.overview?.founded_year || "N/A"}
                  </div>
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
                {profile?.key_contacts &&
                Array.isArray(profile.key_contacts) &&
                profile.key_contacts.length > 0 ? (
                  profile.key_contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="border-b border-gray-800 pb-3 last:border-0"
                    >
                      <div className="font-medium text-white text-sm">
                        {contact.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {contact.position ||
                          contact.title ||
                          "Position not available"}
                      </div>
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5B9FED] hover:underline mt-1 inline-block"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    Key contacts will appear here...
                  </div>
                )}
              </div>
            </div>

            {/* Recent Signals */}
            <div className="bg-[#3D2644] border border-purple-900/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={20} className="text-purple-400" />
                <h3 className="text-base font-semibold">Recent Signals</h3>
              </div>
              <div className="space-y-3">
                {profile?.recent_news_signals &&
                Array.isArray(profile.recent_news_signals) &&
                profile.recent_news_signals.length > 0 ? (
                  profile.recent_news_signals.slice(0, 5).map((news, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-purple-500 pl-3"
                    >
                      <div className="text-sm font-medium text-white mb-1">
                        {news.signal_type || "News Update"}
                      </div>
                      {news.summary && (
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {news.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {news.published_date && (
                          <span>
                            {new Date(news.published_date).toLocaleDateString()}
                          </span>
                        )}
                        {news.url && (
                          <>
                            <span>•</span>
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:underline"
                            >
                              Read more
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic text-sm">
                    Recent signals will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
