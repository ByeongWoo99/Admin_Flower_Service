
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Flower, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  imgUrl: string;
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
  
  const [formData, setFormData] = useState<FlowerUpdateRequest>({
    name: '',
    emotion: '',
    meaning: '',
    imgUrl: '',
    delFlag: 'N'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
        imgUrl: flower.imgUrl,
        delFlag: flower.delFlag
      });
      // 기존 이미지 미리보기 설정
      if (flower.imgUrl) {
        setImagePreview(`${API_BASE_URL}${flower.imgUrl}`);
      }
    }
  }, [flower]);

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

  // 꽃 수정 mutation
  const updateFlowerMutation = useMutation({
    mutationFn: async (data: { formData: FlowerUpdateRequest; imageFile?: File }) => {
      let updatedFormData = { ...data.formData };
      
      // 새 이미지 파일이 있으면 업로드
      if (data.imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('imageFile', data.imageFile);
        
        const uploadResponse = await fetch(`${API_BASE_URL}/admin/flowers`, {
          method: 'POST',
          body: formDataToSend,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('이미지 업로드에 실패했습니다');
        }
        
        // 실제로는 업로드 API를 별도로 만들어야 하지만, 임시로 처리
        // 새 이미지 파일명으로 URL 생성 (실제 구현에서는 백엔드에서 반환받아야 함)
        const fileName = `${Date.now()}_${data.imageFile.name}`;
        updatedFormData.imgUrl = `/flower/${fileName}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });
      
      if (!response.ok) {
        throw new Error('꽃 수정에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flower', seq] });
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      queryClient.invalidateQueries({ queryKey: ['allFlowers'] });
      toast({
        title: "성공",
        description: "꽃 정보가 성공적으로 수정되었습니다!",
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
    updateFlowerMutation.mutate({ formData, imageFile: imageFile || undefined });
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm animate-pulse">
            <CardHeader>
              <div className="h-6 bg-orange-100 rounded w-1/3 mx-auto"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-10 bg-orange-100 rounded"></div>
              <div className="h-10 bg-orange-100 rounded"></div>
              <div className="h-24 bg-orange-100 rounded"></div>
              <div className="h-10 bg-orange-100 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">꽃 정보를 불러올 수 없습니다</h1>
          <Button onClick={() => navigate('/flowers')} className="bg-orange-600 hover:bg-orange-700">
            꽃 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={handleBackToDetail}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            상세로
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
              "{flower.name}" 수정하기
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
                <Label htmlFor="imageFile" className="text-gray-700">새 이미지 파일 (선택사항)</Label>
                <Input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border-orange-200 focus:border-orange-400"
                />
                <p className="text-sm text-muted-foreground mt-1">파일을 선택하지 않으면 기존 이미지가 유지됩니다</p>
              </div>

              <div>
                <Label htmlFor="delFlag" className="text-gray-700">상태</Label>
                <Select value={formData.delFlag} onValueChange={(value) => setFormData({ ...formData, delFlag: value })}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">활성</SelectItem>
                    <SelectItem value="Y">삭제됨</SelectItem>
                  </SelectContent>
                </Select>
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
                  onClick={handleBackToDetail}
                  className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={updateFlowerMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateFlowerMutation.isPending ? '저장 중...' : '수정하기'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlowerEdit;
