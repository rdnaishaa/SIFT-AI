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
  Download,
  Trash2,
  MoreVertical,
  Star,
  MessageSquare,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { profileAPI } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ChatModal from "../components/ChatModal";

export default function DetailPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/dashboard");
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  // Handle delete button click
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setOpenDropdown(false);
  };

  // Delete profile function
  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      await profileAPI.deleteProfile(id);
      toast.success("Profile deleted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error(error.message || "Failed to delete profile");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      const updatedProfile = await profileAPI.toggleFavorite(id);
      setProfile((prev) => ({
        ...prev,
        is_favorite: updatedProfile.is_favorite,
      }));
      toast.success(
        updatedProfile.is_favorite
          ? "Added to favorites"
          : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Failed to toggle favorite");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Download PDF Function
  const downloadPDF = () => {
    try {
      console.log("Download PDF clicked!", profile);

      if (!profile) {
        toast.error("No profile data available to download");
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Helper function to add text with word wrap
      const addText = (
        text,
        x,
        y,
        maxWidth,
        fontSize = 10,
        style = "normal"
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", style);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * fontSize * 0.5;
      };

      // Header with company name
      doc.setFillColor(91, 159, 237); // #5B9FED
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(profile?.company_name || "Company Profile", margin, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 33);

      yPos = 50;
      doc.setTextColor(0, 0, 0);

      // Company Overview Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(91, 159, 237);
      doc.text("Company Overview", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      if (profile?.overview?.website) {
        yPos = addText(
          `Website: ${profile.overview.website}`,
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 5;
      }

      if (profile?.overview?.industry) {
        yPos = addText(
          `Industry: ${profile.overview.industry}`,
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 5;
      }

      if (profile?.overview?.location) {
        yPos = addText(
          `Location: ${profile.overview.location}`,
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 5;
      }

      if (profile?.overview?.employee_count) {
        yPos = addText(
          `Employees: ${profile.overview.employee_count}`,
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 5;
      }

      if (profile?.overview?.founded_year) {
        yPos = addText(
          `Founded: ${profile.overview.founded_year}`,
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 10;
      }

      // Executive Summary
      if (profile?.executive_summary) {
        yPos += 5;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 159, 237);
        doc.text("Executive Summary", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        yPos = addText(
          profile.executive_summary,
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 10;
      }

      // Tech Stack
      if (profile?.tech_stack && profile.tech_stack.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 159, 237);
        doc.text("Technology Stack", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        yPos = addText(
          profile.tech_stack.join(", "),
          margin,
          yPos,
          pageWidth - 2 * margin
        );
        yPos += 10;
      }

      // Pain Points
      if (profile?.pain_points && profile.pain_points.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 159, 237);
        doc.text("Potential Needs & Pain Points", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        profile.pain_points.forEach((point, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          const title = point.title || point;
          yPos = addText(
            `${idx + 1}. ${title}`,
            margin,
            yPos,
            pageWidth - 2 * margin,
            10,
            "bold"
          );
          yPos += 2;

          if (point.description) {
            yPos = addText(
              `   ${point.description}`,
              margin,
              yPos,
              pageWidth - 2 * margin
            );
          }
          yPos += 5;
        });
        yPos += 5;
      }

      // Key Contacts Table
      if (profile?.key_contacts && profile.key_contacts.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 159, 237);
        doc.text("Key Contacts", margin, yPos);
        yPos += 10;

        const contactsData = profile.key_contacts.map((contact) => [
          contact.name || "N/A",
          contact.title || contact.position || "N/A",
          contact.linkedin || "-",
          contact.email || "-",
          contact.phone || "-",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Name", "Title", "LinkedIn", "Email", "Phone"]],
          body: contactsData,
          theme: "grid",
          headStyles: {
            fillColor: [91, 159, 237],
            textColor: 255,
            fontStyle: "bold",
          },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 35 },
            2: { cellWidth: 35 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Recent Signals
      if (
        profile?.recent_news_signals &&
        profile.recent_news_signals.length > 0
      ) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 159, 237);
        doc.text("Recent Signals", margin, yPos);
        yPos += 10;

        const signalsData = profile.recent_news_signals
          .slice(0, 5)
          .map((news) => [
            news.signal_type || "News",
            news.summary || news.title || "N/A",
            news.published_date
              ? new Date(news.published_date).toLocaleDateString()
              : "-",
          ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Type", "Summary", "Date"]],
          body: signalsData,
          theme: "grid",
          headStyles: {
            fillColor: [91, 159, 237],
            textColor: 255,
            fontStyle: "bold",
          },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            1: { cellWidth: 80 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Opening Lines
      if (
        profile?.opening_lines &&
        typeof profile.opening_lines === "object" &&
        Object.keys(profile.opening_lines).length > 0
      ) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(91, 159, 237);
        doc.text("AI Generated Opening Lines", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        Object.entries(profile.opening_lines).forEach(([key, data], idx) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          const role =
            data.role ||
            key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          yPos = addText(
            `${idx + 1}. ${role}`,
            margin,
            yPos,
            pageWidth - 2 * margin,
            10,
            "bold"
          );
          yPos += 2;

          if (data.context) {
            yPos = addText(
              `   Context: ${data.context}`,
              margin,
              yPos,
              pageWidth - 2 * margin,
              9,
              "italic"
            );
            yPos += 2;
          }

          const message = data.message || data;
          yPos = addText(
            `   "${message}"`,
            margin,
            yPos,
            pageWidth - 2 * margin
          );
          yPos += 5;
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
        doc.text(
          "Generated by SIFT AI",
          pageWidth - margin,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
      }

      // Save PDF
      const fileName = `${profile?.company_name || "Company"}_Profile_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
      console.log("PDF saved successfully:", fileName);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1113] via-[#1a1d22] to-[#0F1113] text-white">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 bg-gradient-to-b from-[#1A1D21]/80 via-[#1a1d22]/50 to-transparent backdrop-blur-xl border-b border-gray-800/30 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              <div className="bg-[#1A1D21]/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl p-6 animate-pulse">
                <div className="h-32 bg-gray-700/30 rounded-xl"></div>
              </div>
              <div className="bg-[#1A1D21]/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-700/30 rounded-xl"></div>
              </div>
            </div>
            <div className="w-80 space-y-6">
              <div className="bg-[#1A1D21]/40 backdrop-blur-xl border border-gray-800/30 rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-700/30 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1113] via-[#1a1d22] to-[#0F1113] text-white">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#1A1D21]/80 to-[#0F1113]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Delete Profile</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the profile for{" "}
              <span className="text-white font-semibold">
                {profile?.company_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-700/40 hover:bg-gray-600/50 rounded-lg font-medium transition disabled:opacity-50 border border-gray-600/30"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#1A1D21]/80 via-[#1a1d22]/50 to-transparent backdrop-blur-xl border-b border-gray-800/30 px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 hover:text-[#5B9FED] transition group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition backdrop-blur-md border ${
                profile?.is_favorite
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30 hover:border-yellow-500/50"
                  : "bg-gray-700/40 text-gray-300 hover:bg-gray-600/50 border-gray-600/30 hover:border-gray-500/50"
              } ${favoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Star
                size={18}
                fill={profile?.is_favorite ? "currentColor" : "none"}
                className="transition-transform group-hover:scale-110"
              />
              {favoriteLoading
                ? "..."
                : profile?.is_favorite
                ? "Favorited"
                : "Favorite"}
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/70 to-blue-700/70 hover:from-blue-600 hover:to-blue-700 rounded-xl text-sm font-medium transition backdrop-blur-md border border-blue-500/30 hover:border-blue-500/50"
            >
              <MessageSquare size={18} />
              Chat
            </button>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5B9FED]/70 to-[#4A8FDD]/70 hover:from-[#5B9FED] hover:to-[#4A8FDD] rounded-xl text-sm font-medium transition backdrop-blur-md border border-[#5B9FED]/30 hover:border-[#5B9FED]/50"
            >
              <Download size={18} />
              PDF
            </button>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown();
                }}
                className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-700/40 backdrop-blur-md border border-transparent hover:border-gray-600/50"
              >
                <MoreVertical size={20} />
              </button>

              {/* Dropdown Content */}
              {openDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1A1D21]/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-10 overflow-hidden">
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition border-b border-gray-800/50 last:border-0"
                  >
                    <Trash2 size={16} />
                    Delete Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Company Header with Gradient Background */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#5B9FED]/10 to-purple-500/10 blur-3xl rounded-3xl"></div>
          <div className="relative flex flex-col md:flex-row items-start gap-4 md:gap-6 bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-gray-700/50 rounded-3xl p-6 md:p-8 transition-all duration-300">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#5B9FED] to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-[#5B9FED]/20 hover:shadow-[#5B9FED]/40 transition-all">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={`${profile.company_name} logo`}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
              ) : (
                <div className="text-4xl md:text-5xl font-bold text-white">
                  {profile?.company_name
                    ? profile.company_name.charAt(0).toUpperCase()
                    : "..."}
                                </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent mb-2">
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
            className="text-sm text-gray-400 hover:text-[#5B9FED] transition inline-flex items-center gap-2 group"
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile?.website || profile?.overview?.website || "Loading..."}
            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* AI Executive Summary */}
        <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-[#5B9FED]/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#5B9FED]/10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5B9FED]/20 rounded-lg">
                <Sparkles size={20} className="text-[#5B9FED]" />
              </div>
              <h2 className="text-lg font-semibold">AI Executive Summary</h2>
            </div>
            {profile?.last_analyzed_at && (
              <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                {new Date(profile.last_analyzed_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-300 leading-relaxed">
            {profile?.executive_summary ? (
              <p className="group-hover:text-gray-200 transition">{profile.executive_summary}</p>
            ) : (
              <p className="text-gray-500 italic">
                AI-generated executive summary will appear here...
              </p>
            )}
          </div>
        </div>

        {/* Pain Points */}
        <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-[#FF6B6B]/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6B6B]/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-[#FF6B6B]/20 rounded-lg">
              <AlertCircle size={20} className="text-[#FF6B6B]" />
            </div>
            <h2 className="text-lg font-semibold">Potential Needs & Pain Points</h2>
          </div>
          <div className="space-y-3">
            {profile?.pain_points && Array.isArray(profile.pain_points) && profile.pain_points.length > 0 ? (
              <ul className="space-y-3">
                {profile.pain_points.map((point, idx) => (
                  <li key={idx} className="flex gap-3 group/item p-3 rounded-lg hover:bg-gray-800/30 transition">
                    <span className="text-[#FF6B6B] mt-1 font-bold group-hover/item:scale-125 transition-transform">→</span>
                    <div>
                      <div className="font-medium text-white group-hover/item:text-[#FF6B6B] transition">
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
        <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-[#4ECDC4]/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4ECDC4]/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-[#4ECDC4]/20 rounded-lg">
              <Wrench size={20} className="text-[#4ECDC4]" />
            </div>
            <h2 className="text-lg font-semibold">Tech Stack</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.tech_stack && Array.isArray(profile.tech_stack) && profile.tech_stack.length > 0 ? (
              profile.tech_stack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-[#4ECDC4]/20 to-[#4ECDC4]/10 border border-[#4ECDC4]/30 rounded-lg text-sm text-[#4ECDC4] hover:border-[#4ECDC4]/60 hover:bg-[#4ECDC4]/30 transition-all duration-300 cursor-default"
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

        {/* AI Opening Lines */}
        <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-purple-800/30 hover:border-purple-500/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lightbulb size={20} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">AI Generated Opening Lines</h2>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-medium">NEW</span>
          </div>
          <div className="space-y-3">
            {profile?.opening_lines && typeof profile.opening_lines === "object" && Object.keys(profile.opening_lines).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(profile.opening_lines).map(([key, data], idx) => (
                  <div
                    key={key}
                    className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-700/30 hover:border-purple-600/50 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group/card"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-lg text-xs font-bold group-hover/card:bg-purple-500/50 transition">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white mb-1">
                          {data.role ||
                            key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        {data.context && (
                          <p className="text-xs text-gray-400 mb-2 italic">
                            "{data.context}"
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed pl-12 group-hover/card:text-gray-200 transition">
                      "{data.message || data}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm">
                AI-generated opening lines will appear here...
              </div>
            )}
          </div>
        </div>

        {/* Data Sources */}
        {profile?.data_sources && Array.isArray(profile.data_sources) && profile.data_sources.length > 0 && (
          <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-gray-700/50 rounded-2xl p-6 md:p-8 transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gray-700/30 rounded-lg">
                <Database size={20} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold">Data Sources</h2>
              <span className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full">
                {profile.data_sources.length}
              </span>
            </div>
            <div className="space-y-2">
              {profile.data_sources.slice(0, 5).map((source, idx) => (
                <a
                  key={idx}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#5B9FED] transition group/link p-2 rounded-lg hover:bg-gray-800/30"
                >
                  <ExternalLink size={14} className="shrink-0 group-hover/link:translate-x-1 transition-transform" />
                  <span className="truncate group-hover/link:underline">
                    {source}
                  </span>
                </a>
              ))}
              {profile.data_sources.length > 5 && (
                <p className="text-xs text-gray-500 mt-3 pl-6">
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
        <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CheckCircle2 size={18} className="text-blue-400" />
            </div>
            <h3 className="text-base font-semibold">Quick Facts</h3>
          </div>
          <div className="space-y-4 text-sm">
            {[
              { label: "Industry", value: profile?.overview?.industry },
              { label: "Employees", value: profile?.overview?.employee_count },
              { label: "Location", value: profile?.overview?.location },
              { label: "Founded", value: profile?.overview?.founded_year },
            ].map((fact, idx) => (
              <div key={idx} className="pb-4 border-b border-gray-800/30 last:border-0 last:pb-0">
                <div className="text-gray-500 mb-1 text-xs uppercase tracking-wide">{fact.label}</div>
                <div className="text-white font-medium group-hover:text-gray-100 transition">
                  {fact.value || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Contacts */}
        <div className="group bg-gradient-to-br from-[#1A1D21]/60 to-[#0F1113]/60 backdrop-blur-xl border border-gray-800/30 hover:border-[#5B9FED]/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#5B9FED]/10">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#5B9FED]/20 rounded-lg">
              <UserCircle2 size={18} className="text-[#5B9FED]" />
            </div>
            <h3 className="text-base font-semibold">Key Contacts</h3>
          </div>
          <div className="space-y-3">
            {profile?.key_contacts && Array.isArray(profile.key_contacts) && profile.key_contacts.length > 0 ? (
              profile.key_contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="pb-3 border-b border-gray-800/30 last:border-0 last:pb-0 group/contact hover:bg-gray-800/20 p-2 rounded-lg transition"
                >
                  <div className="font-medium text-white text-sm mb-2">
                    {contact.name || "Unknown"}
                  </div>
                  <div className="space-y-1">
                    {contact.linkedin && (
                      <a
                        href={contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#5B9FED] hover:text-[#7BADFF] transition flex items-center gap-1"
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-xs text-[#5B9FED] hover:text-[#7BADFF] transition flex items-center gap-1 truncate"
                      >
                        ✉️ <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-xs text-[#5B9FED] hover:text-[#7BADFF] transition flex items-center gap-1"
                      >
                        📞 {contact.phone}
                      </a>
                    )}
                  </div>
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
        <div className="group bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-xl border border-purple-800/30 hover:border-purple-600/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp size={18} className="text-purple-400" />
            </div>
            <h3 className="text-base font-semibold">Recent Signals</h3>
          </div>
          <div className="space-y-2.5">
            {profile?.recent_news_signals && Array.isArray(profile.recent_news_signals) && profile.recent_news_signals.length > 0 ? (
              profile.recent_news_signals.slice(0, 5).map((news, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-purple-500 pl-3 py-2 hover:bg-purple-500/10 p-2 rounded-r-lg transition group/signal"
                >
                  <div className="text-xs font-bold text-purple-300 mb-1 uppercase tracking-wide">
                    {news.signal_type || "News"}
                  </div>
                  {news.summary && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2 group-hover/signal:text-gray-300 transition">
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
                          className="text-purple-400 hover:text-purple-300 hover:underline transition"
                        >
                          Read
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

  <ChatModal
    isOpen={isChatOpen}
    onClose={() => setIsChatOpen(false)}
    profileData={profile}
  />
</div>
);
}
