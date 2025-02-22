import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ListingProgress = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/success");
    }, 5000); // Simulating listing completion
  }, [navigate]);

  return (
    <div>
      <h1>Creating Listings...</h1>
      <p>eBay: Listed</p>
      <p>Kijiji: In Progress</p>
      <p>Facebook: Requires Manual Action</p>
    </div>
  );
};

export default ListingProgress;
