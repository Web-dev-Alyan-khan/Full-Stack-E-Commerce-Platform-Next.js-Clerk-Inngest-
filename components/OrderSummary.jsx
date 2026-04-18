'use client'
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
    const { 
        currency, router, getCartCount, getCartAmount, 
        getToken, cartItems, setCartItems 
    } = useAppContext();

    const [loading, setLoading] = useState(false);

    // Calculate totals once here so we can use them in the UI and the API call
    const cartAmount = getCartAmount();
    const tax = Math.floor(cartAmount * 0.02);
    const totalAmount = cartAmount + tax;

    const createOrder = async () => {
        try {
            setLoading(true);

            const items = Object.keys(cartItems)
                .map((key) => ({
                    productId: key,
                    quantity: cartItems[key]
                }))
                .filter(item => item.quantity > 0);

            if (items.length === 0) {
                setLoading(false);
                return toast.error('Your cart is empty');
            }

            const token = await getToken();
            
            const { data } = await axios.post('/api/order/create', {
                address: { fullName: "User", area: "Checkout", city: "Default" }, 
                items: items,
                amount: totalAmount // Sending the calculated total including tax
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("Order Placed Successfully!");
                setCartItems({}); 
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

    return (
        <div className="w-full md:w-96 bg-gray-500/5 p-5 rounded-lg shadow-sm">
            <h2 className="text-xl md:text-2xl font-medium text-gray-700">Order Summary</h2>
            <hr className="border-gray-500/30 my-5" />
            
            <div className="space-y-6">
                {/* Navigation Button for Adding Address */}
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Shipping Address</p>
                    <button 
                        onClick={() => router.push('/add-address')}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider transition-colors"
                    >
                        + Add or Update Address
                    </button>
                </div>

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