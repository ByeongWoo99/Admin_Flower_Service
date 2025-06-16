
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';

interface FlowerDto {
  seq: number;
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
  delFlag: string;
}

const API_BASE_URL = 'http://localhost:8080';

const FlowerManagement = () => {
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 꽃 목록 조회
  const { data: flowers, isLoading, error } = useQuery({
    queryKey: ['flowers', currentPage, debouncedSearchTerm],
    queryFn: async (): Promise<{ flowers: FlowerDto[]; totalCount: number }> => {
      const response = await fetch(
        `${API_BASE_URL}/admin/flowers?page=${currentPage}&search=${debouncedSearchTerm}`
      );
      if (!response.ok) {
        throw new Error('꽃 정보를 불러오는데 실패했습니다');
      }
      return response.json();
    }
  });

  // Update page count when data changes
  useEffect(() => {
    if (flowers) {
      setPageCount(Math.ceil(flowers.totalCount / 12));
    }
  }, [flowers]);

  // 페이지 변경 핸들러
  const handlePageClick = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
  };

  // 꽃 삭제 mutation
  const deleteFlowerMutation = useMutation({
    mutationFn: async (seq: number) => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
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

  const handleDelete = (seq: number) => {
    deleteFlowerMutation.mutate(seq);
  };

  useEffect(() => {
    // debouncedSearchTerm이 변경될 때마다 currentPage를 0으로 설정
    setCurrentPage(0);
  }, [debouncedSearchTerm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const paginatedFlowers = flowers?.flowers || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
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

        {/* 꽃 목록 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedFlowers.map((flower) => (
            <Card 
              key={flower.seq} 
              className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="w-full h-48 bg-orange-50 rounded-lg overflow-hidden">
                  <img
                    src={flower.imgUrl ? `${API_BASE_URL}${flower.imgUrl}` : '/placeholder.svg'}
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
                  to={`/flowers/${flower.seq}?page=${currentPage}&search=${debouncedSearchTerm}`}
                  className="flex-1"
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
                  to={`/flowers/${flower.seq}/edit?page=${currentPage}&search=${debouncedSearchTerm}`}
                  className="flex-1"
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
                  onClick={() => handleDelete(flower.seq)}
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
        {pageCount > 1 && (
          <div className="flex justify-center mt-8">
            {[...Array(pageCount)].map((_, index) => (
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
