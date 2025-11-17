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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { profileAPI } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DetailPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
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
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4">
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
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
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
      <header className="bg-[#1A1D21] border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                profile?.is_favorite
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
              } ${favoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Star
                size={18}
                fill={profile?.is_favorite ? "currentColor" : "none"}
              />
              {favoriteLoading
                ? "Loading..."
                : profile?.is_favorite
                ? "Favorited"
                : "Add to Favorites"}
            </button>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#5B9FED] hover:bg-[#4A8DD9] rounded-lg text-sm font-medium transition"
            >
              <Download size={18} />
              Download PDF
            </button>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown();
                }}
                className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-800"
              >
                <MoreVertical size={20} />
              </button>

              {/* Dropdown Content */}
              {openDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-[#2A2D33] border border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Company Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0">
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
                        <ExternalLink size={14} className="shrink-0" />
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
                      <div className="mt-2 space-y-1">
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#5B9FED] hover:underline block"
                          >
                            🔗 LinkedIn Profile
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-xs text-[#5B9FED] hover:underline block"
                          >
                            ✉️ {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-xs text-[#5B9FED] hover:underline block"
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
