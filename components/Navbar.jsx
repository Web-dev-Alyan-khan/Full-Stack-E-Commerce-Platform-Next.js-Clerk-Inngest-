"use client";

import React from "react";
import { assets } from "@/assets/assets"; 
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  // Destructure exactly what we need from AppContext
  const { isSeller, router, userData, getCartCount } = useAppContext();
  const { openSignIn } = useClerk();

  // Check if user is signed in based on userData from our context
  const isSignedIn = Boolean(userData);

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      
      {/* Logo */}
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
        priority 
      />

      {/* Navigation Links - Desktop Only */}
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">Home</Link>
        
        {/* Mapping Shop to all-products to prevent 404 */}
        <Link href="/all-products" className="hover:text-gray-900 transition">Shop</Link>
        
        <Link href="/about-us" className="hover:text-gray-900 transition">About Us</Link>
        <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs border px-4 py-1.5 rounded-full hover:bg-gray-50 transition"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      {/* Right Side Icons & Auth */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="md:hidden text-xs border px-3 py-1 rounded-full"
          >
            Seller
          </button>
        )}

        {/* Orders Icon - Visible only when signed in */}
        {isSignedIn && (
          <button onClick={() => router.push("/my-orders")} className="hidden md:block">
            <Image
              src={assets.order_icon} 
              alt="orders"
              className="w-5 h-5 hover:scale-110 transition"
            />
          </button>
        )}

        {/* Cart Icon with Counter from AppContext */}
        <button onClick={() => router.push("/cart")} className="relative">
          <Image
            src={assets.cart_icon}
            alt="cart"
            className="w-5 h-5 hover:scale-110 transition"
          />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {getCartCount()}
            </span>
          )}
        </button>

        {/* Auth Section using AppContext userData */}
        {isSignedIn ? (
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Action 
                  label="My Orders" 
                  labelIcon={<Image src={assets.order_icon} alt="" width={16} height={16} />} 
                  onClick={() => router.push('/my-orders')}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        ) : (
          <button 
            onClick={() => openSignIn()}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" className="w-5 h-5" />
            <span className="hidden md:block font-medium">Account</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;