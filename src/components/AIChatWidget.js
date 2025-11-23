import React, { useState } from "react";
import AIChatBox from "./AIChatBox";
import "./AIChatWidget.css";

function AIChatWidget({ aiMessages, setAiMessages }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating AI Button */}
      <div className="ai-floating-button" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {/* AI Chat Popup */}
      {open && (
        <div className="ai-chat-popup">
          <div className="ai-chat-header">
            Gemini AI
            <span className="ai-close-btn" onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="ai-chat-body">
            <AIChatBox messages={aiMessages} setMessages={setAiMessages} />
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatWidget;
