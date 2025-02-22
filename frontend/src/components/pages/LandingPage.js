import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        <h1>QuickList</h1>
        <p>
          Upload an item, and list it on multiple platforms automatically.
        </p>
        <p>
          Sell Smarter. Sell Faster!
        </p>
        <button className="cta-button" onClick={() => navigate("/upload")}>
          Start Selling
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
