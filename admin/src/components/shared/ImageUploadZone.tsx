import { useRef, useState, DragEvent } from 'react';
import { Upload, X, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PendingImage {
  file: File;
  preview: string;
  showInSlider: boolean;
}

interface ImageUploadZoneProps {
  images: PendingImage[];
  onChange: (images: PendingImage[]) => void;
}

export function ImageUploadZone({ images, onChange }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const newImages: PendingImage[] = arr.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      showInSlider: false,
    }));
    onChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  const toggleSlider = (index: number) => {
    const next = [...images];
    next[index] = { ...next[index], showInSlider: !next[index].showInSlider };
    onChange(next);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-4 transition-all hover:border-primary-500 hover:bg-primary-50/20 group',
          dragging && 'border-primary-600 bg-primary-50/40 ring-4 ring-primary-500/10'
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-white p-2.5 shadow-xs border border-slate-200 group-hover:scale-110 transition-transform">
            <Upload className="h-5 w-5 text-slate-600 group-hover:text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 group-hover:text-primary-700">
              Drag & drop images, or <span className="text-primary-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports bulk upload (JPG, PNG, WEBP) — max 20MB per photo
            </p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
        }}
      />

      {/* Selected Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected Photos ({images.length})
            </span>
            <button
              type="button"
              onClick={() => {
                images.forEach((img) => URL.revokeObjectURL(img.preview));
                onChange([]);
              }}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {images.map((img, i) => (
              <div
                key={i}
                className="group relative flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Delete button on hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="absolute top-1.5 right-1.5 rounded-md bg-white/90 p-1 text-slate-600 shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Slider Toggle Footbar */}
                <div
                  className={cn(
                    'flex items-center justify-between border-t border-slate-100 px-2.5 py-2 cursor-pointer transition-colors select-none',
                    img.showInSlider ? 'bg-primary-50/60' : 'bg-slate-50/50 hover:bg-slate-100/70'
                  )}
                  onClick={() => toggleSlider(i)}
                >
                  <span
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] font-semibold',
                      img.showInSlider ? 'text-primary-700' : 'text-slate-600'
                    )}
                  >
                    <Eye className="h-3 w-3" />
                    Slider
                  </span>
                  <input
                    type="checkbox"
                    checked={img.showInSlider}
                    readOnly
                    className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-0 accent-primary-600 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
