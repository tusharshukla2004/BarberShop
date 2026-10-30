import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud, X, Link as LinkIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ImageUploader({ value, onChange, label = 'Photo / Image' }) {
  const [tab, setTab] = useState('url'); // 'url' | 'upload'
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink">
          {label}
        </label>
        <div className="flex rounded-md bg-card p-0.5 border border-border-light text-[11px]">
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded transition-colors ${
              tab === 'url' ? 'bg-white font-semibold text-ink shadow-sm' : 'text-muted'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 rounded transition-colors ${
              tab === 'upload' ? 'bg-white font-semibold text-ink shadow-sm' : 'text-muted'
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {value ? (
        <div className="relative aspect-[4/3] w-full max-w-sm rounded-lg overflow-hidden border border-border-light bg-card group shadow-sm">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            aria-label="Remove image"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : tab === 'url' ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-card border border-border-light text-xs sm:text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleApplyUrl}>
            Apply
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border-light hover:border-accent rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-card/50 transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <UploadCloud className="w-8 h-8 text-muted mb-2" />
          <span className="text-xs font-semibold text-ink">Click to upload an image</span>
          <span className="text-[10px] text-muted mt-0.5">PNG, JPG, WebP up to 5MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </button>
      )}
    </div>
  );
}

ImageUploader.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};
