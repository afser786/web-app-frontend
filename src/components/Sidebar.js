import React from "react";
import { uploadProfilePicture } from "../utils/fileUpload";
import { List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const Sidebar = ({
  users,
  currentUser,
  selectedUser,
  onSelectUser,
  setCurrentUser,
  onRandomCall,
}) => {

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadProfilePicture(file, currentUser.username);

    if (url) {
      setCurrentUser((prev) => ({
        ...prev,
        profileImageUrl: url,
      }));
    }
  };

  const Avatar = ({ url, letter, size = "" }) => {
    const baseStyle = {
      borderRadius: "50%",
      objectFit: "cover",
      display: "block",
    };

    const sizeStyle =
      size === "small" ? { width: 45, height: 45 } : { width: 60, height: 60 };

    if (url) {
      return (
        <img
          src={url}
          alt="avatar"
          className={`wa-avatar-img ${size}`}
          style={{ ...baseStyle, ...sizeStyle }}
        />
      );
    }

    return (
      <div
        className={`wa-avatar ${size}`}
        style={{
          ...sizeStyle,
          ...baseStyle,
          background: "#ccc",
          fontWeight: "bold",
          justifyContent: "center",
          alignItems: "center",
          fontSize: size === "small" ? 18 : 24,
          display: "flex",
        }}
      >
        {letter}
      </div>
    );
  };

  // Filter users once
  const filteredUsers = users.filter((u) => u.username !== currentUser.username);

  // Row component for react-window
  const UserRow = ({ index, style }) => {
    const u = filteredUsers[index];
    const isActive = selectedUser?.username === u.username;

    // We add a wrapper with "style" because react-window positions items absolutely
    return (
      <div style={style}>
        <div
          className={`wa-user ${isActive ? "active" : ""}`}
          onClick={() => onSelectUser(u)}
          style={{ height: "100%", boxSizing: "border-box" }} // Ensure it fits the row
        >
          <div className="wa-user-left">
            <Avatar
              url={u.profileImageUrl}
              letter={u.username[0].toUpperCase()}
              size="small"
            />
          </div>

          <div className="wa-user-main">
            <div className="wa-user-top">
              <div className="wa-user-name">{u.username}</div>
              <div className="wa-user-time">Now</div>
            </div>
            <div className="wa-user-last">Tap to message</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="wa-sidebar">

      {/* TOP PROFILE */}
      <div className="wa-top">
        <div className="wa-profile">
          <div
            className="wa-avatar-wrapper"
            onClick={() => document.getElementById("profilePicInput").click()}
            style={{ cursor: "pointer" }}
          >
            <Avatar
              url={currentUser.profileImageUrl}
              letter={currentUser.username[0].toUpperCase()}
            />
          </div>

          <input
            id="profilePicInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleProfilePicUpload}
          />

          <div>
            <div className="wa-username">{currentUser.username}</div>
            <div className="wa-status">Online</div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="wa-search">
        <input placeholder="Search or start new chat" />
      </div>

      {/* RANDOM VIDEO CALL BUTTON */}
      <div style={{ padding: "10px" }}>
        <button className="wa-random-btn" onClick={onRandomCall}>
          🎲 Random Video Call
        </button>
      </div>

      {/* VIRTUALIZED USER LIST */}
      <div className="wa-list">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={filteredUsers.length}
              itemSize={75} // Height of one row
            >
              {UserRow}
            </List>
          )}
        </AutoSizer>
      </div>

    </aside>
  );
};

export default Sidebar;
