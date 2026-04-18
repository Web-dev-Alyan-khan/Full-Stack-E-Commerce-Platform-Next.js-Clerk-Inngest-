'use client'
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {

    const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext()
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);

    // Fetch user addresses from backend
    const fetchUserAddresses = async () => {
        try {
            const token = await getToken(); // getToken is asynchronous
            const { data } = await axios.get('/api/user/get-address', { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (data.success) {
                setUserAddresses(data.addresses);
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0]);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setIsDropdownOpen(false);
    };

    const createOrder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Please select an address");
            }

            // Convert cartItems object to Array for the API
            let cartItemsArray = Object.keys(cartItems).map((key) => ({ 
                productId: key, // Match your schema field name
                quantity: cartItems[key] 
            }));

            cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

            if (cartItemsArray.length === 0) {
                return toast.error('Your cart is empty');
            }

            const token = await getToken();
            
            // Send the FULL address object to ensure Inngest captures the snapshot
            const { data } = await axios.post('/api/order/create', {
                address: selectedAddress, // Pass full object, not just ID
                items: cartItemsArray
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setCartItems({}); // Clear cart state
                router.push('/order-placed');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
            console.error(error);
        }
    }

    useEffect(() => {
        if (user) {
            fetchUserAddresses();
        }
    }, [user])

    return (
        <div className="w-full md:w-96 bg-gray-500/5 p-5">
            <h2 className="text-xl md:text-2xl font-medium text-gray-700">
                Order Summary
            </h2>
            <hr className="border-gray-500/30 my-5" />
            
            <div className="space-y-6">
                <div>
                    <label className="text-base font-medium uppercase text-gray-600 block mb-2">
                        Select Address
                    </label>
                    <div className="relative inline-block w-full text-sm border">
                        <button
                            className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="truncate block pr-6">
                                {selectedAddress
                                    ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}`
                                    : "Select Address"}
                            </span>
                            <svg className={`absolute right-2 top-2.5 w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <ul className="absolute w-full bg-white border shadow-lg mt-1 z-20 max-h-60 overflow-y-auto">
                                {userAddresses.map((address, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-none"
                                        onClick={() => handleAddressSelect(address)}
                                    >
                                        <p className="font-medium">{address.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{address.area}, {address.city}</p>
                                    </li>
                                ))}
                                <li
                                    onClick={() => router.push("/add-address")}
                                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-center text-orange-600 font-medium bg-gray-50"
                                >
                                    + Add New Address
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-base font-medium uppercase text-gray-600 block mb-2">
                        Promo Code
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Enter promo code"
                            className="flex-grow w-full outline-none p-2.5 text-gray-600 border focus:border-orange-500"
                        />
                        <button className="bg-orange-600 text-white px-4 py-2.5 hover:bg-orange-700 transition-colors">
                            Apply
                        </button>
                    </div>
                </div>

                <hr className="border-gray-500/30 my-5" />

                <div className="space-y-4">
                    <div className="flex justify-between text-base font-medium">
                        <p className="uppercase text-gray-600">Items {getCartCount()}</p>
                        <p className="text-gray-800">{currency}{getCartAmount()}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Shipping Fee</p>
                        <p className="font-medium text-green-600">Free</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Tax (2%)</p>
                        <p className="font-medium text-gray-800">{currency}{Math.floor(getCartAmount() * 0.02)}</p>
                    </div>
                    <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
                        <p>Total</p>
                        <p>{currency}{getCartAmount() + Math.floor(getCartAmount() * 0.02)}</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={createOrder} 
                className="w-full bg-orange-600 text-white py-3.5 mt-8 font-medium hover:bg-orange-700 transition-all shadow-md active:scale-[0.98]"
            >
                Place Order
            </button>
        </div>
    );
};

export default OrderSummary;