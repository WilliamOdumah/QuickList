import { createContext, useState, useContext } from "react";

// Create Context
const ListingsContext = createContext();

// Custom Hook to Use the Context
export const useListings = () => useContext(ListingsContext);

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState(null);

  return (
    <ListingsContext.Provider value={{ listings, setListings }}>
      {children}
    </ListingsContext.Provider>
  );
};
