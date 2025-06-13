
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search, Flower, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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

const API_BASE_URL = 'http://localhost:8080';

const FlowerManagement = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 꽃 목록 조회
  const { data: flowersData, isLoading, error } = useQuery({
    queryKey: ['flowers', currentPage, pageSize],
    queryFn: async (): Promise<PageResponseFlowerDto> => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers?page=${currentPage}&size=${pageSize}`);
      if (!response.ok) {
        throw new Error('꽃 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    }
  });

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
    if (window.confirm('정말로 이 꽃을 삭제하시겠습니까?')) {
      deleteFlowerMutation.mutate(seq);
    }
  };

  const filteredFlowers = flowersData?.flowers.filter(flower =>
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-rose-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">꽃 목록 로딩 오류</h1>
          <p className="text-muted-foreground">API 연결을 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-orange-100 p-3 rounded-full">
              <Flower className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">꽃 관리</h1>
              <p className="text-muted-foreground">아름다운 꽃들을 관리하세요</p>
            </div>
          </div>
          
          <Link to="/flowers/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              새 꽃 추가
            </Button>
          </Link>
        </div>

        {/* 검색창 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="꽃 이름, 감정, 꽃말로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md bg-white/80 backdrop-blur-sm border-orange-200 focus:border-orange-400"
          />
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse border-orange-100">
                <CardHeader className="pb-3">
                  <div className="h-48 bg-orange-100 rounded-md mb-4"></div>
                  <div className="h-4 bg-orange-100 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-orange-100 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-orange-100 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 꽃 목록 */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFlowers.map((flower) => (
              <Card key={flower.seq} className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-orange-100 hover:border-orange-200">
                <CardHeader className="pb-3">
                  <div className="relative h-48 bg-orange-50 rounded-md overflow-hidden mb-4">
                    <img
                      src={flower.imgUrl || '/placeholder.svg'}
                      alt={flower.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    {flower.delFlag === 'Y' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <Badge variant="destructive">삭제됨</Badge>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {flower.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {flower.emotion}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {flower.meaning}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 pt-4">
                  <Link to={`/flowers/${flower.seq}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세
                    </Button>
                  </Link>
                  <Link to={`/flowers/${flower.seq}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(flower.seq)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={flower.delFlag === 'Y'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && filteredFlowers.length === 0 && (
          <div className="text-center py-12">
            <Flower className="h-12 w-12 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">꽃을 찾을 수 없습니다</h3>
            <p className="text-muted-foreground">
              {searchTerm ? '검색 조건을 다시 확인해보세요' : '첫 번째 꽃을 추가해보세요'}
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {flowersData && flowersData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              이전
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              {currentPage + 1} / {flowersData.totalPages} 페이지
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(flowersData.totalPages - 1, currentPage + 1))}
              disabled={flowersData.lastPage}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowerManagement;
