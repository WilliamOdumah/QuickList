import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Processing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/review-listings");
    }, 3000); // Simulates AI processing time
  }, [navigate]);

  return (
    <div>
      <h1>Analyzing your item...</h1>
      <p>Please wait while we extract the item details and find the best price.</p>
    </div>
  );
};

export default Processing;
