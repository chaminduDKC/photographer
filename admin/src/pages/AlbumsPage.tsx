import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Star, Trash2, Filter, Images, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { albumsApi, Album } from '../api/albums.api';
import { categoriesApi } from '../api/categories.api';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LazyImage } from '../components/ui/LazyImage';
import { Spinner } from '../components/ui/Spinner';

export function AlbumsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [featuredFilter, setFeaturedFilter] = useState<string>('');
  const [deletingAlbum, setDeletingAlbum] = useState<Album | null>(null);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const categories = categoriesRes?.data?.data ?? [];

  const { data: albumsRes, isLoading } = useQuery({
    queryKey: ['albums', { categoryId: selectedCategory, featured: featuredFilter }, page],
    queryFn: () =>
      albumsApi.list({
        categoryId: selectedCategory || undefined,
        featured: featuredFilter === 'true' ? true : featuredFilter === 'false' ? false : undefined,
        page,
        limit: 12,
      }),
  });

  const albumsData = albumsRes?.data?.data;
  const albums = albumsData?.albums ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => albumsApi.delete(id),
    onSuccess: () => {
      toast.success('Album deleted');
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      setDeletingAlbum(null);
    },
    onError: () => toast.error('Failed to delete album'),
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
            <Images className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Portfolio Albums</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, filter and manage client shoots, stories, and weddings.
            </p>
          </div>
        </div>

        <Button onClick={() => navigate('/albums/new')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Create Album
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 focus:border-primary-500 focus:outline-none shadow-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 focus:border-primary-500 focus:outline-none shadow-xs"
          >
            <option value="">All Albums</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>
        </div>

        <span className="text-xs font-medium text-slate-400">
          Showing {albums.length} {albumsData?.total ? `of ${albumsData.total}` : ''} collections
        </span>
      </div>

      {/* Albums Grid */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : albums.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center text-slate-400">
            <Images className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No albums found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your category or featured filters, or create a new collection.
            </p>
            <Button className="mt-4" onClick={() => navigate('/albums/new')}>
              Create Album
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => (
              <div
                key={album.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <Link to={`/albums/${album.id}`} className="block relative h-52 overflow-hidden bg-slate-100">
                  <LazyImage
                    src={album.thumbnailUrl}
                    alt={album.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    skeletonClassName="h-full w-full"
                  />
                  {album.isFeatured && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow-sm border border-amber-200/50">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Featured
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/albums/${album.id}`}
                      className="font-bold text-slate-900 hover:text-primary-600 truncate text-base transition-colors"
                    >
                      {album.name}
                    </Link>
                  </div>

                  <span className="mt-1 inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                    {album.category.name}
                  </span>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                    <Link
                      to={`/albums/${album.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      Manage Photos <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      onClick={() => setDeletingAlbum(album)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete album"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {albumsData && albumsData.totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              page={page}
              totalPages={albumsData.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAlbum}
        onClose={() => setDeletingAlbum(null)}
        onConfirm={() => deletingAlbum && deleteMutation.mutate(deletingAlbum.id)}
        title="Delete Album"
        message={`Are you sure you want to delete "${deletingAlbum?.name}"? All photos in this collection will also be permanently destroyed from Cloudinary.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
