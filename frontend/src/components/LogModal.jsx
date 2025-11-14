import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function LogModal({
  isOpen,
  onClose,
  logs,
  isComplete,
  onNavigate,
}) {
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1D21] border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isComplete
              ? "✅ Profile Generation Complete"
              : "🔄 Generating Profile..."}
          </h2>
          {isComplete && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Log Container */}
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-2 font-mono text-sm bg-[#0F1113]"
        >
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <div className="animate-pulse">Initializing...</div>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`py-1 px-3 rounded ${
                  log.startsWith("✅")
                    ? "text-green-400"
                    : log.startsWith("❌") || log.startsWith("ERROR")
                    ? "text-red-400"
                    : log.startsWith("🔍") || log.startsWith("🤖")
                    ? "text-blue-400"
                    : log.startsWith("🧠")
                    ? "text-purple-400"
                    : log.startsWith("💾")
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                {log}
              </div>
            ))
          )}

          {/* Loading indicator when not complete */}
          {!isComplete && logs.length > 0 && (
            <div className="flex items-center gap-2 text-gray-500 py-2">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
              <span className="ml-2">Processing...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {isComplete ? (
              <span className="text-green-400">✓ All steps completed</span>
            ) : (
              <span>⏳ Please wait while we generate the profile...</span>
            )}
          </div>

          {isComplete && (
            <button
              onClick={onNavigate}
              className="bg-[#5B9FED] hover:bg-[#4A8DD9] px-6 py-2.5 rounded-lg font-medium transition"
            >
              View Profile →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
