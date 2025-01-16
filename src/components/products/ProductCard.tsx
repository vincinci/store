"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/store/cart";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            RWF {product.price.toLocaleString()}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
