
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower, Leaf, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-100 p-4 rounded-full">
                <Flower className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              꽃의 추억
              <span className="block text-3xl text-orange-600 mt-2">꽃 관리 시스템</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              아름다운 꽃들과 그 속에 담긴 의미를 체계적으로 관리하세요. 
              자연의 가장 아름다운 표현을 통해 감정과 추억을 기록할 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/flowers">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8 py-3">
                  <Flower className="h-5 w-5 mr-2" />
                  꽃 관리하기
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 border-orange-200 text-orange-700 hover:bg-orange-50">
                <Heart className="h-5 w-5 mr-2" />
                더 알아보기
              </Button>
            </div>
          </div>
        </div>
        
        {/* 장식 요소 */}
        <div className="absolute top-20 left-10 text-orange-200 opacity-50">
          <Leaf className="h-24 w-24" />
        </div>
        <div className="absolute bottom-20 right-10 text-rose-200 opacity-50">
          <Flower className="h-32 w-32" />
        </div>
      </div>

      {/* 기능 섹션 */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 우리 시스템을 선택해야 할까요?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            현대적인 기술로 구축되어 원활한 꽃 컬렉션 관리 경험을 제공합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Flower className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">종합적인 관리</CardTitle>
              <CardDescription>
                감정, 의미, 아름다운 이미지를 포함한 각 꽃의 상세 정보를 저장할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 꽃 이름과 설명</li>
                <li>• 감정적 연관성</li>
                <li>• 문화적 의미와 상징</li>
                <li>• 고품질 이미지 관리</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="bg-rose-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Heart className="h-8 w-8 text-rose-600" />
              </div>
              <CardTitle className="text-xl">감정적 연결</CardTitle>
              <CardDescription>
                꽃과 감정, 추억을 연결하여 의미 있는 연관성을 만들어보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 감정 기반 분류</li>
                <li>• 추억의 의미</li>
                <li>• 개인적 의미 저장</li>
                <li>• 치유적 기록</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-pink-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="bg-pink-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Leaf className="h-8 w-8 text-pink-600" />
              </div>
              <CardTitle className="text-xl">쉬운 관리</CardTitle>
              <CardDescription>
                꽃 컬렉션을 추가, 편집, 정리할 수 있는 직관적인 인터페이스
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 간단한 생성, 수정, 삭제</li>
                <li>• 고급 검색 및 필터링</li>
                <li>• 대용량 컬렉션 페이지네이션</li>
                <li>• 안전 삭제 기능</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 액션 섹션 */}
      <div className="bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">꽃의 여행을 시작하세요</h2>
          <p className="text-orange-100 mb-8 text-lg">
            인생에서 특별한 의미를 가진 꽃들을 기록하세요. 
            추억과 감정의 디지털 정원을 만들어보세요.
          </p>
          <Link to="/flowers">
            <Button variant="secondary" size="lg" className="px-8 py-3">
              <Flower className="h-5 w-5 mr-2" />
              지금 시작하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
