"use client";

import React from "react";
// Added BagIcon or similar from your assets if available
import { assets, CartIcon, BagIcon } from "@/assets/assets"; 
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router ,user} = useAppContext();
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();

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
        {["Home", "Shop", "About Us", "Contact"].map((item) => (
          <Link 
            key={item} 
            href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`} 
            className="hover:text-gray-900 transition"
          >
            {item}
          </Link>
        ))}

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

        {/* Orders Icon (Desktop only, or visible when signed in) */}
        {isSignedIn && (
          <button onClick={() => router.push("/my-orders")} className="hidden md:block">
            <Image
              src={assets.order_icon} // Ensure you have this in your assets
              alt="orders"
              className="w-5 h-5 hover:scale-110 transition"
            />
          </button>
        )}

        {/* Cart Icon */}
        <button onClick={() => router.push("/cart")} className="relative">
          <Image
            src={assets.cart_icon}
            alt="cart"
            className="w-5 h-5 hover:scale-110 transition"
          />
        </button>

        {/* Auth Section */}
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/">
            <UserButton.MenuItems>
              {/* Custom Order Link inside Clerk Menu */}
              <UserButton.Action 
                label="My Orders" 
                labelIcon={<Image src={assets.order_icon} alt="orders" width={16} height={16} />} 
                onClick={() => router.push('/my-orders')}
              />
              <UserButton.Action 
                label="My Cart" 
                labelIcon={<CartIcon />} 
                onClick={() => router.push('/cart')}
              />
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button 
            onClick={() => openSignIn()}
            className="flex items-center gap-2 hover:text-gray-900 transition"
          >
            <Image src={assets.user_icon} alt="user icon" className="w-5 h-5" />
            <span className="hidden md:block">Account</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;