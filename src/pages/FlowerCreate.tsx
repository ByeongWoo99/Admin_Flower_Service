
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Flower, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlowerCreateRequest {
  name: string;
  emotion: string;
  meaning: string;
  delFlag?: string;
}

const API_BASE_URL = 'http://localhost:8080';

const FlowerCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FlowerCreateRequest>({
    name: '',
    emotion: '',
    meaning: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 꽃 생성 mutation
  const createFlowerMutation = useMutation({
    mutationFn: async (data: { formData: FlowerCreateRequest; imageFile: File }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.formData.name);
      formDataToSend.append('emotion', data.formData.emotion);
      formDataToSend.append('meaning', data.formData.meaning);
      formDataToSend.append('image', data.imageFile);

      const response = await fetch(`${API_BASE_URL}/admin/flowers`, {
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-700">꽃 이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="꽃 이름을 입력하세요"
                  maxLength={20}
                  className="border-orange-200 focus:border-orange-400"
                />
                <p className="text-sm text-muted-foreground mt-1">최대 20자</p>
              </div>
              
              <div>
                <Label htmlFor="emotion" className="text-gray-700">감정 *</Label>
                <Input
                  id="emotion"
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  placeholder="감정을 입력하세요"
                  maxLength={10}
                  className="border-orange-200 focus:border-orange-400"
                />
                <p className="text-sm text-muted-foreground mt-1">최대 10자</p>
              </div>
              
              <div>
                <Label htmlFor="meaning" className="text-gray-700">꽃말 *</Label>
                <Textarea
                  id="meaning"
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="꽃말을 입력하세요"
                  rows={4}
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>
              
              <div>
                <Label htmlFor="image" className="text-gray-700">이미지 파일 *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              {/* 이미지 미리보기 */}
              {imagePreview && (
                <div>
                  <Label className="text-gray-700">이미지 미리보기</Label>
                  <div className="mt-2 w-full h-48 bg-orange-50 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/flowers')}
                  className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={createFlowerMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createFlowerMutation.isPending ? '저장 중...' : '추가하기'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerCreate;
