
import React, { useState } from "react";
import Header from "../../components/Header";
import HostelSidebar from "../../components/hostelSidebar"
import HostelHome from "./HostelHome";
import HostelDonateFood from "./HostelDonateFood";
import HostelFoodStatus from "./HostelFoodStatus";
import HostelTransactionHistory from "./HostelTransactionHistory";
import WastageAreaChart from "../../components/charts/WastageAreaChart";
import WastageBarChart from "../../components/charts/WastageBarChart";
import WastageDoughnutChart from "../../components/charts/WastageDoughnutChart";
import WastageLineChart from "../../components/charts/WastageLineChart";
import WastagePieChart from "../../components/charts/WastagePieChart";


import { useLocation } from "react-router-dom";


import Styles from "./HostelDashboard.module.css";

export default function HostelDashboard() {
  const location = useLocation();
  const {state} = location;


  const [activeComponent, setActiveComponent] = useState("dashboardHome");

  const renderContent = () => {
    switch (activeComponent) {
      case "hostelHome":
        return <HostelHome />;
      case "hostelDonateFood":
        return <HostelDonateFood/>;
      case "hostelFoodStatus":
        return <HostelFoodStatus />;
      case "hostelTransactionHistory":
        return <HostelTransactionHistory />;
      case "lineChart":
        return <WastageLineChart />;
      case "barChart":
        return <WastageBarChart />;
      case "areaChart":
        return <WastageAreaChart />;
      case "pieChart":
        return <WastagePieChart />;
      case "doughnutChart":
        return <WastageDoughnutChart />;
      default:
        return <HostelHome />;
    }
  };



  return (
    <div className={Styles.dashboardContainer}>
      <div className={Styles.dashboardSidebarLayout}>
        <HostelSidebar setActiveComponent={setActiveComponent}/>
      </div>
      <div className={Styles.rightSideLayout}>
        <Header organizationName={state} />
        <div className="content-container">{renderContent()}</div>
      </div>
    </div>
  );
}


