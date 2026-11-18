import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { sound } from '../../services/sound';

export interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  description?: string;
}

interface CustomSelectProps<T extends string | number = string | number> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
}

export function CustomSelect<T extends string | number>({
  value,
  options,
  onChange,
  title = 'Seleccionar opción',
  placeholder = 'Selecciona una opción',
  disabled = false,
  searchable,
  className = '',
  buttonClassName = '',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const shouldShowSearch = searchable ?? options.length >= 10;

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [options, search]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOpen = () => {
    if (disabled) return;
    sound.playTap();
    setSearch('');
    setIsOpen(true);
  };

  const handleSelect = (val: T) => {
    sound.playTap();
    setIsOpen(false);
    if (val !== value) {
      onChange(val);
    }
  };

  const defaultButtonClasses =
    'w-full flex items-center justify-between gap-2 bg-white dark:bg-[#18272e] border-2 border-duo-gray-300 dark:border-[#283842] hover:border-duo-blue focus:border-duo-blue rounded-2xl py-3 px-4 text-xs md:text-sm font-black text-gray-800 dark:text-gray-100 shadow-[0_4px_0_0_#e5e5e5] dark:shadow-none focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left';

  const modal = isOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-[#18272e] rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-duo-gray-200 dark:border-[#283842] shadow-2xl flex flex-col max-h-[82vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-duo-gray-200 dark:border-[#283842] flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-duo-blue">
                  Opciones
                </span>
                <h3 className="text-sm sm:text-base font-black text-gray-800 dark:text-gray-100">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-[#131f24] hover:bg-gray-200 dark:hover:bg-[#283842] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Search bar for long lists */}
            {shouldShowSearch && (
              <div className="px-4 pt-3 pb-2 border-b border-duo-gray-200/60 dark:border-[#283842]/60 flex-shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#131f24] border-2 border-duo-gray-200 dark:border-[#283842] rounded-xl text-xs font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-duo-blue transition-colors"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="overflow-y-auto p-3 flex flex-col gap-1.5 pb-6 sm:pb-3">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-gray-400 dark:text-gray-500">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-duo-blue/10 dark:bg-duo-blue/20 border-duo-blue text-duo-blue-dark dark:text-blue-300'
                          : 'bg-gray-50/70 dark:bg-[#131f24] border-transparent hover:border-duo-gray-300 dark:hover:border-[#283842] text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-black leading-snug break-words">
                          {opt.label}
                        </span>
                        {opt.description && (
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                            {opt.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-duo-blue text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={buttonClassName || defaultButtonClasses}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="truncate flex-1 min-w-0">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px] text-gray-500 dark:text-gray-400 flex-shrink-0" />
      </button>
      {modal}
    </div>
  );
}
