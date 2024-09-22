"use client";

import { useEffect, useState, useContext } from "react";
import { RestaurantContext } from "@/components/RestaurantContext"; // Import the RestaurantContext
import SectionHeaders from "@/components/layout/SectionHeaders";
import MenyItem from "@/components/meny/MenyItem";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MenuPage() {
  const { selectedRestaurant } = useContext(RestaurantContext); // Get selected restaurant from context
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState(""); // Store the selected restaurant ObjectId
  const [activeCategory, setActiveCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Alle");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch restaurants, categories, and menu items
  useEffect(() => {
    // Fetch all restaurants
    fetch("/api/restaurants").then((res) => {
      res.json().then((restaurants) => {
        setRestaurants(restaurants);
        // Find the ObjectId of the selected restaurant based on its name
        const selectedRestaurantObj = restaurants.find(
          (r) => r.name.toLowerCase() === selectedRestaurant.toLowerCase()
        );
        if (selectedRestaurantObj) {
          setRestaurantId(selectedRestaurantObj._id);
        }
      });
    });

    // Fetch categories
    fetch("/api/categories").then((res) => {
      res.json().then((categories) => {
        setCategories(categories);
        if (categories.length > 0) {
          setActiveCategory(categories[0]._id);
          setSubCategories(categories[0].subcategories || []);
        }
      });
    });

    // Fetch menu items
    fetch("/api/menu-items").then((res) => {
      res.json().then((menuItems) => {
        setMenuItems(menuItems);
      });
    });
  }, [selectedRestaurant]);

  // Filter menu items whenever category, subcategory (filter), or search term changes
  useEffect(() => {
    if (!restaurantId) return;

    let filtered = menuItems;

    // Filter by selected restaurant (based on ObjectId)
    filtered = filtered.filter(
      (item) =>
        item.restaurants.includes(restaurantId) || // Check if item is available at the selected restaurant
        item.restaurants.length === 0 // If no restaurants are specified, it's available everywhere
    );

    // Filter by active category
    if (activeCategory) {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    // Filter by subcategory
    if (activeFilter !== "Alle") {
      filtered = filtered.filter((item) => item.subcategory === activeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [restaurantId, activeCategory, activeFilter, searchTerm, menuItems]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const selectedCategory = categories.find((c) => c._id === categoryId);
    setSubCategories(selectedCategory?.subcategories || []);
    setActiveFilter("Alle"); // Reset subcategory filter when switching categories
  };

  // Handle filter (subcategory) change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Handle search term change
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <section className="md:mt-[140px] mt-[90px]">
      <div className="bg-white shadow-md py-4 mb-8 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category._id}
                className={`text-lg md:text-xl font-bold whitespace-nowrap pb-2 ${
                  activeCategory === category._id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => handleCategoryChange(category._id)}
              >
                {category.name.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mt-4">
            <div className="relative w-full md:w-auto">
              <Input
                type="text"
                placeholder="Søk..."
                className="pl-10 pr-4 py-2 w-full md:w-64 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              <motion.button
                className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
                  activeFilter === "Alle"
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                onClick={() => handleFilterChange("Alle")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Alle
              </motion.button>
              {subCategories.length > 0 &&
                subCategories.map((filter) => (
                  <motion.button
                    key={filter._id}
                    className={`px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
                      activeFilter === filter._id
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300"
                    }`}
                    onClick={() => handleFilterChange(filter._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filter.name}
                  </motion.button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {categories
          .filter((c) => activeCategory === "" || c._id === activeCategory)
          .map((c) => (
            <div key={c._id} className="mb-12">
              <div className="text-center">
                <SectionHeaders mainHeader={c.name} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                {filteredItems
                  .filter((m) => m.category === c._id)
                  .map((item) => (
                    <MenyItem key={item._id} {...item} />
                  ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
