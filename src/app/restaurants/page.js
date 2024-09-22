"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import UserTabs from "@/components/layout/UserTabs";
import { UseProfile } from "@/components/UseProfile";

export default function ManageRestaurantsPage() {
  const isAdmin = UseProfile();
  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    openingTimes: "",
    location: "",
  });
  const [isEditing, setIsEditing] = useState(false); // New state to track edit mode
  const [editingRestaurantId, setEditingRestaurantId] = useState(null); // Store the restaurant ID being edited

  // Fetch restaurants on load
  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data));
  }, []);

  // Handle input changes for form fields
  function handleInputChange(e) {
    const { name, value } = e.target;
    setNewRestaurant((prev) => ({ ...prev, [name]: value }));
  }

  // Handle form submission to create or update a restaurant
  async function handleSubmit(e) {
    e.preventDefault();

    const savingPromise = new Promise(async (resolve, reject) => {
      const method = isEditing ? "PUT" : "POST"; // Change method based on whether we're editing
      const url = isEditing
        ? `/api/restaurants/${editingRestaurantId}`
        : "/api/restaurants";
      const res = await fetch(url, {
        method,
        body: JSON.stringify(newRestaurant),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const savedRestaurant = await res.json();
        if (isEditing) {
          // Update the restaurant in the list
          setRestaurants((prev) =>
            prev.map((restaurant) =>
              restaurant._id === editingRestaurantId
                ? savedRestaurant
                : restaurant
            )
          );
        } else {
          // Add the new restaurant to the list
          setRestaurants([...restaurants, savedRestaurant]);
        }

        resolve();
        setNewRestaurant({ name: "", openingTimes: "", location: "" }); // Reset form
        setIsEditing(false); // Reset edit mode
      } else {
        reject();
      }
    });

    await toast.promise(savingPromise, {
      loading: isEditing ? "Updating restaurant..." : "Saving restaurant...",
      success: isEditing ? "Restaurant updated!" : "Restaurant saved!",
      error: isEditing
        ? "Error updating restaurant."
        : "Error saving restaurant.",
    });
  }

  // Handle deleting a restaurant
  async function handleDelete(id) {
    const deletePromise = new Promise(async (resolve, reject) => {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRestaurants(
          restaurants.filter((restaurant) => restaurant._id !== id)
        );
        resolve();
      } else {
        reject();
      }
    });

    await toast.promise(deletePromise, {
      loading: "Deleting restaurant...",
      success: "Restaurant deleted!",
      error: "Error deleting restaurant.",
    });
  }

  // Handle editing a restaurant
  function handleEdit(restaurant) {
    setNewRestaurant({
      name: restaurant.name,
      location: restaurant.location,
      openingTimes: restaurant.openingTimes,
    });
    setIsEditing(true);
    setEditingRestaurantId(restaurant._id); // Set the ID of the restaurant being edited
  }

  // Handle canceling the edit
  function handleCancelEdit() {
    setNewRestaurant({ name: "", openingTimes: "", location: "" }); // Reset form
    setIsEditing(false); // Exit edit mode
    setEditingRestaurantId(null); // Clear the editing ID
  }

  return (
    <section className="max-w-4xl mx-auto p-4">
      <UserTabs isAdmin={isAdmin} />
      <h1 className="text-2xl font-bold mb-4">Manage Restaurants</h1>

      {/* Add New or Edit Restaurant Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Restaurant" : "Add New Restaurant"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Restaurant Name"
                value={newRestaurant.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Input
                type="text"
                name="location"
                placeholder="Location"
                value={newRestaurant.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Input
                type="text"
                name="openingTimes"
                placeholder="Opening Times (e.g. Mon-Fri 09:00-18:00)"
                value={newRestaurant.openingTimes}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? "Update Restaurant" : "Add Restaurant"}
              </Button>
              {isEditing && (
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List of Restaurants */}
      <h2 className="text-xl font-bold mb-4">Restaurants</h2>
      {restaurants.length === 0 && <p>No restaurants found.</p>}
      {restaurants.map((restaurant) => (
        <Card key={restaurant._id} className="mb-4">
          <CardHeader>
            <CardTitle>{restaurant.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Location: {restaurant.location}</p>
            <p>Opening Times: {restaurant.openingTimes}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => handleEdit(restaurant)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(restaurant._id)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
