import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import UploadItem from "./components/pages/UploadItem";
import Processing from "./components/pages/Processing";
import ReviewListings from "./components/pages/ReviewListings";
import Success from "./components/pages/Success";
import { ListingsProvider } from "./ListingsContext";

function App() {
  return (
    <ListingsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadItem />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/review-listings" element={<ReviewListings />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
    </ListingsProvider>
  );
}

export default App;
