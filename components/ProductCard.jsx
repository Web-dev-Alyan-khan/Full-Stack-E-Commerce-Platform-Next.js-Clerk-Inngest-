import React from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {
    const { currency, router } = useAppContext();

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); window.scrollTo(0, 0); }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
        >
            {/* 1. Parent: Must be 'relative', 'w-full', and have a fixed 'h-size' or aspect-ratio */}
            <div className="relative w-full h-52 bg-gray-100 rounded-lg overflow-hidden group">
                <Image
                    src={product?.images?.[0] || assets.upload_area}
                    alt={product?.name || "Product Image"}
                    /* 2. 'fill' makes the image stretch to the parent's edges */
                    fill
                    /* 3. 'object-cover' forces the image to fill every pixel of the container */
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized 
                    /* 4. 'sizes' helps Next.js understand the intended display width */
                    sizes="200px"
                />
                
                {/* Keep button z-index high so it's not hidden by the filled image */}
                <button className="absolute top-2 right-2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition">
                    <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" unoptimized />
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate text-gray-800">
                {product?.name}
            </p>
            
            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium text-gray-900">
                    {currency}{product?.offerPrice}
                </p>
                <button className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition">
                    Buy now
                </button>
            </div>
        </div>
    );
};

export default ProductCard;