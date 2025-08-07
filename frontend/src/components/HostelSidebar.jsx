// src/dashboard-component/Sidebar.jsx
import React, { useState } from "react";
import Logo from "./Logo";
import "./Sidebar.css";

const HostelSidebar = ({ setActiveComponent }) => {
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
              activeLink === "hostelHome" ? "active-link" : ""
            }`}
            onClick={() => handleClick("hostelHome")}
          >
            <i className="ri-home-8-line"></i>Dashboard
          </li>
          <li
            className={`${
              activeLink === "hostelDonateFood" ? "active-link" : ""
            }`}
            onClick={() => handleClick("hostelDonateFood")}
          >
            <i className="ri-restaurant-line"></i>Donate Food
          </li>
          <li
            className={`${
              activeLink === "hostelFoodStatus" ? "active-link" : ""
            }`}
            onClick={() => handleClick("hostelFoodStatus")}
          >
            <i className="ri-info-card-line"></i>Food Status
          </li>
          <li
            className={`${
              activeLink === "hostelTransactionHistory" ? "active-link" : ""
            }`}
            onClick={() => handleClick("hostelTransactionHistory")}
          >
            <i className="ri-money-rupee-circle-line"></i>Transaction History
          </li>
        </ul>

        <div className="links-header">
          <i className="ri-file-chart-line"></i>ANALYTICS
        </div>
        <ul className="wastage-analytics-links-container links-container">
          <li
            className={`${
              activeLink === "lineChart" ? "active-link" : ""
            }`}
            onClick={() => handleClick("lineChart")}
          >
            <i className="ri-line-chart-line"></i>Line
          </li>
          <li
            className={`${
              activeLink === "barChart" ? "active-link" : ""
            }`}
            onClick={() => handleClick("barChart")}
          >
            <i className="ri-bar-chart-2-line"></i>Bar
          </li>
          <li
            className={`${
              activeLink === "pieChart" ? "active-link" : ""
            }`}
            onClick={() => handleClick("pieChart")}
          >
            <i className="ri-pie-chart-2-line"></i>Pie
          </li>
          <li
            className={`${
              activeLink === "areaChart" ? "active-link" : ""
            }`}
            onClick={() => handleClick("areaChart")}
          >
            <i className="ri-donut-chart-line"></i>Area
          </li>
          <li
            className={`${
              activeLink === "stackedChart" ? "active-link" : ""
            }`}
            onClick={() => handleClick("doughnutChart")}
          >
            <i className="ri-stacked-view"></i>Doughnut
          </li>
        </ul>
      </ul>
    </div>
  );
};

export default HostelSidebar;
