export default function ChatBubble({ msg, isSender }) {

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  if (msg.type === "IMAGE") {
    return (
      <div className={`bubble ${isSender ? "sender" : "receiver"}`}>
        <img
          src={msg.content}
          alt="sent"
          className="chat-image"
          style={{ maxWidth: "200px", borderRadius: "8px" }}
        />
        <div className="msg-time">{formatTime(msg.timestamp)}</div>
      </div>
    );
  }

  if (msg.type === "FILE") {
    return (
      <div className={`bubble ${isSender ? "sender" : "receiver"}`}>
        <a href={msg.content} target="_blank" rel="noreferrer">
          📄 Download File
        </a>
        <div className="msg-time">{formatTime(msg.timestamp)}</div>
      </div>
    );
  }

  // TEXT
  return (
    <div className={`bubble ${isSender ? "sender" : "receiver"}`}>
      <div className="msg-text">{msg.content}</div>
      <div className="msg-time">{formatTime(msg.timestamp)}</div>
    </div>
  );
}
