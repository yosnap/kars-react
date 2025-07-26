import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ExtraButtonProps {
  extra: {
    id: string;
    name: string;
    slug: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}


const ExtraButton: React.FC<ExtraButtonProps> = ({ extra, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        relative flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 w-full min-h-[60px] hover:shadow-sm text-sm
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
        }
      `}
    >
      {/* Nombre del extra */}
      <span className={`font-medium text-center ${
        isSelected 
          ? 'text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {extra.name}
      </span>
      
      {/* Indicador de selección */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-4 h-4 text-blue-500" />
        </div>
      )}
    </button>
  );
};

export default ExtraButton;