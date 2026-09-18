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
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Eye } from 'lucide-react';
import { Image } from '../../api/images.api';
import { LazyImage } from '../ui/LazyImage';
import { cn } from '../../utils/cn';

interface SortableImageGridProps {
  images: Image[];
  albumId: string;
  onReorder: (images: Image[]) => void;
  onToggleSlider: (imageId: string, current: boolean) => void;
  onDelete: (imageId: string) => void;
}

function SortableImageCard({
  image,
  onToggleSlider,
  onDelete,
}: {
  image: Image;
  onToggleSlider: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
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
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all',
        isDragging && 'ring-2 ring-primary-500 z-20 shadow-xl'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
         style={{touchAction:'none'}}
        className="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing rounded-lg bg-white/90 p-1.5 text-slate-700 shadow-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-white"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <LazyImage
        src={image.url}
        alt="Album image"
        className="h-44 w-full group-hover:scale-105 transition-transform duration-300"
        skeletonClassName="h-44 w-full"
      />

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-white px-3 py-2.5">
        <button
          type="button"
         
          onClick={() => onToggleSlider(image.id, image.showInSlider)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
            image.showInSlider
              ? 'bg-primary-50 text-primary-700 border border-primary-200'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          {image.showInSlider ? 'In Slider' : 'Slider'}
        </button>

        <button
          type="button"
          onClick={() => onDelete(image.id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Delete photo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SortableImageGrid({
  images,
  onReorder,
  onToggleSlider,
  onDelete,
}: SortableImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
     useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    onReorder(reordered);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image) => (
            <SortableImageCard
              key={image.id}
              image={image}
              onToggleSlider={onToggleSlider}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
