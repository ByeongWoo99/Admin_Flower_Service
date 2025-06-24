import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Flower } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlowerForm } from '@/components/flower/FlowerForm';
import { API_CONFIG } from '@/config/api';

interface FlowerDto {
  seq: number;
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
  delFlag: string;
}

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

  // 기존 꽃 정보 조회
  const { data: flower, isLoading } = useQuery({
    queryKey: ['flower', seq],
    queryFn: async (): Promise<FlowerDto> => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/flowers/${seq}`);
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

  // 꽃 수정 mutation (이미지 포함)
  const updateFlowerWithImageMutation = useMutation({
    mutationFn: async (data: { formData: typeof formData; imageFile: File }) => {
      const formDataToSend = new FormData();
      
      const flowerJson = JSON.stringify({
        name: data.formData.name,
        emotion: data.formData.emotion,
        meaning: data.formData.meaning,
        delFlag: data.formData.delFlag
      });
      
      formDataToSend.append('flower', flowerJson);
      formDataToSend.append('imageFile', data.imageFile);

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/flowers/${seq}`, {
        method: 'PATCH',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error('꽃 수정에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flower', seq] });
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      toast({
        title: "성공",
        description: "꽃 정보가 성공적으로 수정되었습니다!",
      });
      handleBackToList();
    },
    onError: () => {
      toast({
        title: "오류",
        description: "꽃 수정에 실패했습니다",
        variant: "destructive",
      });
    }
  });

  // 꽃 수정 mutation (텍스트만)
  const updateFlowerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/flowers/${seq}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          emotion: data.emotion,
          meaning: data.meaning,
          delFlag: data.delFlag
        }),
      });
      
      if (!response.ok) {
        throw new Error('꽃 수정에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flower', seq] });
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      toast({
        title: "성공",
        description: "꽃 정보가 성공적으로 수정되었습니다!",
      });
      handleBackToList();
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
        description: "모든 필드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (imageFile) {
      updateFlowerWithImageMutation.mutate({ formData, imageFile });
    } else {
      updateFlowerMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
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
          
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Flower className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">꽃 정보 수정</h1>
          </div>
        </div>

        {/* 폼 */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900">
              꽃 정보 수정
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <FlowerForm
              formData={formData}
              setFormData={setFormData}
              imageFile={imageFile}
              setImageFile={setImageFile}
              onSubmit={handleSubmit}
              isSubmitting={updateFlowerWithImageMutation.isPending || updateFlowerMutation.isPending}
              submitButtonText="수정하기"
              onCancel={handleBackToList}
              isEdit={true}
              existingImageUrl={flower?.imgUrl}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerEdit;
