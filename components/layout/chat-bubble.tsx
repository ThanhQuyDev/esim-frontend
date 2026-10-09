"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useChatSocket, type ChatMessage, type ChatMessageQuote } from "@/lib/chat-socket";
import { uploadToCloudinary, validateChatFile, type FileAttachment } from "@/lib/cloudinary";
import { useAuth } from "@/lib/auth";
import { MessageCircle, X, Send, Loader2, Paperclip, Image as ImageIcon, CornerUpLeft } from "lucide-react";
import { splitChatLinks } from "@/lib/chat-links";

// ===== Mobile layout (v3 #006) =====

/** Phones get the chat full screen; the 360px floating card was cramped there. */
const MOBILE_QUERY = "(max-width: 640px)";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/**
 * The part of the screen the keyboard leaves visible. A full-screen chat sized
 * by `100vh` sits partly under the keyboard on iOS and gets shoved up, which is
 * what made the old window "nhỏ lại còn bị đẩy lên" — so it follows the visual
 * viewport instead.
 */
function useVisualViewportBox(enabled: boolean): CSSProperties | undefined {
  const [box, setBox] = useState<CSSProperties>();
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!enabled || !viewport) {
      setBox(undefined);
      return;
    }
    const update = () => setBox({ top: viewport.offsetTop, height: viewport.height });
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [enabled]);
  return box;
}

/**
 * Touch keyboards have no Shift+Enter, so there Enter must stay a line break and
 * the send button sends — the same rule the admin chat uses (#007, v3 #006).
 */
function useEnterSends(): boolean {
  return !useMediaQuery("(pointer: coarse)");
}

// ===== Quoted-message helpers (#073) =====

/**
 * One line describing a quoted message. Attachment-only messages are stored
 * with the placeholder "📎", which says nothing in a quote — fall back to the
 * file name so the customer recognises what is being answered.
 */
function quoteSummary(quote: Pick<ChatMessageQuote, "message" | "fileName" | "fileType">) {
  const text = quote.message?.trim();
  if (text && text !== "📎") return text;
  if (quote.fileType?.startsWith("image/")) return quote.fileName || "Hình ảnh";
  if (quote.fileType?.startsWith("video/")) return quote.fileName || "Video";
  return quote.fileName || "Tệp đính kèm";
}

/**
 * Who wrote a quoted message, from the customer's point of view. The widget
 * only ever has two sides plus the bot, so no user lookup is needed.
 */
function quoteAuthorName(senderId: number | null, viewerId: number | null) {
  if (senderId === null) return "Hệ thống";
  if (viewerId !== null && senderId === viewerId) return "Bạn";
  return "Hỗ trợ viên";
}

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
  /** Message being quoted, cleared once the reply is sent (#073). */
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** The image being viewed in place, instead of a new Cloudinary tab. */
  const [viewingImage, setViewingImage] = useState<{ url: string; alt: string } | null>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const viewportBox = useVisualViewportBox(isMobile);
  const enterSends = useEnterSends();

  // A full-screen chat over a scrollable page lets the page scroll underneath.
  useEffect(() => {
    if (!isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile]);

  // Grow with the message up to ~5 lines, then scroll inside the box.
  useEffect(() => {
    const box = inputRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${Math.min(box.scrollHeight, 120)}px`;
  }, [input]);

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
    if (!input.trim() || !connected) return;
    sendMessage(input, undefined, replyTo?.id);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "";
    setReplyTo(null);
  };

  const startReply = useCallback((message: ChatMessage) => {
    setReplyTo(message);
    inputRef.current?.focus();
  }, []);

  /** Scroll the quoted original into view when its quote is tapped (#073). */
  const jumpToMessage = useCallback((messageId: number) => {
    const target = document.getElementById(`chat-msg-${messageId}`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateChatFile(file);
    if (validationError) return;

    setUploading(true);
    try {
      const attachment = await uploadToCloudinary(file);
      sendMessage(input || "", attachment, replyTo?.id);
      setInput("");
      setReplyTo(null);
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [input, sendMessage, replyTo]);

  return (
    <div
      className={
        isMobile
          ? "fixed inset-x-0 top-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden bg-white"
          : "fixed bottom-24 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      }
      style={isMobile ? viewportBox : { height: "480px" }}
      role="dialog"
      aria-label="Support chat"
      data-testid="chat-window"
      data-fullscreen={isMobile ? "true" : undefined}
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
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === userId}
            viewerId={userId}
            onReply={startReply}
            onJumpToQuoted={jumpToMessage}
            onViewImage={setViewingImage}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Quoted message chip — the reply the customer is about to send (#073) */}
      {replyTo && (
        <div
          className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-3 py-2"
          data-testid="chat-reply-preview"
        >
          <CornerUpLeft className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          <div className="min-w-0 flex-1 border-l-2 border-[#5353ff] pl-2">
            <p className="truncate text-[12px] font-medium text-gray-600">
              Đang trả lời {quoteAuthorName(replyTo.senderId, userId).toLowerCase()}
            </p>
            <p className="truncate text-[12px] text-gray-500">{quoteSummary(replyTo)}</p>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="Hủy trả lời"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Esc backs out of the quote without clearing what has been typed
          if (e.key === "Escape" && replyTo) {
            e.preventDefault();
            setReplyTo(null);
          }
        }}
        className="flex items-end gap-2 border-t border-gray-200 bg-white px-3 py-2"
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

        {/* A textarea, so a message can span lines (v3 #006). 16px text on
            phones: iOS zooms into anything smaller and stays zoomed. */}
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Grow with the text (up to max-h) so a line started with
            // Shift+Enter is actually visible while typing (#005, round 4).
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            // Never send mid-composition: Vietnamese IMEs (Telex/VNI) use Enter
            // to commit the word being typed.
            if (e.key === "Enter" && !e.shiftKey && enterSends && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          enterKeyHint={enterSends ? "send" : "enter"}
          placeholder={enterSends ? "Nhập tin nhắn… (Shift+Enter để xuống dòng)" : "Nhập tin nhắn…"}
          className="max-h-[120px] min-h-[40px] flex-1 resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-base leading-6 outline-none transition-colors focus:border-[#1a1a1a] focus:bg-white sm:text-sm"
          disabled={!connected}
          aria-label="Chat message input"
          data-testid="chat-input"
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

      {viewingImage && (
        <ImageViewer
          url={viewingImage.url}
          alt={viewingImage.alt}
          onClose={() => setViewingImage(null)}
        />
      )}
    </div>
  );
}

// ===== In-place image viewer (v3 #006) =====

/**
 * Opens an attached image over the chat. A link to the Cloudinary file used to
 * leave the site, and on a phone the only way back was closing that tab.
 */
function ImageViewer({ url, alt, onClose }: { url: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-label="Xem hình ảnh"
      data-testid="chat-image-viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={url}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ===== Single message bubble =====

function MessageBubble({
  message,
  isOwn,
  viewerId,
  onReply,
  onJumpToQuoted,
  onViewImage,
}: {
  message: ChatMessage;
  isOwn: boolean;
  viewerId: number | null;
  onReply?: (message: ChatMessage) => void;
  onJumpToQuoted?: (messageId: number) => void;
  onViewImage?: (image: { url: string; alt: string }) => void;
}) {
  // Time WITH the date, "14:05 10/10/2026", so an old message can be told
  // from today's (#005, test round 4).
  const sent = new Date(message.createdAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const time =
    `${pad(sent.getHours())}:${pad(sent.getMinutes())} ` +
    `${pad(sent.getDate())}/${pad(sent.getMonth() + 1)}/${sent.getFullYear()}`;

  const hasImage = !!(message.fileUrl && message.fileType?.startsWith("image/"));
  const hasVideo = !!(message.fileUrl && message.fileType?.startsWith("video/"));
  /**
   * An attachment-led bubble: the media carries the message, so the bubble drops
   * its padding and coloured pill and lets the media's own frame show. Video used
   * to be left out of this, which put a `rounded-2xl` coloured pill around every
   * clip — the over-rounded frame #039 is about.
   */
  const hasMedia = hasImage || hasVideo;
  const hasTextContent = !!(message.message && message.message !== "📎");

  return (
    <div
      id={`chat-msg-${message.id}`}
      data-testid={`chat-msg-${message.id}`}
      className={`group flex scroll-mt-4 ${isOwn ? "justify-end" : "justify-start"}`}
    >
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
          hasMedia && !hasTextContent
            ? "p-0 bg-transparent"
            : isOwn
              ? "px-3.5 py-2 bg-[#5353ff] text-white rounded-br-md"
              : "px-3.5 py-2 bg-white text-gray-800 border border-gray-200 rounded-bl-md"
        }`}
      >
        {/* Quoted message — what this reply is answering (#073) */}
        {message.replyTo && (
          <button
            type="button"
            onClick={() => onJumpToQuoted?.(message.replyTo!.id)}
            data-testid={`chat-quote-${message.id}`}
            className={`mb-1.5 block w-full border-l-2 pl-2 text-left ${
              hasMedia && !hasTextContent ? "px-3.5 pt-2" : ""
            } ${isOwn ? "border-white/60" : "border-[#5353ff]"}`}
            title="Xem tin nhắn gốc"
          >
            <span
              className={`block truncate text-[12px] font-medium ${
                isOwn ? "text-white/85" : "text-gray-600"
              }`}
            >
              {quoteAuthorName(message.replyTo.senderId, viewerId)}
            </span>
            <span
              className={`block truncate text-[12px] ${isOwn ? "text-white/70" : "text-gray-500"}`}
            >
              {quoteSummary(message.replyTo)}
            </span>
          </button>
        )}

        {/* File attachment preview */}
        {message.fileUrl && message.fileType?.startsWith("image/") && (
          <button
            type="button"
            onClick={() =>
              onViewImage?.({ url: message.fileUrl!, alt: message.fileName || "Hình ảnh" })
            }
            className="block cursor-zoom-in"
            aria-label="Xem hình ảnh"
            data-testid={`chat-image-${message.id}`}
          >
            <img
              src={message.fileUrl}
              alt={message.fileName || "Image"}
              className="max-w-full rounded-sm max-h-[200px] object-cover"
              loading="lazy"
            />
          </button>
        )}
        {hasVideo && (
          <video
            src={message.fileUrl!}
            controls
            data-testid={`chat-video-${message.id}`}
            // `rounded-sm`, the same barely-there radius the image sibling uses:
            // a video frame reads as a screen, and `rounded-lg` on top of the
            // bubble's own radius looked like a bubble inside a bubble (#039).
            className={`max-w-full rounded-sm max-h-[200px] ${hasTextContent ? "mb-1.5" : ""}`}
            preload="metadata"
          />
        )}

        {hasTextContent && (
          // Only the image case re-adds padding here: a video with a caption
          // already sits inside the bubble's own px-3.5, and adding more would
          // indent the caption twice.
          <p className={`whitespace-pre-wrap break-words ${hasImage ? "mt-1.5 px-3.5" : ""}`}>
            {/* Links staff send (e.g. a destination page) are tappable (#050). */}
            {splitChatLinks(message.message ?? "").map((part, index) =>
              part.type === "link" ? (
                <a
                  key={index}
                  href={part.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all underline underline-offset-2"
                >
                  {part.value}
                </a>
              ) : (
                <span key={index}>{part.value}</span>
              )
            )}
          </p>
        )}
        <p
          className={`mt-1 text-[12px] ${
            isOwn ? "text-gray-300" : "text-gray-400"
          } text-right ${hasImage && !hasTextContent ? "px-1" : ""}`}
        >
          {time}
        </p>
      </div>

      {/* Reply affordance. Always visible on touch — there is no hover there —
          and revealed on hover from a pointer, so the thread stays clean (#073). */}
      {onReply && (
        <button
          type="button"
          onClick={() => onReply(message)}
          data-testid={`chat-reply-${message.id}`}
          className="ml-1 mt-1 flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full text-gray-400 transition-opacity hover:bg-gray-200 hover:text-gray-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label="Trả lời tin nhắn này"
          title="Trả lời tin nhắn này"
        >
          <CornerUpLeft className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
