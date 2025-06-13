
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Search, Flower } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface FlowerSaveRequest {
  name: string;
  emotion: string;
  meaning: string;
  imgUrl: string;
}

interface FlowerUpdateRequest extends FlowerSaveRequest {
  delFlag?: string;
}

const API_BASE_URL = 'http://localhost:8080';

const FlowerManagement = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState<FlowerDto | null>(null);
  const [formData, setFormData] = useState<FlowerSaveRequest>({
    name: '',
    emotion: '',
    meaning: '',
    imgUrl: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch flowers with pagination
  const { data: flowersData, isLoading, error } = useQuery({
    queryKey: ['flowers', currentPage, pageSize],
    queryFn: async (): Promise<PageResponseFlowerDto> => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers?page=${currentPage}&size=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flowers');
      }
      return response.json();
    }
  });

  // Create flower mutation
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
        throw new Error('Failed to create flower');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Flower created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create flower",
        variant: "destructive",
      });
    }
  });

  // Update flower mutation
  const updateFlowerMutation = useMutation({
    mutationFn: async ({ seq, data }: { seq: number; data: FlowerUpdateRequest }) => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update flower');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Flower updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update flower",
        variant: "destructive",
      });
    }
  });

  // Delete flower mutation
  const deleteFlowerMutation = useMutation({
    mutationFn: async (seq: number) => {
      const response = await fetch(`${API_BASE_URL}/admin/flowers/${seq}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete flower');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      toast({
        title: "Success",
        description: "Flower deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete flower",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      emotion: '',
      meaning: '',
      imgUrl: ''
    });
    setSelectedFlower(null);
  };

  const handleCreate = () => {
    createFlowerMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedFlower) {
      updateFlowerMutation.mutate({
        seq: selectedFlower.seq,
        data: formData
      });
    }
  };

  const handleEdit = (flower: FlowerDto) => {
    setSelectedFlower(flower);
    setFormData({
      name: flower.name,
      emotion: flower.emotion,
      meaning: flower.meaning,
      imgUrl: flower.imgUrl
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (seq: number) => {
    if (window.confirm('Are you sure you want to delete this flower?')) {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Flowers</h1>
          <p className="text-muted-foreground">Please check your API connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-green-100 p-3 rounded-full">
              <Flower className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flower Management</h1>
              <p className="text-muted-foreground">Manage your botanical collection</p>
            </div>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Flower
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Flower</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter flower name"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="emotion">Emotion</Label>
                  <Input
                    id="emotion"
                    value={formData.emotion}
                    onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                    placeholder="Enter emotion"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="meaning">Meaning</Label>
                  <Textarea
                    id="meaning"
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    placeholder="Enter flower meaning"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="imgUrl">Image URL</Label>
                  <Input
                    id="imgUrl"
                    value={formData.imgUrl}
                    onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
                <Button 
                  onClick={handleCreate} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={createFlowerMutation.isPending}
                >
                  {createFlowerMutation.isPending ? 'Creating...' : 'Create Flower'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search flowers by name, emotion, or meaning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Flowers Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFlowers.map((flower) => (
              <Card key={flower.seq} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="relative h-48 bg-gray-100 rounded-md overflow-hidden mb-4">
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
                        <Badge variant="destructive">Deleted</Badge>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {flower.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {flower.emotion}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {flower.meaning}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(flower)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(flower.seq)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={flower.delFlag === 'Y'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFlowers.length === 0 && (
          <div className="text-center py-12">
            <Flower className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No flowers found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first flower to get started'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {flowersData && flowersData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage + 1} of {flowersData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(flowersData.totalPages - 1, currentPage + 1))}
              disabled={flowersData.lastPage}
            >
              Next
            </Button>
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Flower</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter flower name"
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="edit-emotion">Emotion</Label>
                <Input
                  id="edit-emotion"
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  placeholder="Enter emotion"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="edit-meaning">Meaning</Label>
                <Textarea
                  id="edit-meaning"
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="Enter flower meaning"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-imgUrl">Image URL</Label>
                <Input
                  id="edit-imgUrl"
                  value={formData.imgUrl}
                  onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              <Button 
                onClick={handleUpdate} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={updateFlowerMutation.isPending}
              >
                {updateFlowerMutation.isPending ? 'Updating...' : 'Update Flower'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FlowerManagement;
