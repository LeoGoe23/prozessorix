import React from 'react';

interface CategoryCardProps {
  config: {
    label: string;
    defaultColor: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ config, onClick }) => {
  const IconComponent = config.icon;

  return (
    <div 
      className="bg-slate-700/40 rounded-xl border border-white/10 p-6 cursor-pointer hover:bg-slate-600/40 hover:border-purple-400/30 transition-all hover:scale-105"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-3">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: config.defaultColor + '20', color: config.defaultColor }}
        >
          <IconComponent className="w-8 h-8" />
        </div>
        <span className="font-semibold text-white text-sm text-center">
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;
