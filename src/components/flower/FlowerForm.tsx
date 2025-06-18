
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';

interface FlowerFormProps {
  formData: {
    name: string;
    emotion: string;
    meaning: string;
    delFlag?: string;
  };
  setFormData: (data: any) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel: () => void;
  isEdit?: boolean;
  existingImageUrl?: string;
}

export const FlowerForm: React.FC<FlowerFormProps> = ({
  formData,
  setFormData,
  imageFile,
  setImageFile,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
  isEdit = false,
  existingImageUrl
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const getImagePreview = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    if (isEdit && existingImageUrl) {
      return existingImageUrl;
    }
    return null;
  };

  const imagePreview = getImagePreview();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
        <Label htmlFor="imageFile" className="text-gray-700">
          이미지 파일 {isEdit ? "(선택사항)" : "*"}
        </Label>
        <Input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border-orange-200 focus:border-orange-400"
        />
        {isEdit && (
          <p className="text-sm text-muted-foreground mt-1">
            파일을 선택하지 않으면 기존 이미지가 유지됩니다
          </p>
        )}
      </div>

      {isEdit && formData.delFlag !== undefined && (
        <div>
          <Label htmlFor="delFlag" className="text-gray-700">상태</Label>
          <Select 
            value={formData.delFlag} 
            onValueChange={(value) => setFormData({ ...formData, delFlag: value })}
          >
            <SelectTrigger className="border-orange-200 focus:border-orange-400">
              <SelectValue placeholder="상태를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">활성</SelectItem>
              <SelectItem value="Y">삭제됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 이미지 미리보기 */}
      {imagePreview && (
        <div>
          <Label className="text-gray-700">이미지 미리보기</Label>
          <div className="mt-2 w-[512px] h-[512px] mx-auto bg-orange-50 rounded-lg overflow-hidden border-2 border-orange-100">
            <img
              src={imagePreview}
              alt="미리보기"
              className="w-full h-full object-contain"
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
          onClick={onCancel}
          className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-orange-600 hover:bg-orange-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? '저장 중...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};
