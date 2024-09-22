"use client";
import { SessionProvider } from "next-auth/react";
import { createContext, useEffect, useState } from "react";
import RestaurantProvider from "./RestaurantContext";
import toast from "react-hot-toast";

export const CartContext = createContext({});

export function cartProductPrice(cartProduct) {
  let price = cartProduct.basePrice || 0;

  if (cartProduct.selectedSize) {
    price += cartProduct.selectedSize.price || 0;
  }

  if (cartProduct.selectedExtras?.length > 0) {
    cartProduct.selectedExtras.forEach((extra) => {
      price += extra.price || 0;
    });
  }

  return price;
}

export default function AppProvider({ children }) {
  const [cartProducts, setCartProducts] = useState([]);

  const ls = typeof window !== "undefined" ? window.localStorage : null;

  useEffect(() => {
    if (ls && ls.getItem("cart")) {
      setCartProducts(JSON.parse(ls.getItem("cart")));
    }
  }, [ls]);

  function clearCart() {
    setCartProducts([]);
    saveCartProductsToLocalStorage([]);
  }

  function removeCartProduct(indexToRemove) {
    setCartProducts((prevCartProducts) => {
      const newCartProducts = prevCartProducts.filter(
        (v, index) => index !== indexToRemove
      );
      saveCartProductsToLocalStorage(newCartProducts);
      return newCartProducts;
    });
    toast.success("Produkt fjernet");
  }

  function saveCartProductsToLocalStorage(cartProducts) {
    if (ls) {
      ls.setItem("cart", JSON.stringify(cartProducts));
    }
  }

  function addToCart(product, size = null, extras = []) {
    setCartProducts((prevProducts) => {
      const cartProduct = { ...product, size, extras };
      const newProducts = [...prevProducts, cartProduct];
      saveCartProductsToLocalStorage(newProducts);
      return newProducts;
    });
  }

  return (
    <SessionProvider>
      <CartContext.Provider
        value={{
          cartProducts,
          setCartProducts,
          addToCart,
          removeCartProduct,
          clearCart,
        }}
      >
        <RestaurantProvider>{children}</RestaurantProvider>
      </CartContext.Provider>
    </SessionProvider>
  );
}
