import React, { useState } from "react";
import NgoSidebar from "../../components/NgoSidebar";
import Header from "../../components/Header";
import NgoAvailableFoods from "./NgoAvailableFoods";
import NgoTransactionHistory from "./NgoTransactionHistory";
import NgoHome from "./NgoHome";
import { useLocation } from "react-router-dom";

import styles from "./NgoDashboard.module.css";

function NgoDashboard() {
  const location = useLocation();
  const { state } = location;
  const [activeComponent, setActiveComponent] = useState("dashboardHome");

  const renderContent = () => {
    switch (activeComponent) {
      case "ngoHome":
        return <NgoHome />;
      case "ngoAvailableFoods":
        return <NgoAvailableFoods />;
      case "ngoTransactionHistory":
        return <NgoTransactionHistory />;
      default:
        return <NgoHome />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardSidebarLayout}>
        <NgoSidebar setActiveComponent={setActiveComponent} />
      </div>
      <div className={styles.rightSideLayout}>
        <Header organizationName={state} />
        <div className={styles.contentContainer}>{renderContent()}</div>
      </div>
    </div>
  );
}

export default NgoDashboard;
