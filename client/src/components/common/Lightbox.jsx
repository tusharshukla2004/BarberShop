import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ isOpen, onClose, items, currentIndex, onNavigate }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const total = items.length;
  const currentItem = items[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(total - 1);
    }
  }, [currentIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  }, [currentIndex, total, onNavigate]);

  // Focus trap & keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    const timer = setTimeout(() => {
      const closeBtn = modalRef.current?.querySelector('[data-lightbox-close]');
      closeBtn?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [tabindex="0"]'
        );
        if (!focusable || focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !currentItem) return null;

  const currentFormatted = String(currentIndex + 1).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm -z-10"
        aria-hidden="true"
      />

      {/* Top Bar: Counter & Close button */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between text-white z-20">
        <span className="font-mono text-sm tracking-widest text-on-dark-muted">
          ({currentFormatted}/{totalFormatted})
        </span>

        <button
          type="button"
          data-lightbox-close
          onClick={onClose}
          aria-label="Close lightbox"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous image"
        className="absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next image"
        className="absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Image & Caption */}
      <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
        <img
          src={currentItem.imageUrl}
          alt={currentItem.caption || `Gallery showcase item ${currentIndex + 1}`}
          className="max-h-[70vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
        />

        <div className="mt-4 text-center max-w-xl">
          {currentItem.category && (
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">
              {currentItem.category}
            </span>
          )}
          {currentItem.caption && (
            <p className="text-white text-sm sm:text-base font-normal">
              {currentItem.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

Lightbox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      imageUrl: PropTypes.string.isRequired,
      category: PropTypes.string,
      caption: PropTypes.string,
    })
  ).isRequired,
  currentIndex: PropTypes.number.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
