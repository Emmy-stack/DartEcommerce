import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Users, Shield, Truck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Darté</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your Modern Marketplace for Everything
          </p>
          <Button 
            asChild
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
          >
            <a href="/api/login">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Darté?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              The best place to discover, buy, and sell amazing products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect with verified sellers and buyers in a safe, trusted marketplace
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Shop with confidence using our secure payment system and buyer protection
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get your products delivered quickly with our network of trusted partners
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of buyers and sellers on Darté today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline">
              <a href="/api/login">Sign In</a>
            </Button>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
