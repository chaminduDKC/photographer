import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UploadCloud, Trash2, Star, Pencil, Images, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { albumsApi } from '../api/albums.api';
import { categoriesApi } from '../api/categories.api';
import { imagesApi, Image } from '../api/images.api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ThumbnailPicker } from '../components/shared/ThumbnailPicker';
import { ImageUploadZone, PendingImage } from '../components/shared/ImageUploadZone';
import { SortableImageGrid } from '../components/shared/SortableImageGrid';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LazyImage } from '../components/ui/LazyImage';
import { Spinner } from '../components/ui/Spinner';

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // Edit album state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);

  // Quick category creation state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryThumbnail, setNewCategoryThumbnail] = useState<File | null>(null);

  // New images upload state
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const { data: albumRes, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => albumsApi.get(id!),
    enabled: !!id,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const categories = categoriesRes?.data?.data ?? [];
  const album = albumRes?.data?.data;
  const images = album?.images ?? [];

  // Quick Add Category Mutation
  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      const trimmed = newCategoryName.trim();
      if (!trimmed) throw new Error('Category name is required');
      if (!newCategoryThumbnail) throw new Error('Category thumbnail is required');

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
      setCategoryId(newCat.id);
      setCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryThumbnail(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create category');
    },
  });

  // Update album details
  const updateAlbumMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      if (name) fd.append('name', name);
      if (categoryId) fd.append('categoryId', categoryId);
      fd.append('isFeatured', String(isFeatured));
      if (newThumbnail) fd.append('thumbnail', newThumbnail);

      return albumsApi.update(id!, fd);
    },
    onSuccess: () => {
      toast.success('Album updated');
      queryClient.invalidateQueries({ queryKey: ['album', id] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      setEditModalOpen(false);
    },
    onError: () => toast.error('Failed to update album'),
  });

  // Delete album
  const deleteAlbumMutation = useMutation({
    mutationFn: () => albumsApi.delete(id!),
    onSuccess: () => {
      toast.success('Album deleted');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      navigate('/albums');
    },
    onError: () => toast.error('Failed to delete album'),
  });

  // Upload more images
  const uploadImagesMutation = useMutation({
    mutationFn: async () => {
      if (pendingImages.length === 0) return;
      const fd = new FormData();
      pendingImages.forEach((img) => fd.append('images', img.file));
      const sliderFlags = pendingImages.map((img) => img.showInSlider);
      fd.append('sliderFlags', JSON.stringify(sliderFlags));

      return imagesApi.upload(id!, fd);
    },
    onSuccess: () => {
      toast.success('Photos uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['album', id] });
      setPendingImages([]);
      setUploadModalOpen(false);
    },
    onError: () => toast.error('Failed to upload photos'),
  });

  // Reorder images
  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => imagesApi.reorder(id!, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['album', id] }),
    onError: () => toast.error('Failed to update image positions'),
  });

  // Toggle slider
  const toggleSliderMutation = useMutation({
    mutationFn: ({ imageId, current }: { imageId: string; current: boolean }) =>
      imagesApi.patch(id!, imageId, { showInSlider: !current }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['album', id] }),
    onError: () => toast.error('Failed to update slider status'),
  });

  // Delete single image
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => imagesApi.delete(id!, imageId),
    onSuccess: () => {
      toast.success('Photo removed');
      queryClient.invalidateQueries({ queryKey: ['album', id] });
      setDeletingImageId(null);
    },
    onError: () => toast.error('Failed to delete photo'),
  });

  function openEditModal() {
    if (!album) return;
    setName(album.name);
    setCategoryId(album.categoryId);
    setIsFeatured(album.isFeatured);
    setNewThumbnail(null);
    setEditModalOpen(true);
  }

  function handleReorder(reordered: Image[]) {
    queryClient.setQueryData(['album', id], {
      data: { data: { ...album!, images: reordered } },
    });
    reorderMutation.mutate(reordered.map((img, idx) => ({ id: img.id, order: idx })));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
        <p className="text-base font-semibold text-slate-700">Album not found.</p>
        <Button className="mt-4" onClick={() => navigate('/albums')}>
          Back to Albums
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation button */}
      <button
        onClick={() => navigate('/albums')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Albums
      </button>

      {/* Album Header Banner */}
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between shadow-xs">
        <div className="flex items-center gap-4 sm:gap-5">
          <LazyImage
            src={album.thumbnailUrl}
            alt={album.name}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover shadow-sm border border-slate-200"
            skeletonClassName="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{album.name}</h1>
              {album.isFeatured && (
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Featured
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Category: <span className="font-semibold text-slate-700">{album.category.name}</span> •{' '}
              <span className="font-semibold text-slate-700">{images.length}</span> photo{images.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={openEditModal}>
            <Pencil className="h-3.5 w-3.5" /> Edit Details
          </Button>
          <Button size="sm" onClick={() => setUploadModalOpen(true)}>
            <UploadCloud className="h-3.5 w-3.5" /> Add Photos
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeletingAlbum(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Album Images Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Gallery Photos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag images by their handle to change exhibition ordering.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg w-fit">
            {images.filter((i) => i.showInSlider).length} in homepage slider
          </span>
        </div>

        {images.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center text-slate-400">
            <Images className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No photos in this album yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Upload photos to showcase them in your gallery</p>
            <Button className="mt-4" onClick={() => setUploadModalOpen(true)}>
              <UploadCloud className="h-4 w-4" /> Upload Photos
            </Button>
          </div>
        ) : (
          <SortableImageGrid
            images={images}
            albumId={album.id}
            onReorder={handleReorder}
            onToggleSlider={(imageId, current) =>
              toggleSliderMutation.mutate({ imageId, current })
            }
            onDelete={setDeletingImageId}
          />
        )}
      </div>

      {/* Edit Album Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Album Information"
      >
        <div className="space-y-5">
          <Input
            label="Album Title *"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              id="edit-featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-0 accent-primary-600 cursor-pointer"
            />
            <label htmlFor="edit-featured" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
              Feature this album on home showcase
            </label>
          </div>

          <ThumbnailPicker
            label="Replace Cover Thumbnail (optional)"
            currentUrl={album.thumbnailUrl}
            onChange={setNewThumbnail}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateAlbumMutation.mutate()}
              isLoading={updateAlbumMutation.isPending}
              disabled={!name.trim() || !categoryId}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Photos Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setPendingImages([]);
        }}
        title="Add Photos to Collection"
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <ImageUploadZone images={pendingImages} onChange={setPendingImages} />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => {
                setUploadModalOpen(false);
                setPendingImages([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => uploadImagesMutation.mutate()}
              isLoading={uploadImagesMutation.isPending}
              disabled={pendingImages.length === 0}
            >
              Upload {pendingImages.length} Photo{pendingImages.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Add Category Modal (inside Edit Details) */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setNewCategoryName('');
          setNewCategoryThumbnail(null);
        }}
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
            placeholder="e.g. Pre-shoots, Engagements, Commercial"
          />

          <ThumbnailPicker
            label="Category Thumbnail *"
            onChange={setNewCategoryThumbnail}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryModalOpen(false)}
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

      {/* Confirm Delete Album */}
      <ConfirmDialog
        isOpen={deletingAlbum}
        onClose={() => setDeletingAlbum(false)}
        onConfirm={() => deleteAlbumMutation.mutate()}
        title="Delete Collection"
        message={`Are you sure you want to delete "${album.name}"? All photos in this collection will also be permanently removed from Cloudinary.`}
        isLoading={deleteAlbumMutation.isPending}
      />

      {/* Confirm Delete Single Image */}
      <ConfirmDialog
        isOpen={!!deletingImageId}
        onClose={() => setDeletingImageId(null)}
        onConfirm={() => deletingImageId && deleteImageMutation.mutate(deletingImageId)}
        title="Delete Photo"
        message="Are you sure you want to permanently delete this photo? It will be removed from Cloudinary."
        isLoading={deleteImageMutation.isPending}
      />
    </div>
  );
}
