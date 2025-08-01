"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, `You: ${userMessage}`]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessages((prev) => [
          ...prev,
          `Error: ${errorData.error || "Failed to send"}`,
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, `Boron: ${data.reply}`]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, "Error: Network or server issue"]);
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-white shadow">
        {messages.length === 0 ? (
          <p className="text-gray-400">No messages yet...</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className="mb-2 p-2 rounded bg-gray-100 text-gray-800 whitespace-pre-wrap"
            >
              {msg}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="flex flex-col space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="border rounded-lg p-2 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
