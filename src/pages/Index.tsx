
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower, Leaf, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-6 rounded-3xl shadow-2xl">
                <Flower className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              꽃 관리
              <span className="block text-4xl bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent mt-4">
                꽃 관리 시스템
              </span>
            </h1>
            <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              편지 작성자에게 추천되는 꽃들을 관리할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/flowers">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-10 py-4 text-lg rounded-xl shadow-lg">
                  <Flower className="h-6 w-6 mr-3" />
                  꽃 관리하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* 장식 요소 */}
        <div className="absolute top-32 left-16 text-orange-200 opacity-30">
          <Leaf className="h-32 w-32 animate-pulse" />
        </div>
        <div className="absolute bottom-32 right-16 text-rose-200 opacity-30">
          <Flower className="h-40 w-40 animate-bounce" />
        </div>
        <div className="absolute top-48 right-32 text-amber-200 opacity-40">
          <Sparkles className="h-24 w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Index;
