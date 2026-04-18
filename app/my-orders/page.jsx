'use client';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const MyOrders = () => {
    const { currency, getToken, user } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

   const fetchOrders = useCallback(async () => {
    try {
        const token = await getToken();
        
        // If Clerk hasn't provided a token yet, stop here.
        if (!token) {
            return; 
        }

        setLoading(true);
        const { data } = await axios.get('/api/order/list', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
            setOrders(data.orders);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        // Only show the error if it's a genuine failure
        if (error.response?.status === 401) {
            toast.error("Session expired. Please sign in again.");
        }
    } finally {
        setLoading(false);
    }
}, [getToken]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">My Orders</h2>
                    
                    {loading ? (
                        <Loading />
                    ) : (
                        <div className="max-w-5xl border-t border-gray-300 text-sm">
                            {orders && orders.length > 0 ? (
                                orders.map((order) => (
                                    <div key={order._id} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300">
                                        <div className="flex-1 flex gap-5 max-w-80">
                                            <Image
                                                className="max-w-16 max-h-16 object-cover"
                                                src={assets.box_icon}
                                                alt="box_icon"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <p className="font-medium text-base text-gray-800">
                                                    {/* Defensive Mapping: Handles cases where product data isn't populated */}
                                                    {order.items && order.items.length > 0 
                                                        ? order.items.map((item) => 
                                                            `${item.product?.name || 'Product'} x ${item.quantity}`
                                                          ).join(", ")
                                                        : "No items details available"}
                                                </p>
                                                <span className="text-gray-500 text-xs">ID: {order._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-gray-600 text-xs md:text-sm">
                                            <p className="leading-5">
                                                <span className="font-medium text-gray-800">{order.address?.fullName || "User"}</span>
                                                <br />
                                                <span>{order.address?.area || "Default Area"}</span>
                                                <br />
                                                <span>{order.address?.city || "Default City"}</span>
                                            </p>
                                        </div>

                                        <p className="font-medium my-auto text-lg text-gray-800">
                                            {currency}{order.amount}
                                        </p>

                                        <div className="text-xs text-gray-600">
                                            <p className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${order.payment ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                    Method: COD
                                                </span>
                                                <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                                                <span className={`font-medium ${order.payment ? 'text-green-600' : 'text-orange-600'}`}>
                                                    Status: {order.status || "Pending"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-gray-500">
                                    <p className="text-lg">No orders found.</p>
                                    <button 
                                        onClick={() => fetchOrders()} 
                                        className="mt-4 text-orange-600 font-medium hover:underline"
                                    >
                                        Refresh Page
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;