import React, { useEffect, useState, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "../../api/api";
import styles from "./AwcTrackFood.module.css";
import LightButton from "../../components/LightButton";
import DarkButton from "../../components/DarkButton";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { AuthContext } from "../../context/auth-context";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

// Custom Marker Icons
const hostelIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/883/883746.png",
  iconSize: [40, 40],
});

const AwcIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3048/3048396.png",
  iconSize: [40, 40],
});

const AwcTrackFood = ({ donorCoords, receiverCoords,transactionId }) => {
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [donorPlace, setDonorPlace] = useState("Loading...");
  const [receiverPlace, setReceiverPlace] = useState("Loading...");
  const [routeData, setRouteData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("drive");
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const apiKey = "02f139a2a1d147f1a46d19124de1d746";
  const isRetina = L.Browser.retina;

  // 📌 Reverse Geocoding
  const getPlaceName = async (lat, lng, setPlace) => {
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}`;
      const response = await axios.get(url);
      if (response.data.features?.length > 0) {
        setPlace(response.data.features[0].properties.formatted);
      } else {
        setPlace("Unknown Location");
      }
    } catch (error) {
      setPlace("Unknown Location");
    }
  };

  // 📌 Fetch Route using Geoapify API
  const fetchRoute = async (mode) => {
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${donorCoords.lat},${donorCoords.lng}|${receiverCoords.lat},${receiverCoords.lng}&mode=${mode}&details=instruction_details&apiKey=${apiKey}`;
      console.log(`Fetching ${mode} route:`, url); // Debugging request

      const response = await axios.get(url);
      console.log(`${mode} API Response:`, response.data); // Debugging response

      if (response.data.features?.length > 0) {
        const feature = response.data.features[0];

        setRouteData(feature); // Save the full GeoJSON route

        setDistance((feature.properties.distance / 1000).toFixed(2)); // Convert meters to km
        setEstimatedTime(Math.round(feature.properties.time / 60)); // Convert seconds to minutes
      } else {
        console.error(`No route data for ${mode}`);
      }
    } catch (error) {
      console.error(`Error fetching ${mode} route:`, error);
    }
  };

  useEffect(() => {
    getPlaceName(donorCoords.lat, donorCoords.lng, setDonorPlace);
    getPlaceName(receiverCoords.lat, receiverCoords.lng, setReceiverPlace);
    fetchRoute(selectedMode);
  }, [donorCoords, receiverCoords, selectedMode]);

  const opeAwcogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${donorCoords.lat},${donorCoords.lng}&destination=${receiverCoords.lat},${receiverCoords.lng}&travelmode=${selectedMode}`;
    window.open(url, "_blank");
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      showErrorToast("Please enter a 6-digit OTP");
      return;
    }

    try {
      const response = await sendRequest(
        `${BASE_API_URL}/verify-otp/${transactionId}`,
        "POST",
        { otp: enteredOtp },

        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response?.success) {
        showSuccessToast("✅ OTP Verified! Transaction Completed.");
      } else {
        showErrorToast("❌ Incorrect OTP. Try Again.");
      }
    } catch (error) {
      showErrorToast(
        error.message || "⚠️ Verification failed. Please try again."
      );
    }
  };

  const handleOtpChange = (index, value) => {
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  return (
    <div className={styles.mapContainer}>
      {/* 📝 Info Panel */}
      <div className={styles.leftSideContainer}>
        <div className={styles.infoPanel}>
          <h2>Tracking Food Movement</h2>
          <p className={styles.locationTexts}>
            Hostel Location: <span>{donorPlace}</span>
          </p>
          <p className={styles.locationTexts}>
            Awc Location: <span>{receiverPlace}</span>
          </p>

          {/* Mode Switch */}
          <div className={styles.modeButtons}>
            <LightButton
              onClick={() => setSelectedMode("drive")}
              buttonText="🚗 Car"
            ></LightButton>
            <LightButton
              onClick={() => setSelectedMode("walk")}
              buttonText="🚶 Walk"
            ></LightButton>
            <LightButton
              onClick={() => setSelectedMode("scooter")}
              buttonText="🚲 Bike"
            ></LightButton>
          </div>

          {distance && estimatedTime ? (
            <div className={styles.distanceContainer}>
              <p>
                <strong>Distance:</strong> {distance} km
              </p>
              <p>
                <strong>Estimated Time:</strong> {estimatedTime} mins
              </p>
            </div>
          ) : (
            <p>Loading route data...</p>
          )}
          <div className={styles.navButton}>
            <LightButton
              onClick={opeAwcogleMaps}
              buttonText="Start Google Map Navigation"
            ></LightButton>
          </div>
        </div>

        <div className={styles.otpContainer}>
          <div className={styles.topContainer}>
            <h3>Enter OTP to Complete Transaction</h3>
            <div className={styles.otpBoxes}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index - 1}`).focus();
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles.otpButtonContainer}>
            <DarkButton
              onClick={verifyOtp}
              buttonText="✔️ Verify OTP"
            ></DarkButton>
          </div>
        </div>
      </div>

      {/* 🗺️ Map */}

      <MapContainer
        center={[donorCoords.lat, donorCoords.lng]}
        zoom={12}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>'
          url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}${
            isRetina ? "@2x" : ""
          }.png?apiKey=${apiKey}`}
          maxZoom={20}
        />

        <Marker position={[donorCoords.lat, donorCoords.lng]} icon={hostelIcon}>
          <Popup>
            <strong>🏠 Hostel (Donor)</strong>
            <br />
            {donorPlace}
          </Popup>
        </Marker>

        <Marker
          position={[receiverCoords.lat, receiverCoords.lng]}
          icon={AwcIcon}
        >
          <Popup>
            <strong>🤝 Awc (Receiver)</strong>
            <br />
            {receiverPlace}
          </Popup>
        </Marker>

        {/* ✅ Route Renderer */}
        <RouteLayer routeData={routeData} />
      </MapContainer>
    </div>
  );
};

// ✅ Separate Component to Render Route
const RouteLayer = ({ routeData }) => {
  const map = useMap();

  useEffect(() => {
    if (routeData) {
      const routeLayer = L.geoJSON(routeData, {
        style: {
          color: "rgba(20, 137, 255, 0.7)",
          weight: 5,
        },
      }).bindPopup((layer) => {
        return `${layer.feature.properties.distance} ${layer.feature.properties.distance_units}, ${layer.feature.properties.time}`;
      });

      routeLayer.addTo(map);

      return () => {
        map.removeLayer(routeLayer);
      };
    }
  }, [routeData, map]);

  return null;
};

export default AwcTrackFood;
