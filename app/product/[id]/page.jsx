"use client";

import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";

const Product = () => {
  const { id } = useParams();
  const { products, router, addToCart } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    if (products.length > 0) {
      const product = products.find((item) => item._id === id);
      setProductData(product || null);
    }
  }, [id, products]);

  useEffect(() => {
    if (productData?.images?.length > 0) {
      setMainImage(productData.images[0]);
    }
  }, [productData]);

  if (!productData) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            
            {/* --- MAIN IMAGE FIX --- */}
            <div className="relative rounded-lg overflow-hidden bg-gray-500/10 mb-4 h-[500px] w-full">
              <Image
                src={mainImage || assets.upload_area}
                alt="product"
                /* 1. Use 'fill' to take up the whole 500px container */
                fill
                /* 2. 'object-cover' to ensure it fills the space perfectly */
                className="object-cover mix-blend-multiply"
                unoptimized 
                priority
                /* 3. Helps with resolution quality */
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {productData?.images?.map((img, index) => (
                /* Added 'relative' and 'h-24' to thumbnails for consistent sizing */
                <div
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`relative h-24 cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border-2 transition ${
                    mainImage === img ? 'border-orange-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt="thumbnail"
                    fill
                    className="object-cover mix-blend-multiply"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">{productData.name}</h1>
            <p className="text-gray-600 mt-3 leading-relaxed">{productData.description}</p>
            
            <p className="text-3xl font-medium mt-6 text-orange-600">
              ${productData.offerPrice}
              <span className="text-base text-gray-500 line-through ml-2 font-normal">
                ${productData.price}
              </span>
            </p>
            
            <div className="flex items-center mt-10 gap-4">
              <button 
                onClick={() => addToCart(productData._id)} 
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 transition rounded-md font-medium"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => { addToCart(productData._id); router.push("/cart"); }} 
                className="w-full py-4 bg-orange-500 text-white hover:bg-orange-600 transition rounded-md font-medium shadow-lg shadow-orange-200"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;