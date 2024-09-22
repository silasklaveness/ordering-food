"use client";

import { useEffect, useState } from "react";
import EditableImage from "./EditableImage";
import MenyItemPriceProps from "./MenyItemPriceProps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MenuItemForm({ onSubmit, menuItem }) {
  const [image, setImage] = useState(menuItem?.image || "");
  const [name, setName] = useState(menuItem?.name || "");
  const [description, setDescription] = useState(menuItem?.description || "");
  const [basePrice, setBasePrice] = useState(menuItem?.basePrice || "");
  const [sizes, setSizes] = useState(menuItem?.sizes || []);
  const [category, setCategory] = useState(menuItem?.category || "");
  const [subCategory, setSubCategory] = useState(menuItem?.subcategory || "");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [extraIngredientsPrices, setExtraIngredientPrices] = useState(
    menuItem?.extraIngredientsPrices || []
  );
  const [restaurants, setRestaurants] = useState([]); // All restaurants
  const [selectedRestaurants, setSelectedRestaurants] = useState(
    menuItem?.restaurants || [] // Pre-selected restaurants
  );

  // Fetch categories from the backend
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      });
  }, []);

  // Fetch restaurants from the backend
  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);
      });
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (category) {
      const selectedCategory = categories.find((c) => c._id === category);
      if (selectedCategory && selectedCategory.subcategories) {
        setSubCategories(selectedCategory.subcategories);
      } else {
        setSubCategories([]);
      }
    } else {
      setSubCategories([]);
    }
    // Ensure subCategory is set to the current subcategory if editing an existing item
    setSubCategory(menuItem?.subcategory || "");
  }, [category, categories, menuItem]);

  // Handle adding or removing restaurants from the selected list
  function handleRestaurantSelect(restaurantId) {
    setSelectedRestaurants((prevSelected) => {
      if (prevSelected.includes(restaurantId)) {
        return prevSelected.filter((id) => id !== restaurantId); // Remove if already selected
      } else {
        return [...prevSelected, restaurantId]; // Add if not selected
      }
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {menuItem ? "Edit Menu Item" : "Add New Menu Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(ev) =>
            onSubmit(ev, {
              image,
              name,
              description,
              basePrice,
              sizes,
              extraIngredientsPrices,
              category, // Pass the main category
              subcategory: subCategory, // Pass the subcategory
              restaurants: selectedRestaurants, // Pass selected restaurants
            })
          }
          className="space-y-8"
        >
          <div className="grid md:grid-cols-[1fr_2fr] gap-8">
            <div>
              <EditableImage link={image} setLink={setImage} />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Item name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.length > 0 &&
                      categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {subCategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subCategory">Subcategory</Label>
                  <Select
                    value={subCategory}
                    onValueChange={(value) => setSubCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((subC) => (
                        <SelectItem key={subC._id} value={subC._id}>
                          {subC.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={basePrice}
                  onChange={(ev) => setBasePrice(ev.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Restaurant selection */}
          <div className="space-y-2">
            <Label>Available in Restaurants</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedRestaurants.length === 0} // If no specific restaurants, assume "All"
                  onChange={() => setSelectedRestaurants([])} // Reset to "All"
                />
                <span>All Restaurants</span>
              </label>
              {restaurants.map((restaurant) => (
                <label
                  key={restaurant._id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedRestaurants.includes(restaurant._id)}
                    onChange={() => handleRestaurantSelect(restaurant._id)}
                  />
                  <span>{restaurant.name}</span>
                </label>
              ))}
            </div>
          </div>

          <MenyItemPriceProps
            name={"Sizes"}
            addLabel={"Add item size"}
            props={sizes}
            setProps={setSizes}
          />
          <MenyItemPriceProps
            name={"Extra ingredients"}
            addLabel={"Add ingredients prices"}
            props={extraIngredientsPrices}
            setProps={setExtraIngredientPrices}
          />

          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
