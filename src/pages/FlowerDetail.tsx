
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Flower } from 'lucide-react';

interface FlowerDto {
  seq: number;
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
  delFlag: string;
}

const API_BASE_URL = 'http://localhost:8080';

const FlowerDetail = () => {
  const { seq } = useParams<{ seq: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || '0';
  const search = searchParams.get('search') || '';

  const { data: flower, isLoading, error } = useQuery({
    queryKey: ['flower', seq],
    queryFn: async (): Promise<FlowerDto> => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`);
      if (!response.ok) {
        throw new Error('꽃 정보를 불러오는데 실패했습니다');
      }
      return response.json();
    },
    enabled: !!seq
  });

  const handleBackToList = () => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) {
      params.set('search', search);
    }
    navigate(`/flowers?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm animate-pulse">
            <CardHeader>
              <div className="h-8 bg-orange-100 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-orange-100 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-orange-100 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-orange-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-orange-100 rounded w-3/4"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">꽃 정보를 불러올 수 없습니다</h1>
          <Button onClick={() => navigate('/flowers')} className="bg-orange-600 hover:bg-orange-700">
            꽃 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={handleBackToList}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
          
          <Link to={`/flowers/${flower.seq}/edit?page=${page}&search=${search}`}>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Edit className="h-4 w-4 mr-2" />
              수정하기
            </Button>
          </Link>
        </div>

        {/* 꽃 상세 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 p-4 rounded-full">
                <Flower className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {flower.name}
            </CardTitle>
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-lg px-4 py-2">
                {flower.emotion}
              </Badge>
            </div>
            {flower.delFlag === 'Y' && (
              <Badge variant="destructive" className="mt-2">
                삭제된 꽃
              </Badge>
            )}
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* 꽃 이미지 */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-80 bg-orange-50 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={flower.imgUrl ? `${API_BASE_URL}${flower.imgUrl}` : '/placeholder.svg'}
                  alt={flower.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                    console.log('Image load failed, using placeholder');
                  }}
                />
              </div>
            </div>

            {/* 꽃말 */}
            <div className="bg-orange-50/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Flower className="h-5 w-5 text-orange-600 mr-2" />
                꽃말
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {flower.meaning}
              </p>
            </div>

            {/* 추가 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-rose-50/50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">번호</h4>
                <p className="text-gray-600">{flower.seq}</p>
              </div>
              <div className="bg-pink-50/50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">상태</h4>
                <p className="text-gray-600">
                  {flower.delFlag === 'Y' ? '삭제됨' : '활성'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerDetail;
