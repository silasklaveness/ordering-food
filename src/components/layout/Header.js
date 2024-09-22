"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../AppContext";
import { RestaurantContext } from "../RestaurantContext";
import ShoppingCart from "../icons/ShoppingCart";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  User,
  Menu,
  X,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import RestaurantSelector from "./RestaurantSelector";

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState("up");

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection]);

  return scrollDirection;
}

export default function LuxuriousHeader() {
  const { data: session, status } = useSession();
  const userData = session?.user;
  let userName = userData?.name || userData?.email;
  const { cartProducts } = useContext(CartContext);
  const { selectedRestaurant } = useContext(RestaurantContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (userName && userName.includes(" ")) {
    userName = userName.split(" ")[0];
  }

  const navItems = [
    { href: "/", label: "Hjem" },
    { href: "/menu", label: "Meny" },
    { href: "/#about", label: "Om oss" },
    { href: "/#contact", label: "Kontakt" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuVariants = {
    closed: { opacity: 0, x: "-100%" },
    open: { opacity: 1, x: 0 },
  };

  // Determine if current page is the homepage or a restaurant page
  const isHomePage = pathname === "/";
  const isRestaurantPage =
    pathname === "/tolvsrod" || pathname === "/teie" || pathname === "/sentrum";

  // Apply transparency logic to both the homepage and restaurant pages
  const isTransparent = (isHomePage || isRestaurantPage) && !isScrolled;
  const isMenuPage = pathname === "/menu";

  const hiddenPages = [
    "/profile",
    "/categories",
    "/menu-items",
    "/users",
    "/orders",
    "/oversikt",
    "/restaurants",
  ];
  const shouldHideHeader = hiddenPages.some((page) =>
    pathname.startsWith(page)
  );

  if (shouldHideHeader) {
    return null;
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent && !isOpen ? "bg-transparent" : "bg-white shadow-md"
      } ${
        isMenuPage && scrollDirection === "down"
          ? "-translate-y-full"
          : "translate-y-0"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="z-10 relative">
          <Image src="/logo.png" alt="Tønsberg Pizza" width={100} height={50} />
        </Link>

        {/* Navigation Items for Larger Screens */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors font-medium text-sm uppercase ${
                isTransparent && !isOpen
                  ? "text-white hover:text-gray-300"
                  : "text-black hover:text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Middle content - RestaurantSelector on Mobile */}
        <div className="flex-1 flex items-center justify-center md:hidden">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <RestaurantSelector />
          </motion.div>
        </div>

        {/* Right content */}
        <div className="flex items-center gap-4">
          {/* RestaurantSelector on Larger Screens */}
          <motion.div
            className="relative hidden md:block"
            whileHover={{ scale: 1.05 }}
          >
            <RestaurantSelector />
          </motion.div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className={`transition-colors relative ${
              isTransparent && !isOpen
                ? "text-white hover:text-gray-300"
                : "text-black hover:text-gray-600"
            }`}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartProducts.length > 0 && (
              <motion.span
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-white rounded-full text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {cartProducts.length}
              </motion.span>
            )}
          </Link>

          {/* Authentication Buttons */}
          <div className="hidden md:block">
            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={`transition-colors ${
                    isTransparent && !isOpen
                      ? "text-white hover:text-gray-300"
                      : "text-black hover:text-gray-600"
                  }`}
                >
                  <User size={24} />
                </Link>
                <Button
                  onClick={() => signOut()}
                  className="bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Logg ut
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`transition-colors font-medium ${
                    isTransparent && !isOpen
                      ? "text-white hover:text-gray-300"
                      : "text-black hover:text-gray-600"
                  }`}
                >
                  Logg inn
                </Link>
                <Button
                  asChild
                  className="bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 rounded-full px-4 py-2 text-sm font-semibold"
                >
                  <Link href="/register">Registrer</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden transition-colors ${
              isTransparent && !isOpen
                ? "text-white hover:text-gray-300"
                : "text-black hover:text-gray-600"
            }`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed w-screen flex flex-col items-start justify-between px-6 py-8 bg-orange-500 text-white"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col space-y-8 mt-3 w-full">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="text-2xl font-semibold text-white hover:text-gray-300 transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              {/* RestaurantSelector in Mobile Menu */}
              <RestaurantSelector />
            </div>

            <div className="flex flex-col w-full mt-8 space-y-6">
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="text-2xl font-semibold text-white hover:text-gray-300 transition-colors flex items-center gap-2"
                  >
                    <span>{userName}</span> <UserIcon />
                  </Link>
                  <Button
                    onClick={() => {
                      signOut();
                      closeMenu();
                    }}
                    className="bg-white text-orange-500 hover:bg-orange-100 transition-all duration-300 rounded-full px-6 py-3 w-full text-lg font-semibold"
                  >
                    Logg ut
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    onClick={closeMenu}
                    className="justify-start p-0 text-white hover:text-gray-300 text-lg font-normal"
                  >
                    <Link href="/login">Logg inn</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-white text-orange-500 hover:bg-orange-100 transition-all duration-300 rounded-full px-6 py-3 w-full text-lg font-semibold"
                    onClick={closeMenu}
                  >
                    <Link href="/register">Registrer</Link>
                  </Button>
                </>
              )}
              <div className="flex space-x-8 justify-center mt-6">
                <motion.a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Facebook size={30} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram size={30} />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Youtube size={30} />
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
