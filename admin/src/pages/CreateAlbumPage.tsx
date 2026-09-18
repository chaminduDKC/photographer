import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, FolderPlus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../api/categories.api';
import { albumsApi } from '../api/albums.api';
import { imagesApi } from '../api/images.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ThumbnailPicker } from '../components/shared/ThumbnailPicker';
import { ImageUploadZone, PendingImage } from '../components/shared/ImageUploadZone';
import { Spinner } from '../components/ui/Spinner';

export function CreateAlbumPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Quick category creation modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryThumbnail, setNewCategoryThumbnail] = useState<File | null>(null);

  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const categories = categoriesRes?.data?.data ?? [];

  // Quick Add Category Mutation
  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      const trimmed = newCategoryName.trim();
      if (!trimmed) throw new Error('Category name is required');
      if (!newCategoryThumbnail) throw new Error('Category thumbnail image is required');

      // Client-side uniqueness check
      const duplicate = categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        throw new Error('A category with this name already exists.');
      }

      const fd = new FormData();
      fd.append('name', trimmed);
      fd.append('thumbnail', newCategoryThumbnail);
      fd.append('order', String(categories.length));

      const res = await categoriesApi.create(fd);
      return res.data.data;
    },
    onSuccess: (newCat) => {
      toast.success(`Category "${newCat.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Automatically select the newly created category
      setCategoryId(newCat.id);
      closeCategoryModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create category');
    },
  });

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setNewCategoryName('');
    setNewCategoryThumbnail(null);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!thumbnail) throw new Error('Cover thumbnail is required');
      if (!categoryId) throw new Error('Category selection is required');

      // 1. Create Album
      setUploadProgress('Creating album...');
      const albumFd = new FormData();
      albumFd.append('name', name);
      albumFd.append('categoryId', categoryId);
      albumFd.append('isFeatured', String(isFeatured));
      albumFd.append('thumbnail', thumbnail);

      const albumRes = await albumsApi.create(albumFd);
      const newAlbum = albumRes.data.data;

      // 2. Upload album images if any
      if (pendingImages.length > 0) {
        setUploadProgress(`Optimizing & uploading ${pendingImages.length} photos...`);
        const imgFd = new FormData();
        pendingImages.forEach((img) => imgFd.append('images', img.file));
        const sliderFlags = pendingImages.map((img) => img.showInSlider);
        imgFd.append('sliderFlags', JSON.stringify(sliderFlags));

        await imagesApi.upload(newAlbum.id, imgFd);
      }

      return newAlbum;
    },
    onSuccess: (album) => {
      toast.success('Album created successfully!');
      navigate(`/albums/${album.id}`);
    },
    onError: (err: any) => {
      setUploadProgress(null);
      toast.error(err.response?.data?.message || err.message || 'Failed to create album');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Navigation Header */}
      <div>
        <button
          onClick={() => navigate('/albums')}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Albums
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Collection</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify album details and upload gallery images simultaneously.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Album Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              1. Album Information
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Title, primary category classification, and collection cover picture.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <Input
                label="Album Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rachel & Liam Wedding, Rome"
                required
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Category
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-xs"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setCategoryModalOpen(true)}
                    className="flex-shrink-0 px-3"
                    title="Add new category"
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>

                {loadingCategories && (
                  <p className="text-xs text-slate-400">Loading categories...</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="featured-toggle"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-0 accent-primary-600 cursor-pointer"
                />
                <label htmlFor="featured-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                  Highlight this album in featured / home showcase
                </label>
              </div>
            </div>

            <div>
              <ThumbnailPicker
                label="Cover Thumbnail *"
                onChange={setThumbnail}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Upload Images */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              2. Upload Photos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select all high-res photos for this album. Use the "Slider" check to include specific shots in the home carousel.
            </p>
          </div>

          <ImageUploadZone
            images={pendingImages}
            onChange={setPendingImages}
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          {uploadProgress ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-700">
              <Spinner className="h-4 w-4" />
              <span>{uploadProgress}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              {pendingImages.length} photo{pendingImages.length === 1 ? '' : 's'} staged for upload
            </span>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/albums')}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              disabled={!name.trim() || !categoryId || !thumbnail}
            >
              <UploadCloud className="h-4 w-4" /> Create & Upload
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={closeCategoryModal}
        title="Add New Category"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Create a new category right now. Once created, it will be automatically selected for this album.
          </p>

          <Input
            label="Category Name *"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Pre-shoots, Engagements, Editorial"
          />

          <ThumbnailPicker
            label="Category Thumbnail *"
            onChange={setNewCategoryThumbnail}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={closeCategoryModal}
              disabled={addCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => addCategoryMutation.mutate()}
              isLoading={addCategoryMutation.isPending}
              disabled={!newCategoryName.trim() || !newCategoryThumbnail}
            >
              <Plus className="h-4 w-4" /> Create Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
