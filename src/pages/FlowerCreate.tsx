import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Flower } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FlowerForm } from '@/components/flower/FlowerForm';
import { API_CONFIG } from '@/config/api';

const FlowerCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    emotion: '',
    meaning: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 꽃 생성 mutation (백엔드 API에 맞춰 JSON 문자열로 전송)
  const createFlowerMutation = useMutation({
    mutationFn: async (data: { formData: typeof formData; imageFile: File }) => {
      const formDataToSend = new FormData();
      
      // 꽃 정보를 JSON으로 변환하여 전송
      const flowerJson = JSON.stringify({
        name: data.formData.name,
        emotion: data.formData.emotion,
        meaning: data.formData.meaning
      });
      
      formDataToSend.append('flower', flowerJson);
      formDataToSend.append('imageFile', data.imageFile);

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/flowers`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        throw new Error('꽃 생성에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      queryClient.invalidateQueries({ queryKey: ['allFlowers'] });
      toast({
        title: "성공",
        description: "새로운 꽃이 성공적으로 추가되었습니다!",
      });
      navigate('/flowers');
    },
    onError: () => {
      toast({
        title: "오류",
        description: "꽃 생성에 실패했습니다",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.emotion || !formData.meaning || !imageFile) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력하고 이미지를 선택해주세요",
        variant: "destructive",
      });
      return;
    }
    createFlowerMutation.mutate({ formData, imageFile });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/flowers">
            <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Flower className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">새 꽃 추가</h1>
          </div>
        </div>

        {/* 폼 */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900">
              새로운 꽃 정보 입력
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <FlowerForm
              formData={formData}
              setFormData={setFormData}
              imageFile={imageFile}
              setImageFile={setImageFile}
              onSubmit={handleSubmit}
              isSubmitting={createFlowerMutation.isPending}
              submitButtonText="추가하기"
              onCancel={() => navigate('/flowers')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerCreate;
