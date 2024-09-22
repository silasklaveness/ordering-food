import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const libraries = ["places", "geometry"];

export default function CheckoutInputs({
  addressProps,
  setAddressProps,
  deliveryOption,
  name,
  setName,
  email,
  setEmail,
  disabled = false,
  setCanProceed, // Function to control whether the user can proceed
  selectedRestaurant, // Add selectedRestaurant as a prop
}) {
  const autocompleteInputRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null); // User's marker
  const restaurantMarkerRef = useRef(null); // Restaurant's marker
  const polylineRef = useRef(null); // Polyline connecting the markers

  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // Store user's location
  const [restaurantLocation, setRestaurantLocation] = useState(null); // Store restaurant's location
  const [distance, setDistance] = useState(null); // Store distance in kilometers
  const [isWithinDeliveryRange, setIsWithinDeliveryRange] = useState(true); // Delivery range check

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Prevent form submission on "Enter"
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
    }
  };

  // Restaurant addresses based on selected location in lowercase
  const restaurantAddresses = {
    tolvsrød: "Valløveien 58, 3152 Tolvsrød",
    teie: "Smidsrødveien 14, 3120 Nøtterøy",
    sentrum: "Stoltenbergs gate 31b, 3110 Tønsberg",
  };

  // Get the address for the selected restaurant in lowercase
  const getRestaurantAddress = () => {
    return restaurantAddresses[selectedRestaurant?.toLowerCase()] || null;
  };

  // Initialize the map
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 59.2317, lng: 10.4014 }, // Default center near Nøtterøy
        zoom: 12,
      });
      setMap(mapInstance);

      // Initialize the user's marker
      const markerInstance = new google.maps.Marker({
        map: mapInstance,
      });
      markerRef.current = markerInstance;

      // Cleanup
      return () => {
        markerInstance.setMap(null);
      };
    }
  }, [isLoaded]);

  // Geocode the restaurant's address based on selected restaurant
  useEffect(() => {
    if (map && selectedRestaurant) {
      const geocoder = new google.maps.Geocoder();
      const restaurantAddress = getRestaurantAddress(); // Get the address for the selected restaurant

      if (restaurantAddress) {
        geocoder.geocode({ address: restaurantAddress }, (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            setRestaurantLocation(location);
          } else {
            console.error("Geocode for restaurant failed due to: " + status);
          }
        });
      }
    }
  }, [map, selectedRestaurant]); // Re-run if selectedRestaurant changes

  // Initialize the restaurant's marker
  useEffect(() => {
    if (map && restaurantLocation) {
      if (!restaurantMarkerRef.current) {
        const restaurantMarker = new google.maps.Marker({
          position: restaurantLocation,
          map: map,
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Different icon for the restaurant
          title: selectedRestaurant, // Show selected restaurant name
        });
        restaurantMarkerRef.current = restaurantMarker;

        // Cleanup
        return () => {
          restaurantMarker.setMap(null);
        };
      } else {
        restaurantMarkerRef.current.setPosition(restaurantLocation);
      }
    }
  }, [map, restaurantLocation]);

  // Initialize Autocomplete
  useEffect(() => {
    if (isLoaded && map && autocompleteInputRef.current && !disabled) {
      const autocompleteInstance = new google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          fields: ["address_components", "geometry"],
        }
      );
      setAutocomplete(autocompleteInstance);

      // Autocomplete listener
      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        if (!place.geometry) {
          console.error("Place contains no geometry");
          return;
        }

        // Update user's location and marker
        map.setCenter(place.geometry.location);
        markerRef.current.setPosition(place.geometry.location);
        setUserLocation(place.geometry.location);

        // Fill form fields
        const components = place.address_components;
        fillFormFields(components);
      });

      // Cleanup
      return () => {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      };
    }
  }, [isLoaded, map, disabled]);

  // Update user's marker when userLocation changes
  useEffect(() => {
    if (userLocation && markerRef.current) {
      markerRef.current.setPosition(userLocation);
    }
  }, [userLocation]);

  // Update polyline, map bounds, and distance
  useEffect(() => {
    if (userLocation && restaurantLocation && map) {
      const path = [restaurantLocation, userLocation];

      // Create or update the polyline
      if (!polylineRef.current) {
        const polyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#0000FF",
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map: map,
        });
        polylineRef.current = polyline;
      } else {
        polylineRef.current.setPath(path);
      }

      // Adjust map bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(restaurantLocation);
      bounds.extend(userLocation);
      map.fitBounds(bounds);

      // Calculate the distance using the Geometry library
      const distanceInMeters =
        google.maps.geometry.spherical.computeDistanceBetween(
          restaurantLocation,
          userLocation
        );
      const distanceInKilometers = distanceInMeters / 1000;
      setDistance(distanceInKilometers);

      // Check if within delivery range
      const withinRange = distanceInKilometers <= 8;
      setIsWithinDeliveryRange(withinRange);

      // Inform parent component
      if (setCanProceed) {
        setCanProceed(withinRange);
      }
    } else {
      // Remove polyline if locations are not available
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      setDistance(null); // Reset distance
      setIsWithinDeliveryRange(true); // Reset delivery range check
      if (setCanProceed) {
        setCanProceed(true);
      }
    }
  }, [userLocation, restaurantLocation, map]);

  // Geocode the user's address when addressProps change
  useEffect(() => {
    if (
      addressProps.streetAddress &&
      addressProps.city &&
      map &&
      markerRef.current
    ) {
      geocodeAddress(`${addressProps.streetAddress}, ${addressProps.city}`);
    }
  }, [addressProps, map]);

  const getComponent = (components, types) => {
    for (const type of types) {
      const component = components.find((comp) => comp.types.includes(type));
      if (component) return component.long_name;
    }
    return "";
  };

  const fillFormFields = (components) => {
    if (disabled) return;
    const street = getComponent(components, ["route"]);
    const streetNumber = getComponent(components, ["street_number"]);
    const city = getComponent(components, [
      "locality",
      "postal_town",
      "sublocality",
      "administrative_area_level_2",
    ]);
    const postalCode = getComponent(components, ["postal_code"]);
    const country = getComponent(components, ["country"]);

    setAddressProps("streetAddress", `${street} ${streetNumber}`);
    setAddressProps("city", city);
    setAddressProps("postalCode", postalCode);
    setAddressProps("country", country);
  };

  const geocodeAddress = (address) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && map && markerRef.current) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        markerRef.current.setPosition(location);
        setUserLocation(location);
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  };

  const commonFields = [
    { id: "name", label: "Name", value: name, onChange: setName },
    {
      id: "email",
      label: "Email",
      type: "email",
      value: email,
      onChange: setEmail,
    },
    {
      id: "phone",
      label: "Phone",
      type: "tel",
      value: addressProps.phone,
      onChange: (value) => setAddressProps("phone", value),
    },
  ];

  const deliveryFields = [
    {
      id: "streetAddress",
      label: "Street Address",
      value: addressProps.streetAddress,
      onChange: (value) => setAddressProps("streetAddress", value),
    },
    {
      id: "postalCode",
      label: "Postal Code",
      value: addressProps.postalCode,
      onChange: (value) => setAddressProps("postalCode", value),
    },
    {
      id: "city",
      label: "City",
      value: addressProps.city,
      onChange: (value) => setAddressProps("city", value),
    },
  ];

  const inputFields =
    deliveryOption === "delivery"
      ? [...commonFields, ...deliveryFields]
      : commonFields;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {deliveryOption === "delivery"
          ? "Delivery Information"
          : "Contact Information"}
      </h2>

      {!disabled && deliveryOption === "delivery" && (
        <div className="space-y-2 mb-4">
          <Label htmlFor="autocompleteAddress">Search for Address</Label>
          <Input
            id="autocompleteAddress"
            ref={autocompleteInputRef}
            type="text"
            placeholder="Start typing your address"
            onKeyDown={handleKeyDown} // Prevent form submission on "Enter"
          />
        </div>
      )}

      <div className="space-y-4">
        {inputFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type={field.type || "text"}
              value={field.value || ""}
              onChange={(ev) => !disabled && field.onChange(ev.target.value)}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              disabled={disabled}
              onKeyDown={handleKeyDown} // Prevent form submission on "Enter"
            />
          </div>
        ))}
      </div>

      {!disabled && deliveryOption === "delivery" && (
        <>
          {distance !== null && (
            <p className="mt-4 text-lg">
              The distance from the restaurant to your address is{" "}
              <strong>{distance.toFixed(2)} km</strong>.
            </p>
          )}
          {!isWithinDeliveryRange && (
            <p className="mt-2 text-red-600">
              Din addresse er over vår avstandsgrense på 8km. Enten velg ny
              addresse eller velg hent selv.
            </p>
          )}
          <div
            ref={mapRef}
            style={{ height: "200px", width: "100%", marginTop: "20px" }}
          />
        </>
      )}
    </div>
  );
}
