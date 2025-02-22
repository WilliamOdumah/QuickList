import { useNavigate, useLocation } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const listingUrl = location.state?.listingUrl;

  return (
    <div>
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

      <button onClick={() => navigate("/upload")}>List Another Item</button>
    </div>
  );
};

export default Success;
