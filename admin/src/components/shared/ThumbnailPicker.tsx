import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ThumbnailPickerProps {
  label?: string;
  currentUrl?: string;
  onChange: (file: File | null) => void;
  error?: string;
}

export function ThumbnailPicker({ label = 'Cover Thumbnail', currentUrl, onChange, error }: ThumbnailPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>
      <div
        className={cn(
          'relative flex h-48 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-2 transition-all hover:border-primary-500 hover:bg-primary-50/20 group',
          error && 'border-red-500 bg-red-50/10'
        )}
        onClick={() => !preview && inputRef.current?.click()}
      >
        {preview ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <img src={preview} alt="Thumbnail preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/20 transition-opacity group-hover:bg-slate-900/40" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-slate-700 shadow-md hover:bg-white hover:text-red-600 transition-colors"
              title="Remove thumbnail"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary-600 transition-colors">
            <div className="rounded-full bg-white p-3 shadow-xs border border-slate-200">
              <Upload className="h-5 w-5 text-slate-600 group-hover:text-primary-600" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Click to upload thumbnail</span>
            <span className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 20MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
