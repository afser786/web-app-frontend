import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Config from "../config";

let stompClient = null;

// =============================
// ⭐ CONNECT WEBSOCKET
// =============================
export const connectWebSocket = (username, onMessageReceived) => {
  console.log("connectWebSocket CALLED:", username);

  // Avoid duplicate WS
  if (stompClient && stompClient.connected) {
    console.log("WS already active – skipping");
    return;
  }

  // Pass username in WebSocket URL
  const socket = new SockJS(`${Config.WS}?username=${username}`);

  stompClient = new Client({
    webSocketFactory: () => socket,

    connectHeaders: {
      username: username,
    },

    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WebSocket connected as:", username);

      // =============================
      // ⭐ RECEIVE PRIVATE CHAT MESSAGE
      // =============================
      stompClient.subscribe(`/user/queue/messages`, (frame) => {
        const msg = JSON.parse(frame.body);

        // ⭐ FIX: ALWAYS ensure message has timestamp
        msg.timestamp = msg.timestamp || new Date().toISOString();

        onMessageReceived(msg);
      });

      // =============================
      // ⭐ VIDEO CALL SIGNALS
      // =============================
      stompClient.subscribe(`/user/queue/call`, (frame) => {
        const signal = JSON.parse(frame.body);

        if (window.onCallSignal) {
          window.onCallSignal(signal);
        }
      });
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },

    onWebSocketClose: () => {
      console.warn("WebSocket closed");
    },

    onWebSocketError: () => {
      console.error("WebSocket error");
    },
  });

  stompClient.activate();
  window.stompClient = stompClient;
};

// =============================
// ⭐ SEND PRIVATE MESSAGE
// =============================
export const sendPrivateMessage = (message) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("WS not connected");
    return;
  }

  stompClient.publish({
    destination: "/app/chat.private",
    body: JSON.stringify(message),
  });
};

// =============================
// ⭐ SEND VIDEO CALL SIGNAL
// =============================
export const sendCallSignal = (signal) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("WS not connected");
    return;
  }

  stompClient.publish({
    destination: "/app/call",
    body: JSON.stringify(signal),
  });
};

// =============================
// ⭐ DISCONNECT WEBSOCKET
// =============================
export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    console.log("Disconnecting WebSocket…");
    stompClient.deactivate();
  }
};
