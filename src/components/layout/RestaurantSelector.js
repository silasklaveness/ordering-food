"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ChevronUp, ChevronDown } from "lucide-react";
import { RestaurantContext } from "../RestaurantContext";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const restaurants = [
  {
    id: "tolvsrød",
    name: "TOLVSRØD",
    address: "Tolvsrød Torg 2",
    postalCode: "3150 Tolvsrød",
    phone: "+4748866907",
    mapUrl: "/tolvsrød.png",
  },
  {
    id: "sentrum",
    name: "SENTRUM",
    address: "Nedre Langgate 20",
    postalCode: "3126 Tønsberg",
    phone: "+4748866906",
    mapUrl: "/sentrum.png",
  },
  {
    id: "teie",
    name: "TEIE",
    address: "Smidsrødveien 1",
    postalCode: "3120 Nøtterøy",
    phone: "+4748866908",
    mapUrl: "/teie.png",
  },
];

export default function RestaurantSelector() {
  const { selectedRestaurant, setSelectedRestaurant, isInitialized } =
    useContext(RestaurantContext);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter(); // Initialize router for navigation

  // Wait for isInitialized to ensure selectedRestaurant is loaded
  useEffect(() => {
    if (isInitialized) {
      if (!selectedRestaurant) {
        // No restaurant selected, show modal
        setShowPopup(true);
      } else {
        const restaurant = restaurants.find((r) => r.id === selectedRestaurant);
        setCurrentRestaurant(restaurant);
      }
    }
  }, [isInitialized, selectedRestaurant]);

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant.id); // Update the selected restaurant in context
    setCurrentRestaurant(restaurant);
    setShowPopup(false);

    // Handle the mapping of "tolvsrød" to "tolvsrod" for the URL
    const restaurantPath =
      restaurant.id === "tolvsrød" ? "tolvsrod" : restaurant.id;

    // Navigate to the corresponding restaurant page
    router.push(`/${restaurantPath}`); // Navigate to the restaurant's page
  };

  if (!isInitialized) {
    // Optionally, render a loading spinner here
    return null;
  }

  return (
    <>
      {currentRestaurant && (
        <Button
          onClick={() => setShowPopup((prev) => !prev)}
          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center"
        >
          <MapPin className="mr-2" size={18} />
          {currentRestaurant.name}
          {showPopup ? (
            <ChevronUp className="ml-2" size={18} />
          ) : (
            <ChevronDown className="ml-2" size={18} />
          )}
        </Button>
      )}

      <AnimatePresence>
        {showPopup && (
          <Dialog open={showPopup} onOpenChange={(open) => setShowPopup(open)}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 p-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Velg Restaurant
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-6">
                  {currentRestaurant && (
                    <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={currentRestaurant.mapUrl}
                        alt={`Map of ${currentRestaurant.name}`}
                        layout="fill" // Makes the image fill its container
                        objectFit="cover" // Ensures the image covers the container
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  {currentRestaurant && (
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-gray-800">
                        {currentRestaurant.name}
                      </h2>
                      <p className="text-gray-600 mb-1">
                        {currentRestaurant.address}
                      </p>
                      <p className="text-gray-600 mb-4">
                        {currentRestaurant.postalCode}
                      </p>
                      <a
                        href={`tel:${currentRestaurant.phone}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="mr-2" size={18} />
                        {currentRestaurant.phone}
                      </a>
                    </div>
                  )}

                  <div className="space-y-2">
                    {restaurants.map((restaurant) => (
                      <Button
                        key={restaurant.id}
                        onClick={() => handleSelectRestaurant(restaurant)}
                        variant="ghost"
                        className={`w-full justify-start hover:bg-blue-50 text-gray-700 hover:text-blue-600 ${
                          currentRestaurant &&
                          restaurant.id === currentRestaurant.id
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        <MapPin className="mr-2" size={18} />
                        {restaurant.name}
                        {currentRestaurant &&
                          restaurant.id === currentRestaurant.id && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
