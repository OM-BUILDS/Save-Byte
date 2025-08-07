// src/App.jsx
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import LoadingHome from "./pages/LoadingHome";
import Home from "./pages/Home";
import HomeNavbar from "./components/HomeNavbar"
import RegistrationForm from "./pages/RegistrationForm";
import LogIn from "./pages/LogIn";
import HostelDashboard from "./pages/hostel-dashboard/HostelDashboard";
import HostelDonateFood from "./pages/hostel-dashboard/HostelDonateFood";
import HostelFoodStatus from "./pages/hostel-dashboard/HostelFoodStatus";
import HostelEditFood from "./pages/hostel-dashboard/HostelEditFood";
import HostelTransactionHistory from "./pages/hostel-dashboard/HostelTransactionHistory";
import WastageAreaChart from "./components/charts/WastageAreaChart";
import WastageBarChart from "./components/charts/WastageBarChart";
import WastageDoughnutChart from "./components/charts/WastageDoughnutChart";
import WastageLineChart from "./components/charts/WastageLineChart";
import WastagePieChart from "./components/charts/WastagePieChart";
import NgoDashboard from "./pages/ngo-dashboard/NgoDashboard";
import NgoAvailableFoods from "./pages/ngo-dashboard/NgoAvailableFoods";
import NgoTransactionHistory from "./pages/ngo-dashboard/NgoTransactionHistory";
import NgoTrackFood from "./pages/ngo-dashboard/NgoTrackFood";
import AwcDashboard from "./pages/awc-dashboard/AwcDashboard";

import { AuthContext } from "./context/auth-context";
import { useAuth } from "./hooks/auth-hook";
import "leaflet/dist/leaflet.css";
import "./App.module.css"


function AppContent() {
  const { token, login, logout, userId } = useAuth();
  const location = useLocation();
  const hideNavbarOnRoutes = ["/hostel-dashboard","/ngo-dashboard","/awc-dashboard"];

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      {/* Conditionally hide HomeNavbar */}
      {!hideNavbarOnRoutes.includes(location.pathname) && <HomeNavbar />}

      <Routes>
        <Route path="/" element={<LoadingHome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/hostel-dashboard" element={<HostelDashboard />} />
        <Route path="/ngo-dashboard" element={<NgoDashboard/>} />
        <Route path="/awc-dashboard" element={<AwcDashboard/>} />
      </Routes>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent></AppContent>
    </Router>
  );
}

export default App;


