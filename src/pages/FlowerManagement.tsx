import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';

interface FlowerDto {
  seq: number;
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
  delFlag: string;
}

interface PageResponseFlowerDto {
  flowers: FlowerDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

const EMOTIONS = ["슬픔", "그리움", "감사", "후회", "미안함(사죄)", "희망", "추모+존경"];

const FlowerManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [filteredFlowers, setFilteredFlowers] = useState<FlowerDto[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // URL에서 현재 페이지 가져오기
  const currentPage = parseInt(searchParams.get('page') || '0');

  // 꽃 목록 조회 (백엔드 API에 맞춰 page, size만 사용)
  const { data: flowerData, isLoading, error } = useQuery({
    queryKey: ['flowers', currentPage],
    queryFn: async (): Promise<PageResponseFlowerDto> => {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/admin/flowers?page=${currentPage}&size=12`
      );
      if (!response.ok) {
        throw new Error('꽃 정보를 불러오는데 실패했습니다');
      }
      return response.json();
    }
  });

  // 검색 및 감정 필터링 (클라이언트 사이드)
  useEffect(() => {
    if (flowerData && flowerData.flowers) {
      let filtered = flowerData.flowers;
      
      // 검색어 필터링
      if (searchTerm) {
        filtered = filtered.filter(flower =>
          flower.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // 감정 필터링
      if (selectedEmotion) {
        filtered = filtered.filter(flower => flower.emotion === selectedEmotion);
      }
      
      setFilteredFlowers(filtered);
    }
  }, [flowerData, searchTerm, selectedEmotion]);

  // 페이지 변경 핸들러
  const handlePageClick = (selectedPage: number) => {
    const params = new URLSearchParams();
    params.set('page', selectedPage.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    setSearchParams(params);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // 검색어 변경 시 URL 업데이트
    const params = new URLSearchParams();
    params.set('page', '0'); // 검색 시 첫 페이지로 이동
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    }
    setSearchParams(params);
  };

  // 감정 필터 핸들러
  const handleEmotionFilter = (emotion: string) => {
    if (selectedEmotion === emotion) {
      setSelectedEmotion(''); // 같은 감정 클릭 시 필터 해제
    } else {
      setSelectedEmotion(emotion);
    }
    
    // 필터 변경 시 첫 페이지로 이동
    const params = new URLSearchParams();
    params.set('page', '0');
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    setSearchParams(params);
  };

  // 꽃 카드 클릭 핸들러 (상세 페이지로 이동)
  const handleFlowerClick = (seq: number) => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    navigate(`/flowers/${seq}?${params.toString()}`);
  };

  // 꽃 삭제 mutation
  const deleteFlowerMutation = useMutation({
    mutationFn: async (seq: number) => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/flowers/${seq}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('꽃 삭제에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      queryClient.invalidateQueries({ queryKey: ['allFlowers'] });
      toast({
        title: "성공",
        description: "꽃이 성공적으로 삭제되었습니다!",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "꽃 삭제에 실패했습니다",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (e: React.MouseEvent, seq: number) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    deleteFlowerMutation.mutate(seq);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const displayFlowers = (searchTerm || selectedEmotion) ? filteredFlowers : (flowerData?.flowers || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                <Home className="h-4 w-4 mr-2" />
                홈
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">꽃 관리</h1>
          </div>
          <Link to="/flowers/new">
            <Button>새로운 꽃 추가</Button>
          </Link>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="꽃 이름으로 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-md bg-white/80 backdrop-blur-sm border-orange-100 shadow-sm"
          />
        </div>

        {/* 감정 필터 버튼들 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedEmotion === '' ? "default" : "outline"}
              onClick={() => setSelectedEmotion('')}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              전체
            </Button>
            {EMOTIONS.map((emotion) => (
              <Button
                key={emotion}
                variant={selectedEmotion === emotion ? "default" : "outline"}
                onClick={() => handleEmotionFilter(emotion)}
                className={selectedEmotion === emotion ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200 text-orange-700 hover:bg-orange-50"}
              >
                {emotion}
              </Button>
            ))}
          </div>
        </div>

        {/* 꽃 목록 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayFlowers.map((flower) => (
            <Card 
              key={flower.seq} 
              className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleFlowerClick(flower.seq)}
            >
              <CardHeader className="pb-3">
                <div className="w-full h-48 bg-orange-50 rounded-lg overflow-hidden">
                  <img
                    src={flower.imgUrl || '/placeholder.svg'}
                    alt={flower.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardTitle className="text-lg text-gray-900 text-center">
                  {flower.name}
                </CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {flower.emotion}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                  {flower.meaning}
                </p>
                {flower.delFlag === 'Y' && (
                  <Badge variant="destructive" className="w-full justify-center mb-3">
                    삭제된 꽃
                  </Badge>
                )}
              </CardContent>

              <CardFooter className="flex gap-2 pt-0">
                <Link 
                  to={`/flowers/${flower.seq}?page=${currentPage}&search=${searchTerm}`}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    상세
                  </Button>
                </Link>
                
                <Link 
                  to={`/flowers/${flower.seq}/edit?page=${currentPage}&search=${searchTerm}`}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => handleDelete(e, flower.seq)}
                  disabled={deleteFlowerMutation.isPending}
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 페이지네이션 */}
        {flowerData && flowerData.totalPages > 1 && !searchTerm && !selectedEmotion && (
          <div className="flex justify-center mt-8">
            {[...Array(flowerData.totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "secondary"}
                className={`mx-1 ${currentPage === index ? 'bg-orange-300 text-orange-900' : ''}`}
                onClick={() => handlePageClick(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowerManagement;
