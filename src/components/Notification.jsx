import React from "react";
function Notification({ notification }) {
  if (!notification) return null;
  // ^ Early return: if there's no notification, render nothing.

  return (
    <div className={`notification notification--${notification.type}`}>
      <span className="notification-icon">
        {notification.type === "success" && "✓"}
        {notification.type === "info" && "ℹ"}
        {notification.type === "error" && "✗"}
      </span>
      <span className="notification-message">{notification.message}</span>
    </div>
  );
}

export default Notification;