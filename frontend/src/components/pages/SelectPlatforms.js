import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SelectPlatforms = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);

  const handleSelection = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div>
      <h1>Where do you want to sell?</h1>
      {["eBay", "Facebook", "Kijiji", "Craigslist"].map((platform) => (
        <div key={platform}>
          <input
            type="checkbox"
            checked={platforms.includes(platform)}
            onChange={() => handleSelection(platform)}
          />
          {platform}
        </div>
      ))}
      <button disabled={platforms.length === 0} onClick={() => navigate("/login")}>Next</button>
    </div>
  );
};

export default SelectPlatforms;
