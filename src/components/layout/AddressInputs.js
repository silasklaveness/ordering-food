import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const libraries = ["places", "geometry"];

export default function AddressInputs({ addressProps, setAddressProps }) {
  const autocompleteInputRef = useRef(null); // Ref for the autocomplete field
  const mapRef = useRef(null); // Ref for the map container
  const markerRef = useRef(null); // Ref for the marker

  const [map, setMap] = useState(null); // Store map instance
  const [marker, setMarker] = useState(null); // Store marker instance
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || "",
    libraries: libraries,
  });

  useEffect(() => {
    if (isLoaded && mapRef.current && autocompleteInputRef.current) {
      // Initialize the map
      const initMap = new google.maps.Map(mapRef.current, {
        center: { lat: 59.911491, lng: 10.757933 }, // Default location (Oslo)
        zoom: 14,
      });
      setMap(initMap);

      // Initialize the marker at the initial location
      const initMarker = new google.maps.Marker({
        position: { lat: 59.911491, lng: 10.757933 },
        map: initMap,
      });
      setMarker(initMarker);

      // If the user already has an address, update the marker position on the map
      if (addressProps.streetAddress && addressProps.city) {
        geocodeAddress(`${addressProps.streetAddress}, ${addressProps.city}`);
      }

      // Initialize autocomplete
      const autocomplete = new google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          componentRestrictions: { country: "no" }, // Restrict to Norway
          fields: ["address_components", "geometry"],
        }
      );

      // Add listener for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          console.log("No geometry available for this place.");
          return;
        }

        // Ensure map and marker instances are available before setting
        if (map && marker) {
          // Get the location of the selected place and move the map & marker
          const location = place.geometry.location;
          map.setCenter(location);
          marker.setPosition(location);
        }

        // Extract and fill the form with address components
        const addressComponents = place.address_components || [];
        fillFormFields(addressComponents);
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    // Call geocode when the address from the profile is loaded
    if (addressProps.streetAddress && addressProps.city && map && marker) {
      geocodeAddress(`${addressProps.streetAddress}, ${addressProps.city}`);
    }
  }, [addressProps, map, marker]);

  const getComponent = (components, types) => {
    for (const type of types) {
      const component = components.find((comp) => comp.types.includes(type));
      if (component) return component.long_name;
    }
    return "";
  };

  const fillFormFields = (components) => {
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

  // Geocode the existing address and place the marker on the map
  const geocodeAddress = (address) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && map && marker) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        marker.setPosition(location);
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  };

  // Form fields definition
  const inputFields = [
    {
      id: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "Your phone number",
    },
    {
      id: "streetAddress",
      label: "Street Address",
      type: "text",
      placeholder: "Street address",
    },
    {
      id: "postalCode",
      label: "Postal Code",
      type: "text",
      placeholder: "Postal code",
    },
    { id: "city", label: "City", type: "text", placeholder: "City" },
    { id: "country", label: "Country", type: "text", placeholder: "Country" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Delivery Information</h2>

      {/* Autocomplete input for filling out the address */}
      <div className="space-y-2">
        <Label htmlFor="autocompleteAddress">Search for Address</Label>
        <Input
          id="autocompleteAddress"
          ref={autocompleteInputRef} // Attach autocomplete ref to this input
          type="text"
          placeholder="Start typing your address"
        />
      </div>

      {/* Existing form fields */}
      <div className="space-y-4 mt-6">
        {inputFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type={field.type}
              value={addressProps[field.id] || ""}
              onChange={(ev) => setAddressProps(field.id, ev.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Map showing the selected address */}
      <div
        ref={mapRef}
        style={{ height: "200px", width: "100%", marginTop: "20px" }}
      />
    </div>
  );
}
