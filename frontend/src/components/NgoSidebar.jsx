// src/dashboard-component/Sidebar.jsx
import React, { useState } from "react";
import Logo from "./Logo";
import "./Sidebar.css";

const NgoSidebar = ({ setActiveComponent }) => {
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
              activeLink === "ngoHome" ? "active-link" : ""
            }`}
            onClick={() => handleClick("ngoHome")}
          >
            <i className="ri-home-8-line"></i>Dashboard
          </li>
          <li
            className={`${
              activeLink === "ngoAvilableFoods" ? "active-link" : ""
            }`}
            onClick={() => handleClick("ngoAvailableFoods")}
          >
            <i className="ri-restaurant-line"></i>
            Available Foods
          </li>
        
          <li
            className={`${
              activeLink === "ngoTransactionHistory" ? "active-link" : ""
            }`}
            onClick={() => handleClick("ngoTransactionHistory")}
          >
            <i className="ri-money-rupee-circle-line"></i>Transaction History
          </li>
        </ul>
      </ul>
    </div>
  );
};

export default NgoSidebar;
