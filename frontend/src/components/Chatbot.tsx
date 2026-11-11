
"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://buildwise-ai-production-f4413c39.up.railway.app";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! 👋 Welcome to BuildWise AI. I'm your construction project assistant. How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load project information
  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(API_URL + "/projects");

        if (!response.ok) {
          throw new Error("Project API error: " + response.status);
        }

        const data = await response.json();

        if (
          data.status === "success" &&
          Array.isArray(data.projects) &&
          data.projects.length > 0
        ) {
          setProjectId(data.projects[0].id);
        }
      } catch (error) {
        console.error("BuildWise AI Project Load Error:", error);
      }
    }

    loadProject();
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Send message to the smart AI chatbot
  async function sendMessage() {
    const message = input.trim();

    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    // Keep the previous conversation for AI context
    const chatHistory = messages.slice(-10).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL + "/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          project_id: projectId,
          history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(
          data.message || "Unable to generate an AI response."
        );
      }

      const aiResponse =
        data.reply ||
        data.result?.response ||
        data.result?.analysis ||
        data.result?.message ||
        data.message ||
        "BuildWise AI could not generate a response.";

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("BuildWise AI Chatbot Error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I'm having trouble connecting to BuildWise AI. Please check the backend connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // Clear conversation
  function clearChat() {
    if (isLoading) return;

    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Chat cleared! 👋 How can I help you with your construction project?",
      },
    ]);
  }

  // Close chatbot
  function closeChat() {
    setIsOpen(false);
    setIsMinimized(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`absolute bottom-[76px] right-0 flex w-[calc(100vw-40px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 sm:w-[390px] ${
            isMinimized
              ? "h-[64px]"
              : "h-[min(560px,calc(100dvh-120px))]"
          }`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-[#101D35] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/15 text-xl">
                🏗️
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  BuildWise AI
                </h3>

                <p className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  AI Project Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clear Chat */}
              <button
                onClick={clearChat}
                disabled={isLoading}
                title="Clear chat"
                aria-label="Clear chat"
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                </svg>
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title="Minimize"
                aria-label="Minimize chat"
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>

              {/* Close */}
              <button
                onClick={closeChat}
                title="Close"
                aria-label="Close chat"
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Conversation Area */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
                <div className="text-center">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-medium text-slate-500">
                    BUILDWISE AI ASSISTANT
                  </span>
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "rounded-br-sm bg-[#101D35] text-white"
                          : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="shrink-0 border-t border-slate-200 bg-white p-3">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about your project..."
                    disabled={isLoading}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#101D35] text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </form>

                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Powered by BuildWise AI · AI Orchestrator
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open BuildWise AI chatbot"
          className="group flex h-16 w-16 items-center justify-center rounded-full bg-[#101D35] text-white shadow-xl shadow-slate-900/25 transition-all duration-300 hover:scale-110 hover:bg-cyan-600 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-8 w-8 transition-transform duration-300 group-hover:rotate-6"
          >
            <path d="M21 11.5a8.5 8.5 0 0 1-.9 3.8 8.6 8.6 0 0 1-7.6 4.7 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8 8.6 8.6 0 0 1 4.7-7.6 8.5 8.5 0 0 1 3.8-.9h.5a8.6 8.6 0 0 1 8 8v.5Z" />
          </svg>

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-cyan-400 text-[10px] font-bold text-[#101D35]">
            1
          </span>
        </button>
      )}
    </div>
  );
}
