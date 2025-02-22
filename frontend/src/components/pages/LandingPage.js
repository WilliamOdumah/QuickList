import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Sell Your Items Easily</h1>
      <p>Upload an item, let AI analyze it, and list it on multiple platforms automatically.</p>
      <button onClick={() => navigate("/upload")}>Start Selling</button>
    </div>
  );
};

export default LandingPage;
