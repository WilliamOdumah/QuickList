import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import Processing from "./Processing";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../ListingsContext"; // Import Context

function UploadItem() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const { setListings } = useListings(); // Use Context
  const navigate = useNavigate();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/android|iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const captureImage = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setPreview(screenshot);
    fetch(screenshot)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
        setImage(file);
      });
  };

  const handlePlatformSelection = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select or take an image.");
    if (platforms.length === 0) return alert("Please select at least one platform.");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("platforms", JSON.stringify(platforms));

    try {
      const response = await axios.post("http://localhost:5000/api/list", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setListings(response.data);
      navigate("/review-listings"); 
    } catch (error) {
      console.error("Error recognizing image:", error);
      alert("Failed to process the item.");
    }
    setLoading(false);
  };

  return (
    <>
      {loading && <Processing />}
      <div>
        <h3>Upload or Take a Picture</h3>

        {!isMobile && (
          <button onClick={() => setUseCamera(!useCamera)}>
            {useCamera ? "Use File Upload" : "Use Camera"}
          </button>
        )}

        {useCamera && !isMobile && (
          <>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width="300" />
            <button onClick={captureImage}>Capture Photo</button>
          </>
        )}

        {isMobile && (
          <>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              id="fileInput"
              style={{ display: "none" }}
            />
            <button onClick={() => document.getElementById("fileInput").click()}>
              Capture Image
            </button>
          </>
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {preview && <img src={preview} alt="Preview" width="200" />}

        <h3>Select Platforms</h3>
        {["eBay", "Facebook", "Kijiji", "Craigslist"].map((platform) => (
          <div key={platform}>
            <input
              type="checkbox"
              checked={platforms.includes(platform)}
              onChange={() => handlePlatformSelection(platform)}
            />
            {platform}
          </div>
        ))}

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Identify Item"}
        </button>
      </div>
    </>
  );
}

export default UploadItem;
