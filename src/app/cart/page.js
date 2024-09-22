"use client";

import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext, cartProductPrice } from "@/components/AppContext";
import SectionHeaders from "@/components/layout/SectionHeaders";
import CheckoutInputs from "@/components/layout/CheckoutInputs";
import { UseProfile } from "@/components/UseProfile";
import CartProduct from "@/components/meny/CartProduct";
import MenyItemPopup from "@/components/meny/MenyItemPopup";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  AlertCircle,
  ChevronLeft,
  CreditCard,
  ArrowRight,
  Car,
  HandCoins,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantContext } from "@/components/RestaurantContext";

export default function CartPage() {
  const { cartProducts, removeCartProduct, setCartProducts } =
    useContext(CartContext);
  const { selectedRestaurant } = useContext(RestaurantContext);
  const [address, setAddress] = useState({});
  const { data: profileData } = UseProfile();
  const [step, setStep] = useState("summary");
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isWithinOpeningHours, setIsWithinOpeningHours] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [canProceed, setCanProceed] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkOpeningHours = () => {
      const day = currentTime.getDay();
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const currentTimeInMinutes = hours * 60 + minutes;

      let isOpen = false;

      if (day >= 1 && day <= 4) {
        // Monday to Thursday
        isOpen =
          currentTimeInMinutes >= 14 * 60 && currentTimeInMinutes < 22 * 60;
      } else if (day === 5 || day === 6) {
        // Friday and Saturday
        isOpen =
          currentTimeInMinutes >= 13 * 60 && currentTimeInMinutes < 23 * 60;
      } else if (day === 0) {
        // Sunday
        isOpen =
          currentTimeInMinutes >= 13 * 60 && currentTimeInMinutes < 22 * 60;
      }

      setIsWithinOpeningHours(isOpen);
    };

    checkOpeningHours();
  }, [currentTime]);

  useEffect(() => {
    if (profileData) {
      if (profileData.name && !name) {
        setName(profileData.name);
      }
      if (profileData.email && !email) {
        setEmail(profileData.email);
      }
      if (profileData.streetAddress && !address.streetAddress) {
        const { phone, streetAddress, city, postalCode, country } = profileData;
        setAddress({ phone, streetAddress, city, postalCode, country });
      }
    }
  }, [profileData, name, email, address]);

  const subtotal = cartProducts.reduce(
    (sum, p) => sum + cartProductPrice(p) * p.quantity,
    0
  );

  const deliveryFee = deliveryOption === "delivery" ? 75 : 0;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = (index, newQuantity) => {
    setCartProducts((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = newQuantity;
      return updatedCart;
    });
  };

  const handleEditProduct = (index, updatedProduct) => {
    setCartProducts((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index] = updatedProduct;
      return updatedCart;
    });
    setEditingProductIndex(null);
  };

  function handleAddressChange(propName, value) {
    setAddress((prev) => ({ ...prev, [propName]: value }));
  }

  const getOpeningHours = (day) => {
    if (day >= 1 && day <= 4) {
      return { open: 14, close: 22 };
    } else if (day === 5 || day === 6 || day === 0) {
      return { open: 13, close: 23 };
    }
    return null;
  };

  const handleScheduleOrder = (selectedDate, selectedTime) => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time for scheduling.");
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const day = selectedDateTime.getDay();
    const hours = selectedDateTime.getHours();
    const minutes = selectedDateTime.getMinutes();

    const openingHours = getOpeningHours(day);

    if (openingHours) {
      const { open, close } = openingHours;
      if (hours >= open && hours < close) {
        // Additional check to ensure the scheduled time is in the future
        if (selectedDateTime < new Date()) {
          toast.error("Scheduled time must be in the future.");
          return;
        }
        setScheduledTime(selectedDateTime);
        setIsScheduling(false);
        toast.success(
          `Order scheduled for ${selectedDateTime.toLocaleString()}`
        );
      } else {
        toast.error(
          "Selected time is outside of opening hours. Please choose a valid time."
        );
      }
    } else {
      toast.error("Invalid day selected. Please choose a valid day.");
    }
  };

  const getMinScheduleDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const getMaxScheduleDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split("T")[0];
  };

  const getAvailableTimes = (date) => {
    const selectedDay = new Date(date).getDay();
    const openingHours = getOpeningHours(selectedDay);

    if (!openingHours) return [];

    const times = [];
    const { open, close } = openingHours;

    // Generate times in 30-minute intervals
    for (let hour = open; hour < close; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }

    // Remove times that are equal to or after closing time
    // For example, if close is 22, remove 22:00 and onwards
    return times.filter((time) => {
      const [h, m] = time.split(":").map(Number);
      return h < close || (h === close && m === 0);
    });
  };

  async function proceedToCheckout(ev) {
    ev.preventDefault();

    if (!canProceed) {
      toast.error("Adressen er for lang unna restauranten.");
      return;
    }

    if (!isWithinOpeningHours && !scheduledTime) {
      toast.error("Vi er stengt. Enten kom tilbake eller bestill for senere.");
      return;
    }

    if (deliveryOption === "delivery" && subtotal < 200) {
      toast.error("Minimum order for delivery is 200 KR");
      return;
    }

    if (!name || !email || !address.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      deliveryOption === "delivery" &&
      (!address.streetAddress || !address.city || !address.postalCode)
    ) {
      toast.error("Please fill in all address fields for delivery");
      return;
    }

    const promise = new Promise((resolve, reject) => {
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          cartProducts,
          deliveryOption,
          name,
          email,
          scheduledTime: scheduledTime ? scheduledTime.toISOString() : null,
          selectedRestaurant,
        }),
      }).then(async (response) => {
        if (response.ok) {
          resolve();
          window.location = await response.json();
        } else {
          reject();
        }
      });
    });

    await toast.promise(promise, {
      loading: "Preparing your order...",
      success: scheduledTime
        ? "Order scheduled successfully!"
        : "Redirecting to payment...",
      error: "Something went wrong, please try again later!",
    });
  }

  if (cartProducts?.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:mt-8 text-center px-4"
      >
        <SectionHeaders mainHeader="Your cart" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg shadow-lg p-4 sm:p-8"
        >
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 mr-2 sm:mr-3" />
            <p className="text-base sm:text-lg font-semibold text-yellow-800">
              Handlekurv tom
            </p>
          </div>
          <p className="text-sm sm:text-base text-yellow-700">
            Gå til meny for å legge til nye retter.
          </p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <ShoppingCart className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mt-6 sm:mt-8 text-yellow-400" />
          </motion.div>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-20 sm:mt-[190px] px-4 max-w-2xl mx-auto"
    >
      <div className="text-center mb-6 sm:mb-8">
        <SectionHeaders
          mainHeader="Din handlekurv"
          subHeader={selectedRestaurant}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Order Summary
            </h2>
            <div className="space-y-4">
              {cartProducts.map((product, index) => (
                <CartProduct
                  key={index}
                  product={product}
                  onRemove={removeCartProduct}
                  index={index}
                  onUpdateQuantity={handleUpdateQuantity}
                  onEditProduct={(updatedProduct) =>
                    handleEditProduct(index, updatedProduct)
                  }
                  onEdit={() => setEditingProductIndex(index)}
                />
              ))}
            </div>
            <div className="py-4 flex items-center justify-between border-t mt-4">
              <div className="text-sm sm:text-base text-gray-600">
                <p>Subtotal:</p>
                <p>Delivery:</p>
                <p className="font-semibold text-base sm:text-lg">Total:</p>
              </div>
              <div className="text-right text-sm sm:text-base">
                <p>{subtotal} KR</p>
                <p>{deliveryFee} KR</p>
                <p className="font-semibold text-base sm:text-lg">{total} KR</p>
              </div>
            </div>
            {!isWithinOpeningHours && (
              <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800 font-semibold">
                  Vi er stengt. Enten kom tilbake eller bestill for senere.
                </p>
              </div>
            )}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Choose delivery option:</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeliveryOption("pickup")}
                  className={`flex-1 p-4 rounded-lg border-2 ${
                    deliveryOption === "pickup"
                      ? "border-primary bg-primary/10"
                      : "border-gray-200"
                  } transition-all duration-200`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <HandCoins className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold">Hente selv</h4>
                  <p className="text-sm text-gray-500">Klar på ca 15 min</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeliveryOption("delivery")}
                  className={`flex-1 p-4 rounded-lg border-2 ${
                    deliveryOption === "delivery"
                      ? "border-primary bg-primary/10"
                      : "border-gray-200"
                  } transition-all duration-200`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Car className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold">Levering</h4>
                  <p className="text-sm text-gray-500">Max 8km unna</p>
                  <p className="text-sm font-semibold">75 kr</p>
                </motion.button>
              </div>
            </div>
            {isWithinOpeningHours && !isScheduling && (
              <Button
                onClick={() => setIsScheduling(true)}
                className="mt-4 w-full"
                variant="outline"
              >
                Order for Later
                <Clock className="ml-2 w-4 h-4" />
              </Button>
            )}
            {(isScheduling || !isWithinOpeningHours) && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Schedule your order:</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="schedule-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Date
                    </label>
                    <input
                      type="date"
                      id="schedule-date"
                      value={scheduledDate}
                      onChange={(e) => {
                        setScheduledDate(e.target.value);
                        // Reset time when date changes
                        setScheduledTime("");
                      }}
                      min={getMinScheduleDate()}
                      max={getMaxScheduleDate()}
                      required
                      className="mt-1 block w-full border rounded-md p-2"
                    />
                  </div>
                  <div className="flex-1 mt-4 sm:mt-0">
                    <label
                      htmlFor="schedule-time"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Time
                    </label>
                    <select
                      id="schedule-time"
                      value={scheduledTime}
                      onChange={(e) => {
                        setScheduledTime(e.target.value);
                        handleScheduleOrder(scheduledDate, e.target.value);
                      }}
                      required
                      className="mt-1 block w-full border rounded-md p-2"
                      disabled={!scheduledDate}
                    >
                      <option value="">-- Select Time --</option>
                      {scheduledDate &&
                        getAvailableTimes(scheduledDate).map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            {scheduledTime && (
              <p className="mt-2 text-sm text-green-600">
                Your order is scheduled for:{" "}
                {new Date(scheduledTime).toLocaleString()}
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("checkout")}
              disabled={!isWithinOpeningHours && !scheduledTime}
              className={`mt-6 w-full py-3 px-4 rounded-md flex items-center justify-center text-sm sm:text-base ${
                isWithinOpeningHours || scheduledTime
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-all duration-300`}
            >
              {isWithinOpeningHours || scheduledTime ? (
                <>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </>
              ) : (
                "Schedule Order First"
              )}
            </motion.button>
          </motion.div>
        )}

        {step === "checkout" && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Checkout</h2>
              <button
                onClick={() => setStep("summary")}
                className="flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="mr-1 w-4 h-4 sm:w-5 sm:h-5" />
                Back to Order
              </button>
            </div>
            <form onSubmit={proceedToCheckout}>
              <CheckoutInputs
                addressProps={address}
                setAddressProps={handleAddressChange}
                deliveryOption={deliveryOption}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                selectedRestaurant={selectedRestaurant}
                setCanProceed={setCanProceed}
              />
              {scheduledTime && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">Scheduled for:</p>
                  <p className="text-sm">
                    {new Date(scheduledTime).toLocaleString()}
                  </p>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="mt-6 w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 px-4 rounded-md hover:from-primary-dark hover:to-primary transition-all duration-300 flex items-center justify-center text-sm sm:text-base"
              >
                <CreditCard className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                {scheduledTime
                  ? `Schedule Order (${total} KR)`
                  : `Pay ${total} KR`}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {editingProductIndex !== null && (
        <MenyItemPopup
          product={cartProducts[editingProductIndex]}
          onClose={() => setEditingProductIndex(null)}
          onSubmit={(updatedProduct) =>
            handleEditProduct(editingProductIndex, updatedProduct)
          }
        />
      )}
    </motion.section>
  );
}
