"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";

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
}

// ===== Hook =====

export function useChatSocket() {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      // Auto mark as read
      socket.emit("markAsRead", { chatRoomId: msg.chatRoomId });
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
  }, [token]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socketRef.current || !roomId || !text.trim()) return;
      socketRef.current.emit("sendMessage", {
        chatRoomId: roomId,
        message: text.trim(),
      });
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

  return {
    connected,
    roomId,
    messages,
    error,
    sendMessage,
    loadMore,
    userId: user?.id ?? null,
  };
}
