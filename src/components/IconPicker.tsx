import React from 'react';
import { PLAYER_ICONS } from '../types/game';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon }) => {
  const iconCategories = [
    {
      name: 'Business',
      icons: PLAYER_ICONS.slice(0, 24),
    },
    {
      name: 'People',
      icons: PLAYER_ICONS.slice(24, 40),
    },
    {
      name: 'Goals',
      icons: PLAYER_ICONS.slice(40, 56),
    },
    {
      name: 'Action',
      icons: PLAYER_ICONS.slice(56, 72),
    },
    {
      name: 'Tools',
      icons: PLAYER_ICONS.slice(72),
    },
  ];

  return (
    <div className="space-y-3">
      {iconCategories.map((category) => (
        <div key={category.name}>
          <div className="text-xs font-medium text-gray-400 mb-2">{category.name}</div>
          <div className="grid grid-cols-8 gap-1">
            {category.icons.map((icon) => (
              <button
                key={icon}
                onClick={() => onSelectIcon(icon)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                  selectedIcon === icon
                    ? 'bg-indigo-500 shadow-lg ring-2 ring-indigo-400'
                    : 'bg-slate-700/50 hover:bg-slate-600'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IconPicker;
