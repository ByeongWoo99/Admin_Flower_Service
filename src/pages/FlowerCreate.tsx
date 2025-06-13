
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Flower, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlowerSaveRequest {
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
}

const API_BASE_URL = 'http://localhost:8080';

const FlowerCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FlowerSaveRequest>({
    name: '',
    emotion: '',
    meaning: '',
    imgUrl: ''
  });

  const createFlowerMutation = useMutation({
    mutationFn: async (newFlower: FlowerSaveRequest) => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlower),
      });
      if (!response.ok) {
        throw new Error('꽃 생성에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "새로운 꽃이 성공적으로 추가되었습니다!",
      });
      navigate('/flowers');
    },
    onError: () => {
      toast({
        title: "오류",
        description: "꽃 추가에 실패했습니다",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.emotion || !formData.meaning || !formData.imgUrl) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    createFlowerMutation.mutate(formData);
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
              아름다운 꽃을 추가하세요
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
                <Label htmlFor="imgUrl" className="text-gray-700">이미지 URL *</Label>
                <Input
                  id="imgUrl"
                  value={formData.imgUrl}
                  onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                  placeholder="이미지 URL을 입력하세요"
                  type="url"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              {/* 이미지 미리보기 */}
              {formData.imgUrl && (
                <div>
                  <Label className="text-gray-700">이미지 미리보기</Label>
                  <div className="mt-2 w-full h-48 bg-orange-50 rounded-lg overflow-hidden">
                    <img
                      src={formData.imgUrl}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
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
                  {createFlowerMutation.isPending ? '저장 중...' : '저장하기'}
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
