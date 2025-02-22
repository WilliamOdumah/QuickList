import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Item Successfully Listed!</h1>
      <button onClick={() => navigate("/upload")}>List Another Item</button>
    </div>
  );
};

export default Success;
