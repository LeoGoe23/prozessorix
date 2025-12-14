import React, { useState } from 'react';
import { ProcessObject, Player } from '../types/game';
import { Plus } from 'lucide-react';
import ProcessStepCreator from './ProcessStepCreator';

interface CategoryMenuProps {
  category: string;
  config: {
    label: string;
    defaultColor: string;
    icons: string[];
    icon: React.ComponentType<{ className?: string }>;
  };
  objects: ProcessObject[];
  selectedObjectId?: string | null;
  onObjectClick?: (object: ProcessObject) => void;
  onAddObject?: (object: Omit<ProcessObject, 'id' | 'timestamp'>) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  players?: Player[];
  onCreateProcessStep?: (
    text: string,
    fromPlayerId: string,
    toPlayerId: string,
    medium?: string,
    duration?: string,
    description?: string
  ) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({
  category,
  config,
  objects,
  selectedObjectId,
  onObjectClick,
  onAddObject,
  onDragStart,
  onDragEnd,
  players,
  onCreateProcessStep,
}) => {
  const [showCreator, setShowCreator] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  console.log('CategoryMenu - onObjectClick is defined:', !!onObjectClick);
  console.log('CategoryMenu - objects count:', objects.length);

  // Nur für process-step Kategorie den Creator anzeigen
  const isProcessStepCategory = category === 'process-step';
  const canCreateStep = isProcessStepCategory && players && players.length >= 2 && onCreateProcessStep;
  
  // Für andere Kategorien außer connector: Icon-Picker anzeigen
  const isConnectorCategory = category === 'connector';
  const canAddObject = !isProcessStepCategory && !isConnectorCategory && onAddObject;

  const handleCreateStep = (
    text: string,
    fromPlayerId: string,
    toPlayerId: string,
    medium?: string,
    duration?: string,
    description?: string
  ) => {
    if (onCreateProcessStep) {
      onCreateProcessStep(text, fromPlayerId, toPlayerId, medium, duration, description);
      setShowCreator(false);
    }
  };
  
  const handleAddObject = (icon: string, name: string) => {
    if (onAddObject) {
      onAddObject({
        name,
        icon,
        color: config.defaultColor,
        category: category as any,
      });
      setShowIconPicker(false);
    }
  };

  if (showCreator && canCreateStep) {
    return (
      <ProcessStepCreator
        players={players!}
        onCreateStep={handleCreateStep}
        onCancel={() => setShowCreator(false)}
      />
    );
  }
  
  if (showIconPicker && canAddObject) {
    return (
      <div className="h-full flex flex-col">
        <button
          onClick={() => setShowIconPicker(false)}
          className="mb-3 text-xs text-purple-400 hover:text-purple-300 text-left"
        >
          ← Zurück
        </button>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {config.icons.map((icon, index) => (
              <button
                key={index}
                onClick={() => {
                  const name = prompt(`Name für ${icon}:`, `${config.label.slice(0, -1)} ${index + 1}`);
                  if (name) {
                    handleAddObject(icon, name);
                  }
                }}
                className="aspect-square rounded-lg flex items-center justify-center text-2xl transition-all cursor-pointer bg-slate-600/30 border-2 border-transparent hover:bg-slate-600/50 hover:scale-105 hover:border-purple-400/30"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Add Button for Process Steps */}
      {canCreateStep && (
        <button
          onClick={() => setShowCreator(true)}
          className="mb-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Prozessschritt erstellen
        </button>
      )}
      
      {/* Add Button for Other Objects */}
      {canAddObject && (
        <button
          onClick={() => setShowIconPicker(true)}
          className="mb-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Objekt hinzufügen
        </button>
      )}

      {/* Objects Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-3 content-start">
          {objects.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 text-xs py-8 italic">
              Keine Objekte vorhanden
            </div>
          ) : (
            objects.map((obj) => (
              <div
                key={obj.id}
                className="relative group"
              >
                <div
                  draggable={category === 'communication'}
                  onDragStart={(e) => {
                    if (category === 'communication') {
                      e.dataTransfer.setData('communicationObjectId', obj.id);
                      e.dataTransfer.effectAllowed = 'copy';
                      if (onDragStart) onDragStart();
                    }
                  }}
                  onDragEnd={() => {
                    if (category === 'communication' && onDragEnd) {
                      onDragEnd();
                    }
                  }}
                  onMouseDown={(e) => {
                    // Bei Kommunikationsmitteln: Wenn es ein normaler Linksklick ist (ohne Bewegung),
                    // soll es als Click behandelt werden
                    if (category === 'communication') {
                      const startX = e.clientX;
                      const startY = e.clientY;
                      
                      const handleMouseUp = (upEvent: MouseEvent) => {
                        const distance = Math.sqrt(
                          Math.pow(upEvent.clientX - startX, 2) + 
                          Math.pow(upEvent.clientY - startY, 2)
                        );
                        
                        // Wenn die Maus weniger als 5px bewegt wurde, behandle es als Click
                        if (distance < 5 && onObjectClick) {
                          onObjectClick(obj);
                        }
                        
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mouseup', handleMouseUp);
                    }
                  }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl transition-all cursor-pointer border-2 ${
                    selectedObjectId === obj.id 
                      ? 'bg-purple-500/40 border-purple-400 scale-105 ring-2 ring-purple-400' 
                      : 'bg-slate-600/30 border-transparent hover:bg-slate-600/50 hover:scale-105 hover:border-purple-400/30'
                  } ${category === 'communication' ? 'cursor-move' : ''}`}
                  style={{ borderColor: selectedObjectId === obj.id ? undefined : obj.color + '40' }}
                  title={obj.name}
                  onClick={(e) => {
                    console.log('CLICK! Object:', obj.name, 'onObjectClick exists:', !!onObjectClick);
                    e.stopPropagation();
                    // Nur für nicht-draggable Items den normalen onClick verwenden
                    if (category !== 'communication' && onObjectClick) {
                      onObjectClick(obj);
                    }
                  }}
                >
                  {obj.icon}
                </div>
                {/* Name label */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                    {obj.name}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
