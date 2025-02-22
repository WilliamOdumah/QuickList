import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/logo.png"; // Make sure to upload your logo here

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        {/* Logo at the top */}
        <img src={logo} alt="QuickList Logo" className="logo" />

        <h1>QuickList</h1>
        <p>Upload an item, and list it on multiple platforms automatically.</p>
        <p>Sell Smarter. Sell Faster.</p>

        <button className="cta-button" onClick={() => navigate("/upload")}>
          Start Selling
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
