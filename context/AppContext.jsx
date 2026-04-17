'use client';
import { productsDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs"; 
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY;
    const router = useRouter();
    
    const { user, isSignedIn, isLoaded } = useUser();
    const { getToken } = useAuth(); // Correct usage of useAuth

    const [products, setProducts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [cartItems, setCartItems] = useState({});

 const fetchProductData = async () => {
    try {
        
        const { data } = await axios.get('/api/product/list');

        // 3. Update state if the request is successful
        if (data.success) {
            setProducts(data.products);
        } else {
            // Handle cases where success is false but request didn't "fail" (e.g. business logic errors)
            toast.error(data.message);
        }

    } catch (error) {
        // 4. Handle actual request failures (404, 500, etc.)
        console.error("Fetch Error:", error);
        toast.error(error.response?.data?.message || "Failed to load products");
   } 
};

    // New function to fetch user data from your API
    const fetchUserData = async () => {
        try {
            const token = await getToken(); // Get the JWT from Clerk
            
            const { data } = await axios.get("/api/user/data", {
                headers: { Authorization: `Bearer ${token}` } // Send token in headers
            });

            if (data.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Error fetching user from DB:", error);
        }
    }

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            // Check seller role
            if (user.publicMetadata?.role === 'seller') {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
            
            // Fetch DB data whenever user is signed in
            fetchUserData();

        } else if (isLoaded && !isSignedIn) {
            setUserData(null);
            setIsSeller(false);
        }
    }, [user, isSignedIn, isLoaded]);

    useEffect(() => {
        fetchProductData();
    }, []);

 // --- Cart Functionality Corrected ---
const addToCart = async (itemId) => {
    // Logic Fix: Modify the CLONE (cartData), not the state directly
    let cartData = structuredClone(cartItems);
    
    if (cartData[itemId]) {
        cartData[itemId] += 1;
    } else {
        cartData[itemId] = 1;
    }

    setCartItems(cartData); // Corrected to ()
    toast.success("Item Added To Cart");

    if (user) {
        try {
            const token = await getToken(); // getToken is usually async in Clerk
            await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            toast.error(error.message);
        }
    }
}

const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    
    if (quantity === 0) {
        delete cartData[itemId];
    } else {
        cartData[itemId] = quantity;
    }

    setCartItems(cartData);

    if (user) {
        try {
              const token = await getToken()
           if (!token) {
            console.error("No token found. User might not be logged in.");
               return;
               }
            await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Cart Updated");
        } catch (error) {
            toast.error(error.message);
        }
    }
}
    const getCartCount = () => {
        return Object.values(cartItems).reduce((acc, count) => acc + count, 0);
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemInfo && cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const value = {
        currency, router,
        isSeller, setIsSeller,
        userData, setUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        getToken 
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}