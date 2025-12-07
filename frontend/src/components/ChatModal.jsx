import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { profileAPI } from "../services/api";

export default function ChatModal({ isOpen, onClose, profileData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Halo! Saya adalah asisten AI yang sudah mempelajari profil **${
        profileData?.company_name || "perusahaan ini"
      }**. Ada yang bisa saya bantu?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Add empty assistant message placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await profileAPI.chatWithProfileStream(
        userMessage,
        profileData,
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            const lastMessage = newMessages[lastIndex];

            // Ensure we are updating the assistant's message
            if (lastMessage.role === "assistant") {
              newMessages[lastIndex] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
            }
            return newMessages;
          });
        }
      );
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        // Remove the empty placeholder if it's still empty or replace with error
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant" && !lastMessage.content) {
          lastMessage.content = "Maaf, terjadi kesalahan saat menghubungi AI.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-4">
      <div className="bg-[#1A1D21] border-t md:border border-gray-700 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl h-[90vh] md:h-[600px] flex flex-col shadow-2xl transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-[#1A1D21] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bot className="text-blue-400" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                Chat Assistant
              </h2>
              <p className="text-xs text-gray-400 truncate max-w-[200px] md:max-w-none">
                Ask anything about {profileData?.company_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0F1113]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-[#1A1D21] border border-gray-700 text-gray-200 rounded-bl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                  {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  <span>{msg.role === "user" ? "You" : "AI Assistant"}</span>
                </div>
                <div className="text-sm leading-relaxed break-words">
                  <ReactMarkdown
                    components={{
                      strong: ({ node, ...props }) => (
                        <span className="font-bold text-blue-200" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc ml-4 mb-2" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal ml-4 mb-2" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-blue-400 underline break-all"
                          {...props}
                        />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono break-all"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1A1D21] border border-gray-700 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-[#1A1D21] md:rounded-b-2xl pb-safe">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu..."
              className="flex-1 bg-[#0F1113] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm md:text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition flex items-center justify-center shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
