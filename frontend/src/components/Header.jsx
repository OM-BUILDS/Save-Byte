import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useHttpClient} from "../hooks/http-hook";
import { BASE_API_URL } from "../api/api";
import "./Header.css";

// Connect to WebSocket
const socket = io("http://localhost:5001", { withCredentials: true });

const Header = ({ organizationName }) => {
  const { sendRequest } = useHttpClient();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = JSON.parse(sessionStorage.getItem("userData"))?.userId;
  const token = JSON.parse(sessionStorage.getItem("userData"))?.token;
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null); // Ref for dropdown

  useEffect(() => {
    if (userId) {
      socket.emit("join", userId);
      console.log(`🟢 Joined socket room: ${userId}`);

      // Fetch past notifications
      fetchNotifications();
    }

    // Listen for real-time notifications
    socket.on("notification", (data) => {
      setNotifications((prevNotifications) => [data, ...prevNotifications]);
      setUnreadCount((prevCount) => prevCount + 1);
      console.log(`🔔 New Notification Received: `, data);
    });

    return () => {
      socket.off("notification");
    };
  }, [userId]);

  // Fetch previous notifications from database
  const fetchNotifications = async () => {
    try {
      const response = await sendRequest(
        `${BASE_API_URL}/get-all-notifications/${userId}`,
        "GET",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.notifications) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount || 0);
        console.log("📨 Notifications:", response.notifications);
        console.log("📌 Unread Count:", response.unreadCount);
      }
    } catch (err) {
      console.error("⚠️ Error fetching notifications:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await sendRequest(
        `${BASE_API_URL}/mark-read-notifications/${userId}`,
        "PUT",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      // Clear notifications and unread count to trigger re-render
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("⚠️ Error marking notifications as read:", err);
    }
  };

  // Handle Click Outside to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ul className="dashboard-header">
      <p className="blue-text">
        Welcome to <span className="red-text">{organizationName}</span> Dashboard
      </p>
      <ul className="right-side-container">
        {/* Notification Bell with Counter */}
        <div
          className="notification-container"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <i className="ri-notification-2-fill notification"></i>
          {unreadCount > 0 && <p className="notification-counter">{unreadCount}</p>}
        </div>

        {/* Dropdown for Notifications */}
        {showDropdown && (
          <div className="notification-dropdown" ref={dropdownRef}>
            {notifications.length === 0 ? (
              <h5>No new notifications</h5>
            ) : (
              notifications.map((notif, index) => (
                <div key={index} className="notification-item">
                   <div className="notification-time">
                    {new Date(notif.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="notification-message"> {index + 1}. {notif.message}</div>
                </div>
              ))
              
            
            )}

            {/* View All Button */}
            <button
              className="view-all-btn"
              onClick={markAllAsRead}
            >
              Mark All Notifications As Read
            </button>
          </div>
        )}
        <i className="ri-user-settings-fill"></i>
      </ul>
    </ul>
  );
};

export default Header;
