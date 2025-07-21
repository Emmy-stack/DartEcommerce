import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

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

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  isFavorited?: boolean;
}

export function ProductCard({ product, onProductClick, isFavorited = false }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localFavorited, setLocalFavorited] = useState(isFavorited);

  const favoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (localFavorited) {
        await apiRequest("DELETE", `/api/favorites/${productId}`);
      } else {
        await apiRequest("POST", "/api/favorites", { productId });
      }
    },
    onSuccess: () => {
      setLocalFavorited(!localFavorited);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: localFavorited ? "Removed from favorites" : "Added to favorites",
        description: localFavorited 
          ? "Product removed from your favorites" 
          : "Product added to your favorites",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const cartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product added to your cart",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }
    cartMutation.mutate(product.id);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 animate-fade-in"
      onClick={() => onProductClick(product)}
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors duration-200"
          onClick={handleFavoriteClick}
          disabled={favoriteMutation.isPending}
        >
          <Heart 
            className={`h-4 w-4 ${
              localFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </Button>
        {product.favoriteCount > 10 && (
          <Badge className="absolute top-2 left-2">
            Popular
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {product.name}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ₦{parseFloat(product.price).toLocaleString()}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={cartMutation.isPending}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            {cartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
