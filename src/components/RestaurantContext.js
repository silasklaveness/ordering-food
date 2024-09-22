"use client"; // This ensures the context is a client component

import { createContext, useState, useEffect, useRef } from "react";

export const RestaurantContext = createContext();

export default function RestaurantProvider({ children }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialRender = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRestaurant = localStorage.getItem("selectedRestaurant");
      if (storedRestaurant) {
        try {
          const parsedRestaurant = JSON.parse(storedRestaurant);
          setSelectedRestaurant(parsedRestaurant);
        } catch (error) {
          console.error("Failed to parse stored restaurant:", error);
          localStorage.removeItem("selectedRestaurant");
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedRestaurant) {
        localStorage.setItem(
          "selectedRestaurant",
          JSON.stringify(selectedRestaurant)
        );
      } else {
        localStorage.removeItem("selectedRestaurant");
      }

      if (initialRender.current) {
        initialRender.current = false;
      } else {
        // Handle any side effects when selectedRestaurant changes
        // For example, clear the cart if you have that functionality
      }
    }
  }, [selectedRestaurant]);

  return (
    <RestaurantContext.Provider
      value={{ selectedRestaurant, setSelectedRestaurant, isInitialized }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}
