import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Flower, Heart, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlowerForm } from '@/components/flower/FlowerForm';

interface FlowerDto {
  seq: number;
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
  delFlag: string;
}

interface FlowerUpdateRequest {
  name: string;
  emotion: string;
  meaning: string;
  imgUrl?: string;
  delFlag?: string;
}

const API_BASE_URL = 'http://localhost:8080';

const FlowerEdit = () => {
  const { seq } = useParams<{ seq: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || '0';
  const search = searchParams.get('search') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    emotion: '',
    meaning: '',
    delFlag: 'N'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 꽃 정보 조회
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

  // 폼 데이터 초기화
  useEffect(() => {
    if (flower) {
      setFormData({
        name: flower.name,
        emotion: flower.emotion,
        meaning: flower.meaning,
        delFlag: flower.delFlag
      });
    }
  }, [flower]);

  // 꽃 수정 mutation
  const updateFlowerMutation = useMutation({
    mutationFn: async (data: { formData: FlowerUpdateRequest; imageFile?: File }) => {
      // 새 이미지 파일이 있으면 multipart/form-data로 전송
      if (data.imageFile) {
        const formData = new FormData();
        
        // flower 정보를 JSON 문자열로 변환하여 전송
        const flowerJson = JSON.stringify({
          name: data.formData.name,
          emotion: data.formData.emotion,
          meaning: data.formData.meaning,
          delFlag: data.formData.delFlag
        });
        
        formData.append('flower', flowerJson);
        formData.append('imageFile', data.imageFile);
        
        const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
          method: 'PATCH',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('꽃 수정에 실패했습니다');
        }
        return response.json();
      } else {
        // 이미지 파일이 없으면 JSON으로 전송
        const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.formData.name,
            emotion: data.formData.emotion,
            meaning: data.formData.meaning,
            delFlag: data.formData.delFlag
          }),
        });
        
        if (!response.ok) {
          throw new Error('꽃 수정에 실패했습니다');
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flower', seq] });
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      queryClient.invalidateQueries({ queryKey: ['allFlowers'] });
      toast({
        title: "성공 ✨",
        description: "꽃 정보가 아름답게 수정되었습니다! 💖",
      });
      
      // 원래 페이지로 돌아가기
      const params = new URLSearchParams();
      params.set('page', page);
      if (search) {
        params.set('search', search);
      }
      navigate(`/flowers?${params.toString()}`);
    },
    onError: () => {
      toast({
        title: "오류",
        description: "꽃 수정에 실패했습니다",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.emotion || !formData.meaning) {
      toast({
        title: "입력 오류",
        description: "필수 필드를 모두 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const updateData: FlowerUpdateRequest = {
      name: formData.name,
      emotion: formData.emotion,
      meaning: formData.meaning,
      delFlag: formData.delFlag
    };

    // imgUrl은 새 이미지가 있을 때만 백엔드에서 처리됨
    updateFlowerMutation.mutate({ 
      formData: updateData, 
      imageFile: imageFile || undefined 
    });
  };

  const handleBackToDetail = () => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) {
      params.set('search', search);
    }
    navigate(`/flowers/${seq}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm animate-pulse shadow-2xl border-0 rounded-3xl">
            <CardHeader>
              <div className="h-6 bg-gradient-to-r from-pink-200 to-rose-200 rounded w-1/3 mx-auto"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-10 bg-gradient-to-r from-pink-200 to-rose-200 rounded"></div>
              <div className="h-10 bg-gradient-to-r from-pink-200 to-rose-200 rounded"></div>
              <div className="h-24 bg-gradient-to-r from-pink-200 to-rose-200 rounded"></div>
              <div className="h-10 bg-gradient-to-r from-pink-200 to-rose-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-0">
            <Flower className="h-16 w-16 text-rose-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">꽃 정보를 불러올 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 꽃을 찾을 수 없어요</p>
            <Button onClick={() => navigate('/flowers')} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200">
              <Heart className="h-4 w-4 mr-2" />
              꽃 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            className="border-pink-200 text-pink-700 hover:bg-pink-50 rounded-full px-6 py-3 shadow-lg backdrop-blur-sm bg-white/80"
            onClick={handleBackToDetail}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            상세로
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-200 to-rose-200 p-3 rounded-full shadow-lg">
              <Flower className="h-6 w-6 text-pink-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">꽃 정보 수정</h1>
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* 폼 */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100">
            <CardTitle className="text-center text-2xl text-gray-900 flex items-center justify-center gap-3">
              <Heart className="h-6 w-6 text-pink-600" />
              "{flower.name}" 수정하기
              <Heart className="h-6 w-6 text-pink-600" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <FlowerForm
              formData={formData}
              setFormData={setFormData}
              imageFile={imageFile}
              setImageFile={setImageFile}
              onSubmit={handleSubmit}
              isSubmitting={updateFlowerMutation.isPending}
              submitButtonText="수정하기"
              onCancel={handleBackToDetail}
              isEdit={true}
              existingImageUrl={flower?.imgUrl ? `${API_BASE_URL}${flower.imgUrl}` : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerEdit;
