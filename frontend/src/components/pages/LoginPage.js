import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Log into Selected Platforms</h1>
      <p>Please log in to the platforms you selected.</p>
      <button onClick={() => navigate("/processing")}>Next</button>
    </div>
  );
};

export default LoginPage;
