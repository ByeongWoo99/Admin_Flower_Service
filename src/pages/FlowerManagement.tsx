import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search, Flower, Eye, Home } from 'lucide-react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0'));
  const [pageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [allFlowers, setAllFlowers] = useState<FlowerDto[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    setSearchParams(params);
  }, [currentPage, searchTerm, setSearchParams]);

  // 전체 꽃 목록 조회 (검색용)
  const { data: allFlowersData } = useQuery({
    queryKey: ['allFlowers'],
    queryFn: async (): Promise<FlowerDto[]> => {
      let allData: FlowerDto[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`${API_BASE_URL}/admin/flowers?page=${page}&size=100`);
        if (!response.ok) {
          throw new Error('꽃 목록을 불러오는데 실패했습니다');
        }
        const data: PageResponseFlowerDto = await response.json();
        allData = [...allData, ...data.flowers];
        hasMore = !data.lastPage;
        page++;
      }
      
      return allData;
    }
  });

  // 현재 페이지 꽃 목록 조회
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

  // 전체 꽃 목록 업데이트
  useEffect(() => {
    if (allFlowersData) {
      setAllFlowers(allFlowersData);
    }
  }, [allFlowersData]);

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
    if (window.confirm('정말로 이 꽃을 삭제하시겠습니까?')) {
      deleteFlowerMutation.mutate(seq);
    }
  };

  // 전체 목록에서 검색
  const filteredFlowers = searchTerm
    ? allFlowers.filter(flower =>
        flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flower.emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flower.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : flowersData?.flowers || [];

  // 검색 결과 페이지네이션
  const searchResultPages = Math.ceil(filteredFlowers.length / pageSize);
  const searchResultFlowers = searchTerm
    ? filteredFlowers.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : filteredFlowers;

  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const renderPageNumbers = () => {
    const totalPages = searchTerm ? searchResultPages : (flowersData?.totalPages || 0);
    if (totalPages <= 1) return null;

    const pages = [];
    const current = currentPage;
    
    // 첫 페이지
    if (current > 2) {
      pages.push(
        <Button
          key={0}
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(0)}
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          1
        </Button>
      );
      if (current > 3) {
        pages.push(<span key="start-ellipsis" className="px-2">...</span>);
      }
    }

    // 현재 페이지 주변
    for (let i = Math.max(0, current - 2); i <= Math.min(totalPages - 1, current + 2); i++) {
      pages.push(
        <Button
          key={i}
          variant={i === current ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={i === current 
            ? "bg-orange-600 hover:bg-orange-700" 
            : "border-orange-200 text-orange-700 hover:bg-orange-50"
          }
        >
          {i + 1}
        </Button>
      );
    }

    // 마지막 페이지
    if (current < totalPages - 3) {
      if (current < totalPages - 4) {
        pages.push(<span key="end-ellipsis" className="px-2">...</span>);
      }
      pages.push(
        <Button
          key={totalPages - 1}
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages - 1)}
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-4 rounded-2xl shadow-lg">
              <Flower className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                꽃의 정원
              </h1>
              <p className="text-muted-foreground text-lg">소중한 꽃들을 관리하세요</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link to="/">
              <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                <Home className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </Link>
            <Link to="/flowers/new">
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                새 꽃 추가
              </Button>
            </Link>
          </div>
        </div>

        {/* 검색창 */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="꽃 이름, 감정, 꽃말로 검색..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-12 text-lg max-w-md bg-white/90 backdrop-blur-sm border-orange-200 focus:border-orange-400 rounded-xl shadow-sm"
          />
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse border-orange-100 rounded-xl">
                <CardHeader className="pb-3">
                  <div className="h-48 bg-orange-100 rounded-lg mb-4"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {searchResultFlowers.map((flower) => (
              <Card key={flower.seq} className="group bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-orange-100 hover:border-orange-300 rounded-2xl overflow-hidden cursor-pointer">
                <Link 
                  to={`/flowers/${flower.seq}?page=${currentPage}&search=${searchTerm}`} 
                  className="block"
                >
                  <CardHeader className="pb-3 p-0">
                    <div className="relative h-52 bg-gradient-to-br from-orange-50 to-rose-50 overflow-hidden">
                      <img
                        src={flower.imgUrl ? `${API_BASE_URL}${flower.imgUrl}` : '/placeholder.svg'}
                        alt={flower.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      {flower.delFlag === 'Y' && (
                        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center backdrop-blur-sm">
                          <Badge variant="destructive" className="text-sm px-3 py-1">삭제됨</Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                        {flower.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-rose-100 text-orange-800 px-3 py-1 rounded-full">
                        {flower.emotion}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {flower.meaning}
                    </p>
                  </CardContent>
                </Link>
                <CardFooter className="flex gap-2 pt-4 p-4">
                  <Link to={`/flowers/${flower.seq}?page=${currentPage}&search=${searchTerm}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세
                    </Button>
                  </Link>
                  <Link to={`/flowers/${flower.seq}/edit?page=${currentPage}&search=${searchTerm}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(flower.seq);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg"
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
        {!isLoading && searchResultFlowers.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-orange-100 to-rose-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Flower className="h-12 w-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">꽃을 찾을 수 없습니다</h3>
            <p className="text-muted-foreground text-lg mb-6">
              {searchTerm ? '검색 조건을 다시 확인해보세요' : '첫 번째 꽃을 추가해보세요'}
            </p>
            {!searchTerm && (
              <Link to="/flowers/new">
                <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  새 꽃 추가하기
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* 개선된 페이지네이션 */}
        {(searchTerm ? searchResultPages : flowersData?.totalPages || 0) > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 px-4 py-2"
            >
              이전
            </Button>
            
            <div className="flex items-center gap-1">
              {renderPageNumbers()}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min((searchTerm ? searchResultPages : flowersData?.totalPages || 0) - 1, currentPage + 1))}
              disabled={searchTerm ? currentPage >= searchResultPages - 1 : flowersData?.lastPage}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 px-4 py-2"
            >
              다음
            </Button>
          </div>
        )}

        {/* 페이지 정보 */}
        {(searchTerm ? filteredFlowers.length > 0 : flowersData) && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            총 {searchTerm ? filteredFlowers.length : flowersData?.totalElements}개의 꽃 | {currentPage + 1} / {searchTerm ? searchResultPages : flowersData?.totalPages} 페이지
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowerManagement;
