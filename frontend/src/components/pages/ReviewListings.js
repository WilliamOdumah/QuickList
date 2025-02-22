import { useNavigate } from "react-router-dom";

const ReviewListings = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Review & Edit Listings</h1>
      <p>Here’s how your item will appear on each platform.</p>
      <button onClick={() => navigate("/listing-in-progress")}>Confirm Listings</button>
    </div>
  );
};

export default ReviewListings;
