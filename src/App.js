import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import Login from "./components/Login";
import Register from "./components/Register";
import VideoCall from "./components/VideoCall";
import AIChatWidget from "./components/AIChatWidget";

import { connectWebSocket } from "./ws/websocket";
import { joinRandomQueue } from "./Services/randomCallService";

import Config from "./config";
import "./styles/chat.css";

function App() {
  const [screen, setScreen] = useState("LOGIN");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [messageStore, setMessageStore] = useState({});
  const [aiMessages, setAiMessages] = useState([]);

  const [showVideoCall, setShowVideoCall] = useState(null);
  const videoCallRef = useRef(null);

  const wsConnected = useRef(false);

  // ----------------------------------------------------
  // WEBSOCKET CONNECTION
  // ----------------------------------------------------
  // test for coderabbit review

  useEffect(() => {
    if (!currentUser || wsConnected.current) return;

    wsConnected.current = true;

    connectWebSocket(currentUser.username, (msg) => {
      console.log("WS RECEIVED:", msg);

      setMessageStore((prev) => {
        const chatId =
          msg.sender === currentUser.username ? msg.receiver : msg.sender;

        return {
          ...prev,
          [chatId]: [...(prev[chatId] || []), msg],
        };
      });
    });

    // WebRTC signals
    window.onCallSignal = (signal) => {
      if (signal.type === "offer") {
        setShowVideoCall(signal.from);
      }

      if (videoCallRef.current?.handleSignal) {
        videoCallRef.current.handleSignal(signal);
      }
    };

    return () => {
      wsConnected.current = false;
      if (window.stompClient) window.stompClient.deactivate();
    };
  }, [currentUser]);

  // ----------------------------------------------------
  // LOAD USER LIST
  // ----------------------------------------------------
  useEffect(() => {
    if (screen === "CHAT") {
      fetch(Config.USER_LIST)
        .then((res) => res.json())
        .then((data) => setUsers(data || []));
    }
  }, [screen]);

  // ----------------------------------------------------
  // LOGIN / REGISTER
  // ----------------------------------------------------
  const handleLogin = (user) => {
    setCurrentUser({
      ...user,
      profileImageUrl: user.profileImageUrl || "/default-avatar.png",
    });
    setScreen("CHAT");
  };

  const handleRegister = (user) => {
    setCurrentUser({
      ...user,
      profileImageUrl: user.profileImageUrl || "/default-avatar.png",
    });
    setScreen("CHAT");
  };

  // ----------------------------------------------------
  // ⭐ RANDOM VIDEO CALL
  // ----------------------------------------------------
  const handleNextRandom = async () => {
    console.log("🟦 Random button clicked");

    while (true) {
      const result = await joinRandomQueue(currentUser.username);

      if (result.status === "WAITING") {
        alert("🔍 Finding a new random partner...");
        return;
      }

      if (result.status === "MATCHED") {
        const partner = result.partner;

        if (partner === currentUser.username) {
          console.log("⚠ Matched with yourself, retrying...");
          await new Promise((r) => setTimeout(r, 500));
          continue;
        }

        console.log("🟩 MATCHED WITH:", partner);

        setShowVideoCall(partner);

        window.stompClient.publish({
          destination: "/app/call",
          body: JSON.stringify({
            type: "offer-init",
            from: currentUser.username,
            to: partner,
          }),
        });

        break;
      }
    }
  };

  // ----------------------------------------------------
  // LOGIN / REGISTER SCREEN
  // ----------------------------------------------------
  if (screen === "LOGIN") {
    return <Login onLogin={handleLogin} onSwitch={() => setScreen("REGISTER")} />;
  }

  if (screen === "REGISTER") {
    return <Register onRegister={handleRegister} onSwitch={() => setScreen("LOGIN")} />;
  }

  // ----------------------------------------------------
  // MAIN CHAT SCREEN
  // ----------------------------------------------------
  return (
    <div className="wa-app">

      <Sidebar
        users={users}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        setCurrentUser={setCurrentUser}
        onRandomCall={handleNextRandom}
      />

      <ChatPanel
        currentUser={currentUser}
        selectedUser={selectedUser}
        allMessages={messageStore}
        messages={messageStore[selectedUser?.username] || []}
        updateLocalMessages={setMessageStore}
        onVideoCall={() => setShowVideoCall(selectedUser?.username)}
      />

      <AIChatWidget aiMessages={aiMessages} setAiMessages={setAiMessages} />

      {showVideoCall && (
        <div className="video-call-wrapper active">
          <VideoCall
            ref={videoCallRef}
            currentUser={currentUser}
            targetUser={showVideoCall}
            onClose={() => setShowVideoCall(null)}
            onNext={handleNextRandom}
          />
        </div>
      )}

    </div>
  );
}

export default App;
