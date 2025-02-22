import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import UploadItem from "./components/pages/UploadItem";
import SelectPlatforms from "./components/pages/SelectPlatforms";
import LoginPage from "./components/pages/LoginPage";
import Processing from "./components/pages/Processing";
import ReviewListings from "./components/pages/ReviewListings";
import ListingProgress from "./components/pages/ListingProgress";
import Success from "./components/pages/Success";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadItem />} />
        <Route path="/select-platforms" element={<SelectPlatforms />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/review-listings" element={<ReviewListings />} />
        <Route path="/listing-in-progress" element={<ListingProgress />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
}

export default App;
