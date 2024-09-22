"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserTabs from "@/components/layout/UserTabs";
import MenuItemForm from "@/components/layout/MenuItemForm";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle } from "lucide-react";

export default function NewMenuItemPage() {
  const router = useRouter();
  const [redirectToItems, setRedirectToItems] = useState(false);

  // Form submit handler
  async function handleFormSubmit(ev, formData) {
    ev.preventDefault();

    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        body: JSON.stringify({
          ...formData, // Form data includes restaurants from MenuItemForm
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) resolve();
      else reject();
    });

    await toast.promise(savingPromise, {
      loading: "Saving this tasty item...",
      success: "Item saved successfully!",
      error: "Error saving item",
    });

    setRedirectToItems(true);
    router.push("/menu-items");
  }

  if (redirectToItems) {
    return null; // Redirection handled by router.push
  }

  return (
    <section className="max-w-4xl mx-auto p-4">
      <UserTabs isAdmin={true} />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="w-6 h-6" />
            Create New Menu Item
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

          {/* MenuItemForm component (which already includes restaurant selection logic) */}
          <MenuItemForm onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </section>
  );
}
