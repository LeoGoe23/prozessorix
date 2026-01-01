import React from 'react';
import { PLAYER_ICONS } from '../types/game';
import img1 from '../assets/image1.png';
import img2 from '../assets/image2.png';
import img3 from '../assets/image3.png';
import img4 from '../assets/image4.png';
import img5 from '../assets/image5.png';
import img6 from '../assets/image6.png';
import img7 from '../assets/image7.png';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  uploadedFirst?: boolean;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon, uploadedFirst = false }) => {
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

  const uploaded = (
    <div>
      <div className="text-xs font-medium text-gray-400 mb-2">Uploaded</div>
      <div className="grid grid-cols-8 gap-1">
        {[img1, img2, img3, img4, img5, img6, img7].map((icon) => (
          <button
            key={icon}
            onClick={() => onSelectIcon(icon)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
              selectedIcon === icon
                ? 'bg-indigo-500 shadow-lg ring-2 ring-indigo-400'
                : 'bg-slate-700/50 hover:bg-slate-600'
            }`}
          >
            <img src={icon} alt="uploaded" className="max-w-[80%] max-h-[80%] object-contain mx-auto" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {uploadedFirst && uploaded}
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
                {typeof icon === 'string' && (icon.includes('/') || icon.startsWith('data:') || icon.startsWith('http')) ? (
                  <img src={icon} alt="icon" className="max-w-[80%] max-h-[80%] object-contain mx-auto" />
                ) : (
                  icon
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!uploadedFirst && uploaded}
    </div>
  );
};

export default IconPicker;
