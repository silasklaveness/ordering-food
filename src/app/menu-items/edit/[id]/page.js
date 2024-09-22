"use client";

import { UseProfile } from "@/components/UseProfile";
import EditableImage from "@/components/layout/EditableImage";
import UserTabs from "@/components/layout/UserTabs";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MenuItemForm from "@/components/layout/MenuItemForm";
import DeleteButton from "@/components/DeleteButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

export default function EditMenuItemPage() {
  const { id } = useParams();
  const [menuItem, setMenuItem] = useState(null);
  const [redirectToItems, setRedirectToItems] = useState(false);
  const { loading, data } = UseProfile();

  useEffect(() => {
    fetch("/api/menu-items").then((res) => {
      res.json().then((items) => {
        const item = items.find((i) => i._id === id);
        setMenuItem(item);
        console.log(item);
      });
    });
  }, [id]);

  async function handleFormSubmit(ev, data) {
    ev.preventDefault();
    data = {
      ...data,
      _id: id,
    };
    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch("/api/menu-items", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) resolve();
      else reject();
    });

    await toast.promise(savingPromise, {
      loading: "Saving...",
      success: "Item saved!",
      error: "Error saving the item!",
    });

    setRedirectToItems(true);
  }

  async function handleDeleteClick() {
    const promise = new Promise(async (resolve, reject) => {
      const res = await fetch("/api/menu-items?_id=" + id, {
        method: "DELETE",
      });
      if (res.ok) {
        resolve();
      } else {
        reject();
      }
    });

    await toast.promise(promise, {
      loading: "Deleting...",
      success: "Item deleted!",
      error: "Error deleting the item!",
    });

    setRedirectToItems(true);
  }

  if (redirectToItems) {
    return redirect("/menu-items");
  }

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
        <div className="text-2xl font-bold text-red-500">Not an admin.</div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-4">
      <UserTabs isAdmin={true} />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Edit className="w-6 h-6" />
            Edit Menu Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Link href="/menu-items">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Show all menu items
              </Button>
            </Link>
          </div>
          {/* Menu Item Form */}
          {menuItem && (
            <MenuItemForm menuItem={menuItem} onSubmit={handleFormSubmit} />
          )}
          <div className="mt-4 flex justify-end">
            <DeleteButton
              label="Delete this menu item"
              onDelete={handleDeleteClick}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
