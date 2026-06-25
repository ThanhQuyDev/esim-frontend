"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { useChatSocket, type ChatMessage } from "@/lib/chat-socket";
import { uploadToCloudinary, validateChatFile, type FileAttachment } from "@/lib/cloudinary";
import { useAuth } from "@/lib/auth";
import { MessageCircle, X, Send, Loader2, Paperclip, Image as ImageIcon } from "lucide-react";

// ===== Browser Title Notification Hook =====

function useTitleNotification(unreadCount: number, chatOpen: boolean) {
  const originalTitleRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }
  }, []);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // If chat is open or no unread, restore title
    if (chatOpen || unreadCount === 0) {
      document.title = originalTitleRef.current || document.title;
      return;
    }

    // Only flash when tab is not visible
    const handleVisibility = () => {
      if (document.hidden && unreadCount > 0 && !chatOpen) {
        startFlashing();
      } else {
        stopFlashing();
      }
    };

    const startFlashing = () => {
      if (intervalRef.current) return;
      let showNotification = true;
      intervalRef.current = setInterval(() => {
        document.title = showNotification
          ? `(${unreadCount}) Tin nhắn mới...`
          : (originalTitleRef.current || "esim.vn");
        showNotification = !showNotification;
      }, 1500);
    };

    const stopFlashing = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.title = originalTitleRef.current || document.title;
    };

    // Start immediately if hidden
    if (document.hidden && unreadCount > 0) {
      startFlashing();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopFlashing();
    };
  }, [unreadCount, chatOpen]);
}

// ===== Chat Bubble — fixed bottom-right =====

export function ChatBubble() {
  const { user, token, openAuthModal } = useAuth();
  const [open, setOpen] = useState(false);
  const { unreadCount, markAsRead } = useChatSocket();

  // Browser title notification
  useTitleNotification(unreadCount, open);

  const handleOpen = () => {
    if (!token) {
      openAuthModal();
      return;
    }
    setOpen(true);
    // Mark messages as read when opening chat
    markAsRead();
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            handleOpen();
          }
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a1a] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open support chat"}
        id="chat-bubble-toggle"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-sm font-medium text-white shadow-md">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {open && token && <ChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}

// ===== Chat Window =====

function ChatWindow({ onClose }: { onClose: () => void }) {
  const { connected, messages, sendMessage, error, userId, markAsRead } = useChatSocket();
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when window opens & mark as read
  useEffect(() => {
    inputRef.current?.focus();
    markAsRead();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateChatFile(file);
    if (validationError) return;

    setUploading(true);
    try {
      const attachment = await uploadToCloudinary(file);
      sendMessage(input || "", attachment);
      setInput("");
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [input, sendMessage]);

  return (
    <div
      className="fixed bottom-24 right-6 z-50 flex w-[360px] max-[480px]:w-[calc(100vw-2rem)] max-[480px]:right-4 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      style={{ height: "480px" }}
      role="dialog"
      aria-label="Support chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <p className="text-base sm:text-sm font-semibold leading-tight">Hỗ trợ</p>
            <p className="text-sm sm:text-xs text-gray-300">
              {connected ? "Đang kết nối" : "Đang kết nối lại…"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.length === 0 && !error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-base sm:text-sm text-gray-400 text-center">
              {connected
                ? "Chào bạn! Hãy gửi tin nhắn để được hỗ trợ."
                : "Đang kết nối…"}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === userId} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2"
      >
        {/* File attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!connected || uploading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Attach file"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn…"
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-base sm:text-sm outline-none transition-colors focus:border-[#1a1a1a] focus:bg-white"
          disabled={!connected}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={!connected || (!input.trim() && !uploading)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-opacity disabled:opacity-40"
          aria-label="Send message"
        >
          {!connected ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}

// ===== Single message bubble =====

function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessage;
  isOwn: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasImage = !!(message.fileUrl && message.fileType?.startsWith("image/"));
  const hasTextContent = !!(message.message && message.message !== "📎");

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Admin logo — shown before admin messages */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-2 mt-1">
          <img
            src="/logo/logo_chat.svg"
            alt="Admin"
            className="h-7 w-7 rounded-full object-cover border border-gray-200"
          />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl text-base sm:text-sm leading-relaxed ${
          hasImage && !hasTextContent
            ? "p-0 bg-transparent"
            : isOwn
              ? "px-3.5 py-2 bg-[#5353ff] text-white rounded-br-md"
              : "px-3.5 py-2 bg-white text-gray-800 border border-gray-200 rounded-bl-md"
        }`}
      >
        {/* File attachment preview */}
        {message.fileUrl && message.fileType?.startsWith("image/") && (
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={message.fileUrl}
              alt={message.fileName || "Image"}
              className="max-w-full rounded-sm max-h-[200px] object-cover"
              loading="lazy"
            />
          </a>
        )}
        {message.fileUrl && message.fileType?.startsWith("video/") && (
          <video
            src={message.fileUrl}
            controls
            className="max-w-full rounded-lg max-h-[200px] mb-1.5"
            preload="metadata"
          />
        )}

        {hasTextContent && (
          <p className={`whitespace-pre-wrap break-words ${hasImage ? "mt-1.5 px-3.5" : ""}`}>{message.message}</p>
        )}
        <p
          className={`mt-1 text-[12px] ${
            isOwn ? "text-gray-300" : "text-gray-400"
          } text-right ${hasImage && !hasTextContent ? "px-1" : ""}`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
