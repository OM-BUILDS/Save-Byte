import React, { useState } from "react";
import AwcSidebar from "../../components/AwcSidebar";
import Header from "../../components/Header";
import AwcAvailableFoods from "./AwcAvailableFoods";
import AwcTransactionHistory from "./AwcTransactionHistory";
import AwcHome from "./AwcHome";
import { useLocation } from "react-router-dom";

import styles from "./AwcDashboard.module.css";

function AwcDashboard() {
  const location = useLocation();
  const { state } = location;
  const [activeComponent, setActiveComponent] = useState("dashboardHome");

  const renderContent = () => {
    switch (activeComponent) {
      case "awcHome":
        return <AwcHome />;
      case "awcAvailableFoods":
        return <AwcAvailableFoods />;
      case "awcTransactionHistory":
        return <AwcTransactionHistory />;
      default:
        return <AwcHome />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardSidebarLayout}>
        <AwcSidebar setActiveComponent={setActiveComponent} />
      </div>
      <div className={styles.rightSideLayout}>
        <Header organizationName={state} />
        <div className={styles.contentContainer}>{renderContent()}</div>
      </div>
    </div>
  );
}

export default AwcDashboard;
