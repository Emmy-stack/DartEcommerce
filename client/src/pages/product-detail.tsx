import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ProductModal } from "@/components/ProductModal";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  sellerId: string;
  categoryId: number;
  favoriteCount: number;
}

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
  });

  useEffect(() => {
    if (product) {
      setIsModalOpen(true);
    }
  }, [product]);

  const isFavorited = product ? favorites.some((fav: any) => fav.id === product.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading product...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <ProductModal
        product={product || null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          window.history.back();
        }}
        isFavorited={isFavorited}
      />
    </div>
  );
}
