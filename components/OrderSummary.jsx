'use client'
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {

    const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext()

    const createOrder = async () => {
        try {
            // Convert cartItems object to Array for the API
            let cartItemsArray = Object.keys(cartItems).map((key) => ({ 
                productId: key, 
                quantity: cartItems[key] 
            }));

            cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

            if (cartItemsArray.length === 0) {
                return toast.error('Your cart is empty');
            }

            const token = await getToken();
            
            // We remove the address field entirely from the request body
            const { data } = await axios.post('/api/order/create', {
                items: cartItemsArray
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setCartItems({}); 
                router.push('/order-placed');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
            console.error(error);
        }
    }

    return (
        <div className="w-full md:w-96 bg-gray-500/5 p-5">
            <h2 className="text-xl md:text-2xl font-medium text-gray-700">
                Order Summary
            </h2>
            <hr className="border-gray-500/30 my-5" />
            
            <div className="space-y-6">
                {/* PROMO CODE SECTION */}
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

                {/* PRICE CALCULATION SECTION */}
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