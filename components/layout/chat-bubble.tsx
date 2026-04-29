"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useChatSocket, type ChatMessage } from "@/lib/chat-socket";
import { useAuth } from "@/lib/auth";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

// ===== Chat Bubble — fixed bottom-right =====

export function ChatBubble() {
  const { user, token, openAuthModal } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => {
          if (!token) {
            openAuthModal();
            return;
          }
          setOpen((prev) => !prev);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1a2e] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open support chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && token && <ChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}

// ===== Chat Window =====

function ChatWindow({ onClose }: { onClose: () => void }) {
  const { connected, messages, sendMessage, error, userId } = useChatSocket();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when window opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div
      className="fixed bottom-24 right-6 z-50 flex w-[360px] max-[480px]:w-[calc(100vw-2rem)] max-[480px]:right-4 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      style={{ height: "480px" }}
      role="dialog"
      aria-label="Support chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold leading-tight">Hỗ trợ</p>
            <p className="text-xs text-gray-300">
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
            <p className="text-sm text-gray-400 text-center">
              {connected
                ? "Chào bạn! Hãy gửi tin nhắn để được hỗ trợ."
                : "Đang kết nối…"}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
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
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn…"
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition-colors focus:border-[#1a1a2e] focus:bg-white"
          disabled={!connected}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={!connected || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-white transition-opacity disabled:opacity-40"
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

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isOwn
            ? "bg-[#1a1a2e] text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? "text-gray-300" : "text-gray-400"
          } text-right`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
