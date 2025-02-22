import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../ListingsContext";
import axios from "axios";
import "./ReviewListings.css";

// Import platform logos from the assets folder
import eBayLogo from "../../assets/logos/ebay.png";
import FacebookLogo from "../../assets/logos/facebook.png";
import KijijiLogo from "../../assets/logos/kijiji.png";
import CraigslistLogo from "../../assets/logos/craigslist.png";

const platformLogos = {
  eBay: eBayLogo,
  Facebook: FacebookLogo,
  Kijiji: KijijiLogo,
  Craigslist: CraigslistLogo,
};

const ReviewListings = () => {
  const navigate = useNavigate();
  const { listings, setListings } = useListings();
  const [postingStatus, setPostingStatus] = useState({});
  const [listingUrls, setListingUrls] = useState({});
  const [editing, setEditing] = useState({});
  const [editedDetails, setEditedDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Handle Posting
  const handlePostListing = async (platform, details) => {
    setPostingStatus((prev) => ({ ...prev, [platform]: "Posting..." }));

    try {
      const response = await axios.post("http://localhost:5000/api/post-listing", {
        platform,
        details,
      });

      if (response.data.success) {
        setPostingStatus((prev) => ({ ...prev, [platform]: "Posted Successfully!" }));
        setListingUrls((prev) => ({ ...prev, [platform]: response.data.listing_url }));

        // Open success page in a new tab
        const successUrl = `/success?listingUrl=${encodeURIComponent(response.data.listing_url)}`;
        window.open(successUrl, "_blank");
      } else {
        setPostingStatus((prev) => ({ ...prev, [platform]: "Failed to Post" }));
      }
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error);
      setPostingStatus((prev) => ({ ...prev, [platform]: "Failed to Post" }));
    }
  };

  const handleEditClick = (platform, details) => {
    setEditing({ ...editing, [platform]: true });
    setEditedDetails(details);
  };

  const handleSave = async (platform) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/update-listing`, {
        platform,
        updatedDetails: editedDetails,
      });

      if (response.data.success) {
        setListings((prev) => ({
          ...prev,
          [platform]: { ...prev[platform], ...editedDetails },
        }));
        setEditing({ ...editing, [platform]: false });
      }
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const handleDelete = async (platform) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/delete-listing`, {
        data: { platform },
      });

      if (response.data.success) {
        setListings((prev) => {
          const updatedListings = { ...prev };
          delete updatedListings[platform];
          return updatedListings;
        });
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  return (
    <div className="review-container">
      <div className="review-wrapper">
        <h1>Review & Edit Listings</h1>
        <p>Here’s how your item will appear on each platform.</p>

        {loading ? (
          <div className="spinner"></div>
        ) : listings && Object.keys(listings).length > 0 ? (
          <div className="listings-grid">
            {Object.entries(listings).map(([platform, details]) => (
              <div key={platform} className="listing-card">
                <div className="listing-header">
                  <img src={platformLogos[platform]} alt={platform} className="platform-logo" />
                  <h3>{platform}</h3>
                </div>

                {editing[platform] ? (
                  <div className="edit-section">
                    <label>
                      <strong>Item Name:</strong>
                      <input
                        type="text"
                        value={editedDetails.item_name}
                        onChange={(e) =>
                          setEditedDetails({ ...editedDetails, item_name: e.target.value })
                        }
                      />
                    </label>

                    <label>
                      <strong>Price:</strong>
                      <input
                        type="number"
                        value={editedDetails.suggested_price}
                        onChange={(e) =>
                          setEditedDetails({ ...editedDetails, suggested_price: e.target.value })
                        }
                      />
                    </label>

                    <div className="edit-buttons">
                      <button onClick={() => handleSave(platform)}>Save</button>
                      <button onClick={() => setEditing({ ...editing, [platform]: false })}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="details-section">
                    <p>
                      <strong>Item Name:</strong> {details.item_name}
                    </p>
                    <p>
                      <strong>Category:</strong> {details.category}
                    </p>
                    <p>
                      <strong>Condition:</strong> {details.condition}
                    </p>
                    <p>
                      <strong>Suggested Price:</strong> ${details.suggested_price}
                    </p>

                    <div className="action-buttons">
                      <button onClick={() => handleEditClick(platform, details)}>Edit</button>
                      <button onClick={() => handleDelete(platform)}>Delete</button>
                    </div>
                  </div>
                )}

                <button onClick={() => handlePostListing(platform, details)} className="cta-button">
                  {postingStatus[platform] || "Post"}
                </button>

                {listingUrls[platform] && (
                  <p className="listing-url">
                    ✅{" "}
                    <a href={listingUrls[platform]} target="_blank" rel="noopener noreferrer">
                      View Your Listing
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No listings available.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewListings;
