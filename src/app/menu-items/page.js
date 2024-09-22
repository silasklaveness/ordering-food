"use client";

import UserTabs from "@/components/layout/UserTabs";
import { UseProfile } from "@/components/UseProfile";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState([]); // Ensure menuItems is initialized as an array
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const { loading, data } = UseProfile();

  useEffect(() => {
    fetch("/api/menu-items")
      .then((res) => res.json())
      .then((menuItems) => {
        // Log the fetched menuItems to check the data
        console.log("Fetched menu items:", menuItems);
        if (Array.isArray(menuItems)) {
          setMenuItems(menuItems);
          setFilteredItems(menuItems);
        } else {
          setMenuItems([]);
          setFilteredItems([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching menu items:", err);
        setMenuItems([]); // Fallback in case of an error
        setFilteredItems([]); // Fallback in case of an error
      });

    fetch("/api/categories")
      .then((res) => res.json())
      .then((categories) => {
        console.log("Fetched categories:", categories);
        setCategories(categories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories([]); // Fallback in case of an error
      });
  }, []);

  useEffect(() => {
    const filtered = menuItems.filter((item) => {
      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        item.category?._id === selectedCategory ||
        item.category === selectedCategory;

      const matchesSubcategory =
        selectedSubcategory === "all" ||
        item.subcategory?._id === selectedSubcategory ||
        item.subcategory === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory, selectedSubcategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data.admin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold text-red-500">
          You are not allowed to access this page.
        </div>
      </div>
    );
  }

  const selectedCategoryObject = categories.find(
    (cat) => cat._id === selectedCategory
  );
  const subcategories = selectedCategoryObject
    ? selectedCategoryObject.subcategories
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col md:flex-row">
        <div className="md:w-64 md:flex-shrink-0">
          <UserTabs isAdmin={data.admin} />
        </div>
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-primary text-3xl font-bold mb-4">Menu Items</h1>
            <Card>
              <CardContent className="p-4">
                <Link href="/menu-items/new">
                  <Button className="w-full sm:w-auto">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create new menu item
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Edit menu items:
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    icon={<Search className="w-4 h-4 text-gray-500" />}
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedSubcategory("all");
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedSubcategory}
                  onValueChange={setSelectedSubcategory}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories.map((subcat) => (
                      <SelectItem key={subcat._id} value={subcat._id}>
                        {subcat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AnimatePresence>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  layout
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link href={`/menu-items/edit/${item._id}`}>
                          <Card className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                              <div className="relative aspect-square mb-2">
                                <Image
                                  className="rounded-md object-cover"
                                  src={item.image}
                                  alt={item.name}
                                  layout="fill"
                                />
                              </div>
                              <h3 className="text-center font-medium text-lg mb-2">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                              <p className="text-sm font-semibold mb-2">
                                {item.basePrice} KR
                              </p>
                              <Button variant="outline" className="w-full">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center col-span-full text-gray-500">
                      No menu items found.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
