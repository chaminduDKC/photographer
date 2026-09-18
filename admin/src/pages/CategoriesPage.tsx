import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, GripVertical, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi, Category } from '../api/categories.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ThumbnailPicker } from '../components/shared/ThumbnailPicker';
import { LazyImage } from '../components/ui/LazyImage';
import { Spinner } from '../components/ui/Spinner';

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
           style={{ touchAction: 'none' }}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Drag to reorder category"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <LazyImage
          src={category.thumbnailUrl}
          alt={category.name}
          className="h-16 w-20 flex-shrink-0 rounded-xl"
          skeletonClassName="h-16 w-20 flex-shrink-0 rounded-xl"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate text-base">{category.name}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">/{category.slug}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <Button variant="secondary" size="sm" onClick={() => onEdit(category)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(category)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const categories = data?.data?.data ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor, {activationConstraint:{delay:200, tolerance:5}})
  );

  const reorderMutation = useMutation({
    mutationFn: categoriesApi.reorder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    onError: () => toast.error('Failed to update category order'),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error('Category name is required');

      // Client-side uniqueness validation
      const duplicate = categories.some((c) => {
        if (editingCategory && c.id === editingCategory.id) return false;
        return c.name.toLowerCase() === trimmed.toLowerCase();
      });

      if (duplicate) {
        throw new Error('A category with this name already exists.');
      }

      const fd = new FormData();
      fd.append('name', trimmed);
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

      if (editingCategory) {
        return categoriesApi.update(editingCategory.id, fd);
      } else {
        fd.append('order', String(categories.length));
        return categoriesApi.create(fd);
      }
    },
    onSuccess: () => {
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to save category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeletingCategory(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete category');
    },
  });

  function openCreate() {
    setEditingCategory(null);
    setName('');
    setThumbnailFile(null);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name);
    setThumbnailFile(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
    setName('');
    setThumbnailFile(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);

    queryClient.setQueryData(['categories'], { data: { data: reordered } });
    reorderMutation.mutate(reordered.map((c, i) => ({ id: c.id, order: i })));
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize gallery works (Weddings, Portraits, Pre-shoots, etc.) and reorder.
            </p>
          </div>
        </div>

        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            <FolderOpen className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No categories found</p>
            <p className="text-xs text-slate-400 mt-1">Create categories to organize your photography albums</p>
            <Button className="mt-4" onClick={openCreate}>
              Add Category
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <SortableCategoryRow
                    key={cat.id}
                    category={cat}
                    onEdit={openEdit}
                    onDelete={setDeletingCategory}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <div className="space-y-5">
          <Input
            label="Category Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Weddings, Fashion, Portraits"
          />

          <ThumbnailPicker
            label="Cover Thumbnail *"
            currentUrl={editingCategory?.thumbnailUrl}
            onChange={setThumbnailFile}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
              disabled={!name.trim() || (!editingCategory && !thumbnailFile)}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? Categories that currently hold albums cannot be removed until albums are relocated or deleted.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
