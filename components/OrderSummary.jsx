'use client'
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
    const { 
        currency, router, getCartCount, getCartAmount, 
        getToken, user, cartItems, setCartItems 
    } = useAppContext();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch user addresses from backend
   const fetchUserAddresses = async () => {
    try {
        const token = await getToken();
        const { data } = await axios.get('/api/user/get-address', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
            return data.addresses;
        }
    } catch (error) {
        console.error("Context Fetch Error", error);
        return [];
    }
};
    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setIsDropdownOpen(false);
    };

    const createOrder = async () => {
        if (!selectedAddress) {
            return toast.error("Please select an address");
        }

        try {
            setLoading(true);

            // Structure items for the backend
            const items = Object.keys(cartItems)
                .map((key) => ({
                    productId: key,
                    quantity: cartItems[key]
                }))
                .filter(item => item.quantity > 0);

            if (items.length === 0) {
                return toast.error('Your cart is empty');
            }

            const token = await getToken();
            
            // POST request to create order
            const { data } = await axios.post('/api/order/create', {
                address: selectedAddress,
                items: items
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setCartItems({}); // Clear global cart state
                router.push('/order-placed');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchUserAddresses();
    }, [user]);

    // Calculate total including 2% tax
    const cartAmount = getCartAmount();
    const tax = Math.floor(cartAmount * 0.02);
    const totalAmount = cartAmount + tax;

    return (
        <div className="w-full md:w-96 bg-gray-500/5 p-5 rounded-lg shadow-sm">
            <h2 className="text-xl md:text-2xl font-medium text-gray-700">Order Summary</h2>
            <hr className="border-gray-500/30 my-5" />
            
            <div className="space-y-6">
                {/* Address Selection */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Shipping Address</label>
                    <div className="relative w-full text-sm border bg-white rounded">
                        <button
                            className="w-full text-left px-4 py-3 text-gray-700 focus:outline-none flex justify-between items-center"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="truncate">
                                {selectedAddress
                                    ? `${selectedAddress.fullName}, ${selectedAddress.city}`
                                    : "Select Address"}
                            </span>
                            <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} 
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <ul className="absolute w-full bg-white border shadow-xl mt-1 z-50 max-h-48 overflow-y-auto rounded">
                                {userAddresses.map((address, index) => (
                                    <li key={index}
                                        className="px-4 py-2 hover:bg-orange-50 cursor-pointer border-b last:border-none"
                                        onClick={() => handleAddressSelect(address)}
                                    >
                                        <p className="font-medium text-gray-800">{address.fullName}</p>
                                        <p className="text-xs text-gray-500">{address.area}, {address.city}</p>
                                    </li>
                                ))}
                                <li onClick={() => router.push("/add-address")}
                                    className="px-4 py-3 hover:bg-orange-600 hover:text-white cursor-pointer text-center text-orange-600 font-medium bg-gray-50 transition-colors"
                                >
                                    + Add New Address
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Subtotal ({getCartCount()} items)</p>
                        <p className="text-gray-800 font-medium">{currency}{cartAmount}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Shipping Fee</p>
                        <p className="text-green-600 font-medium">Free</p>
                    </div>
                    <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Estimated Tax (2%)</p>
                        <p className="text-gray-800 font-medium">{currency}{tax}</p>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-3 text-gray-800">
                        <p>Total</p>
                        <p>{currency}{totalAmount}</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={createOrder}
                disabled={loading}
                className={`w-full bg-orange-600 text-white py-4 mt-8 font-bold rounded shadow-lg transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700'}`}
            >
                {loading ? "Processing..." : "PLACE ORDER"}
            </button>
        </div>
    );
};

export default OrderSummary;