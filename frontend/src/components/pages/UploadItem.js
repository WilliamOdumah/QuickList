import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import Processing from "./Processing";

function UploadItem() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the user is on a mobile device
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
        setImage(new File([blob], "captured_image.jpg", { type: "image/jpeg" }));
      });
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select or take an image.");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:5000/api/list", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setItemDetails(response.data);
    } catch (error) {
      console.error("Error recognizing image:", error);
      alert("Failed to process the item.");
    }
    setLoading(false);
  };

  return (
    <>
    {loading && (
        <Processing/> 
    )}

    <div>    
      <h3>Upload or Take a Picture</h3>

      {/* If on a laptop, allow webcam use. If on mobile, only show file upload. */}
      {!isMobile && (
        <button onClick={() => setUseCamera(!useCamera)}>
          {useCamera ? "Use File Upload" : "Use Camera"}
        </button>
      )}

      {/* Camera View (Only for laptops) */}
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
          style={{ display: "none" }} // Hide the default input
        />
        <button onClick={() => document.getElementById("fileInput").click()}>
          📸 Capture Image
        </button>
      </>
      )}

      

      {/* File Upload (Always available, required on mobile) */}
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {/* Image Preview */}
      {preview && <img src={preview} alt="Preview" width="200" />}

      {/* Upload Button */}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Identify Item"}
      </button>

      {/* Show Item Details */}
      {itemDetails && (
        <div>
          <h3>Item Details:</h3>
          <pre>{JSON.stringify(itemDetails, null, 2)}</pre>
        </div>
      )}
    </div>
    </>
  );
}

export default UploadItem;
