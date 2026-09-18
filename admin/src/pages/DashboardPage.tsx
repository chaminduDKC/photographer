import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi } from '../api/albums.api';
import { categoriesApi } from '../api/categories.api';
import { Images, FolderOpen, Star, Eye, ArrowUpRight, Plus, FolderPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LazyImage } from '../components/ui/LazyImage';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ThumbnailPicker } from '../components/shared/ThumbnailPicker';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Quick category creation modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryThumbnail, setCategoryThumbnail] = useState<File | null>(null);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const { data: albumsRes } = useQuery({
    queryKey: ['albums', {}, 1],
    queryFn: () => albumsApi.list({ page: 1, limit: 6 }),
  });

  const { data: featuredRes } = useQuery({
    queryKey: ['albums', { featured: true }, 1],
    queryFn: () => albumsApi.list({ featured: true, page: 1, limit: 1 }),
  });

  const categories = categoriesRes?.data?.data ?? [];
  const albums = albumsRes?.data?.data;
  const totalFeatured = featuredRes?.data?.data?.total ?? 0;

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      const trimmed = categoryName.trim();
      if (!trimmed) throw new Error('Category name is required');
      if (!categoryThumbnail) throw new Error('Category thumbnail image is required');

      // Client-side quick duplication check
      const duplicate = categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        throw new Error('A category with this name already exists.');
      }

      const fd = new FormData();
      fd.append('name', trimmed);
      fd.append('thumbnail', categoryThumbnail);
      fd.append('order', String(categories.length));

      const res = await categoriesApi.create(fd);
      return res.data.data;
    },
    onSuccess: (newCat) => {
      toast.success(`Category "${newCat.name}" created!`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeCategoryModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create category');
    },
  });

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setCategoryName('');
    setCategoryThumbnail(null);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your photographer portfolio, collections and categories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setCategoryModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <FolderPlus className="h-4 w-4" /> Add Category
          </Button>
          <Button onClick={() => navigate('/albums/new')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> New Album
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Albums',
            value: albums?.total ?? '—',
            icon: Images,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          {
            label: 'Categories',
            value: categories.length,
            icon: FolderOpen,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Featured Collections',
            value: totalFeatured,
            icon: Star,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Active Showcase',
            value: 'Ready',
            icon: Eye,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md"
          >
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Albums Showcase */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Collections</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recently added albums ready to display</p>
          </div>
          <Link
            to="/albums"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            View all albums <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!albums ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : albums.albums.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">No albums created yet.</p>
            <Button className="mt-3" onClick={() => navigate('/albums/new')}>
              Create First Album
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.albums.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all"
              >
                <LazyImage
                  src={album.thumbnailUrl}
                  alt={album.name}
                  className="h-16 w-16 flex-shrink-0 rounded-lg group-hover:scale-105 transition-transform duration-300"
                  skeletonClassName="h-16 w-16 flex-shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-900 truncate text-sm group-hover:text-primary-600 transition-colors">
                      {album.name}
                    </p>
                    {album.isFeatured && (
                      <Star className="h-3.5 w-3.5 flex-shrink-0 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <span className="inline-block mt-1 text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                    {album.category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal on Dashboard */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={closeCategoryModal}
        title="Add New Category"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Create a category to group your collections (e.g. Weddings, Portraits, Pre-shoots). Category names must be unique.
          </p>

          <Input
            label="Category Name *"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Pre-shoots, Engagements, Commercial"
          />

          <ThumbnailPicker
            label="Category Thumbnail *"
            onChange={setCategoryThumbnail}
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
              disabled={!categoryName.trim() || !categoryThumbnail}
            >
              <Plus className="h-4 w-4" /> Create Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
