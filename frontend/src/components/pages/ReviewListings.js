import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../ListingsContext";
import axios from "axios";

const ReviewListings = () => {
  const navigate = useNavigate();
  const { listings, setListings } = useListings(); 
  const [postingStatus, setPostingStatus] = useState({});
  const [listingUrls, setListingUrls] = useState({});
  const [editing, setEditing] = useState({});
  const [editedDetails, setEditedDetails] = useState({});

  // Handle Posting
  const handlePostListing = async (platform, details) => {
    setPostingStatus(prev => ({ ...prev, [platform]: "Posting..." }));

    try {
      const response = await axios.post("http://localhost:5000/api/post-listing", {
        platform,
        details,
      });

      if (response.data.success) {
        setPostingStatus(prev => ({ ...prev, [platform]: "Posted Successfully!" }));
        setListingUrls(prev => ({ ...prev, [platform]: response.data.listing_url }));

        // Redirect to success page after posting
        navigate("/success", { state: { listingUrl: response.data.listing_url } });
      } else {
        setPostingStatus(prev => ({ ...prev, [platform]: "Failed to Post" }));
      }
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error);
      setPostingStatus(prev => ({ ...prev, [platform]: "Failed to Post" }));
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
        setListings(prev => ({
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
        setListings(prev => {
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
    <div>
      <h1>Review & Edit Listings</h1>
      <p>Here’s how your item will appear on each platform.</p>

      {listings ? (
        Object.entries(listings).map(([platform, details]) => (
          <div key={platform} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
            <h3>{platform}</h3>

            {/* Edit Mode */}
            {editing[platform] ? (
              <>
                <label>
                  <strong>Item Name:</strong>
                  <input
                    type="text"
                    value={editedDetails.item_name}
                    onChange={(e) => setEditedDetails({ ...editedDetails, item_name: e.target.value })}
                  />
                </label>

                <label>
                  <strong>Price:</strong>
                  <input
                    type="number"
                    value={editedDetails.suggested_price}
                    onChange={(e) => setEditedDetails({ ...editedDetails, suggested_price: e.target.value })}
                  />
                </label>

                <button onClick={() => handleSave(platform)}>Save</button>
                <button onClick={() => setEditing({ ...editing, [platform]: false })}>Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Item Name:</strong> {details.item_name}</p>
                <p><strong>Category:</strong> {details.category}</p>
                <p><strong>Condition:</strong> {details.condition}</p>
                <p><strong>Suggested Price:</strong> ${details.suggested_price}</p>

                <button onClick={() => handleEditClick(platform, details)}>Edit</button>
                <button onClick={() => handleDelete(platform)}>Delete</button>
              </>
            )}

            {/* Post Button */}
            <button onClick={() => handlePostListing(platform, details)}>
              {postingStatus[platform] || "Post"}
            </button>

            {/* Show Listing URL */}
            {listingUrls[platform] && (
              <p>
                ✅ <a href={listingUrls[platform]} target="_blank" rel="noopener noreferrer">
                  View Your Listing
                </a>
              </p>
            )}
          </div>
        ))
      ) : (
        <p>No listings available.</p>
      )}

    </div>
  );
};

export default ReviewListings;
