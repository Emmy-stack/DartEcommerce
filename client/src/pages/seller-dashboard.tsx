import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Package, ShoppingCart, DollarSign, Star, Info, CloudUpload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  categoryId: z.string().min(1, "Category is required"),
});

const sellerApplicationSchema = z.object({
  email: z.string().email("Valid email is required"),
  whatsapp: z.string().min(10, "WhatsApp number is required"),
  paymentInfo: z.string().min(10, "Payment information is required"),
});

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: sellerApplication } = useQuery({
    queryKey: ["/api/seller-applications/me"],
    enabled: isAuthenticated,
  });

  const productForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: "",
    },
  });

  const applicationForm = useForm({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      email: user?.email || "",
      whatsapp: "",
      paymentInfo: "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      applicationForm.setValue("email", user.email);
    }
  }, [user, applicationForm]);

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/products", {
        ...data,
        categoryId: parseInt(data.categoryId),
        price: data.price,
      });
    },
    onSuccess: () => {
      productForm.reset();
      setAgreedToTerms(false);
      toast({
        title: "Product created",
        description: "Your product has been submitted for approval",
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
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/seller-applications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller-applications/me"] });
      toast({
        title: "Application submitted",
        description: "Your seller application has been submitted for review",
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
        description: "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  // Show seller application form if not approved
  if (!user?.isApproved || user?.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Apply to Become a Seller</CardTitle>
            </CardHeader>
            <CardContent>
              {sellerApplication?.status === "pending" ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your seller application is pending review. We'll notify you once it's approved.
                  </AlertDescription>
                </Alert>
              ) : sellerApplication?.status === "rejected" ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Your seller application was rejected. Please contact support for more information.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={applicationForm.handleSubmit((data) => createApplicationMutation.mutate(data))} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...applicationForm.register("email")}
                      disabled
                    />
                    {applicationForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{applicationForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      {...applicationForm.register("whatsapp")}
                      placeholder="+234 XXX XXX XXXX"
                    />
                    {applicationForm.formState.errors.whatsapp && (
                      <p className="text-red-500 text-sm mt-1">{applicationForm.formState.errors.whatsapp.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="paymentInfo">Payment Information</Label>
                    <Textarea
                      id="paymentInfo"
                      {...applicationForm.register("paymentInfo")}
                      placeholder="Bank account details, payment preferences, etc."
                      rows={4}
                    />
                    {applicationForm.formState.errors.paymentInfo && (
                      <p className="text-red-500 text-sm mt-1">{applicationForm.formState.errors.paymentInfo.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createApplicationMutation.isPending}
                  >
                    {createApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your products and track your sales</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₦0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Product Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={productForm.handleSubmit((data) => createProductMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...productForm.register("name")}
                    placeholder="Enter product name"
                  />
                  {productForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{productForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...productForm.register("price")}
                    placeholder="0.00"
                  />
                  {productForm.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">{productForm.formState.errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select onValueChange={(value) => productForm.setValue("categoryId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {productForm.formState.errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{productForm.formState.errors.categoryId.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...productForm.register("description")}
                    placeholder="Describe your product in detail"
                    rows={4}
                  />
                  {productForm.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">{productForm.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="imageUrl">Product Image URL</Label>
                  <Input
                    id="imageUrl"
                    {...productForm.register("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                  />
                  {productForm.formState.errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-1">{productForm.formState.errors.imageUrl.message}</p>
                  )}
                </div>

                {/* Subscription Notice */}
                <div className="md:col-span-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <h3 className="font-medium">Subscription Required</h3>
                        <p className="mt-1">
                          ₦3000/month subscription + 7% commission per sale. First 3 months free!
                        </p>
                        <div className="flex items-center mt-2">
                          <Checkbox
                            id="terms"
                            checked={agreedToTerms}
                            onCheckedChange={setAgreedToTerms}
                          />
                          <label htmlFor="terms" className="ml-2 text-sm">
                            I agree to the terms and conditions
                          </label>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={!agreedToTerms || createProductMutation.isPending}
                    className="w-full"
                  >
                    {createProductMutation.isPending ? "Adding Product..." : "Add Product"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
