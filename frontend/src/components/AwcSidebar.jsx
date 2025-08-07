// src/dashboard-component/Sidebar.jsx
import React, { useState } from "react";
import Logo from "./Logo";
import "./Sidebar.css";

const AwcSidebar = ({ setActiveComponent }) => {
  const [activeLink, setActiveLink] = useState("");

  function handleClick(link) {
    setActiveComponent(link);
    setActiveLink(link); 
  }

  return (
    <div className="sidebar-container">
      <div className="logo-container">
        <Logo />
      </div>

      <ul className="sidebar-links-container">
        <div className="links-header">
          <i className="ri-home-7-line"></i>HOME
        </div>

        <ul className="top-links-container links-container">
        <li
            className={`${
              activeLink === "awcHome" ? "active-link" : ""
            }`}
            onClick={() => handleClick("awcHome")}
          >
            <i className="ri-home-8-line"></i>Dashboard
          </li>
          <li
            className={`${
              activeLink === "awcAvailableFoods" ? "active-link" : ""
            }`}
            onClick={() => handleClick("awcAvailableFoods")}
          >
            <i className="ri-restaurant-line"></i>Available Foods
          </li>
          <li
            className={`${
              activeLink === "awcTransactionHistory" ? "active-link" : ""
            }`}
            onClick={() => handleClick("awcTransactionHistory")}
          >
            <i className="ri-money-rupee-circle-line"></i>Transaction History
          </li>
        </ul>
    
      </ul>
    </div>
  );
};

export default AwcSidebar;
