
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower, Leaf, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <Flower className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Botanical Memorial
              <span className="block text-3xl text-green-600 mt-2">Flower Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Preserve the beauty and meaning of flowers with our comprehensive management system. 
              Catalog emotions, meanings, and memories through nature's most beautiful expressions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/flowers">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                  <Flower className="h-5 w-5 mr-2" />
                  Manage Flowers
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3">
                <Heart className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-green-200 opacity-50">
          <Leaf className="h-24 w-24" />
        </div>
        <div className="absolute bottom-20 right-10 text-emerald-200 opacity-50">
          <Flower className="h-32 w-32" />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our System?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with modern technology to provide a seamless experience for managing your botanical collection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Flower className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Comprehensive Catalog</CardTitle>
              <CardDescription>
                Store detailed information about each flower including emotions, meanings, and beautiful imagery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Flower names and descriptions</li>
                <li>• Emotional associations</li>
                <li>• Cultural meanings and symbolism</li>
                <li>• High-quality image management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="bg-emerald-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Emotional Connection</CardTitle>
              <CardDescription>
                Connect flowers with emotions and memories, creating meaningful associations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Emotion-based categorization</li>
                <li>• Memorial significance</li>
                <li>• Personal meaning storage</li>
                <li>• Therapeutic documentation</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="bg-teal-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Leaf className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle className="text-xl">Easy Management</CardTitle>
              <CardDescription>
                Intuitive interface for adding, editing, and organizing your flower collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Simple CRUD operations</li>
                <li>• Advanced search and filtering</li>
                <li>• Pagination for large collections</li>
                <li>• Soft delete functionality</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Botanical Journey</h2>
          <p className="text-green-100 mb-8 text-lg">
            Begin cataloging the flowers that hold special meaning in your life. 
            Create a digital garden of memories and emotions.
          </p>
          <Link to="/flowers">
            <Button variant="secondary" size="lg" className="px-8 py-3">
              <Flower className="h-5 w-5 mr-2" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
