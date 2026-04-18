'use client';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency, getToken } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            
            if (!token) {
                setLoading(false);
                return;
            }

            // Calling your new seller-specific orders endpoint
            const { data } = await axios.get('/api/order/seller-order', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error(data.message || "Failed to fetch seller orders");
            }
        } catch (error) {
            console.error("Seller Orders Fetch Error:", error);
            // Handle 403 (Not a Seller) or 401 (Unauthorized)
            const errorMsg = error.response?.data?.message || "Error loading orders";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchSellerOrders();
    }, [fetchSellerOrders]);

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loading />
                </div>
            ) : (
                <div className="md:p-10 p-4 space-y-5">
                    <h2 className="text-lg font-medium">Customer Orders</h2>
                    <div className="max-w-4xl rounded-md bg-white shadow-sm">
                        {orders.length > 0 ? (
                            orders.map((order, index) => (
                                <div key={order._id || index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-200 first:border-t-0">
                                    <div className="flex-1 flex gap-5 max-w-80">
                                        <Image
                                            className="max-w-16 max-h-16 object-cover"
                                            src={assets.box_icon}
                                            alt="box_icon"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <p className="font-medium text-gray-800">
                                                {order.items.map((item) => 
                                                    `${item.product?.name || 'Product'} x ${item.quantity}`
                                                ).join(", ")}
                                            </p>
                                            <span className="text-xs text-gray-500">Items: {order.items.length}</span>
                                        </div>
                                    </div>

                                    <div className="text-gray-600">
                                        <p className="leading-5">
                                            <span className="font-medium text-gray-800">{order.address.fullName}</span>
                                            <br />
                                            <span>{order.address.area}</span>
                                            <br />
                                            <span>{order.address.city}{order.address.state ? `, ${order.address.state}` : ''}</span>
                                            <br />
                                            <span className="text-xs">{order.address.phoneNumber}</span>
                                        </p>
                                    </div>

                                    <p className="font-semibold text-base my-auto text-gray-800">
                                        {currency}{order.amount}
                                    </p>

                                    <div className="my-auto">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                                {order.status || "Order Placed"}
                                            </span>
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">
                                                {new Date(order.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-orange-600 font-medium">COD</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center text-gray-500">
                                <p>No orders have been placed for your products yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Orders;