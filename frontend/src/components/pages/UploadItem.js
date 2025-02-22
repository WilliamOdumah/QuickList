import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import Processing from "./Processing";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../ListingsContext"; // Import Context
import "./UploadItem.css"; // Import the CSS file

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

  const removeImage = () => {
    setImage(null);
    setPreview(null);
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
      <div className="upload-container">
        <div className="upload-wrapper">
          <h2>Upload or Capture an Image</h2>
          <p className="description">
            Upload a picture of your item or use your camera to take a new one.
          </p>

          {!isMobile && (
            <div className="toggle-camera">
              <button className="cta-button" onClick={() => setUseCamera(!useCamera)}>
                {useCamera ? "Use File Upload" : "Use Camera"}
              </button>
            </div>
          )}

          {useCamera && !isMobile && (
            <div className="camera-section">
              <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
              <button className="capture-button" onClick={captureImage}>
                Capture Photo
              </button>
            </div>
          )}

          <div className="file-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="fileInput"
              className="hidden-file-input"
            />
          </div>

          {preview && (
            <div className="preview-section">
              <img src={preview} alt="Preview" className="image-preview" />
              <button className="remove-button" onClick={removeImage}>
                Remove Image
              </button>
            </div>
          )}

          <h3>Select Platforms</h3>
          <p className="description">Choose where you'd like to list your item.</p>
          <div className="platforms">
            {["eBay", "Facebook", "Kijiji", "Craigslist"].map((platform) => (
              <button
                key={platform}
                type="button"
                className={`platform-chip ${platforms.includes(platform) ? "selected" : ""}`}
                onClick={() => handlePlatformSelection(platform)}
              >
                {platform}
              </button>
            ))}
          </div>

          <button onClick={handleUpload} disabled={loading} className="cta-button upload-cta">
            {loading ? "Processing..." : "Identify Item"}
          </button>
        </div>
      </div>
    </>
  );
}

export default UploadItem;
