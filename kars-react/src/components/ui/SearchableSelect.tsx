import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean; // Nueva prop para mostrar botón de limpiar
  showSearch?: boolean; // Nueva prop para habilitar búsqueda
  emptyMessage?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
  loading = false,
  disabled = false,
  className = "",
  allowClear = true,
  showSearch = true,
  emptyMessage = "No s'han trobat opcions"
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option?.label?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
  );

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enfocar el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (open && showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, showSearch]);

  // Limpiar término de búsqueda cuando se cierra
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
    setOpen(false);
  };

  const handleSelectOption = (option: SelectOption) => {
    onValueChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else if (filteredOptions.length === 1) {
        handleSelectOption(filteredOptions[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        className={`
          flex h-10 w-full items-center justify-between rounded-md border 
          border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
          px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50 
          dark:ring-offset-gray-950 dark:placeholder:text-gray-400 
          dark:focus:ring-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600
          ${open ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        `}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={`truncate ${selectedOption ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
          {loading ? 'Carregant...' : selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className="flex items-center gap-1">
          {/* Clear button */}
          {allowClear && selectedOption && !disabled && !loading && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              onClick={handleClear}
            />
          )}
          
          {/* Dropdown arrow */}
          <ChevronDown 
            className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {showSearch && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cercar..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`
                    w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                    focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                    ${option.value === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                  `}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({option.count})
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;