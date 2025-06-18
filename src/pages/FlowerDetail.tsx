
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Flower, Heart, Trash2 } from 'lucide-react';
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

const FlowerDetail = () => {
  const { seq } = useParams<{ seq: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // 꽃 삭제 mutation
  const deleteFlowerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('꽃 삭제에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flower', seq] });
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      queryClient.invalidateQueries({ queryKey: ['allFlowers'] });
      toast({
        title: "성공",
        description: "꽃이 성공적으로 삭제되었습니다!",
      });
      
      // 목록으로 돌아가기
      handleBackToList();
    },
    onError: () => {
      toast({
        title: "오류",
        description: "꽃 삭제에 실패했습니다",
        variant: "destructive",
      });
    }
  });

  const handleBackToList = () => {
    const params = new URLSearchParams();
    if (page !== '0') {
      params.set('page', page);
    }
    if (search) {
      params.set('search', search);
    }
    
    const queryString = params.toString();
    navigate(`/flowers${queryString ? `?${queryString}` : ''}`);
  };

  const handleDelete = () => {
    deleteFlowerMutation.mutate();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !flower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-12 shadow-lg">
            <Flower className="h-16 w-16 text-orange-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">꽃 정보를 불러올 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 꽃을 찾을 수 없어요</p>
            <Button onClick={handleBackToList} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg shadow-lg">
              <Heart className="h-4 w-4 mr-2" />
              꽃 목록으로 돌아가기
            </Button>
          </div>
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
          
          <div className="flex gap-3">
            <Link to={`/flowers/${flower.seq}/edit?page=${page}&search=${search}`}>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Edit className="h-4 w-4 mr-2" />
                수정하기
              </Button>
            </Link>
          </div>
        </div>

        {/* 꽃 상세 정보 */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              {flower.name}
            </CardTitle>
            <div className="flex justify-center gap-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Heart className="h-4 w-4 mr-2" />
                {flower.emotion}
              </Badge>
              {flower.delFlag === 'Y' && (
                <Badge variant="destructive">
                  삭제된 꽃
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* 꽃 이미지 */}
            <div className="flex justify-center">
              <div className="w-[512px] h-[512px] bg-orange-50 rounded-lg overflow-hidden shadow-lg border-2 border-orange-100">
                <img
                  src={flower.imgUrl || '/placeholder.svg'}
                  alt={flower.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                    console.log('Image load failed, using placeholder');
                  }}
                />
              </div>
            </div>

            {/* 꽃말 */}
            <div className="bg-orange-50 rounded-lg p-6 shadow-sm border border-orange-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Flower className="h-5 w-5 text-orange-600 mr-2" />
                꽃말
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                "{flower.meaning}"
              </p>
            </div>

            {/* 상세 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">번호</h4>
                <p className="text-gray-600">{flower.seq}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">상태</h4>
                    <p className="text-gray-600">
                      {flower.delFlag === 'Y' ? '삭제됨' : '활성'}
                    </p>
                  </div>
                  {flower.delFlag !== 'Y' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>꽃 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 "{flower.name}"을(를) 삭제하시겠습니까? 
                            <br />
                            삭제된 꽃은 복구할 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={deleteFlowerMutation.isPending}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {deleteFlowerMutation.isPending ? '삭제 중...' : '삭제'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerDetail;
