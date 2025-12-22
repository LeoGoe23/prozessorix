import React, { useState } from 'react';
import { Package, CheckSquare, Settings, GitMerge, Users } from 'lucide-react';
import {
  ProcessObject,
  Player,
  PROCESS_STEP_ICONS,
  SYSTEM_TOOL_ICONS,
  CONNECTOR_ICONS,
  OBJECT_COLORS,
  ProcessStep,
} from '../types/game';
import CategoryCard from './CategoryCard';
import CategoryMenu from './CategoryMenu';
import PlayerSelectionModal from './PlayerSelectionModal';
import ProcessStepCardModal from './ProcessStepCardModal';
import ProcessConnectorModal from './ProcessConnectorModal';

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
  onAddPlayer?: (player: Player) => void;
  onAddDecision?: () => void;
}

type ObjectCategory = 'process-step' | 'system-tool' | 'connector';

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
  onAddPlayer,
  onAddDecision,
}) => {
  const [openCategory, setOpenCategory] = useState<ObjectCategory | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showProcessStepModal, setShowProcessStepModal] = useState(false);
  const [showConnectorModal, setShowConnectorModal] = useState(false);

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
          /* Categories Grid - Show all 4 categories + Spieler/Rollen */
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(CATEGORY_CONFIG) as ObjectCategory[]).map((category) => {
              const config = CATEGORY_CONFIG[category];

              return (
                <CategoryCard
                  key={category}
                  config={config}
                  onClick={() => {
                    if (category === 'process-step') {
                      setShowProcessStepModal(true);
                    } else if (category === 'connector') {
                      setShowConnectorModal(true);
                    } else {
                      setOpenCategory(category);
                    }
                  }}
                />
              );
            })}
            
            {/* Spieler/Rollen Kachel - öffnet direkt das Modal */}
            {onAddPlayer && (
              <CategoryCard
                config={{
                  label: 'Spieler/Rollen',
                  defaultColor: OBJECT_COLORS[4],
                  icon: Users,
                }}
                onClick={() => setShowPlayerModal(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Player Selection Modal */}
      {showPlayerModal && onAddPlayer && (
        <PlayerSelectionModal
          onClose={() => {
            setShowPlayerModal(false);
            setOpenCategory(null);
          }}
          onSubmit={(playerData) => {
            const randomColor = OBJECT_COLORS[Math.floor(Math.random() * OBJECT_COLORS.length)];
            const newPlayer: Player = {
              id: `player-${Date.now()}`,
              name: playerData.name,
              role: playerData.role,
              department: playerData.department,
              color: randomColor,
              icon: playerData.icon,
              onBoard: false,
            };
            onAddPlayer(newPlayer);
            setShowPlayerModal(false);
            setOpenCategory(null);
          }}
        />
      )}

      {/* Process Step Card Modal */}
      {showProcessStepModal && (
        <ProcessStepCardModal
          onClose={() => setShowProcessStepModal(false)}
          onSubmit={(stepData) => {
            const newProcessStep: Omit<ProcessStep, 'id' | 'timestamp'> = {
              name: stepData.name,
              category: 'process-step',
              icon: '📝',
              color: OBJECT_COLORS[0],
              input: stepData.input,
              output: stepData.output,
              systems: stepData.systems,
              workSteps: stepData.workSteps,
              escalationLevel: stepData.escalationLevel,
              duration: stepData.duration,
              notes: stepData.notes,
              inWaitingArea: true,
            };
            console.log('Creating process step with inWaitingArea:', newProcessStep);
            onAddObject(newProcessStep as Omit<ProcessObject, 'id' | 'timestamp'>);
            setShowProcessStepModal(false);
          }}
        />
      )}

      {/* Process Connector Modal */}
      {showConnectorModal && (
        <ProcessConnectorModal
          onClose={() => setShowConnectorModal(false)}
          onSelectProcessStep={() => {
            if (onAddCard) {
              onAddCard(
                'Freier Prozess',
                '', // kein Sender
                '', // kein Empfänger
                '', // medium
                '', // duration
                '' // description
              );
            }
          }}
          onSelectDecision={() => {
            if (onAddDecision) {
              onAddDecision();
            }
          }}
        />
      )}
    </div>
  );
};

export default ProcessObjectToolbox;
