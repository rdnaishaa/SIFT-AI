import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  ChevronDown,
  MoreVertical,
  Trash2,
  Star,
  Settings,
  X,
  Edit2,
  Save,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { profileAPI } from "../services/api";
import LogModal from "../components/LogModal";

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [companyInput, setCompanyInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updating, setUpdating] = useState(false);

  // SSE State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [generatedProfileId, setGeneratedProfileId] = useState(null);
  const eventSourceRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Auto-update favorites when profiles change
  useEffect(() => {
    if (activeTab === "favorites" && profiles.length > 0) {
      setFavorites(profiles.filter((p) => p.is_favorite === true));
    }
  }, [profiles, activeTab]);

  // Fetch favorite profiles
  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      // Filter profiles yang is_favorite = true
      setFavorites(profiles.filter((p) => p.is_favorite === true));
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // Use all profiles sorted by created_at (most recent first) as history
      const sortedProfiles = [...profiles].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setHistoryItems(sortedProfiles);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch profiles from backend
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await profileAPI.getMyProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate new profile with SSE streaming
  const handleGenerateProfile = async () => {
    if (!companyInput.trim()) return;

    setGenerating(true);
    setShowLogModal(true);
    setLogs([]);
    setIsGenerationComplete(false);
    setGeneratedProfileId(null);

    try {
      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Start SSE stream
      eventSourceRef.current = profileAPI.createProfileStream(
        companyInput,
        // onLog callback
        (logMessage) => {
          setLogs((prev) => [...prev, logMessage]);
        },
        // onComplete callback
        (profileId) => {
          setIsGenerationComplete(true);
          setGeneratedProfileId(profileId);
          setGenerating(false);
          setCompanyInput("");
          // Refresh profile list
          fetchProfiles();
        },
        // onError callback
        (errorMsg) => {
          setLogs((prev) => [...prev, `❌ Error: ${errorMsg}`]);
          setIsGenerationComplete(true);
          setGenerating(false);
        }
      );
    } catch (error) {
      console.error("Error starting profile generation:", error);
      setLogs((prev) => [...prev, `❌ Error: ${error.message}`]);
      setIsGenerationComplete(true);
      setGenerating(false);
    }
  };

  // Handle log modal close
  const handleCloseLogModal = () => {
    setShowLogModal(false);
    setLogs([]);
    setIsGenerationComplete(false);
    setGeneratedProfileId(null);
  };

  // Navigate to generated profile
  const handleViewGeneratedProfile = () => {
    if (generatedProfileId) {
      navigate(`/detail/${generatedProfileId}`);
      handleCloseLogModal();
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!editMode) {
      // Entering edit mode, populate form
      setEditFormData({
        username: user?.username || "",
        email: user?.email || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setUpdateError("");
      setUpdateSuccess("");
    }
    setEditMode(!editMode);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setUpdateError("");
    setUpdateSuccess("");
  };

  // Handle update submit
  const handleUpdateSubmit = async () => {
    setUpdateError("");
    setUpdateSuccess("");

    // Validation
    if (
      editFormData.new_password &&
      editFormData.new_password !== editFormData.confirm_password
    ) {
      setUpdateError("New passwords do not match");
      return;
    }

    if (editFormData.new_password && !editFormData.current_password) {
      setUpdateError("Current password is required to change password");
      return;
    }

    setUpdating(true);

    try {
      const updateData = {};

      // Only send changed fields
      if (editFormData.username !== user?.username) {
        updateData.username = editFormData.username;
      }
      if (editFormData.email !== user?.email) {
        updateData.email = editFormData.email;
      }
      if (editFormData.new_password) {
        updateData.current_password = editFormData.current_password;
        updateData.new_password = editFormData.new_password;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setUpdateError("No changes detected");
        setUpdating(false);
        return;
      }

      await updateUser(updateData);
      setUpdateSuccess("Profile updated successfully!");
      setEditMode(false);

      // Clear form after successful update
      setTimeout(() => {
        setUpdateSuccess("");
      }, 3000);
    } catch (error) {
      setUpdateError(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Navigate to detail page
  const viewDetails = (profile) => {
    const profileId = profile.profile_id || profile.id;
    setViewLoadingId(profileId);
    // Gunakan profile_id untuk navigasi
    navigate(`/detail/${profileId}`);
  };

  // Toggle dropdown menu
  const toggleDropdown = (profileId, event) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === profileId ? null : profileId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdownId]);

  // Handle delete button click
  const handleDeleteClick = (profile, event) => {
    event.stopPropagation();
    setProfileToDelete(profile);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;

    const profileId = profileToDelete.profile_id || profileToDelete.id;
    setDeletingId(profileId);

    try {
      await profileAPI.deleteProfile(profileId);
      // Refresh profiles
      await fetchProfiles();
      toast.success("Profile deleted successfully");
      setShowDeleteConfirm(false);
      setProfileToDelete(null);
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error(error.message || "Failed to delete profile");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setProfileToDelete(null);
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (profile, event) => {
    event.stopPropagation();
    const profileId = profile.profile_id || profile.id;
    setFavoriteLoadingId(profileId);

    try {
      const updatedProfile = await profileAPI.toggleFavorite(profileId);

      // Update profiles state immediately
      setProfiles((prevProfiles) => {
        const newProfiles = prevProfiles.map((p) =>
          (p.profile_id || p.id) === profileId
            ? { ...p, is_favorite: updatedProfile.is_favorite }
            : p
        );

        // Also update favorites if we're in that tab
        if (activeTab === "favorites") {
          setFavorites(newProfiles.filter((p) => p.is_favorite === true));
        }

        return newProfiles;
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Failed to toggle favorite");
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 Day Ago";
    if (diffDays < 7) return `${diffDays} Days Ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} Weeks Ago`;
    return `${Math.floor(diffDays / 30)} Months Ago`;
  };

  // Filter profiles based on search query
  const filterProfiles = (items) => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((profile) => {
      const companyName = profile.company_name?.toLowerCase() || "";
      const industry = profile.overview?.industry?.toLowerCase() || "";
      const location = profile.overview?.location?.toLowerCase() || "";
      const summary = profile.executive_summary?.toLowerCase() || "";

      return (
        companyName.includes(query) ||
        industry.includes(query) ||
        location.includes(query) ||
        summary.includes(query)
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0F1113] text-white flex">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Profile</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the profile for{" "}
              <span className="text-white font-semibold">
                {profileToDelete?.company_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deletingId}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Modal for SSE Streaming */}
      <LogModal
        isOpen={showLogModal}
        onClose={handleCloseLogModal}
        logs={logs}
        isComplete={isGenerationComplete}
        onNavigate={handleViewGeneratedProfile}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Settings size={24} className="text-[#5B9FED]" />
                Settings
              </h3>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    onClick={handleEditToggle}
                    className="text-gray-400 hover:text-white transition"
                    title="Edit Profile"
                  >
                    <Edit2 size={20} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setEditMode(false);
                    setUpdateError("");
                    setUpdateSuccess("");
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Error/Success Messages */}
              {updateError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded-lg text-sm">
                  {updateSuccess}
                </div>
              )}

              {/* User Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">
                  Account Information
                </h4>

                {!editMode ? (
                  // View Mode
                  <div className="bg-[#2A2D33] border border-gray-700 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Username</label>
                      <div className="text-white font-medium">
                        {user?.username || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <div className="text-white">{user?.email || "N/A"}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">User ID</label>
                      <div className="text-gray-400 text-sm font-mono">
                        {user?.user_id || "N/A"}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <div className="bg-[#2A2D33] border border-gray-700 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editFormData.username}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-[#1A1D21] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#5B9FED]"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-[#1A1D21] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#5B9FED]"
                        placeholder="Enter email"
                      />
                    </div>

                    <div className="pt-3 border-t border-gray-600">
                      <h5 className="text-xs font-semibold text-gray-400 mb-3">
                        Change Password (Optional)
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="current_password"
                            value={editFormData.current_password}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 bg-[#1A1D21] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#5B9FED]"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="new_password"
                            value={editFormData.new_password}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 bg-[#1A1D21] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#5B9FED]"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirm_password"
                            value={editFormData.confirm_password}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 bg-[#1A1D21] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#5B9FED]"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2A2D33] border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Total Profiles
                    </div>
                    <div className="text-2xl font-bold text-[#5B9FED]">
                      {profiles.length}
                    </div>
                  </div>
                  <div className="bg-[#2A2D33] border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Favorites</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {profiles.filter((p) => p.is_favorite).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {editMode ? (
                  <>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setUpdateError("");
                        setUpdateSuccess("");
                      }}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateSubmit}
                      disabled={updating}
                      className="flex-1 px-4 py-2 bg-[#5B9FED] hover:bg-[#4A8FDD] rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setUpdateError("");
                      setUpdateSuccess("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-48 bg-[#1A1D21] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          {/* Use public/SIFT no BG.png — public files are served from root */}
          <img src="/SIFT%20no%20BG.png" alt="SIFT" className="w-24 h-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === "dashboard"
                ? "bg-[#5B9FED] text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab("favorites");
              fetchFavorites();
            }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === "favorites"
                ? "bg-[#5B9FED] text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              fetchHistory();
            }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
              activeTab === "history"
                ? "bg-[#5B9FED] text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            History
          </button>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Settings size={18} />
            Settings
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition flex items-center gap-2"
          >
            Logout
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
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
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search profiles by company name, industry, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2A2D33] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#5B9FED] transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {user?.username || user?.email || "Guest"}
                </div>
                <div className="text-xs text-gray-500">User</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "favorites"
                ? "Favorites"
                : "History"}
            </h1>
            <p className="text-gray-400 text-sm">
              {activeTab === "dashboard" &&
                "Start profiling a company or view your saved prospects."}
              {activeTab === "favorites" && "Your saved favorite prospects."}
              {activeTab === "history" &&
                "Recently viewed or generated profiles."}
            </p>
          </div>

          {/* Input Section (only on dashboard) */}
          <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-8 mb-10">
            {activeTab === "dashboard" ? (
              <>
                <label className="block text-sm font-medium mb-4">
                  Enter a company name or Website
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter here"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleGenerateProfile()
                    }
                    disabled={generating}
                    className="flex-1 bg-[#2A2D33] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#5B9FED] transition disabled:opacity-50"
                  />
                  <button
                    onClick={handleGenerateProfile}
                    disabled={generating || !companyInput.trim()}
                    className="bg-[#5B9FED] hover:bg-[#4A8DD9] px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {generating ? "Generating..." : "Generate Profile"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                Use the Dashboard to generate new profiles.
              </div>
            )}
          </div>

          {/* Listing Area (Dashboard / Favorites / History) */}
          <div>
            {((activeTab === "dashboard" && loading) ||
              (activeTab === "favorites" && favoritesLoading) ||
              (activeTab === "history" && historyLoading)) && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 animate-pulse"
                  >
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

            {!(
              (activeTab === "dashboard" && loading) ||
              (activeTab === "favorites" && favoritesLoading) ||
              (activeTab === "history" && historyLoading)
            ) &&
              (() => {
                const items =
                  activeTab === "dashboard"
                    ? profiles
                    : activeTab === "favorites"
                    ? favorites
                    : historyItems;

                // Apply search filter
                const filteredItems = filterProfiles(items);

                if (!items || items.length === 0) {
                  return (
                    <div className="text-center py-20">
                      <div className="text-gray-500 mb-4">No items found</div>
                      <p className="text-gray-600 text-sm">
                        {activeTab === "dashboard" &&
                          "Start by generating your first company profile above"}
                        {activeTab === "favorites" &&
                          "You have not favorited any prospects yet."}
                        {activeTab === "history" && "No recent activity yet."}
                      </p>
                    </div>
                  );
                }

                if (filteredItems.length === 0) {
                  return (
                    <div className="text-center py-20">
                      <div className="text-gray-500 mb-4">No results found</div>
                      <p className="text-gray-600 text-sm">
                        No profiles match your search "{searchQuery}"
                      </p>
                    </div>
                  );
                }

                // Render History as Table
                if (activeTab === "history") {
                  return (
                    <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-[#2A2D33] border-b border-gray-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                              Company Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                              Industry
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                              Location
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                              Created
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                              Favorite
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map((profile) => (
                            <tr
                              key={profile.profile_id || profile.id}
                              className="border-b border-gray-800 hover:bg-[#252830] transition"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-white">
                                      {profile.company_name
                                        ? profile.company_name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "U"}
                                    </span>
                                  </div>
                                  <span className="text-white font-medium">
                                    {profile.company_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {profile.overview?.industry || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {profile.overview?.location || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {profile.created_at
                                  ? formatRelativeTime(profile.created_at)
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={(e) =>
                                    handleToggleFavorite(profile, e)
                                  }
                                  disabled={
                                    favoriteLoadingId ===
                                    (profile.profile_id || profile.id)
                                  }
                                  className={`transition p-1 rounded-lg ${
                                    profile.is_favorite
                                      ? "text-yellow-400 hover:text-yellow-500"
                                      : "text-gray-500 hover:text-yellow-400"
                                  } ${
                                    favoriteLoadingId ===
                                    (profile.profile_id || profile.id)
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                >
                                  <Star
                                    size={18}
                                    fill={
                                      profile.is_favorite
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => viewDetails(profile)}
                                    className="px-3 py-1.5 bg-[#5B9FED] hover:bg-[#4A8DD9] rounded-lg text-xs font-medium transition text-white"
                                  >
                                    View Details
                                  </button>
                                  <div className="relative">
                                    <button
                                      onClick={(e) =>
                                        toggleDropdown(
                                          profile.profile_id || profile.id,
                                          e
                                        )
                                      }
                                      className="text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
                                    >
                                      <MoreVertical size={18} />
                                    </button>
                                    {openDropdownId ===
                                      (profile.profile_id || profile.id) && (
                                      <div className="absolute right-0 mt-2 w-40 bg-[#2A2D33] border border-gray-700 rounded-lg shadow-lg z-10">
                                        <button
                                          onClick={(e) =>
                                            handleDeleteClick(profile, e)
                                          }
                                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2 transition"
                                        >
                                          <Trash2 size={16} />
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // Render Dashboard and Favorites as Cards
                return (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.slice(0, 6).map((profile) => (
                      <div
                        key={profile.profile_id || profile.id}
                        className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 hover:border-[#5B9FED] transition-all relative"
                      >
                        {/* Favorite Button - Top Left */}
                        <div className="absolute top-4 left-4">
                          <button
                            onClick={(e) => handleToggleFavorite(profile, e)}
                            disabled={
                              favoriteLoadingId ===
                              (profile.profile_id || profile.id)
                            }
                            className={`transition p-1 rounded-lg ${
                              profile.is_favorite
                                ? "text-yellow-400 hover:text-yellow-500"
                                : "text-gray-500 hover:text-yellow-400"
                            } ${
                              favoriteLoadingId ===
                              (profile.profile_id || profile.id)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Star
                              size={20}
                              fill={
                                profile.is_favorite ? "currentColor" : "none"
                              }
                            />
                          </button>
                        </div>

                        {/* Dropdown Menu Button - Top Right */}
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={(e) =>
                              toggleDropdown(
                                profile.profile_id || profile.id,
                                e
                              )
                            }
                            className="text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
                          >
                            <MoreVertical size={20} />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdownId ===
                            (profile.profile_id || profile.id) && (
                            <div className="absolute right-0 mt-2 w-40 bg-[#2A2D33] border border-gray-700 rounded-lg shadow-lg z-10">
                              <button
                                onClick={(e) => handleDeleteClick(profile, e)}
                                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2 transition"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {profile.company_name
                                ? profile.company_name.charAt(0).toUpperCase()
                                : "U"}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-center text-lg font-semibold mb-1">
                          {profile.company_name}
                        </h3>

                        <p className="text-center text-xs text-gray-500 mb-4">
                          {profile.created_at
                            ? `Created: ${formatRelativeTime(
                                profile.created_at
                              )}`
                            : ""}
                        </p>

                        <p className="text-sm text-gray-400 mb-5 line-clamp-2 text-center">
                          {profile.executive_summary || "No summary available."}
                        </p>

                        <button
                          onClick={() => viewDetails(profile)}
                          disabled={
                            viewLoadingId === (profile.profile_id || profile.id)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                            viewLoadingId === (profile.profile_id || profile.id)
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-[#4A5568] hover:bg-[#5A6578]"
                          } text-white`}
                        >
                          {viewLoadingId ===
                          (profile.profile_id || profile.id) ? (
                            <>
                              <svg
                                className="animate-spin w-4 h-4 mr-2 text-white"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                              </svg>
                              Loading...
                            </>
                          ) : (
                            "View Details →"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
          </div>
        </div>
      </main>
    </div>
  );
}
