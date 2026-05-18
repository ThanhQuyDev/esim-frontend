"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import type { FileAttachment } from "@/lib/cloudinary";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

// ===== Types (from spec) =====

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export type { FileAttachment } from "@/lib/cloudinary";

// ===== Hook =====

export function useChatSocket() {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Connect socket when token is available
  useEffect(() => {
    if (!token) return;

    const socket = io(`${API_BASE_URL}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
      // User auto-joins their own room
      socket.emit("joinRoom", {});
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("joinedRoom", (data: { roomId: number; userId: number }) => {
      setRoomId(data.roomId);
      // Load message history
      socket.emit("getMessages", { chatRoomId: data.roomId, limit: 50 });
    });

    socket.on(
      "messages",
      (data: { chatRoomId: number; messages: ChatMessage[] }) => {
        // Server returns DESC (newest first), reverse for chronological display
        setMessages(data.messages.slice().reverse());
      }
    );

    socket.on("newMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      // Increment unread if message is from admin (not from current user)
      if (msg.senderId !== user?.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("error", (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setRoomId(null);
      setMessages([]);
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    (text: string, attachment?: FileAttachment) => {
      if (!socketRef.current || !roomId) return;
      if (!text.trim() && !attachment) return;

      const payload: Record<string, unknown> = {
        chatRoomId: roomId,
        message: text.trim() || (attachment ? "📎" : ""),
      };

      if (attachment) {
        payload.fileUrl = attachment.fileUrl;
        payload.fileName = attachment.fileName;
        payload.fileType = attachment.fileType;
        payload.fileSize = attachment.fileSize;
      }

      socketRef.current.emit("sendMessage", payload);
    },
    [roomId]
  );

  const loadMore = useCallback(
    (page: number) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit("getMessages", {
        chatRoomId: roomId,
        page,
        limit: 50,
      });
    },
    [roomId]
  );

  const markAsRead = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit("markAsRead", { chatRoomId: roomId });
    setUnreadCount(0);
  }, [roomId]);

  return {
    connected,
    roomId,
    messages,
    error,
    sendMessage,
    loadMore,
    markAsRead,
    unreadCount,
    userId: user?.id ?? null,
  };
}
