import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ShoppingCart, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorited?: boolean;
}

export function ProductModal({ product, isOpen, onClose, isFavorited = false }: ProductModalProps) {
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

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      await apiRequest("POST", "/api/orders", {
        productId: product.id,
        sellerId: product.sellerId,
        quantity: 1,
        totalPrice: product.price,
      });
    },
    onSuccess: () => {
      toast({
        title: "Order placed",
        description: "Your order has been placed successfully",
      });
      onClose();
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
        description: "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!product) return;
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

  const handleAddToCart = () => {
    if (!product) return;
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

  const handleBuyNow = () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place orders",
        variant: "destructive",
      });
      return;
    }
    orderMutation.mutate();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₦{parseFloat(product.price).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">(4.2) • 124 reviews</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Seller Information</h3>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt="Seller" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Verified Seller</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">4.8 ⭐ (1,245 sales)</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Chat
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={cartMutation.isPending}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {cartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFavoriteClick}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      localFavorited ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleBuyNow}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
