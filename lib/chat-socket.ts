"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth";
import type { FileAttachment } from "@/lib/cloudinary";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

// ===== Types (from spec) =====

/** Snippet of the quoted message, sent with any reply (#073). */
export interface ChatMessageQuote {
  id: number;
  senderId: number | null;
  message: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}

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
  replyToId?: number | null;
  replyTo?: ChatMessageQuote | null;
  /** One reaction per person, `{ "<userId>": "❤️" }` (vande-1411 #037). */
  reactions?: Record<string, string> | null;
}

export type { FileAttachment } from "@/lib/cloudinary";

// ===== Visitors (vande-2011 #023) =====

/**
 * A visitor without an account chats under a key the server signed; it is kept
 * here so the conversation is still theirs on the next visit. When they sign
 * in, the server moves the conversation to the account and this is dropped.
 */
const GUEST_TOKEN_KEY = "esim_chat_guest";
/** The server shows a visitor, and a visitor's messages, as user -1. */
export const GUEST_USER_ID = -1;

function readGuestToken(): string | null {
  try {
    return localStorage.getItem(GUEST_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeGuestToken(value: string | null) {
  try {
    if (value) localStorage.setItem(GUEST_TOKEN_KEY, value);
    else localStorage.removeItem(GUEST_TOKEN_KEY);
  } catch {
    // Private mode: the visitor gets a new conversation next time.
  }
}

// ===== Hook =====

/**
 * `asGuest`: a visitor without an account opened the chat window, so start
 * (or resume) their conversation. Without it a visitor connects only if they
 * already have one, for the launcher's unread badge.
 */
export function useChatSocket({ asGuest = false }: { asGuest?: boolean } = {}) {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const guest = !token;
  const myId = token ? (user?.id ?? null) : GUEST_USER_ID;
  const myIdRef = useRef(myId);
  myIdRef.current = myId;

  // A refusal (too fast, a link…) shows for a moment, then goes.
  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(() => setError(null), 6000);
    return () => window.clearTimeout(t);
  }, [error]);

  // Connect socket when token is available
  useEffect(() => {
    const guestToken = readGuestToken();
    let auth: Record<string, unknown>;
    if (token) {
      // An earlier visitor conversation joins the account (#023).
      auth = guestToken ? { token, guest: guestToken } : { token };
    } else if (guestToken) {
      auth = { guest: guestToken };
    } else if (asGuest) {
      auth = { asGuest: true };
    } else {
      return;
    }

    const socket = io(`${API_BASE_URL}/chat`, {
      auth,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
      // User auto-joins their own room; a visitor's is made only once they
      // open the chat window.
      socket.emit("joinRoom", token ? {} : { create: asGuest });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on(
      "joinedRoom",
      (data: { roomId: number | null; userId: number; guestToken?: string }) => {
      if (data.guestToken) writeGuestToken(data.guestToken);
      if (!data.roomId) return;
      setRoomId(data.roomId);
      // Load message history
      socket.emit("getMessages", { chatRoomId: data.roomId, limit: 50 });
    });

    // The visitor conversation is now the account's (#023).
    socket.on("guestAdopted", () => writeGuestToken(null));

    socket.on(
      "messages",
      (data: { chatRoomId: number; messages: ChatMessage[] }) => {
        // Server returns DESC (newest first), reverse for chronological display
        setMessages(data.messages.slice().reverse());
        // Replies that came while the customer was away still wait on the
        // launcher's badge (vande-2011 #022); it only counted live ones.
        setUnreadCount(
          data.messages.filter((m) => !m.isRead && m.senderId !== myIdRef.current).length
        );
      }
    );

    socket.on("newMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      // Increment unread if message is from admin (not from current user)
      if (msg.senderId !== myIdRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Someone reacted to a message (vande-1411 #037).
    socket.on(
      "messageReaction",
      (data: { messageId: number; reactions: Record<string, string> | null }) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
        );
      }
    );

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
  }, [token, asGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    (text: string, attachment?: FileAttachment, replyToId?: number | null) => {
      if (!socketRef.current || !roomId) return;
      if (!text.trim() && !attachment) return;

      const payload: Record<string, unknown> = {
        chatRoomId: roomId,
        message: text.trim() || (attachment ? "📎" : ""),
      };

      // Quoting an earlier message of this same room (#073)
      if (replyToId) {
        payload.replyToId = replyToId;
      }

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

  /** React to a message; the same reaction again takes it back (vande-1411 #037). */
  const react = useCallback((messageId: number, emoji: string) => {
    socketRef.current?.emit("react", { messageId, emoji });
  }, []);

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
    react,
    unreadCount,
    userId: myId,
    /** Chatting without an account (#023): text only. */
    guest,
  };
}
