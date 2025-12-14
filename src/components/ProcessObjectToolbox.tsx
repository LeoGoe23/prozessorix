import React, { useState } from 'react';
import { Package, CheckSquare, Settings, MessageCircle, GitMerge } from 'lucide-react';
import {
  ProcessObject,
  Player,
  PROCESS_STEP_ICONS,
  SYSTEM_TOOL_ICONS,
  COMMUNICATION_ICONS,
  CONNECTOR_ICONS,
  OBJECT_COLORS,
} from '../types/game';
import CategoryCard from './CategoryCard';
import CategoryMenu from './CategoryMenu';

interface ProcessObjectToolboxProps {
  processObjects: ProcessObject[];
  onAddObject: (object: Omit<ProcessObject, 'id' | 'timestamp'>) => void;
  onRemoveObject: (objectId: string) => void;
  onUpdateObject?: (objectId: string, updates: Partial<ProcessObject>) => void;
  onObjectClick?: (object: ProcessObject) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  selectedObjectId?: string | null;
  players?: Player[];
  onAddCard?: (
    text: string,
    fromPlayerId: string,
    toPlayerId: string,
    medium?: string,
    duration?: string,
    description?: string
  ) => void;
}

type ObjectCategory = 'process-step' | 'system-tool' | 'communication' | 'connector';

interface CategoryConfig {
  label: string;
  icons: string[];
  defaultColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORY_CONFIG: Record<ObjectCategory, CategoryConfig> = {
  'process-step': {
    label: 'Prozessschritte',
    icons: PROCESS_STEP_ICONS,
    defaultColor: OBJECT_COLORS[0],
    icon: CheckSquare,
  },
  'system-tool': {
    label: 'Systeme/Tools',
    icons: SYSTEM_TOOL_ICONS,
    defaultColor: OBJECT_COLORS[1],
    icon: Settings,
  },
  'communication': {
    label: 'Kommunikationsmittel',
    icons: COMMUNICATION_ICONS,
    defaultColor: OBJECT_COLORS[2],
    icon: MessageCircle,
  },
  'connector': {
    label: 'Prozessschrittverbinder',
    icons: CONNECTOR_ICONS,
    defaultColor: OBJECT_COLORS[3],
    icon: GitMerge,
  },
};

const ProcessObjectToolbox: React.FC<ProcessObjectToolboxProps> = ({
  processObjects,
  onAddObject,
  onObjectClick,
  onDragStart,
  onDragEnd,
  selectedObjectId,
  players,
  onAddCard,
}) => {
  const [openCategory, setOpenCategory] = useState<ObjectCategory | null>(null);

  const getObjectsByCategory = (category: ObjectCategory): ProcessObject[] => {
    return processObjects.filter((obj) => obj.category === category);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-400/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {openCategory ? CATEGORY_CONFIG[openCategory].label : 'Objekte'}
            </h3>
          </div>
        </div>
        {openCategory && (
          <button
            onClick={() => setOpenCategory(null)}
            className="px-3 py-1.5 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
          >
            ← Zurück
          </button>
        )}
      </div>

      {/* Show Category Menu if one is selected */}
      <div className="min-h-[280px]">
        {openCategory ? (
          <CategoryMenu
            category={openCategory}
            config={CATEGORY_CONFIG[openCategory]}
            objects={getObjectsByCategory(openCategory)}
            selectedObjectId={selectedObjectId}
            onObjectClick={onObjectClick}
            onAddObject={onAddObject}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            players={players}
            onCreateProcessStep={onAddCard}
          />
        ) : (
          /* Categories Grid - Show all 4 categories */
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(CATEGORY_CONFIG) as ObjectCategory[]).map((category) => {
              const config = CATEGORY_CONFIG[category];

              return (
                <CategoryCard
                  key={category}
                  config={config}
                  onClick={() => setOpenCategory(category)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessObjectToolbox;
