import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    const modal = modalRef.current;
    const getFocusableElements = () =>
      modal
        ? Array.from(
            modal.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => !element.hasAttribute('disabled'))
        : [];

    (getFocusableElements()[0] ?? modal)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        modal?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [onClose]);

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(46, 46, 44, 0.4)', backdropFilter: 'blur(3px)',
        display: 'grid', placeItems: 'center', zIndex: 100, padding: 16, overflowY: 'auto'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="card" 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
        tabIndex={-1}
        style={{ 
          width: '100%', maxWidth: 600, padding: 28, position: 'relative',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column'
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24, flex: 'none' }}>
          <h2 id="modal-title" style={{ fontSize: 24, margin: 0 }}>{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} style={{ background: 'none', border: 'none', color: '#66655e', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
