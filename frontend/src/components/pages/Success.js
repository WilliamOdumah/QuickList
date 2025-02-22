import { useNavigate, useLocation } from "react-router-dom";
import "./Success.css";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const listingUrl = searchParams.get("listingUrl");

  return (
    <div className="success-container">
      <div className="success-wrapper">
        <h1>Item Successfully Listed!</h1>

        {listingUrl ? (
          <p>
            ✅ Your listing is live! View it here:{" "}
            <a href={listingUrl} target="_blank" rel="noopener noreferrer">
              {listingUrl}
            </a>
          </p>
        ) : (
          <p>Your item has been listed successfully!</p>
        )}

        <button className="cta-button" onClick={() => navigate("/upload")}>
          List Another Item
        </button>
      </div>
    </div>
  );
};

export default Success;
