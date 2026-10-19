"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { soundManager } from "@/lib/audio";
import { X, Send, Headphones, Bot, MessageCircle } from "lucide-react";

interface ChatMsg {
  id: number;
  username: string;
  message: string;
  isSupport: boolean;
  createdAt: string;
}

export default function LiveChatModal() {
  const { chatModalOpen, setChatModalOpen, user } = useApp();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatModalOpen) {
      fetch("/api/chat")
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) setMessages(data.messages);
        })
        .catch(() => {});
    }
  }, [chatModalOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatModalOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input.trim();
    setInput("");
    setSending(true);
    soundManager.playClick();

    // Optimistic UI
    const tempMsg: ChatMsg = {
      id: Date.now(),
      username: user ? user.username : "You",
      message: userText,
      isSupport: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      if (data.success) {
        // Poll for reply
        setTimeout(() => {
          fetch("/api/chat")
            .then((r) => r.json())
            .then((d) => {
              if (d.messages) setMessages(d.messages);
            })
            .catch(() => {});
        }, 1500);
      }
    } catch {} finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-sky-500/30 shadow-2xl text-white flex flex-col h-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">২৪/৭ কাস্টমার সাপোর্ট</h3>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>এজেন্ট লাইভ আছেন</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setChatModalOpen(false)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs bg-slate-950/60">
          {/* Welcome Message */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">
              BD
            </div>
            <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-2xl rounded-tl-none max-w-[80%] text-slate-200">
              হ্যালো! BDWIN24 এ স্বাগতম। ডিপোজিট বা উইথড্র নিয়ে যেকোনো সমস্যায় আমাদের জানান।
            </div>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${m.isSupport ? "justify-start" : "justify-end"}`}
            >
              {m.isSupport && (
                <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0">
                  BD
                </div>
              )}
              <div
                className={`p-2.5 rounded-2xl max-w-[80%] ${
                  m.isSupport
                    ? "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none"
                    : "bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow"
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          {["ডিপোজিট বোনাস কীভাবে পাব?", "উইথড্র কত সময়ে আসে?", "গিফট কোড কী?"].map((chip) => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 whitespace-nowrap hover:bg-slate-700"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="আপনার বার্তা লিখুন..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
