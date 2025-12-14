import React from 'react';
import { Player, ProcessCard, ProcessObject, PLAYER_COLORS, DEFAULT_ROLES, PLAYER_ICONS, GameBoardView, DECISION_ICONS } from '../types/game';
import { Users, Plus, Trash2, ChevronDown, UserPlus, GitBranch, X, Share2, User, Settings, LayoutGrid, Network } from 'lucide-react';
import ShareGameModal from './ShareGameModal';
import IconPicker from './IconPicker';
import ProcessObjectToolbox from './ProcessObjectToolbox';

interface GameBoardProps {
  players: Player[];
  cards: ProcessCard[];
  processObjects: ProcessObject[];
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  onAddCard: (text: string, fromPlayerId: string, toPlayerId: string, medium?: string, duration?: string, description?: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<ProcessCard>) => void;
  onEndTurn: () => void;
  onRestart: () => void;
  isGameFinished: boolean;
  isGameStarted: boolean;
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  onUpdatePlayerPosition?: (playerId: string, position: { x: number; y: number }) => void;
  onAddProcessObject: (object: Omit<ProcessObject, 'id' | 'timestamp'>) => void;
  onRemoveProcessObject: (objectId: string) => void;
  onUpdateProcessObject?: (objectId: string, updates: Partial<ProcessObject>) => void;
  gameId?: string;
  onSwitchToPlayerView?: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  players,
  cards,
  processObjects,
  onAddCard,
  onUpdateCard,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerPosition,
  onAddProcessObject,
  onRemoveProcessObject,
  onUpdateProcessObject,
  gameId,
  onSwitchToPlayerView,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showPlayerModal, setShowPlayerModal] = React.useState(false);
  const [showProcessModal, setShowProcessModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  
  // Player form
  const [currentName, setCurrentName] = React.useState('');
  const [currentRole, setCurrentRole] = React.useState('');
  const [currentIcon, setCurrentIcon] = React.useState(PLAYER_ICONS[0]);
  const [currentInput, setCurrentInput] = React.useState('');
  const [currentOutput, setCurrentOutput] = React.useState('');
  const [currentMedium, setCurrentMedium] = React.useState('');
  const [currentProcessRole, setCurrentProcessRole] = React.useState('');
  
  // Process form
  const [inputText, setInputText] = React.useState('');
  const [selectedFromPlayer, setSelectedFromPlayer] = React.useState<string | null>(null);
  const [selectedToPlayer, setSelectedToPlayer] = React.useState<string | null>(null);
  const [processMedium, setProcessMedium] = React.useState('');
  const [processDuration, setProcessDuration] = React.useState('');
  const [processDescription, setProcessDescription] = React.useState('');
  
  // Drag & Drop
  const [draggedPlayer, setDraggedPlayer] = React.useState<string | null>(null);
  const gameBoardRef = React.useRef<HTMLDivElement>(null);
  
  // Placed communication objects on field
  const [placedCommObjects, setPlacedCommObjects] = React.useState<Array<{ objectId: string; x: number; y: number }>>([]);
  
  // Process Step Detail View
  const [selectedConnection, setSelectedConnection] = React.useState<{ from: string; to: string } | null>(null);
  
  // Player context menu
  const [contextMenuPlayer, setContextMenuPlayer] = React.useState<string | null>(null);
  
  // Player detail view (for quick info card)
  const [selectedPlayerDetail, setSelectedPlayerDetail] = React.useState<string | null>(null);
  
  // Player inspection mode (for split screen)
  const [inspectedPlayer, setInspectedPlayer] = React.useState<string | null>(null);
  
  // Process step inspection mode (for split screen)
  const [inspectedProcessStep, setInspectedProcessStep] = React.useState<string | null>(null);
  
  // Decision box inspection mode (for split screen)
  const [inspectedDecisionBox, setInspectedDecisionBox] = React.useState<string | null>(null);
  
  // Hover state for connections
  const [hoveredConnection, setHoveredConnection] = React.useState<{ from: string; to: string } | null>(null);
  
  // Quick info card for connections (similar to player cards)
  const [selectedConnectionDetail, setSelectedConnectionDetail] = React.useState<{ from: string; to: string; x: number; y: number } | null>(null);
  
  // Drag preview position for waiting area players
  const [dragPreviewPosition, setDragPreviewPosition] = React.useState<{ x: number; y: number } | null>(null);
  
  // State for expanding/collapsing the bottom panel
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = React.useState(true);
  
  // State for object-based process creation
  const [selectedProcessObject, setSelectedProcessObject] = React.useState<ProcessObject | null>(null);
  
  // State for connector selection mode
  const [isConnectorMode, setIsConnectorMode] = React.useState(false);
  const [connectorModeStep, setConnectorModeStep] = React.useState<'starter' | 'empfaenger' | null>(null);
  const [connectorStarter, setConnectorStarter] = React.useState<string | null>(null);
  const [connectorEmpfaenger, setConnectorEmpfaenger] = React.useState<string | null>(null);
  
  // State for process object detail view
  const [selectedObjectDetail, setSelectedObjectDetail] = React.useState<ProcessObject | null>(null);
  
  // State for tracking communication object drag
  const [isDraggingCommObject, setIsDraggingCommObject] = React.useState(false);
  
  // State for selected communication object (click mode)
  const [selectedCommObject, setSelectedCommObject] = React.useState<ProcessObject | null>(null);
  
  // State for editing attributes
  const [isEditingAttributes, setIsEditingAttributes] = React.useState(false);
  const [editSpeed, setEditSpeed] = React.useState('');
  const [editReliability, setEditReliability] = React.useState('');
  const [editFormality, setEditFormality] = React.useState('');
  const [editCost, setEditCost] = React.useState('');
  
  // Orange-style drag connection state
  const [isDraggingConnection, setIsDraggingConnection] = React.useState(false);
  const [dragConnectionFrom, setDragConnectionFrom] = React.useState<string | null>(null);
  const [dragConnectionPosition, setDragConnectionPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [showConnectionTypeMenu, setShowConnectionTypeMenu] = React.useState(false);
  const [connectionMenuPosition, setConnectionMenuPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [connectionMenuTarget, setConnectionMenuTarget] = React.useState<string | null>(null);
  
  // View mode state (player-centric vs process-centric)
  const [viewMode, setViewMode] = React.useState<GameBoardView>('player-centric');
  
  // State for decision creation
  const [isDecisionMode, setIsDecisionMode] = React.useState(false);
  const [showDecisionModal, setShowDecisionModal] = React.useState(false);
  const [decisionQuestion, setDecisionQuestion] = React.useState('');
  const [decisionType, setDecisionType] = React.useState<'binary' | 'multiple'>('binary');
  const [decisionOptions, setDecisionOptions] = React.useState<Array<{ label: string; description: string; toPlayerId?: string }>>([
    { label: 'Ja', description: '' },
    { label: 'Nein', description: '' }
  ]);
  const [decisionStarter, setDecisionStarter] = React.useState<string | null>(null);
  
  // State for decision boxes (placed on board)
  const [decisionBoxes, setDecisionBoxes] = React.useState<Array<{
    id: string;
    question: string;
    fromPlayerId: string;
    options: Array<{ label: string; toPlayerId: string; description?: string; color?: string }>;
    position: { x: number; y: number };
    type: 'binary' | 'multiple';
  }>>([]);

  const handleAddPlayer = () => {
    if (currentName.trim() && currentRole.trim()) {
      const randomColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
      
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: currentName.trim(),
        role: currentRole.trim(),
        color: randomColor,
        icon: currentIcon,
        onBoard: false,  // Neue Spieler starten im Wartebereich
        input: currentInput.trim() || undefined,
        output: currentOutput.trim() || undefined,
        medium: currentMedium.trim() || undefined,
        processRole: currentProcessRole.trim() || undefined,
      };
      
      onAddPlayer(newPlayer);
      setCurrentName('');
      setCurrentRole('');
      setCurrentIcon(PLAYER_ICONS[0]);
      setCurrentInput('');
      setCurrentOutput('');
      setCurrentMedium('');
      setCurrentProcessRole('');
      setShowPlayerModal(false);
    }
  };

  const handleAddTestPlayers = () => {
    const testPlayers = [
      {
        name: 'Anna Schmidt',
        role: 'Projektmanager',
        icon: '👩‍💼',
        input: 'Projektanfragen',
        output: 'Projektpläne',
        medium: 'E-Mail, Teams',
        processRole: 'Koordinator'
      },
      {
        name: 'Max Müller',
        role: 'Entwickler',
        icon: '👨‍💻',
        input: 'Anforderungen',
        output: 'Code',
        medium: 'Jira, Git',
        processRole: 'Umsetzer'
      },
      {
        name: 'Lisa Weber',
        role: 'Designer',
        icon: '🎨',
        input: 'Design-Briefing',
        output: 'UI/UX Designs',
        medium: 'Figma, Slack',
        processRole: 'Gestalter'
      },
      {
        name: 'Tom Fischer',
        role: 'Tester',
        icon: '🔍',
        input: 'Testfälle',
        output: 'Testergebnisse',
        medium: 'Jira, E-Mail',
        processRole: 'Qualitätssicherung'
      }
    ];

    testPlayers.forEach((testPlayer, index) => {
      setTimeout(() => {
        const player: Player = {
          id: `player-${Date.now()}-${index}`,
          name: testPlayer.name,
          role: testPlayer.role,
          color: PLAYER_COLORS[index % PLAYER_COLORS.length],
          icon: testPlayer.icon,
          onBoard: false,  // Test-Spieler starten im Wartebereich
          input: testPlayer.input,
          output: testPlayer.output,
          medium: testPlayer.medium,
          processRole: testPlayer.processRole,
        };
        onAddPlayer(player);
      }, index * 100);
    });

    setShowPlayerModal(false);
    setShowDropdown(false);
  };

  const handleAutoLayout = () => {
    const playersOnBoard = players.filter(p => p.onBoard !== false);
    
    if (playersOnBoard.length === 0) {
      alert('Keine Spieler auf dem Board zum Anordnen!');
      return;
    }

    // Analyze process flow to determine optimal order
    const connections = getConnections();
    
    // Find the most connected players (hubs)
    const playerConnections = playersOnBoard.map(player => {
      const outgoing = connections.filter(c => c.from === player.id).length;
      const incoming = connections.filter(c => c.to === player.id).length;
      return {
        player,
        total: outgoing + incoming,
        outgoing,
        incoming
      };
    });

    // Sort by: incoming first (receivers), then by total connections
    const sortedPlayers = [...playerConnections].sort((a, b) => {
      // Prioritize players who start processes (high outgoing, low incoming)
      const aScore = a.outgoing * 2 - a.incoming;
      const bScore = b.outgoing * 2 - b.incoming;
      if (aScore !== bScore) return bScore - aScore;
      return b.total - a.total;
    }).map(pc => pc.player);

    // Arrange in circle with optimal positioning
    const total = sortedPlayers.length;
    sortedPlayers.forEach((player, index) => {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      const radiusPercent = 35;
      const x = 50 + Math.cos(angle) * radiusPercent;
      const y = 50 + Math.sin(angle) * radiusPercent;
      
      if (onUpdatePlayerPosition) {
        onUpdatePlayerPosition(player.id, { x, y });
      }
    });

    setShowDropdown(false);
  };

  const handleAddTestProcesses = () => {
    // Hole die vier Spieler (oder die ersten vier verfügbaren)
    const availablePlayers = players.filter(p => p.onBoard !== false);
    if (availablePlayers.length < 4) {
      alert('Bitte füge zuerst mindestens 4 Spieler hinzu!');
      return;
    }

    const [player1, player2, player3, player4] = availablePlayers.slice(0, 4);

    const testProcesses = [
      {
        text: 'Projektanfrage prüfen',
        fromId: player1.id,
        toId: player2.id,
        medium: 'E-Mail',
        duration: '30 Min',
        description: 'Eingehende Projektanfrage auf Machbarkeit prüfen'
      },
      {
        text: 'Anforderungen analysieren',
        fromId: player2.id,
        toId: player3.id,
        medium: 'Meeting',
        duration: '2 Stunden',
        description: 'Technische und Design-Anforderungen erfassen'
      },
      {
        text: 'Design umsetzen',
        fromId: player3.id,
        toId: player4.id,
        medium: 'Figma',
        duration: '3 Tage',
        description: 'UI/UX Design in Code umsetzen'
      },
      {
        text: 'Tests durchführen',
        fromId: player4.id,
        toId: player1.id,
        medium: 'Jira',
        duration: '2 Tage',
        description: 'Qualitätssicherung und Fehlerbericht'
      }
    ];

    testProcesses.forEach((process, index) => {
      setTimeout(() => {
        onAddCard(
          process.text,
          process.fromId,
          process.toId,
          process.medium,
          process.duration,
          process.description
        );
      }, index * 200);
    });

    // Füge eine Entscheidungsbox nach dem letzten Prozess hinzu
    setTimeout(() => {
      // Berechne Position der Entscheidungsbox
      const starterIndex = players.indexOf(player4);
      const starterPos = getPlayerPosition(player4, starterIndex, players.length);
      
      const target1Index = players.indexOf(player2);
      const target1Pos = getPlayerPosition(player2, target1Index, players.length);
      
      const target2Index = players.indexOf(player3);
      const target2Pos = getPlayerPosition(player3, target2Index, players.length);
      
      const decisionBoxPosition = {
        x: (starterPos.x + target1Pos.x + target2Pos.x) / 3,
        y: (starterPos.y + target1Pos.y + target2Pos.y) / 3
      };
      
      const newDecisionBox = {
        id: `decision-test-${Date.now()}`,
        question: 'Tests erfolgreich?',
        fromPlayerId: player4.id,
        options: [
          {
            label: 'Ja',
            toPlayerId: player2.id,
            description: 'Alle Tests bestanden - an Entwickler zur Freigabe',
            color: '#10B981'
          },
          {
            label: 'Nein',
            toPlayerId: player3.id,
            description: 'Fehler gefunden - zurück zum Designer zur Überarbeitung',
            color: '#EF4444'
          }
        ],
        position: decisionBoxPosition,
        type: 'binary' as const
      };
      
      setDecisionBoxes(prev => [...prev, newDecisionBox]);
    }, 4 * 200 + 100);

    setShowDropdown(false);
  };

  const handleAddSwimlaneTest = () => {
    // Prüfe ob schon Spieler vorhanden sind
    let testPlayers = players.filter(p => p.onBoard !== false);
    
    // Falls keine Spieler vorhanden sind, erstelle Test-Spieler
    if (testPlayers.length < 4) {
      const newTestPlayers = [
        {
          name: 'Anna Schmidt',
          role: 'Projektmanager',
          icon: '👩‍💼',
          input: 'Projektanfragen',
          output: 'Projektpläne',
          medium: 'E-Mail, Teams',
          processRole: 'Koordinator'
        },
        {
          name: 'Max Müller',
          role: 'Entwickler',
          icon: '👨‍💻',
          input: 'Anforderungen',
          output: 'Code',
          medium: 'Jira, Git',
          processRole: 'Umsetzer'
        },
        {
          name: 'Lisa Weber',
          role: 'Designer',
          icon: '🎨',
          input: 'Design-Briefing',
          output: 'UI/UX Designs',
          medium: 'Figma, Slack',
          processRole: 'Gestalter'
        },
        {
          name: 'Tom Fischer',
          role: 'Tester',
          icon: '🔍',
          input: 'Testfälle',
          output: 'Testergebnisse',
          medium: 'Jira, E-Mail',
          processRole: 'Qualitätssicherung'
        }
      ];

      testPlayers = [];
      newTestPlayers.forEach((testPlayer, index) => {
        const player: Player = {
          id: `player-${Date.now()}-${index}`,
          name: testPlayer.name,
          role: testPlayer.role,
          color: PLAYER_COLORS[index % PLAYER_COLORS.length],
          icon: testPlayer.icon,
          onBoard: true,  // Direkt auf dem Spielfeld
          input: testPlayer.input,
          output: testPlayer.output,
          medium: testPlayer.medium,
          processRole: testPlayer.processRole,
        };
        testPlayers.push(player);
        onAddPlayer(player);
      });
    }

    const [pm, dev, designer, tester] = testPlayers.slice(0, 4);

    // Linearer Prozessfluss für Swimlane mit Entscheidungen
    const swimlaneProcesses = [
      {
        text: 'Anforderungen erstellen',
        fromId: pm.id,
        toId: dev.id,
        medium: 'Jira',
        duration: '1 Tag',
        description: 'Projektanforderungen definieren und dokumentieren'
      },
      {
        text: 'Technische Konzeption',
        fromId: dev.id,
        toId: designer.id,
        medium: 'Confluence',
        duration: '2 Tage',
        description: 'Technische Architektur planen'
      },
      {
        text: 'UI/UX Design',
        fromId: designer.id,
        toId: dev.id,
        medium: 'Figma',
        duration: '3 Tage',
        description: 'Benutzeroberfläche gestalten'
      },
      {
        text: 'Implementierung',
        fromId: dev.id,
        toId: tester.id,
        medium: 'Git',
        duration: '5 Tage',
        description: 'Code entwickeln und implementieren'
      },
      {
        text: 'Qualitätsprüfung',
        fromId: tester.id,
        toId: tester.id, // Tester macht Entscheidung
        medium: 'TestRail',
        duration: '2 Tage',
        description: 'Funktionale und nicht-funktionale Tests durchführen'
      }
    ];

    // Prozesse hinzufügen
    swimlaneProcesses.forEach((process, index) => {
      setTimeout(() => {
        onAddCard(
          process.text,
          process.fromId,
          process.toId,
          process.medium,
          process.duration,
          process.description
        );
      }, index * 200);
    });

    // Prozesse nach Qualitätsprüfung (vor der Entscheidung erstellen)
    setTimeout(() => {
      // Pfad "Nein" - zurück zur Entwicklung für Bugfixes
      onAddCard(
        'Bugfixes durchführen',
        dev.id,
        tester.id,
        'GitHub',
        '1 Tag',
        'Gefundene Fehler beheben und erneut testen'
      );
    }, swimlaneProcesses.length * 200 + 100);

    setTimeout(() => {
      // Pfad "Ja" - zur Freigabe
      onAddCard(
        'Projekt freigeben',
        pm.id,
        pm.id,
        'E-Mail',
        '30 Min',
        'Finale Freigabe und Deployment-Planung'
      );
    }, swimlaneProcesses.length * 200 + 200);

    // Entscheidung: Tests erfolgreich? (nach den Folgeprozessen erstellen)
    setTimeout(() => {
      const decisionBox = {
        id: `decision-swimlane-${Date.now()}`,
        question: 'Tests erfolgreich?',
        fromPlayerId: tester.id,
        logicType: 'xor',
        options: [
          {
            id: `option-yes-${Date.now()}`,
            label: 'Ja',
            toPlayerId: pm.id,
            description: 'Alle Tests bestanden - zur Freigabe',
            color: '#10B981'
          },
          {
            id: `option-no-${Date.now()}`,
            label: 'Nein',
            toPlayerId: dev.id,
            description: 'Fehler gefunden - zurück zur Entwicklung',
            color: '#EF4444'
          }
        ],
        position: { x: 50, y: 50 },
        type: 'binary' as const
      };
      
      setDecisionBoxes(prev => [...prev, decisionBox]);
    }, swimlaneProcesses.length * 200 + 300);

    setShowDropdown(false);
  };

  const handleAddCard = () => {
    if (inputText.trim() && selectedFromPlayer && selectedToPlayer) {
      onAddCard(
        inputText.trim(), 
        selectedFromPlayer, 
        selectedToPlayer,
        processMedium.trim() || undefined,
        processDuration.trim() || undefined,
        processDescription.trim() || undefined
      );
      setInputText('');
      setSelectedFromPlayer(null);
      setSelectedToPlayer(null);
      setProcessMedium('');
      setProcessDuration('');
      setProcessDescription('');
      setSelectedProcessObject(null);
      setShowProcessModal(false);
    }
  };
  
  const handleAddDecision = () => {
    if (decisionQuestion.trim() && decisionStarter && selectedProcessObject) {
      // Berechne Position der Entscheidungsbox (zwischen Starter und den Zielspielern)
      const starterPlayer = players.find(p => p.id === decisionStarter);
      if (!starterPlayer) return;
      
      const starterIndex = players.indexOf(starterPlayer);
      const starterPos = getPlayerPosition(starterPlayer, starterIndex, players.length);
      
      // Berechne durchschnittliche Position der Ziel-Spieler
      let avgX = starterPos.x;
      let avgY = starterPos.y;
      let targetCount = 0;
      
      decisionOptions.forEach(option => {
        if (option.toPlayerId) {
          const targetPlayer = players.find(p => p.id === option.toPlayerId);
          if (targetPlayer) {
            const targetIndex = players.indexOf(targetPlayer);
            const targetPos = getPlayerPosition(targetPlayer, targetIndex, players.length);
            avgX += targetPos.x;
            avgY += targetPos.y;
            targetCount++;
          }
        }
      });
      
      // Position in der Mitte zwischen Starter und Zielen
      const decisionBoxPosition = {
        x: avgX / (targetCount + 1),
        y: avgY / (targetCount + 1)
      };
      
      // Erstelle die Entscheidungsbox
      const newDecisionBox = {
        id: `decision-${Date.now()}`,
        question: decisionQuestion,
        fromPlayerId: decisionStarter,
        options: decisionOptions.filter(opt => opt.toPlayerId).map((opt, index) => ({
          label: opt.label,
          toPlayerId: opt.toPlayerId!,
          description: opt.description,
          color: PLAYER_COLORS[index % PLAYER_COLORS.length]
        })),
        position: decisionBoxPosition,
        type: decisionType
      };
      
      setDecisionBoxes([...decisionBoxes, newDecisionBox]);
      
      // Reset
      setDecisionQuestion('');
      setDecisionType('binary');
      setDecisionOptions([
        { label: 'Ja', description: '' },
        { label: 'Nein', description: '' }
      ]);
      setDecisionStarter(null);
      setSelectedProcessObject(null);
      setIsDecisionMode(false);
      setShowDecisionModal(false);
    }
  };
  
  const handleAddDecisionOption = () => {
    setDecisionOptions([...decisionOptions, { label: '', description: '' }]);
  };
  
  const handleRemoveDecisionOption = (index: number) => {
    if (decisionOptions.length > 2) {
      setDecisionOptions(decisionOptions.filter((_, i) => i !== index));
    }
  };
  
  const handleUpdateDecisionOption = (index: number, field: 'label' | 'description' | 'toPlayerId', value: string) => {
    const newOptions = [...decisionOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setDecisionOptions(newOptions);
  };

  const handlePlayerClick = (playerId: string) => {
    // Im Entscheidungs-Modus: Spieler als Starter auswählen
    if (isDecisionMode) {
      setDecisionStarter(playerId);
      setShowDecisionModal(true);
      return;
    }
    
    // Im Connector-Modus: Spieler als Starter oder Empfänger auswählen
    if (isConnectorMode) {
      if (connectorModeStep === 'starter') {
        setConnectorStarter(playerId);
        setConnectorModeStep('empfaenger');
      } else if (connectorModeStep === 'empfaenger') {
        setConnectorEmpfaenger(playerId);
        // Erstelle die Verbindung
        if (connectorStarter && selectedProcessObject) {
          onAddCard(
            selectedProcessObject.name,
            connectorStarter,
            playerId,
            selectedProcessObject.description || '',
            '',
            selectedProcessObject.description || ''
          );
        }
        // Reset connector mode
        setIsConnectorMode(false);
        setConnectorModeStep(null);
        setConnectorStarter(null);
        setConnectorEmpfaenger(null);
        setSelectedProcessObject(null);
      }
      return;
    }
    
    // Standard-Modus: Spieler für Prozessschritt-Modal auswählen
    if (!selectedFromPlayer) {
      setSelectedFromPlayer(playerId);
    } else if (selectedFromPlayer === playerId) {
      setSelectedFromPlayer(null);
    } else if (!selectedToPlayer) {
      setSelectedToPlayer(playerId);
    } else {
      setSelectedFromPlayer(playerId);
      setSelectedToPlayer(null);
    }
  };
  
  const handleObjectClick = (obj: ProcessObject) => {
    console.log('GameBoard.handleObjectClick called with:', obj.name, 'category:', obj.category);
    
    // Wenn es ein Kommunikationsmittel ist, aktiviere den Auswahl-Modus
    if (obj.category === 'communication') {
      console.log('Communication object selected:', obj.name);
      if (selectedCommObject?.id === obj.id) {
        // Deselektiere wenn bereits ausgewählt
        setSelectedCommObject(null);
      } else {
        setSelectedCommObject(obj);
        setShowDropdown(false);
      }
      return;
    }
    
    // Wenn es ein Connector ist, prüfe ob es ein Entscheidungs-Connector ist
    if (obj.category === 'connector') {
      console.log('Connector mode activated');
      
      // Prüfe ob es ein Entscheidungs-Icon ist (aus DECISION_ICONS)
      const isDecisionIcon = DECISION_ICONS.includes(obj.icon);
      
      if (isDecisionIcon) {
        // Aktiviere Entscheidungs-Modus
        console.log('Decision mode activated');
        setIsDecisionMode(true);
        setSelectedProcessObject(obj);
        setShowDropdown(false);
      } else {
        // Normaler Connector-Modus
        setIsConnectorMode(true);
        setConnectorModeStep('starter');
        setSelectedProcessObject(obj);
        setConnectorStarter(null);
        setConnectorEmpfaenger(null);
        setShowDropdown(false);
      }
    } else {
      // Für andere Objekte: Zeige Details an
      console.log('Opening detail view for:', obj.name);
      if (selectedObjectDetail?.id === obj.id) {
        setSelectedObjectDetail(null);
      } else {
        setSelectedObjectDetail(obj);
      }
    }
  };

  const handleStartDragConnection = (e: React.MouseEvent, playerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 START drag connection from', playerId);
    
    const boardRect = gameBoardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    
    setIsDraggingConnection(true);
    setDragConnectionFrom(playerId);
    setDragConnectionPosition({
      x: ((e.clientX - boardRect.left) / boardRect.width) * 100,
      y: ((e.clientY - boardRect.top) / boardRect.height) * 100
    });
  };

  const handleDragConnectionMove = (e: React.MouseEvent) => {
    if (!isDraggingConnection || !gameBoardRef.current) return;
    
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    setDragConnectionPosition({
      x: ((e.clientX - boardRect.left) / boardRect.width) * 100,
      y: ((e.clientY - boardRect.top) / boardRect.height) * 100
    });
  };

  const handleEndDragConnection = (e: React.MouseEvent, targetPlayerId?: string) => {
    console.log('🎯 handleEndDragConnection called', { isDraggingConnection, dragConnectionFrom, targetPlayerId });
    
    if (!isDraggingConnection || !dragConnectionFrom) {
      setIsDraggingConnection(false);
      setDragConnectionFrom(null);
      setDragConnectionPosition(null);
      return;
    }
    
    // Always show menu - either for connection to player or for creating new element
    console.log('✅ Opening connection menu at', e.clientX, e.clientY, 'position:', dragConnectionPosition);
    setConnectionMenuPosition({
      x: e.clientX,
      y: e.clientY
    });
    setConnectionMenuTarget(targetPlayerId || null); // null means "empty space"
    setShowConnectionTypeMenu(true);
    
    // Keep dragConnectionPosition - needed for placing player at drop location
    setIsDraggingConnection(false);
    // Don't reset dragConnectionPosition yet!
  };

  const handlePlayerContextClick = (e: React.MouseEvent, playerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Im normalen Modus: Zeige Player-Details
    // Rechtsklick: Zeige Context-Menu
    if (e.button === 2 || e.ctrlKey) {
      if (contextMenuPlayer === playerId) {
        setContextMenuPlayer(null);
      } else {
        setContextMenuPlayer(playerId);
      }
    } else {
      // Normaler Klick: Zeige Details
      if (selectedPlayerDetail === playerId) {
        setSelectedPlayerDetail(null);
      } else {
        setSelectedPlayerDetail(playerId);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, playerId: string) => {
    if (showProcessModal) return; // Don't drag during process modal
    
    // Close context menu if open
    if (contextMenuPlayer) {
      setContextMenuPlayer(null);
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedPlayer(playerId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPlayer || !gameBoardRef.current) return;
    
    // Check if dragging a decision box
    if (draggedPlayer.startsWith('decision-')) {
      const decisionId = draggedPlayer.replace('decision-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      setDecisionBoxes(prev => prev.map(box => 
        box.id === decisionId 
          ? { ...box, position: { x: clampedX, y: clampedY } }
          : box
      ));
      return;
    }
    
    const player = players.find(p => p.id === draggedPlayer);
    if (!player) return;
    
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
    const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
    
    // Clamp to board boundaries (with margin for the player element)
    const clampedX = Math.max(8, Math.min(92, x));
    const clampedY = Math.max(8, Math.min(92, y));
    
    // Wenn der Spieler bereits auf dem Board ist (hat eine Position oder onBoard === true), aktualisiere die Position
    if (player.onBoard === true || (player.onBoard !== false && player.position)) {
      if (onUpdatePlayerPosition) {
        onUpdatePlayerPosition(draggedPlayer, { x: clampedX, y: clampedY });
      }
    }
    // Wenn der Spieler aus dem Wartebereich gezogen wird (onBoard === false), zeige nur eine Vorschau
    else if (player.onBoard === false) {
      setDragPreviewPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Wenn ein Spieler aus dem Wartebereich gezogen wurde
    if (draggedPlayer && gameBoardRef.current) {
      const player = players.find(p => p.id === draggedPlayer);
      
      if (player && player.onBoard === false) {
        const boardRect = gameBoardRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Prüfe ob die Maus über dem Spielfeld ist
        const isOverBoard = mouseX >= boardRect.left && 
                           mouseX <= boardRect.right && 
                           mouseY >= boardRect.top && 
                           mouseY <= boardRect.bottom;
        
        if (isOverBoard && onUpdatePlayerPosition) {
          // Berechne Position auf dem Spielfeld
          const x = ((mouseX - boardRect.left) / boardRect.width) * 100;
          const y = ((mouseY - boardRect.top) / boardRect.height) * 100;
          const clampedX = Math.max(8, Math.min(92, x));
          const clampedY = Math.max(8, Math.min(92, y));
          
          // Setze Position und onBoard auf true
          onUpdatePlayerPosition(draggedPlayer, { x: clampedX, y: clampedY });
        }
      }
    }
    setDraggedPlayer(null);
    setDragPreviewPosition(null);
  };

  const getPlayerPosition = (player: Player, index: number, total: number) => {
    // If player has custom position, use it
    if (player.position) {
      return {
        x: player.position.x,
        y: player.position.y,
        isCustom: true,
      };
    }
    
    // Otherwise calculate circle position
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radiusPercent = 35;
    const x = 50 + Math.cos(angle) * radiusPercent;
    const y = 50 + Math.sin(angle) * radiusPercent;
    
    return {
      x,
      y,
      isCustom: false,
    };
  };

  // Helper function to get port position for connections
  const getPlayerPortPosition = (fromPos: {x: number, y: number}, toPos: {x: number, y: number}, isStart: boolean) => {
    // Calculate direction vector
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return fromPos;
    
    // Normalize direction
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // Port offset from center (in percentage units, matching the 24x24 circle with radius ~3%)
    const portOffset = 3;
    
    // For start: offset in direction of target (right port)
    // For end: offset opposite to direction (left port)
    const offsetMultiplier = isStart ? 1 : -1;
    
    return {
      x: (isStart ? fromPos.x : toPos.x) + dirX * portOffset * offsetMultiplier,
      y: (isStart ? fromPos.y : toPos.y) + dirY * portOffset * offsetMultiplier
    };
  };

  // Helper function to calculate curve control point (avoid duplication)
  const calculateCurveControlPoint = (fromPos: {x: number, y: number}, toPos: {x: number, y: number}, fromId: string, toId: string) => {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check for reverse connection
    const hasReverseConnection = getConnections().some(
      c => c.from === toId && c.to === fromId
    );
    const isReverseConnection = hasReverseConnection && fromId > toId;
    
    // Calculate control point distance
    let controlPointDistance = distance * 0.2;
    if (hasReverseConnection) {
      controlPointDistance = distance * 0.4;
    }
    
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Center of the board
    const centerX = 50;
    const centerY = 50;
    
    // Vector from center to midpoint
    const midToCenterX = midX - centerX;
    const midToCenterY = midY - centerY;
    
    // For reverse connections: use alternating direction
    if (hasReverseConnection) {
      const curveDirection = isReverseConnection ? -1 : 1;
      const controlX = midX + perpX * controlPointDistance * curveDirection;
      const controlY = midY + perpY * controlPointDistance * curveDirection;
      return { controlX, controlY, controlPointDistance, finalDirection: curveDirection };
    }
    
    // For normal connections: ALWAYS bend away from center (outward)
    // Determine which perpendicular direction points away from center
    const dot1 = perpX * midToCenterX + perpY * midToCenterY;
    const dot2 = -perpX * midToCenterX + -perpY * midToCenterY;
    
    // Choose direction that points away from center (positive dot product = same direction)
    const curveDirection = dot1 > dot2 ? 1 : -1;
    
    const controlX = midX + perpX * controlPointDistance * curveDirection;
    const controlY = midY + perpY * controlPointDistance * curveDirection;
    
    return { controlX, controlY, controlPointDistance, finalDirection: curveDirection };
  };

  const getConnections = () => {
    const connections: Array<{ from: string; to: string; count: number; cards: ProcessCard[] }> = [];
    
    cards.forEach(card => {
      const existing = connections.find(
        c => c.from === card.fromPlayerId && c.to === card.toPlayerId
      );
      
      if (existing) {
        existing.count++;
        existing.cards.push(card);
      } else {
        connections.push({
          from: card.fromPlayerId,
          to: card.toPlayerId,
          count: 1,
          cards: [card],
        });
      }
    });
    
    return connections;
  };

  // Render swimlane view with horizontal lanes
  const renderSwimlaneView = () => {
    const connections = getConnections();
    const activePlayers = players.filter(p => p.onBoard !== false);
    
    // Sort connections chronologically
    const sortedConnections = [...connections].sort((a, b) => {
      const aMinRound = Math.min(...a.cards.map(c => c.round));
      const bMinRound = Math.min(...b.cards.map(c => c.round));
      if (aMinRound !== bMinRound) return aMinRound - bMinRound;
      return a.cards[0].timestamp - b.cards[0].timestamp;
    });

    // Build process flow graph with proper ordering
    const allSteps: Array<{
      id: string;
      type: 'connection' | 'decision';
      playerId: string;
      cards?: ProcessCard[];
      decisionBox?: any;
      fromId?: string;
      toId?: string;
      timestamp: number;
      stepNumber?: number;
    }> = [];

    // Add regular connections with step numbers
    sortedConnections.forEach((conn, index) => {
      allSteps.push({
        id: `${conn.from}-${conn.to}`,
        type: 'connection',
        playerId: conn.from,
        cards: conn.cards,
        fromId: conn.from,
        toId: conn.to,
        timestamp: conn.cards[0].timestamp,
        stepNumber: index + 1
      });
    });

    // Add decision boxes - place them after the step from their fromPlayerId
    decisionBoxes.forEach((box) => {
      // Find the last connection from this player to determine when to insert the decision
      const lastConnectionFromPlayer = sortedConnections
        .filter(conn => conn.from === box.fromPlayerId)
        .sort((a, b) => b.cards[0].timestamp - a.cards[0].timestamp)[0];
      
      // Use timestamp slightly after the last connection from this player
      const decisionTimestamp = lastConnectionFromPlayer 
        ? lastConnectionFromPlayer.cards[0].timestamp + 1
        : Date.now();
      
      allSteps.push({
        id: `decision-${box.id}`,
        type: 'decision',
        playerId: box.fromPlayerId,
        decisionBox: box,
        fromId: box.fromPlayerId,
        timestamp: decisionTimestamp,
        stepNumber: sortedConnections.length + 1 // Decision gets next step number
      });
    });

    // Sort all steps by timestamp for chronological column assignment
    allSteps.sort((a, b) => a.timestamp - b.timestamp);
    
    // Renumber steps after sorting
    let stepCounter = 1;
    allSteps.forEach(step => {
      if (step.type === 'connection' || step.type === 'decision') {
        step.stepNumber = stepCounter++;
      }
    });

    // Assign columns (starting from column 1, column 0 is reserved for players)
    const processSteps: Array<{
      id: string;
      playerId: string;
      cards: ProcessCard[];
      column: number;
      isDecision?: boolean;
      decisionBox?: any;
      fromId?: string;
      toId?: string;
      stepNumber?: number;
    }> = [];

    let currentColumn = 1; // Start from column 1 (column 0 is for players)
    const stepIdToColumn = new Map<string, number>();

    allSteps.forEach((step) => {
      processSteps.push({
        id: step.id,
        playerId: step.playerId,
        cards: step.cards || [],
        column: currentColumn,
        isDecision: step.type === 'decision',
        decisionBox: step.decisionBox,
        fromId: step.fromId,
        toId: step.toId,
        stepNumber: step.stepNumber
      });
      
      stepIdToColumn.set(step.id, currentColumn);
      // Map player connections for easy lookup
      if (step.type === 'connection') {
        stepIdToColumn.set(`player-${step.toId}`, currentColumn + 1);
      }
      
      currentColumn++;
    });

    const laneHeight = 180;
    const columnWidth = 280;
    const playerColumnWidth = 180; // Smaller column for players
    const leftMargin = 200;
    const topMargin = 80;

    return (
      <div className="absolute inset-0 overflow-auto">
        <div className="relative min-w-full min-h-full" style={{ 
          width: `${Math.max(1200, currentColumn * columnWidth + leftMargin + 200)}px`,
          height: `${activePlayers.length * laneHeight + topMargin + 100}px`
        }}>
          
          {/* Player column background - highlighted, stops at last player, smaller width */}
          <div
            className="absolute"
            style={{
              left: '0px',
              top: '0px',
              width: `${leftMargin + playerColumnWidth}px`,
              height: `${topMargin + activePlayers.length * laneHeight}px`,
              backgroundColor: 'rgba(51, 65, 85, 0.3)',
              borderRight: '2px solid rgba(255, 255, 255, 0.15)'
            }}
          />

          {/* Column header for players */}
          <div
            className="absolute text-center font-bold text-white"
            style={{
              left: `${(leftMargin + playerColumnWidth) / 2 - 60}px`,
              top: '30px',
              width: '120px',
              fontSize: '15px',
              letterSpacing: '0.5px'
            }}
          >
            Beteiligte
          </div>

          {/* Lane backgrounds */}
          {activePlayers.map((player, laneIndex) => (
            <div
              key={`lane-${player.id}`}
              className="absolute left-0 right-0 border-b border-white/10"
              style={{
                top: `${topMargin + laneIndex * laneHeight}px`,
                height: `${laneHeight}px`,
                backgroundColor: laneIndex % 2 === 0 ? 'rgba(51, 65, 85, 0.2)' : 'rgba(71, 85, 105, 0.2)'
              }}
            />
          ))}

          {/* Player bubbles in column 0 - centered in smaller column */}
          {activePlayers.map((player, laneIndex) => {
            const x = (leftMargin + playerColumnWidth) / 2; // True center of the column
            const y = topMargin + laneIndex * laneHeight + laneHeight / 2;
            
            return (
              <div
                key={`player-bubble-${player.id}`}
                className="absolute cursor-pointer group"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
                onClick={() => setInspectedPlayer(player.id)}
              >
                <div
                  className="w-32 px-4 py-3 rounded-2xl border-3 shadow-xl transition-all group-hover:scale-105 group-hover:shadow-2xl"
                  style={{
                    backgroundColor: player.color + '60',
                    borderColor: player.color,
                    borderWidth: '3px',
                    boxShadow: `0 8px 24px ${player.color}60`
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1">{player.icon}</div>
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {player.name}
                    </div>
                    <div className="text-[10px] opacity-80 text-white line-clamp-1">
                      {player.role}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            style={{ top: 0, left: 0 }}
          >
            <defs>
              {activePlayers.map((player) => (
                <marker
                  key={`arrow-swimlane-${player.id}`}
                  id={`arrowhead-swimlane-${player.id}`}
                  markerWidth="3"
                  markerHeight="3"
                  refX="0"
                  refY="1.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 3 1.5, 0 3"
                    fill={player.color}
                    opacity="0.9"
                  />
                </marker>
              ))}
            </defs>

            {/* Draw connection lines between consecutive steps */}
            {processSteps.map((step, stepIndex) => {
              // Skip decisions - they have their own rendering logic
              if (step.isDecision) return null;
              
              const fromPlayer = activePlayers.find(p => p.id === step.fromId);
              const toPlayer = activePlayers.find(p => p.id === step.toId);
              
              if (!fromPlayer || !toPlayer) return null;
              
              const fromLaneIndex = activePlayers.indexOf(fromPlayer);
              const toLaneIndex = activePlayers.indexOf(toPlayer);
              
              // Current step box position
              const currentStepX = leftMargin + (step.column + 0.5) * columnWidth + 80; // Right edge of current step
              const currentStepY = topMargin + fromLaneIndex * laneHeight + laneHeight / 2;
              
              // No lines from player to first step - players are fixed in their column
              
              // Line TO next step (or decision)
              const nextStep = processSteps[stepIndex + 1];
              let lineToNext = null;
              
              if (nextStep) {
                if (nextStep.isDecision) {
                  // Line to decision box
                  const decisionX = leftMargin + (nextStep.column + 0.5) * columnWidth - 42; // Left edge of diamond
                  const decisionY = topMargin + fromLaneIndex * laneHeight + laneHeight / 2;
                  
                  lineToNext = (
                    <line
                      key={`line-${step.id}-decision-${nextStep.id}`}
                      x1={currentStepX}
                      y1={currentStepY}
                      x2={decisionX}
                      y2={decisionY}
                      stroke={fromPlayer.color}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  );
                } else {
                  // Line to next process step
                  const nextFromPlayer = activePlayers.find(p => p.id === nextStep.fromId);
                  const nextFromLaneIndex = nextFromPlayer ? activePlayers.indexOf(nextFromPlayer) : -1;
                  
                  if (nextFromPlayer && nextFromLaneIndex !== -1) {
                    const nextStepX = leftMargin + (nextStep.column + 0.5) * columnWidth - 80;
                    const nextStepY = topMargin + nextFromLaneIndex * laneHeight + laneHeight / 2;
                    
                    // Draw line from current step to next step
                    if (fromLaneIndex === nextFromLaneIndex) {
                      // Same lane - straight line
                      lineToNext = (
                        <line
                          key={`line-${step.id}-${nextStep.id}`}
                          x1={currentStepX}
                          y1={currentStepY}
                          x2={nextStepX}
                          y2={nextStepY}
                          stroke={fromPlayer.color}
                          strokeWidth="3"
                          opacity="0.8"
                          markerEnd={`url(#arrowhead-swimlane-${nextFromPlayer.id})`}
                        />
                      );
                    } else {
                      // Different lanes - path with vertical connection
                      const midX = (currentStepX + nextStepX) / 2;
                      lineToNext = (
                        <path
                          key={`line-${step.id}-${nextStep.id}`}
                          d={`M ${currentStepX} ${currentStepY} L ${midX} ${currentStepY} L ${midX} ${nextStepY} L ${nextStepX} ${nextStepY}`}
                          stroke={fromPlayer.color}
                          strokeWidth="3"
                          fill="none"
                          opacity="0.8"
                          markerEnd={`url(#arrowhead-swimlane-${nextFromPlayer.id})`}
                        />
                      );
                    }
                  }
                }
              }
              
              return lineToNext ? (
                <g key={`lines-${step.id}`}>
                  {lineToNext}
                </g>
              ) : null;
            })}

            {/* Draw decision lines - each option goes to its target */}
            {processSteps.filter(s => s.isDecision).map((step, decisionIndex) => {
              const box = step.decisionBox;
              if (!box) return null;
              
              const fromPlayer = activePlayers.find(p => p.id === box.fromPlayerId);
              if (!fromPlayer) return null;
              
              const fromLaneIndex = activePlayers.indexOf(fromPlayer);
              const boxX = leftMargin + (step.column + 0.5) * columnWidth;
              const boxY = topMargin + fromLaneIndex * laneHeight + laneHeight / 2;
              
              // Decision box exit points - diamond is rotated 45°, so corners are at cardinal directions
              const decisionTopX = boxX; // Top corner (pointing up)
              const decisionTopY = boxY - 42; // 42px up from center
              const decisionRightX = boxX + 42; // Right corner
              const decisionRightY = boxY;
              
              return box.options.map((option, optIdx) => {
                const toPlayer = activePlayers.find(p => p.id === option.toPlayerId);
                if (!toPlayer) return null;
                
                const toLaneIndex = activePlayers.indexOf(toPlayer);
                
                // Find the next step after this decision that involves the target player
                const currentStepIndex = processSteps.indexOf(step);
                
                // First try to find a step AFTER the decision
                let targetStepIndex = processSteps.findIndex((s, idx) => 
                  idx > currentStepIndex && !s.isDecision && (s.fromId === option.toPlayerId || s.playerId === option.toPlayerId)
                );
                
                // If not found after, look BEFORE the decision (for loops back)
                if (targetStepIndex === -1) {
                  targetStepIndex = processSteps.findIndex((s, idx) => 
                    idx < currentStepIndex && !s.isDecision && (s.fromId === option.toPlayerId || s.playerId === option.toPlayerId)
                  );
                }
                
                let toX = leftMargin + (step.column + 1.5) * columnWidth;
                let toY = topMargin + toLaneIndex * laneHeight + laneHeight / 2;
                
                // If we found a target step, point to it (left edge)
                if (targetStepIndex !== -1) {
                  const targetStep = processSteps[targetStepIndex];
                  toX = leftMargin + (targetStep.column + 0.5) * columnWidth - 80;
                  const targetPlayer = activePlayers.find(p => p.id === targetStep.fromId);
                  if (targetPlayer) {
                    const targetLaneIndex = activePlayers.indexOf(targetPlayer);
                    toY = topMargin + targetLaneIndex * laneHeight + laneHeight / 2;
                  }
                }
                
                // Determine color based on option
                const lineColor = option.color || fromPlayer.color;
                
                // Check if this is a backward connection
                const isBackward = targetStepIndex !== -1 && targetStepIndex < currentStepIndex;
                
                // Create path based on direction
                let pathD;
                let labelX;
                let labelY;
                
                if (isBackward) {
                  // Backward path - exit from TOP of diamond, go up and then left, enter target from TOP edge CENTER
                  const topY = Math.min(decisionTopY, toY) - 80; // Go above both boxes
                  
                  // Calculate exact center of target box
                  // toX is the LEFT edge entry point (toX = leftMargin + (column + 0.5) * columnWidth - 80)
                  // So the box center X is: toX + 80 (from left edge to center)
                  const targetCenterX = toX + 80;
                  
                  // Top edge of the box - the box has rounded corners and padding
                  // py-4 = 16px top padding, box center is at toY
                  // Total box height ~80px, so top edge is ~40px above center
                  const targetTopEdge = toY - 40;
                  
                  pathD = `M ${decisionTopX} ${decisionTopY} 
                           L ${decisionTopX} ${topY} 
                           L ${targetCenterX} ${topY} 
                           L ${targetCenterX} ${targetTopEdge}`;
                  
                  labelX = decisionTopX + 15;
                  labelY = topY - 5;
                } else {
                  // Forward path - exit from RIGHT of diamond
                  const midX = (decisionRightX + toX) / 2;
                  
                  if (Math.abs(toLaneIndex - fromLaneIndex) < 0.5) {
                    // Same lane - straight line
                    pathD = `M ${decisionRightX} ${decisionRightY} L ${toX} ${toY}`;
                    labelX = decisionRightX + 60;
                    labelY = decisionRightY - 10;
                  } else {
                    // Different lanes - path with vertical step
                    pathD = `M ${decisionRightX} ${decisionRightY} 
                             L ${midX} ${decisionRightY} 
                             L ${midX} ${toY} 
                             L ${toX} ${toY}`;
                    labelX = decisionRightX + 60;
                    labelY = decisionRightY - 10;
                  }
                }
                
                return (
                  <g key={`decision-line-${box.id}-${optIdx}`}>
                    <path
                      d={pathD}
                      stroke={lineColor}
                      strokeWidth="3"
                      fill="none"
                      opacity="0.8"
                      markerEnd={`url(#arrowhead-swimlane-${fromPlayer.id})`}
                    />
                    {/* Label for decision option */}
                    <text
                      x={labelX}
                      y={labelY}
                      fill="white"
                      fontSize="13"
                      fontWeight="bold"
                      className="pointer-events-none"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {option.label}
                    </text>
                  </g>
                );
              });
            })}
          </svg>

          {/* Process steps */}
          {processSteps.map((step) => {
            const player = activePlayers.find(p => p.id === step.playerId);
            if (!player) return null;
            
            const laneIndex = activePlayers.indexOf(player);
            const x = leftMargin + (step.column + 0.5) * columnWidth;
            const y = topMargin + laneIndex * laneHeight + laneHeight / 2;
            
            if (step.isDecision && step.decisionBox) {
              // Render decision diamond
              const box = step.decisionBox;
              const decisionIcon = processObjects.find(obj => obj.id === box.logicType);
              
              return (
                <div
                  key={step.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setInspectedDecisionBox(box)}
                >
                  {/* Step number badge for decision */}
                  {step.stepNumber && (
                    <div
                      className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg z-10"
                      style={{
                        backgroundColor: player.color,
                        boxShadow: `0 4px 12px ${player.color}60`
                      }}
                    >
                      {step.stepNumber}
                    </div>
                  )}
                  
                  <div
                    className="w-24 h-24 rotate-45 flex items-center justify-center border-4 shadow-xl transition-all group-hover:scale-110"
                    style={{
                      backgroundColor: decisionIcon?.color || '#f59e0b',
                      borderColor: player.color,
                      boxShadow: `0 8px 24px ${decisionIcon?.color || '#f59e0b'}60`
                    }}
                  >
                    <div className="-rotate-45">
                      <div className="text-3xl mb-1">{decisionIcon?.icon || '❓'}</div>
                      <div className="text-xs font-bold text-white text-center px-2 line-clamp-2">
                        {box.question}
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Render process step
              const lastCard = step.cards[step.cards.length - 1];
              
              return (
                <div
                  key={step.id}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => {
                    if (step.cards.length > 0) {
                      const processStep = {
                        id: step.id,
                        playerId: step.playerId,
                        playerName: player.name,
                        role: player.role,
                        text: lastCard.text,
                        medium: lastCard.medium,
                        duration: lastCard.duration,
                        description: lastCard.description,
                        communicationObjectIds: lastCard.communicationObjectIds || [],
                        cards: step.cards
                      };
                      setInspectedProcessStep(processStep);
                    }
                  }}
                >
                  {/* Step number badge */}
                  {step.stepNumber && (
                    <div
                      className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg z-10"
                      style={{
                        backgroundColor: player.color,
                        boxShadow: `0 4px 12px ${player.color}60`
                      }}
                    >
                      {step.stepNumber}
                    </div>
                  )}
                  
                  <div
                    className="w-40 px-6 py-4 rounded-2xl border-3 shadow-xl transition-all group-hover:scale-105 group-hover:shadow-2xl"
                    style={{
                      backgroundColor: player.color + '30',
                      borderColor: player.color,
                      borderWidth: '3px',
                      boxShadow: `0 8px 24px ${player.color}40`
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{player.icon}</div>
                      <div className="text-xs font-bold text-white mb-2 line-clamp-2">
                        {lastCard?.text || 'Prozessschritt'}
                      </div>
                      
                      {/* Communication objects */}
                      {lastCard?.communicationObjectIds && lastCard.communicationObjectIds.length > 0 && (
                        <div className="flex justify-center gap-1 flex-wrap mt-2">
                          {lastCard.communicationObjectIds.map(objId => {
                            const obj = processObjects.find(o => o.id === objId);
                            if (!obj) return null;
                            return (
                              <div
                                key={objId}
                                className="text-lg"
                                title={obj.name}
                              >
                                {obj.icon}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          })}

          {/* Empty State */}
          {processSteps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏊‍♂️</div>
                <h3 className="text-2xl font-bold text-white mb-3">Keine Prozesse in Swimlanes</h3>
                <p className="text-gray-400">Erstelle Prozessschritte, um sie hier zu sehen</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render process-centric view with flow diagram
  const renderProcessCentricView = () => {
    const connections = getConnections();
    
    // Sort connections by round and timestamp for chronological order
    const sortedConnections = [...connections].sort((a, b) => {
      const aMinRound = Math.min(...a.cards.map(c => c.round));
      const bMinRound = Math.min(...b.cards.map(c => c.round));
      if (aMinRound !== bMinRound) return aMinRound - bMinRound;
      return a.cards[0].timestamp - b.cards[0].timestamp;
    });
    
    // Smart flow layout - arrange in flowing pattern
    const flowLayout = sortedConnections.map((conn, index) => {
      // Stagger layout for visual flow
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      // Add slight offset for alternating pattern
      const offsetX = row % 2 === 0 ? 0 : 80;
      const offsetY = col === 1 ? 40 : 0;
      
      return {
        ...conn,
        x: col * 450 + 250 + offsetX,
        y: row * 380 + 200 + offsetY,
        index
      };
    });
    
    return (
      <div className="absolute inset-0 overflow-auto bg-gradient-to-br from-slate-900/50 via-indigo-900/30 to-slate-900/50" style={{ zIndex: 20 }}>
        <div className="relative min-h-full" style={{ minWidth: '1200px', padding: '80px 60px' }}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          </div>
          
          {/* SVG for connecting lines between process nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <marker
                id="arrowhead-process"
                markerWidth="12"
                markerHeight="12"
                refX="10"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon
                  points="0 0, 12 3, 0 6"
                  fill="url(#arrow-gradient)"
                  opacity="0.8"
                />
              </marker>
              
              <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.6 }} />
                <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
              </linearGradient>
              
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.6 }} />
                <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.4 }} />
              </linearGradient>
              
              {/* Glow filter for lines */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Draw flow lines between sequential processes */}
            {flowLayout.map((node, idx) => {
              if (idx === 0) return null;
              
              const prevNode = flowLayout[idx - 1];
              const fromX = prevNode.x;
              const fromY = prevNode.y + 100; // Start from bottom of card
              const toX = node.x;
              const toY = node.y - 100; // End at top of card
              
              // Check if processes are connected (share players)
              const isConnected = prevNode.to === node.from;
              
              // Beautiful curved path
              const controlY1 = fromY + 60;
              const controlY2 = toY - 60;
              
              // S-curve for smooth flow
              const path = `M ${fromX} ${fromY} C ${fromX} ${controlY1}, ${toX} ${controlY2}, ${toX} ${toY}`;
              
              return (
                <g key={`flow-${idx}`}>
                  {/* Glow background */}
                  <path
                    d={path}
                    stroke="url(#line-gradient)"
                    strokeWidth="8"
                    fill="none"
                    opacity="0.15"
                    filter="url(#glow)"
                  />
                  {/* Main line */}
                  <path
                    d={path}
                    stroke={isConnected ? "url(#line-gradient)" : "#6366f1"}
                    strokeWidth="3"
                    fill="none"
                    opacity={isConnected ? "0.7" : "0.3"}
                    strokeDasharray={isConnected ? "0" : "8,4"}
                    markerEnd="url(#arrowhead-process)"
                    className="transition-all"
                  />
                  
                  {/* Flow indicator circles */}
                  {isConnected && [0.3, 0.5, 0.7].map((t, i) => {
                    const x = fromX * Math.pow(1-t, 3) + 3 * fromX * Math.pow(1-t, 2) * t + 
                              3 * toX * (1-t) * Math.pow(t, 2) + toX * Math.pow(t, 3);
                    const y = fromY * Math.pow(1-t, 3) + 3 * controlY1 * Math.pow(1-t, 2) * t + 
                              3 * controlY2 * (1-t) * Math.pow(t, 2) + toY * Math.pow(t, 3);
                    
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#8b5cf6"
                        opacity="0.5"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.3;0.8;0.3"
                          dur="2s"
                          begin={`${i * 0.3}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          
          {/* Process Nodes */}
          {flowLayout.map((node) => {
            const fromPlayer = players.find(p => p.id === node.from);
            const toPlayer = players.find(p => p.id === node.to);
            
            if (!fromPlayer || !toPlayer) return null;
            
            return (
              <div
                key={`${node.from}-${node.to}`}
                className="absolute"
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                {/* Process Node Card */}
                <div
                  className="bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-indigo-500/40 hover:border-indigo-400/70 transition-all duration-500 p-6 cursor-pointer hover:scale-105 hover:-translate-y-2 relative group"
                  style={{ width: '340px' }}
                  onClick={() => {
                    if (node.cards.length > 0) {
                      setInspectedProcessStep(node.cards[0].id);
                    }
                  }}
                >
                  {/* Animated Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-20 blur group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    {/* Process Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <GitBranch className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400/70 tracking-wider">
                            PROZESS
                          </span>
                          <div className="text-lg font-black text-white">
                            #{node.index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl border border-indigo-400/30">
                        <span className="text-xs font-bold text-indigo-200">
                          {node.count} {node.count === 1 ? 'Schritt' : 'Schritte'}
                        </span>
                      </div>
                    </div>

                    {/* From Player - Pinned Badge */}
                    <div className="relative mb-8">
                      <div 
                        className="absolute -left-5 -top-3 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl border-4 border-slate-900 transform -rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer z-20"
                        style={{ 
                          backgroundColor: fromPlayer.color,
                          boxShadow: `0 12px 30px ${fromPlayer.color}60, inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.3)`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedPlayer(fromPlayer.id);
                        }}
                        title={fromPlayer.name}
                      >
                        <span className="drop-shadow-2xl filter brightness-110">{fromPlayer.icon}</span>
                        {/* Pin effect with shadow */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-3 border-slate-900 shadow-xl">
                          <div className="absolute inset-0 bg-white/30 rounded-full blur-sm"></div>
                        </div>
                      </div>
                      
                      <div 
                        className="ml-16 pl-5 py-3 rounded-xl border-l-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group/player"
                        style={{ 
                          borderColor: fromPlayer.color,
                          backgroundColor: fromPlayer.color + '15',
                          boxShadow: `inset 0 0 20px ${fromPlayer.color}10`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedPlayer(fromPlayer.id);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[10px] text-gray-400 font-bold tracking-widest">STARTER</div>
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: fromPlayer.color }}></div>
                        </div>
                        <div className="font-bold text-white text-base group-hover/player:text-lg transition-all">{fromPlayer.name}</div>
                        <div className="text-xs text-gray-400 italic">{fromPlayer.role}</div>
                      </div>
                    </div>

                    {/* Flow Arrow */}
                    <div className="flex justify-center mb-8 relative">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-1 bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent rounded-full"></div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                          <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                            <div className="text-white text-2xl font-bold animate-bounce">↓</div>
                          </div>
                        </div>
                        <div className="h-10 w-1 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent rounded-full"></div>
                      </div>
                    </div>

                    {/* To Player - Pinned Badge */}
                    <div className="relative mb-6">
                      <div 
                        className="absolute -right-5 -top-3 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl border-4 border-slate-900 transform rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer z-20"
                        style={{ 
                          backgroundColor: toPlayer.color,
                          boxShadow: `0 12px 30px ${toPlayer.color}60, inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255,255,255,0.3)`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedPlayer(toPlayer.id);
                        }}
                        title={toPlayer.name}
                      >
                        <span className="drop-shadow-2xl filter brightness-110">{toPlayer.icon}</span>
                        {/* Pin effect with shadow */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-3 border-slate-900 shadow-xl">
                          <div className="absolute inset-0 bg-white/30 rounded-full blur-sm"></div>
                        </div>
                      </div>
                      
                      <div 
                        className="mr-16 pr-5 py-3 rounded-xl border-r-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group/player"
                        style={{ 
                          borderColor: toPlayer.color,
                          backgroundColor: toPlayer.color + '15',
                          boxShadow: `inset 0 0 20px ${toPlayer.color}10`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedPlayer(toPlayer.id);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: toPlayer.color }}></div>
                          <div className="text-[10px] text-gray-400 font-bold tracking-widest">EMPFÄNGER</div>
                        </div>
                        <div className="font-bold text-white text-base text-right group-hover/player:text-lg transition-all">{toPlayer.name}</div>
                        <div className="text-xs text-gray-400 italic text-right">{toPlayer.role}</div>
                      </div>
                    </div>

                    {/* Communication Objects */}
                    {node.cards[0]?.communicationObjectIds && node.cards[0].communicationObjectIds.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest mb-2 text-center">KOMMUNIKATION</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {node.cards[0].communicationObjectIds.map(objId => {
                            const commObj = processObjects.find(obj => obj.id === objId);
                            if (!commObj) return null;
                            return (
                              <div
                                key={objId}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                                style={{ 
                                  backgroundColor: commObj.color + '30',
                                  border: `2px solid ${commObj.color}`,
                                  boxShadow: `0 4px 12px ${commObj.color}50, inset 0 0 20px ${commObj.color}20`
                                }}
                                title={commObj.name}
                              >
                                <span className="text-lg">{commObj.icon}</span>
                                <span className="font-semibold text-white">{commObj.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Latest Step Preview */}
                    {node.cards.length > 0 && (
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur"></div>
                        <div className="relative text-sm text-gray-200 line-clamp-3 bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl p-4 border border-indigo-400/30 italic leading-relaxed">
                          <span className="text-indigo-400 font-bold">"</span>
                          {node.cards[node.cards.length - 1].text}
                          <span className="text-indigo-400 font-bold">"</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {sortedConnections.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto border-2 border-indigo-500/30">
                    <GitBranch className="w-16 h-16 text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Keine Prozesse vorhanden</h3>
                <p className="text-gray-400 text-lg">Erstelle Prozessschritte zwischen Spielern</p>
                <div className="mt-6 text-sm text-gray-500">
                  Wechsel zurück zur Spieleransicht, um Prozesse zu erstellen
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Professional Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-white/10 shadow-2xl flex-shrink-0 relative z-50">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Processorix</h1>
              <p className="text-sm text-indigo-300">Kollaboratives Prozess-Mapping</p>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* View Mode Cycle Button */}
            <button
              onClick={() => {
                if (viewMode === 'player-centric') setViewMode('process-centric');
                else if (viewMode === 'process-centric') setViewMode('swimlane');
                else setViewMode('player-centric');
              }}
              className="flex items-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all border border-white/10"
              title={
                viewMode === 'player-centric' ? 'Zu Prozessansicht wechseln' : 
                viewMode === 'process-centric' ? 'Zu Swimlane-Ansicht wechseln' :
                'Zu Spieleransicht wechseln'
              }
            >
              {viewMode === 'player-centric' ? (
                <>
                  <Network className="w-5 h-5" />
                  <span className="hidden sm:inline">Prozessansicht</span>
                </>
              ) : viewMode === 'process-centric' ? (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="4" rx="1" />
                    <rect x="2" y="10" width="20" height="4" rx="1" />
                    <rect x="2" y="16" width="20" height="4" rx="1" />
                  </svg>
                  <span className="hidden sm:inline">Swimlane</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-5 h-5" />
                  <span className="hidden sm:inline">Spieleransicht</span>
                </>
              )}
            </button>
            
            {/* Switch to Player View Button */}
            {onSwitchToPlayerView && (
              <button
                onClick={onSwitchToPlayerView}
                className="flex items-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-all border border-purple-500/30"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Spieleransicht</span>
              </button>
            )}
            
            {/* Share Button */}
            {gameId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all shadow-lg font-semibold"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Teilen</span>
              </button>
            )}

            {/* Plus Button mit Dropdown */}
            <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg font-semibold relative z-[300]"
            >
              <Plus className="w-5 h-5" />
              Hinzufügen
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-800 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-2 z-[300]">
                <button
                  onClick={() => {
                    setShowPlayerModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Spieler</div>
                    <div className="text-xs text-gray-400">Neuen Teilnehmer hinzufügen</div>
                  </div>
                </button>
                
                <button
                  onClick={handleAddTestPlayers}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <span className="text-lg">🎭</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Test-Spieler</div>
                    <div className="text-xs text-gray-400">4 Demo-Spieler hinzufügen</div>
                  </div>
                </button>
                
                <button
                  onClick={handleAutoLayout}
                  disabled={players.filter(p => p.onBoard !== false).length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <LayoutGrid className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Auto-Layout</div>
                    <div className="text-xs text-gray-400">Spieler intelligent anordnen</div>
                  </div>
                </button>
                
                <button
                  onClick={handleAddTestProcesses}
                  disabled={players.filter(p => p.onBoard !== false).length < 4}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Test-Prozesse</div>
                    <div className="text-xs text-gray-400">4 Demo-Prozesse hinzufügen</div>
                  </div>
                </button>

                <button
                  onClick={handleAddSwimlaneTest}
                  disabled={players.filter(p => p.onBoard !== false).length < 4}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <span className="text-lg">🏊</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Swimlane-Test</div>
                    <div className="text-xs text-gray-400">7 lineare Demo-Prozesse</div>
                  </div>
                </button>
                
                <div className="h-px bg-white/10 my-1 mx-3"></div>
                <button
                  onClick={() => {
                    setShowProcessModal(true);
                    setShowDropdown(false);
                  }}
                  disabled={players.filter(p => p.onBoard !== false).length < 2}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Prozessschritt</div>
                    <div className="text-xs text-gray-400">Neue Verbindung erstellen</div>
                  </div>
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col gap-4 p-4 overflow-hidden"
        onMouseMove={draggedPlayer ? handleMouseMove : undefined}
        onMouseUp={draggedPlayer ? handleMouseUp : undefined}
      >
        {/* Communication Object Selection Banner */}
        {selectedCommObject && (
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-xl border-2 border-cyan-400/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{selectedCommObject.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    📡 {selectedCommObject.name} ausgewählt
                  </h3>
                  <p className="text-sm text-white/80">
                    Klicke auf eine Verbindung (Linie zwischen Spielern), um das Kommunikationsmittel hinzuzufügen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCommObject(null)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Decision Mode Banner */}
        {isDecisionMode && (
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl shadow-xl border-2 border-yellow-400/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  {selectedProcessObject && <span className="text-2xl">{selectedProcessObject.icon}</span>}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    🔀 Entscheidungsmodus aktiv
                  </h3>
                  <p className="text-sm text-white/80">
                    Klicke auf eine Verbindung (Linie zwischen Spielern) oder auf einen Spieler, um eine Entscheidung hinzuzufügen
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDecisionMode(false);
                  setDecisionStarter(null);
                  setSelectedProcessObject(null);
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Connector Mode Banner */}
        {isConnectorMode && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl border-2 border-purple-400/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  {selectedProcessObject && <span className="text-2xl">{selectedProcessObject.icon}</span>}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {connectorModeStep === 'starter' ? '📤 Wähle Prozessstarter' : '📥 Wähle Prozessempfänger'}
                  </h3>
                  <p className="text-sm text-white/80">
                    {connectorModeStep === 'starter' 
                      ? 'Klicke auf den Spieler, der den Prozess startet' 
                      : `Klicke auf den Empfänger (von: ${players.find(p => p.id === connectorStarter)?.name})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsConnectorMode(false);
                  setConnectorModeStep(null);
                  setConnectorStarter(null);
                  setConnectorEmpfaenger(null);
                  setSelectedProcessObject(null);
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-medium"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Hauptbereich mit Spielfeld */}
        <div className="flex-1 flex flex-row gap-4 overflow-hidden">
          {/* Game Board */}
          <div 
            ref={gameBoardRef}
            className={`${inspectedPlayer || inspectedProcessStep || inspectedDecisionBox || selectedObjectDetail ? 'flex-[2]' : 'flex-1'} bg-gradient-to-br from-slate-700/40 via-indigo-800/30 to-slate-700/40 backdrop-blur-sm rounded-3xl shadow-2xl border-2 ${isConnectorMode ? 'border-purple-400/50' : 'border-indigo-400/30'} p-8 relative overflow-hidden transition-all duration-300`}
            onMouseMove={handleDragConnectionMove}
            onMouseUp={(e) => {
              console.log('📋 Board mouseUp', { isDraggingConnection });
              if (isDraggingConnection) {
                // Check if we're over a player by finding the element at mouse position
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                const playerElement = elements.find(el => el.getAttribute('data-player-id'));
                const targetPlayerId = playerElement?.getAttribute('data-player-id');
                
                console.log('🔍 Found player at mouse position:', targetPlayerId);
                handleEndDragConnection(e, targetPlayerId || undefined);
              }
            }}
          >
          
          {/* Render based on viewMode */}
          {viewMode === 'process-centric' ? (
            renderProcessCentricView()
          ) : viewMode === 'swimlane' ? (
            renderSwimlaneView()
          ) : (
            <>
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 16, pointerEvents: 'auto' }}>
            <defs>
              {players.map((player) => (
                <marker
                  key={`arrow-${player.id}`}
                  id={`arrowhead-${player.id}`}
                  markerWidth="3"
                  markerHeight="3"
                  refX="0"
                  refY="1.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 3 1.5, 0 3"
                    fill={player.color}
                    opacity="0.9"
                  />
                </marker>
              ))}
            </defs>

            {/* Orange-style dragging connection line */}
            {isDraggingConnection && dragConnectionFrom && dragConnectionPosition && (() => {
              const fromPlayer = players.find(p => p.id === dragConnectionFrom);
              if (!fromPlayer) return null;
              
              const fromIndex = players.indexOf(fromPlayer);
              const fromPos = getPlayerPosition(fromPlayer, fromIndex, players.filter(p => p.onBoard !== false).length);
              
              // Get port position for drag start
              const startPort = getPlayerPortPosition(fromPos, dragConnectionPosition, true);
              
              return (
                <line
                  x1={startPort.x}
                  y1={startPort.y}
                  x2={dragConnectionPosition.x}
                  y2={dragConnectionPosition.y}
                  stroke={fromPlayer.color}
                  strokeWidth="0.8"
                  strokeDasharray="4,4"
                  opacity="0.8"
                  style={{ pointerEvents: 'none' }}
                />
              );
            })()}

            {/* Draw connections */}
            {getConnections().map((conn) => {
              const fromPlayer = players.find(p => p.id === conn.from);
              const toPlayer = players.find(p => p.id === conn.to);
              
              if (!fromPlayer || !toPlayer) return null;
              
              const fromIndex = players.indexOf(fromPlayer);
              const toIndex = players.indexOf(toPlayer);
              const fromPos = getPlayerPosition(fromPlayer, fromIndex, players.length);
              const toPos = getPlayerPosition(toPlayer, toIndex, players.length);
              
              // Get port positions (lines start/end at ports, not center)
              const startPort = getPlayerPortPosition(fromPos, toPos, true);
              const endPort = getPlayerPortPosition(fromPos, toPos, false);
              
              // Use helper function to calculate curve
              const { controlX, controlY } = calculateCurveControlPoint(
                fromPos,
                toPos,
                conn.from,
                conn.to
              );
              
              const path = `M ${startPort.x} ${startPort.y} Q ${controlX} ${controlY} ${endPort.x} ${endPort.y}`;
              const isSelected = selectedConnection?.from === conn.from && selectedConnection?.to === conn.to;
              const isHovered = hoveredConnection?.from === conn.from && hoveredConnection?.to === conn.to;
              
              // Communication objects are rendered separately
              
              return (
                <g key={`${conn.from}-${conn.to}`} style={{ pointerEvents: 'auto' }}>
                  {/* Invisible wider path for easier clicking */}
                  <path
                    d={path}
                    stroke="transparent"
                    strokeWidth="20"
                    fill="none"
                    style={{ cursor: selectedCommObject ? 'copy' : 'pointer', pointerEvents: 'stroke' }}
                    onClick={(e) => {
                      console.log('CONNECTION CLICKED!', 'from:', conn.from, 'to:', conn.to);
                      e.stopPropagation();
                      
                      // Wenn im Entscheidungs-Modus, öffne das Modal
                      if (isDecisionMode && selectedProcessObject) {
                        setDecisionStarter(conn.from);
                        setShowDecisionModal(true);
                        return;
                      }
                      
                      // Wenn ein Kommunikationsmittel ausgewählt ist, füge es hinzu
                      if (selectedCommObject && onUpdateCard) {
                        conn.cards.forEach(card => {
                          const existingIds = card.communicationObjectIds || [];
                          // Füge das neue Icon hinzu, wenn es noch nicht vorhanden ist
                          if (!existingIds.includes(selectedCommObject.id)) {
                            onUpdateCard(card.id, { 
                              communicationObjectIds: [...existingIds, selectedCommObject.id] 
                            });
                          }
                        });
                        // Deselektiere das Kommunikationsmittel
                        setSelectedCommObject(null);
                      } else {
                        // Normaler Click: Zeige Details
                        setSelectedConnectionDetail({ 
                          from: conn.from, 
                          to: conn.to,
                          x: e.clientX,
                          y: e.clientY
                        });
                      }
                    }}
                    onMouseEnter={() => {
                      console.log('Connection hover START');
                      setHoveredConnection({ from: conn.from, to: conn.to });
                    }}
                    onMouseLeave={() => {
                      console.log('Connection hover END');
                      setHoveredConnection(null);
                    }}
                  />
                  {/* Visible path */}
                  <path
                    d={path}
                    stroke={fromPlayer.color}
                    strokeWidth={isSelected ? "0.8" : isHovered ? "0.7" : "0.5"}
                    fill="none"
                    opacity={isSelected ? "1" : isHovered ? "0.9" : "0.75"}
                    markerEnd={`url(#arrowhead-${fromPlayer.id})`}
                    className="transition-all"
                    style={{
                      filter: isSelected 
                        ? 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' 
                        : (isHovered || selectedCommObject)
                        ? 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' 
                        : 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </g>
              );
            })}
            
            {/* Decision box connections */}
            {decisionBoxes.map((decisionBox) => {
              const fromPlayer = players.find(p => p.id === decisionBox.fromPlayerId);
              if (!fromPlayer) return null;
              
              const fromIndex = players.indexOf(fromPlayer);
              const fromPos = getPlayerPosition(fromPlayer, fromIndex, players.length);
              const boxPos = decisionBox.position;
              
              // Line from player to decision box (straight line)
              const lineToBox = (
                <g key={`line-to-${decisionBox.id}`}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={boxPos.x}
                    y2={boxPos.y}
                    stroke={fromPlayer.color}
                    strokeWidth="0.6"
                    strokeDasharray="4,4"
                    opacity="0.8"
                    markerEnd={`url(#arrowhead-${fromPlayer.id})`}
                  />
                </g>
              );
              
              // Lines from decision box to target players (curved only for back-connections)
              const linesToTargets = decisionBox.options.map((option, optionIndex) => {
                const toPlayer = players.find(p => p.id === option.toPlayerId);
                if (!toPlayer) return null;
                
                const toIndex = players.indexOf(toPlayer);
                const toPos = getPlayerPosition(toPlayer, toIndex, players.length);
                
                // Get end port position (decision box to player port)
                const endPort = getPlayerPortPosition(boxPos, toPos, false);
                
                // Check if this is a connection back to the same player
                const isBackToSame = option.toPlayerId === decisionBox.fromPlayerId;
                
                // Calculate curved path
                const dx = toPos.x - boxPos.x;
                const dy = toPos.y - boxPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // More curve for back connections, less for normal ones
                const controlPointDistance = isBackToSame ? distance * 0.8 : distance * 0.3;
                
                const midX = (boxPos.x + toPos.x) / 2;
                const midY = (boxPos.y + toPos.y) / 2;
                const perpX = -dy / distance;
                const perpY = dx / distance;
                
                // Direction: alternate for multiple options
                const curveDirection = optionIndex % 2 === 0 ? 1 : -1;
                
                const controlX = midX + perpX * controlPointDistance * curveDirection;
                const controlY = midY + perpY * controlPointDistance * curveDirection;
                
                const path = `M ${boxPos.x} ${boxPos.y} Q ${controlX} ${controlY} ${endPort.x} ${endPort.y}`;
                
                const decisionLineKey = `decision-${decisionBox.id}-option-${optionIndex}`;
                const isHoveredDecision = hoveredConnection?.from === decisionLineKey;
                
                return (
                  <g key={`line-from-${decisionBox.id}-to-${option.toPlayerId}-${optionIndex}`} style={{ pointerEvents: 'auto' }}>
                    {/* Invisible wider path for easier clicking */}
                    <path
                      d={path}
                      stroke="transparent"
                      strokeWidth="20"
                      fill="none"
                      style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show quick info card like normal process connections
                        setSelectedConnectionDetail({ 
                          from: decisionLineKey,
                          to: option.toPlayerId,
                          x: e.clientX,
                          y: e.clientY,
                          decisionBox: decisionBox
                        } as any);
                      }}
                      onMouseEnter={() => {
                        setHoveredConnection({ from: decisionLineKey, to: option.toPlayerId });
                      }}
                      onMouseLeave={() => {
                        setHoveredConnection(null);
                      }}
                    />
                    {/* Visible path */}
                    <path
                      d={path}
                      stroke={fromPlayer.color}
                      strokeWidth={isHoveredDecision ? "0.7" : "0.6"}
                      fill="none"
                      opacity={isHoveredDecision ? "1" : "0.8"}
                      markerEnd={`url(#arrowhead-${fromPlayer.id})`}
                      className="transition-all"
                      style={{ 
                        pointerEvents: 'none',
                        filter: isHoveredDecision ? 'drop-shadow(0 0 4px rgba(255,255,255,0.4))' : 'none'
                      }}
                    />
                  </g>
                );
              });
              
              return [lineToBox, ...linesToTargets];
            })}
          </svg>

          {/* Communication icons on connections (rendered outside SVG) */}
          {getConnections().map((conn) => {
            const fromPlayer = players.find(p => p.id === conn.from);
            const toPlayer = players.find(p => p.id === conn.to);
            
            if (!fromPlayer || !toPlayer) return null;
            
            const fromIndex = players.indexOf(fromPlayer);
            const toIndex = players.indexOf(toPlayer);
            const fromPos = getPlayerPosition(fromPlayer, fromIndex, players.length);
            const toPos = getPlayerPosition(toPlayer, toIndex, players.length);
            
            // Use helper function to calculate curve (same logic as line drawing)
            const { controlX, controlY } = calculateCurveControlPoint(
              fromPos,
              toPos,
              conn.from,
              conn.to
            );
            
            const firstCard = conn.cards[0];
            const commObjectIds = firstCard?.communicationObjectIds || [];
            const commObjects = commObjectIds
              .map(id => processObjects.find(obj => obj.id === id))
              .filter(obj => obj !== undefined) as ProcessObject[];
            
            // Get port positions for curve calculation
            const startPort = getPlayerPortPosition(fromPos, toPos, true);
            const endPort = getPlayerPortPosition(fromPos, toPos, false);
            
            return commObjects.map((commObject, iconIdx) => {
              const numIcons = commObjects.length;
              let t: number;
              
              if (numIcons === 1) {
                t = 0.5;
              } else {
                t = 0.3 + (iconIdx / (numIcons - 1)) * 0.4;
              }
              
              // Use port positions instead of center positions for curve
              const iconX = Math.pow(1 - t, 2) * startPort.x + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endPort.x;
              const iconY = Math.pow(1 - t, 2) * startPort.y + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endPort.y;
              
              return (
                <div
                  key={`conn-icon-${conn.from}-${conn.to}-${iconIdx}`}
                  className="absolute group"
                  style={{
                    left: `${iconX}%`,
                    top: `${iconY}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                    zIndex: 17,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-all"
                    style={{
                      backgroundColor: commObject.color + '30',
                      border: `2px solid ${commObject.color}`,
                      boxShadow: `0 0 0 3px rgba(51, 65, 85, 0.8), 0 4px 12px rgba(0,0,0,0.4)`,
                    }}
                    title={`${commObject.name} (Linksklick für Details, Rechtsklick zum Entfernen)`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedObjectDetail(commObject);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onUpdateCard) {
                        conn.cards.forEach(card => {
                          const updatedIds = (card.communicationObjectIds || []).filter(id => id !== commObject.id);
                          onUpdateCard(card.id, { communicationObjectIds: updatedIds });
                        });
                      }
                    }}
                  >
                    {commObject.icon}
                  </div>
                </div>
              );
            });
          })}

          {/* Drop zones for communication objects on connections */}
          <div 
            className="absolute inset-0 w-full h-full" 
            style={{ zIndex: 15, pointerEvents: isDraggingCommObject ? 'auto' : 'none' }}
            onDragEnter={() => setIsDraggingCommObject(true)}
            onDragLeave={(e) => {
              // Only reset if leaving the entire container
              if (e.currentTarget === e.target) {
                setIsDraggingCommObject(false);
              }
            }}
          >
            {getConnections().map((conn) => {
              const fromPlayer = players.find(p => p.id === conn.from);
              const toPlayer = players.find(p => p.id === conn.to);
              
              if (!fromPlayer || !toPlayer) return null;
              
              const fromIndex = players.indexOf(fromPlayer);
              const toIndex = players.indexOf(toPlayer);
              const fromPos = getPlayerPosition(fromPlayer, fromIndex, players.length);
              const toPos = getPlayerPosition(toPlayer, toIndex, players.length);
              
              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;
              
              return (
                <div
                  key={`drop-${conn.from}-${conn.to}`}
                  className="absolute"
                  style={{
                    left: `${midX}%`,
                    top: `${midY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    pointerEvents: 'auto',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const communicationObjectId = e.dataTransfer.getData('communicationObjectId');
                    const placedObjectIndex = e.dataTransfer.getData('placedObjectIndex');
                    
                    if (communicationObjectId && onUpdateCard) {
                      // Remove from placed objects if it was a placed object
                      if (placedObjectIndex) {
                        const idx = parseInt(placedObjectIndex);
                        setPlacedCommObjects(prev => prev.filter((_, i) => i !== idx));
                      }
                      
                      // Update alle cards in dieser Connection
                      conn.cards.forEach(card => {
                        const existingIds = card.communicationObjectIds || [];
                        // Füge das neue Icon hinzu, wenn es noch nicht vorhanden ist
                        if (!existingIds.includes(communicationObjectId)) {
                          onUpdateCard(card.id, { 
                            communicationObjectIds: [...existingIds, communicationObjectId] 
                          });
                        }
                      });
                    }
                    setIsDraggingCommObject(false);
                  }}
                />
              );
            })}
          </div>

          {/* Players positioned in circle */}
          <div 
            ref={gameBoardRef}
            className="relative w-full h-full" 
            style={{ zIndex: 20, pointerEvents: (draggedPlayer || isDraggingCommObject) ? 'auto' : 'none' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={(e) => handleMouseUp(e)}
            onClick={() => setContextMenuPlayer(null)}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingCommObject(false);
              
              const communicationObjectId = e.dataTransfer.getData('communicationObjectId');
              const placedObjectIndex = e.dataTransfer.getData('placedObjectIndex');
              
              if (communicationObjectId && gameBoardRef.current) {
                const rect = gameBoardRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                // Remove old placed object if it was moved
                if (placedObjectIndex) {
                  const idx = parseInt(placedObjectIndex);
                  setPlacedCommObjects(prev => {
                    const filtered = prev.filter((_, i) => i !== idx);
                    return [...filtered, { objectId: communicationObjectId, x, y }];
                  });
                } else {
                  // New object from toolbox
                  setPlacedCommObjects(prev => [...prev, { objectId: communicationObjectId, x, y }]);
                }
              }
            }}
          >
            {/* Drag Preview für Spieler aus Wartebereich */}
            {draggedPlayer && dragPreviewPosition && (() => {
              const player = players.find(p => p.id === draggedPlayer);
              if (!player || player.onBoard !== false) return null;
              
              return (
                <div
                  key={`preview-${player.id}`}
                  className="absolute"
                  style={{
                    left: `${dragPreviewPosition.x}%`,
                    top: `${dragPreviewPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.7,
                    pointerEvents: 'none',
                    zIndex: 100,
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-4xl relative overflow-hidden"
                      style={{
                        backgroundColor: player.color,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)',
                      }}
                    >
                      <div className="relative z-10 drop-shadow-lg">
                        {player.icon}
                      </div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                      <div className="font-bold text-white text-sm drop-shadow-lg">{player.name}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap mt-1">
                      <div
                        className="text-[11px] font-semibold px-3 py-1 rounded-md shadow-lg inline-block"
                        style={{
                          backgroundColor: player.color,
                          color: 'white',
                        }}
                      >
                        {player.role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {players.filter(p => p.onBoard !== false).map((player, index) => {
              const onBoardPlayers = players.filter(p => p.onBoard !== false);
              const pos = getPlayerPosition(player, index, onBoardPlayers.length);
              
              const isFromPlayer = selectedFromPlayer === player.id;
              const isToPlayer = selectedToPlayer === player.id;
              const isDragging = draggedPlayer === player.id;
              const hasContextMenu = contextMenuPlayer === player.id;
              
              // Connector mode highlighting
              const isConnectorStarter = isConnectorMode && connectorStarter === player.id;
              const isConnectorEmpfaenger = isConnectorMode && connectorEmpfaenger === player.id;
              
              return (
                <div
                  key={player.id}
                  className="absolute"
                  data-player-id={player.id}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: 20,
                    pointerEvents: 'auto',
                  }}
                >
                  {/* Player piece */}
                  <div
                    data-player-id={player.id}
                    onClick={(e) => {
                      if (showProcessModal || isConnectorMode || isDecisionMode) {
                        handlePlayerClick(player.id);
                      } else {
                        handlePlayerContextClick(e, player.id);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, player.id);
                    }}
                    className={`relative transition-all duration-300 ${
                      isDragging ? 'scale-105 opacity-80' : ''
                    } ${isFromPlayer || isToPlayer || isConnectorStarter || isConnectorEmpfaenger ? 'scale-110' : 'hover:scale-105'}`}
                    style={{ pointerEvents: 'auto', cursor: isDragging ? 'grabbing' : ((isConnectorMode || isDecisionMode) ? 'pointer' : 'grab') }}
                  >
                    {/* Spielfigur mit 3D-Effekt */}
                    <div className="relative">
                      {/* Hauptkörper der Spielfigur */}
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl relative overflow-hidden"
                        style={{
                          backgroundColor: player.color,
                          boxShadow: isConnectorStarter
                            ? `0 6px 16px rgba(0,0,0,0.3), 0 0 0 4px #a855f7, inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`
                            : isConnectorEmpfaenger
                            ? `0 6px 16px rgba(0,0,0,0.3), 0 0 0 4px #ec4899, inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`
                            : isFromPlayer
                            ? `0 6px 16px rgba(0,0,0,0.3), 0 0 0 4px #fbbf24, inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`
                            : isToPlayer
                            ? `0 6px 16px rgba(0,0,0,0.3), 0 0 0 4px #10b981, inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`
                            : `0 6px 16px rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`,
                        }}
                      >
                        {/* Subtiler Glanzeffekt oben links */}
                        <div 
                          className="absolute top-2 left-2 w-8 h-8 rounded-full pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, transparent 70%)',
                          }}
                        />
                        
                        {/* Icon mit leichtem Schatten */}
                        <div className="relative z-10 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                          {player.icon}
                        </div>
                      </div>
                      
                      {/* Highlight Ring */}
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-white/30 pointer-events-none"
                        style={{
                          top: '-2px',
                          left: '-2px',
                          right: '-2px',
                          bottom: '-2px',
                        }}
                      />
                      
                      {/* Connection Port (Orange-style) - Right side */}
                      <div
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-125 shadow-lg border-2 border-white group-hover:opacity-100 opacity-60"
                        style={{ pointerEvents: 'auto' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleStartDragConnection(e, player.id);
                        }}
                        title="Verbindung erstellen"
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Connection Port - Left side (input) */}
                      <div
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center transition-all shadow-lg border-2 border-white opacity-60 group-hover:opacity-100"
                        style={{ pointerEvents: 'none' }}
                        title="Eingang"
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Player Info Card - appears on normal click */}
                    {selectedPlayerDetail === player.id && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-50 w-80">
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                            <div>
                              <h3 className="font-bold text-white text-lg">{player.name}</h3>
                              <p className="text-sm text-gray-400">{player.role}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlayerDetail(null);
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>

                          {/* Info sections */}
                          <div className="space-y-3">
                            {player.input && (
                              <div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20">
                                <div className="text-xs font-semibold text-indigo-300 mb-1">📥 Input</div>
                                <div className="text-sm text-white">{player.input}</div>
                              </div>
                            )}
                            
                            {player.output && (
                              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                                <div className="text-xs font-semibold text-purple-300 mb-1">📤 Output</div>
                                <div className="text-sm text-white">{player.output}</div>
                              </div>
                            )}
                            
                            {player.medium && (
                              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                                <div className="text-xs font-semibold text-cyan-300 mb-1">📡 Medium</div>
                                <div className="text-sm text-white">{player.medium}</div>
                              </div>
                            )}
                            
                            {player.processRole && (
                              <div className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/20">
                                <div className="text-xs font-semibold text-pink-300 mb-1">👤 Rolle im Prozess</div>
                                <div className="text-sm text-white">{player.processRole}</div>
                              </div>
                            )}

                            {/* Show message if no additional info */}
                            {!player.input && !player.output && !player.medium && !player.processRole && (
                              <div className="text-center py-4 text-gray-400 text-sm">
                                Keine zusätzlichen Informationen
                              </div>
                            )}
                          </div>

                          {/* Inspect Button */}
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlayerDetail(null);
                                setInspectedPlayer(player.id);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors text-sm font-medium"
                            >
                              <Users className="w-4 h-4" />
                              Detailliert inspizieren
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Context Menu - appears on right-click */}
                    {hasContextMenu && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-2 z-50 min-w-[200px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuPlayer(null);
                            setShowProcessModal(true);
                            setSelectedFromPlayer(player.id);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                            <GitBranch className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">Prozessschritt</div>
                            <div className="text-xs text-gray-400">Von hier aus erstellen</div>
                          </div>
                        </button>
                        <div className="h-px bg-white/10 my-1 mx-3"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemovePlayer(player.id);
                            setContextMenuPlayer(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left group"
                        >
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">Löschen</div>
                            <div className="text-xs text-gray-400">Spieler entfernen</div>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Name */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                      <div className="font-bold text-white text-sm drop-shadow-lg">{player.name}</div>
                    </div>

                    {/* Role label directly below card */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 whitespace-nowrap mt-1">
                      <div
                        className="text-[11px] font-semibold px-3 py-1 rounded-md shadow-lg inline-block"
                        style={{
                          backgroundColor: player.color,
                          color: 'white',
                        }}
                      >
                        {player.role}
                      </div>
                    </div>

                    {/* Selection hints */}
                    {isFromPlayer && (
                      <div className="absolute top-full mt-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="bg-yellow-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                          VON
                        </div>
                      </div>
                    )}
                    {isToPlayer && (
                      <div className="absolute top-full mt-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="bg-green-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                          AN
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Placed Communication Objects */}
            {placedCommObjects.map((placed, idx) => {
              const commObj = processObjects.find(obj => obj.id === placed.objectId);
              if (!commObj) return null;

              return (
                <div
                  key={`placed-comm-${idx}`}
                  className="absolute group"
                  style={{
                    left: `${placed.x}%`,
                    top: `${placed.y}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                    zIndex: 25,
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('communicationObjectId', commObj.id);
                    e.dataTransfer.setData('placedObjectIndex', idx.toString());
                    e.dataTransfer.effectAllowed = 'move';
                    setIsDraggingCommObject(true);
                  }}
                  onDragEnd={() => {
                    setIsDraggingCommObject(false);
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all group-hover:scale-110 cursor-move"
                    style={{
                      backgroundColor: commObj.color + '40',
                      borderColor: commObj.color,
                    }}
                    title={`${commObj.name} (Ziehen zum Verschieben)`}
                  >
                    {commObj.icon}
                  </div>
                  {/* Remove button */}
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlacedCommObjects(prev => prev.filter((_, i) => i !== idx));
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span className="text-white text-xs font-bold">×</span>
                  </button>
                </div>
              );
            })}
            
            {/* Decision Boxes */}
            {decisionBoxes.map((decisionBox) => {
              const fromPlayer = players.find(p => p.id === decisionBox.fromPlayerId);
              if (!fromPlayer) return null;
              
              const isDraggingDecision = draggedPlayer === `decision-${decisionBox.id}`;
              
              return (
                <div
                  key={decisionBox.id}
                  className="absolute group"
                  style={{
                    left: `${decisionBox.position.x}%`,
                    top: `${decisionBox.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isDraggingDecision ? 30 : 18,
                    pointerEvents: 'auto',
                    cursor: isDraggingDecision ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, `decision-${decisionBox.id}`);
                  }}
                  onClick={(e) => {
                    if (!isDraggingDecision) {
                      e.stopPropagation();
                      setInspectedDecisionBox(decisionBox.id);
                    }
                  }}
                >
                  {/* Diamond-shaped decision box */}
                  <div className="relative">
                    {/* Main diamond */}
                    <div 
                      className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 transform rotate-45 rounded shadow-xl border-2 border-white/50 hover:scale-110 transition-all"
                      style={{
                        boxShadow: isDraggingDecision 
                          ? '0 8px 24px rgba(251, 191, 36, 0.6), 0 0 0 3px rgba(251, 191, 36, 0.3)' 
                          : '0 4px 12px rgba(0,0,0,0.3), 0 2px 6px rgba(251, 191, 36, 0.4)',
                      }}
                      title={decisionBox.question}
                    >
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded opacity-60"></div>
                      
                      {/* Icon container (counter-rotated) */}
                      <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                        <span className="text-2xl drop-shadow-md">❓</span>
                      </div>
                    </div>
                    
                    {/* Question label on hover */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-40">
                      <div className="bg-slate-900/95 backdrop-blur-xl text-white text-[10px] px-2.5 py-1.5 rounded-md shadow-xl border border-white/20 text-center font-semibold">
                        {decisionBox.question}
                      </div>
                    </div>
                    
                    {/* Option labels around the diamond */}
                    {decisionBox.options.map((option, index) => {
                      const angle = (360 / decisionBox.options.length) * index + 90;
                      const radius = 50;
                      const x = Math.cos((angle * Math.PI) / 180) * radius;
                      const y = Math.sin((angle * Math.PI) / 180) * radius;
                      
                      return (
                        <div
                          key={option.label}
                          className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div 
                            className="px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-md border border-white/30 whitespace-nowrap"
                            style={{
                              backgroundColor: option.color || fromPlayer.color
                            }}
                          >
                            {option.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Remove button */}
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border border-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDecisionBoxes(prev => prev.filter(d => d.id !== decisionBox.id));
                    }}
                    style={{ pointerEvents: 'auto', zIndex: 30 }}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
            </div>
            {/* End of Zoom and Pan Transform Container */}

            {/* Empty state */}
            {players.filter(p => p.onBoard !== false).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5 }}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ziehe Spieler hier rein</h3>
                  <p className="text-gray-400 mb-4">Spieler aus dem Wartebereich unten hochziehen</p>
                </div>
              </div>
            )}

            {/* Spielfeld-Grid (dezent im Hintergrund) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ zIndex: 1 }}>
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            </>
          )}
          </div>

          {/* Inspector Panel - Right Side */}
          {inspectedPlayer && (() => {
          const player = players.find(p => p.id === inspectedPlayer);
          if (!player) return null;

          const playerSteps = cards.filter(c => c.fromPlayerId === player.id || c.toPlayerId === player.id);
          const stepsFrom = cards.filter(c => c.fromPlayerId === player.id);
          const stepsTo = cards.filter(c => c.toPlayerId === player.id);

          return (
            <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-indigo-400/30 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                      <p className="text-sm text-gray-400">{player.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedPlayer(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                {/* Statistics Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-500/20 rounded-lg p-3 border border-indigo-500/30">
                    <div className="text-2xl font-bold text-white">{playerSteps.length}</div>
                    <div className="text-xs text-indigo-300">Gesamt</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                    <div className="text-2xl font-bold text-white">{stepsFrom.length}</div>
                    <div className="text-xs text-purple-300">Gesendet</div>
                  </div>
                  <div className="bg-pink-500/20 rounded-lg p-3 border border-pink-500/30">
                    <div className="text-2xl font-bold text-white">{stepsTo.length}</div>
                    <div className="text-xs text-pink-300">Empfangen</div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Additional Info Section */}
                {(player.input || player.output || player.medium || player.processRole) && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        📋
                      </div>
                      Informationen
                    </h3>
                    <div className="space-y-3">
                      {player.input && (
                        <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                          <div className="text-xs font-semibold text-indigo-300 mb-2">📥 Input</div>
                          <div className="text-white">{player.input}</div>
                        </div>
                      )}
                      {player.output && (
                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                          <div className="text-xs font-semibold text-purple-300 mb-2">📤 Output</div>
                          <div className="text-white">{player.output}</div>
                        </div>
                      )}
                      {player.medium && (
                        <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                          <div className="text-xs font-semibold text-cyan-300 mb-2">📡 Medium</div>
                          <div className="text-white">{player.medium}</div>
                        </div>
                      )}
                      {player.processRole && (
                        <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                          <div className="text-xs font-semibold text-pink-300 mb-2">👤 Rolle im Prozess</div>
                          <div className="text-white">{player.processRole}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sent Process Steps */}
                {stepsFrom.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        📤
                      </div>
                      Gesendete Prozessschritte
                      <span className="text-sm font-normal text-gray-400">({stepsFrom.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {stepsFrom.map((step, index) => {
                        const toPlayer = players.find(p => p.id === step.toPlayerId);
                        return (
                          <div
                            key={step.id}
                            onClick={() => {
                              setInspectedPlayer(null);
                              setInspectedProcessStep(step.id);
                            }}
                            className="bg-slate-700/50 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ backgroundColor: player.color }}
                              >
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-white leading-relaxed">{step.text}</p>
                                {(step.medium || step.duration || step.description) && (
                                  <div className="text-xs text-indigo-400 mt-1">• Details verfügbar</div>
                                )}
                              </div>
                            </div>
                            {toPlayer && (
                              <div className="flex items-center gap-2 text-sm pl-11">
                                <div className="text-gray-400">→ An:</div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                    style={{ backgroundColor: toPlayer.color }}
                                  >
                                    {toPlayer.icon}
                                  </div>
                                  <span className="text-white font-medium">{toPlayer.name}</span>
                                  <span className="text-gray-400 text-xs">({toPlayer.role})</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Received Process Steps */}
                {stepsTo.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        📥
                      </div>
                      Empfangene Prozessschritte
                      <span className="text-sm font-normal text-gray-400">({stepsTo.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {stepsTo.map((step) => {
                        const fromPlayer = players.find(p => p.id === step.fromPlayerId);
                        return (
                          <div
                            key={step.id}
                            onClick={() => {
                              setInspectedPlayer(null);
                              setInspectedProcessStep(step.id);
                            }}
                            className="bg-slate-700/50 rounded-lg p-4 border border-white/10 hover:border-pink-500/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              {fromPlayer && (
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center text-lg flex-shrink-0"
                                  style={{ backgroundColor: fromPlayer.color }}
                                >
                                  {fromPlayer.icon}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-white leading-relaxed">{step.text}</p>
                                {(step.medium || step.duration || step.description) && (
                                  <div className="text-xs text-indigo-400 mt-1">• Details verfügbar</div>
                                )}
                              </div>
                            </div>
                            {fromPlayer && (
                              <div className="flex items-center gap-2 text-sm pl-11">
                                <div className="text-gray-400">Von:</div>
                                <span className="text-white font-medium">{fromPlayer.name}</span>
                                <span className="text-gray-400 text-xs">({fromPlayer.role})</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Process Steps */}
                {playerSteps.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <GitBranch className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400">Noch keine Prozessschritte</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Process Step Inspector - Split Screen */}
        {inspectedProcessStep && (() => {
          const step = cards.find(c => c.id === inspectedProcessStep);
          if (!step) return null;

          const fromPlayer = players.find(p => p.id === step.fromPlayerId);
          const toPlayer = players.find(p => p.id === step.toPlayerId);

          return (
            <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-indigo-400/30 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <GitBranch className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Prozessschritt Details</h2>
                      <p className="text-xs text-gray-400">
                        {new Date(step.timestamp).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedProcessStep(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Title */}
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-2">Titel</div>
                  <div className="text-xl font-semibold text-white">{step.text}</div>
                </div>

                {/* From/To */}
                <div className="flex items-center gap-4">
                  {fromPlayer && (
                    <div className="flex-1 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                      <div className="text-xs font-semibold text-yellow-300 mb-2">📤 Von</div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: fromPlayer.color }}
                        >
                          {fromPlayer.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{fromPlayer.name}</div>
                          <div className="text-xs text-gray-400">{fromPlayer.role}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-gray-400 text-2xl">→</div>

                  {toPlayer && (
                    <div className="flex-1 bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <div className="text-xs font-semibold text-green-300 mb-2">📥 An</div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: toPlayer.color }}
                        >
                          {toPlayer.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{toPlayer.name}</div>
                          <div className="text-xs text-gray-400">{toPlayer.role}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Communication Objects */}
                {step.communicationObjectIds && step.communicationObjectIds.length > 0 && (
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-xs font-semibold text-blue-300 mb-3">💬 Kommunikationsmittel</div>
                    <div className="flex flex-wrap gap-2">
                      {step.communicationObjectIds.map(objId => {
                        const commObj = processObjects.find(obj => obj.id === objId);
                        if (!commObj) return null;
                        return (
                          <div
                            key={objId}
                            onClick={() => setSelectedObjectDetail(commObj)}
                            className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 border border-white/10 hover:bg-slate-600/50 hover:border-blue-400/50 transition-all cursor-pointer"
                            style={{ borderColor: commObj.color + '40' }}
                          >
                            <span className="text-xl">{commObj.icon}</span>
                            <span className="text-white text-sm">{commObj.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {(step.medium || step.duration || step.description) && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    {step.medium && (
                      <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                        <div className="text-xs font-semibold text-cyan-300 mb-2">📡 Medium (Text)</div>
                        <div className="text-white">{step.medium}</div>
                      </div>
                    )}

                    {step.duration && (
                      <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                        <div className="text-xs font-semibold text-indigo-300 mb-2">⏱️ Dauer</div>
                        <div className="text-white">{step.duration}</div>
                      </div>
                    )}

                    {step.description && (
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-xs font-semibold text-purple-300 mb-2">📝 Beschreibung</div>
                        <div className="text-white whitespace-pre-wrap">{step.description}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show message if no additional info */}
                {!step.medium && !step.duration && !step.description && (!step.communicationObjectIds || step.communicationObjectIds.length === 0) && (
                  <div className="text-center py-6 text-gray-400 text-sm bg-slate-700/30 rounded-lg">
                    Keine zusätzlichen Informationen vorhanden
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Decision Box Inspector - Split Screen */}
        {inspectedDecisionBox && (() => {
          const decisionBox = decisionBoxes.find(db => db.id === inspectedDecisionBox);
          if (!decisionBox) return null;

          const fromPlayer = players.find(p => p.id === decisionBox.fromPlayerId);

          return (
            <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-400/30 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center transform rotate-45">
                      <span className="transform -rotate-45 text-2xl">❓</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Entscheidung</h2>
                      <p className="text-xs text-gray-400">
                        {decisionBox.type === 'binary' ? 'Binär' : 'Mehrfach'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedDecisionBox(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Question */}
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-2">Fragestellung</div>
                  <div className="text-xl font-semibold text-white">{decisionBox.question}</div>
                </div>

                {/* From Player */}
                {fromPlayer && (
                  <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                    <div className="text-xs font-semibold text-yellow-300 mb-2">🎯 Ausgangspunkt</div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: fromPlayer.color }}
                      >
                        {fromPlayer.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{fromPlayer.name}</div>
                        <div className="text-xs text-gray-400">{fromPlayer.role}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔀</span>
                    Optionen ({decisionBox.options.length})
                  </div>
                  <div className="space-y-3">
                    {decisionBox.options.map((option, index) => {
                      const toPlayer = players.find(p => p.id === option.toPlayerId);
                      return (
                        <div
                          key={index}
                          className="bg-slate-700/50 rounded-lg p-4 border border-white/10 hover:border-purple-500/30 transition-colors"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: fromPlayer?.color || '#888' }}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium leading-relaxed">{option.label}</p>
                              {option.description && (
                                <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                              )}
                            </div>
                          </div>
                          {toPlayer && (
                            <div className="flex items-center gap-2 text-sm pl-11">
                              <div className="text-gray-400">→ Führt zu:</div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                  style={{ backgroundColor: toPlayer.color }}
                                >
                                  {toPlayer.icon}
                                </div>
                                <span className="text-white font-medium">{toPlayer.name}</span>
                                <span className="text-gray-400 text-xs">({toPlayer.role})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Position Info */}
                <div className="border-t border-white/10 pt-5">
                  <div className="text-sm font-semibold text-gray-400 mb-3">Details</div>
                  <div className="space-y-3">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Typ</div>
                      <div className="text-white">{decisionBox.type === 'binary' ? 'Binäre Entscheidung (Ja/Nein)' : 'Mehrfachauswahl'}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Position</div>
                      <div className="text-white text-sm">
                        X: {decisionBox.position.x.toFixed(1)}%, Y: {decisionBox.position.y.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      if (window.confirm(`Möchten Sie diese Entscheidung wirklich löschen?`)) {
                        setDecisionBoxes(prev => prev.filter(db => db.id !== decisionBox.id));
                        setInspectedDecisionBox(null);
                      }
                    }}
                    className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Entscheidung löschen
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Communication Object Inspector - Split Screen */}
        {selectedObjectDetail && (() => {
          const getCategoryLabel = (category: string) => {
            switch (category) {
              case 'process-step': return 'Prozessschritt';
              case 'system-tool': return 'System/Tool';
              case 'communication': return 'Kommunikationsmittel';
              case 'connector': return 'Verbinder';
              default: return 'Objekt';
            }
          };

          return (
            <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-400/30 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                      style={{ backgroundColor: selectedObjectDetail.color + '40' }}
                    >
                      {selectedObjectDetail.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedObjectDetail.name}</h2>
                      <p className="text-sm text-purple-400">{getCategoryLabel(selectedObjectDetail.category)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedObjectDetail(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Description */}
                {selectedObjectDetail.description && (
                  <div>
                    <div className="text-xs font-medium text-gray-400 mb-2">Beschreibung</div>
                    <div className="text-white leading-relaxed">{selectedObjectDetail.description}</div>
                  </div>
                )}

                {/* Communication Method Attributes */}
                {selectedObjectDetail.category === 'communication' && (
                  <>
                    <div className="border-t border-white/10 pt-5">
                      <div className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        Attribute
                      </div>
                      <div className="space-y-3">
                        {isEditingAttributes ? (
                          <>
                            <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                              <label className="text-xs font-semibold text-cyan-300 mb-2 block">⚡ Geschwindigkeit</label>
                              <input
                                type="text"
                                value={editSpeed}
                                onChange={(e) => setEditSpeed(e.target.value)}
                                placeholder='z.B. "Sofort", "1 Stunde", "1 Tag"'
                                className="w-full bg-slate-800/50 text-white px-3 py-2 rounded-lg border border-cyan-500/30 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                              <label className="text-xs font-semibold text-green-300 mb-2 block">🎯 Zuverlässigkeit</label>
                              <input
                                type="text"
                                value={editReliability}
                                onChange={(e) => setEditReliability(e.target.value)}
                                placeholder='z.B. "Hoch", "Mittel", "Niedrig"'
                                className="w-full bg-slate-800/50 text-white px-3 py-2 rounded-lg border border-green-500/30 focus:outline-none focus:border-green-400"
                              />
                            </div>
                            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                              <label className="text-xs font-semibold text-purple-300 mb-2 block">👔 Formalität</label>
                              <input
                                type="text"
                                value={editFormality}
                                onChange={(e) => setEditFormality(e.target.value)}
                                placeholder='z.B. "Formal", "Informell"'
                                className="w-full bg-slate-800/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-400"
                              />
                            </div>
                            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                              <label className="text-xs font-semibold text-amber-300 mb-2 block">💰 Kosten</label>
                              <input
                                type="text"
                                value={editCost}
                                onChange={(e) => setEditCost(e.target.value)}
                                placeholder='z.B. "Kostenlos", "Niedrig", "Hoch"'
                                className="w-full bg-slate-800/50 text-white px-3 py-2 rounded-lg border border-amber-500/30 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            {(selectedObjectDetail as any).speed && (
                              <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                                <div className="text-xs font-semibold text-cyan-300 mb-2">⚡ Geschwindigkeit</div>
                                <div className="text-white text-lg">{(selectedObjectDetail as any).speed}</div>
                              </div>
                            )}
                            {(selectedObjectDetail as any).reliability && (
                              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                                <div className="text-xs font-semibold text-green-300 mb-2">🎯 Zuverlässigkeit</div>
                                <div className="text-white text-lg">{(selectedObjectDetail as any).reliability}</div>
                              </div>
                            )}
                            {(selectedObjectDetail as any).formality && (
                              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                                <div className="text-xs font-semibold text-purple-300 mb-2">👔 Formalität</div>
                                <div className="text-white text-lg">{(selectedObjectDetail as any).formality}</div>
                              </div>
                            )}
                            {(selectedObjectDetail as any).cost && (
                              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                                <div className="text-xs font-semibold text-amber-300 mb-2">💰 Kosten</div>
                                <div className="text-white text-lg">{(selectedObjectDetail as any).cost}</div>
                              </div>
                            )}
                          </>
                        )}
                        {(selectedObjectDetail as any).attributes && Object.keys((selectedObjectDetail as any).attributes).length > 0 && (
                          <>
                            {Object.entries((selectedObjectDetail as any).attributes).map(([key, value]) => (
                              <div key={key} className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                                <div className="text-xs font-semibold text-indigo-300 mb-2">📌 {key}</div>
                                <div className="text-white text-lg">{value as string}</div>
                              </div>
                            ))}
                          </>
                        )}
                        {!isEditingAttributes && 
                         !(selectedObjectDetail as any).speed && 
                         !(selectedObjectDetail as any).reliability && 
                         !(selectedObjectDetail as any).formality && 
                         !(selectedObjectDetail as any).cost && 
                         (!((selectedObjectDetail as any).attributes) || Object.keys((selectedObjectDetail as any).attributes).length === 0) && (
                          <div className="text-center py-8 text-gray-400 text-sm bg-slate-700/30 rounded-lg">
                            <p className="mb-3">Keine Attribute definiert</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit/Save Buttons */}
                    {onUpdateProcessObject && (
                      <div className="pt-4 border-t border-white/10">
                        {isEditingAttributes ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                onUpdateProcessObject(selectedObjectDetail.id, {
                                  speed: editSpeed.trim() || undefined,
                                  reliability: editReliability.trim() || undefined,
                                  formality: editFormality.trim() || undefined,
                                  cost: editCost.trim() || undefined,
                                });
                                
                                setSelectedObjectDetail({
                                  ...selectedObjectDetail,
                                  speed: editSpeed.trim() || undefined,
                                  reliability: editReliability.trim() || undefined,
                                  formality: editFormality.trim() || undefined,
                                  cost: editCost.trim() || undefined,
                                } as any);
                                
                                setIsEditingAttributes(false);
                              }}
                              className="flex-1 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all font-medium flex items-center justify-center gap-2"
                            >
                              ✓ Speichern
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingAttributes(false);
                                setEditSpeed((selectedObjectDetail as any).speed || '');
                                setEditReliability((selectedObjectDetail as any).reliability || '');
                                setEditFormality((selectedObjectDetail as any).formality || '');
                                setEditCost((selectedObjectDetail as any).cost || '');
                              }}
                              className="flex-1 px-4 py-3 bg-slate-500/20 text-slate-400 rounded-lg hover:bg-slate-500/30 transition-all font-medium flex items-center justify-center gap-2"
                            >
                              ✕ Abbrechen
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditSpeed((selectedObjectDetail as any).speed || '');
                              setEditReliability((selectedObjectDetail as any).reliability || '');
                              setEditFormality((selectedObjectDetail as any).formality || '');
                              setEditCost((selectedObjectDetail as any).cost || '');
                              setIsEditingAttributes(true);
                            }}
                            className="w-full px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-medium flex items-center justify-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Attribute bearbeiten
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* General Info */}
                <div className="border-t border-white/10 pt-5">
                  <div className="text-sm font-semibold text-gray-400 mb-3">Details</div>
                  <div className="space-y-3">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Kategorie</div>
                      <div className="text-white">{getCategoryLabel(selectedObjectDetail.category)}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Erstellt</div>
                      <div className="text-white text-sm">
                        {new Date(selectedObjectDetail.timestamp).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      if (window.confirm(`Möchten Sie "${selectedObjectDetail.name}" wirklich löschen?`)) {
                        onRemoveProcessObject(selectedObjectDetail.id);
                        setSelectedObjectDetail(null);
                      }
                    }}
                    className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        </div>

        {/* Untere Leiste: Ein-/Ausklappbar */}
        <div className="relative">
          {/* Toggle Button für gesamte untere Leiste */}
          <button
            onClick={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur-sm border-2 border-indigo-400/30 rounded-full p-2 hover:bg-slate-700/90 transition-colors shadow-lg"
            title={isBottomPanelExpanded ? 'Untere Leiste minimieren' : 'Untere Leiste maximieren'}
          >
            <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform ${isBottomPanelExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Content */}
          {isBottomPanelExpanded && (
            <div className="grid grid-cols-3 gap-4">
              {/* Wartebereich für Spieler - immer sichtbar, nimmt 2 Spalten */}
              <div className={`col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border-2 ${players.filter(p => p.onBoard === false).length > 0 ? 'border-amber-400/30' : 'border-gray-500/20'} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Spieler
                      <span className="text-xs font-normal text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        {players.filter(p => p.onBoard === false).length}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-400">
                      {players.filter(p => p.onBoard === false).length > 0 
                        ? 'Ziehe sie aufs Spielfeld' 
                        : 'Alle Spieler sind auf dem Spielfeld'}
                    </p>
                  </div>
                </div>
                {players.filter(p => p.onBoard === false).length > 0 ? (
                  <div className="flex gap-6 overflow-x-auto pb-2">
                    {players.filter(p => p.onBoard === false).map((player) => {
                      const isDragging = draggedPlayer === player.id;
                      const isInspected = inspectedPlayer === player.id;
                      
                      // Während des Draggings den Spieler im Wartebereich ausblenden
                      if (isDragging) return null;
                      
                      return (
                        <div
                          key={player.id}
                          className={`flex-shrink-0 transition-all duration-200 ${isDragging ? 'opacity-30' : ''}`}
                        >
                          <div className="flex flex-col items-center gap-1.5 relative">
                            {/* Inspektion Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Inspecting player:', player.name);
                                setInspectedPlayer(inspectedPlayer === player.id ? null : player.id);
                              }}
                              className={`absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                isInspected 
                                  ? 'bg-indigo-500 text-white' 
                                  : 'bg-slate-700/80 text-gray-300 hover:bg-slate-600'
                              }`}
                              title={isInspected ? 'Inspektion schließen' : 'Spieler inspizieren'}
                            >
                              <User className="w-3 h-3" />
                            </button>
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: player.color,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 1px 6px rgba(255,255,255,0.2)',
                                cursor: 'grab',
                              }}
                              onMouseDown={(e) => handleMouseDown(e, player.id)}
                            >
                              {player.icon}
                            </div>
                            <div className="text-xs font-semibold text-white text-center max-w-[70px] truncate">{player.name}</div>
                            <div
                              className="text-[10px] font-medium px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: player.color,
                                color: 'white',
                                opacity: 0.8,
                              }}
                            >
                              {player.role}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8 italic">
                    Keine neuen Spieler im Wartebereich
                  </div>
                )}
              </div>

              {/* Objektbox - nimmt immer 1 Spalte */}
              <div>
                <ProcessObjectToolbox
                  processObjects={processObjects}
                  onAddObject={onAddProcessObject}
                  onRemoveObject={onRemoveProcessObject}
                  onUpdateObject={onUpdateProcessObject}
                  onObjectClick={handleObjectClick}
                  onDragStart={() => setIsDraggingCommObject(true)}
                  onDragEnd={() => setIsDraggingCommObject(false)}
                  selectedObjectId={selectedCommObject?.id || selectedProcessObject?.id}
                  players={players}
                  onAddCard={onAddCard}
                />
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Player Modal */}
      {showPlayerModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
          onClick={() => {
            setShowPlayerModal(false);
            setCurrentName('');
            setCurrentRole('');
            setCurrentIcon(PLAYER_ICONS[0]);
            setCurrentInput('');
            setCurrentOutput('');
            setCurrentMedium('');
            setCurrentProcessRole('');
          }}
        >
          <div 
            className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Neuer Spieler</h2>
              <button
                onClick={() => {
                  setShowPlayerModal(false);
                  setCurrentName('');
                  setCurrentRole('');
                  setCurrentIcon(PLAYER_ICONS[0]);
                  setCurrentInput('');
                  setCurrentOutput('');
                  setCurrentMedium('');
                  setCurrentProcessRole('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="z.B. Anna"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && currentRole && handleAddPlayer()}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rolle</label>
                <input
                  type="text"
                  placeholder="z.B. Entwickler"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && currentName && handleAddPlayer()}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEFAULT_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setCurrentRole(role)}
                      className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 rounded-lg transition-colors border border-white/10"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                <div className="max-h-[200px] overflow-y-auto bg-slate-700/30 rounded-lg p-3">
                  <IconPicker 
                    selectedIcon={currentIcon}
                    onSelectIcon={setCurrentIcon}
                  />
                </div>
              </div>

              {/* Zusätzliche Informationen */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-white mb-2">Zusätzliche Informationen (optional)</h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Input - Was kommt rein?
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Kundenanfrage, E-Mail, Bestellung"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Output - Was geht raus?
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Bearbeitete Anfrage, Rechnung"
                    value={currentOutput}
                    onChange={(e) => setCurrentOutput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Medium - Wie?
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. E-Mail, Telefon, System, persönlich"
                    value={currentMedium}
                    onChange={(e) => setCurrentMedium(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Rolle im Prozess
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Entscheider, Bearbeiter, Prüfer"
                    value={currentProcessRole}
                    onChange={(e) => setCurrentProcessRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddPlayer}
                disabled={!currentName.trim() || !currentRole.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                Spieler hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
          onClick={() => {
            setShowProcessModal(false);
            setInputText('');
            setSelectedFromPlayer(null);
            setSelectedToPlayer(null);
            setProcessMedium('');
            setProcessDuration('');
            setProcessDescription('');
            setSelectedProcessObject(null);
          }}
        >
          <div 
            className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedProcessObject && (
                  <div className="text-4xl">{selectedProcessObject.icon}</div>
                )}
                <h2 className="text-2xl font-bold text-white">
                  {selectedProcessObject ? selectedProcessObject.name : 'Neuer Prozessschritt'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setInputText('');
                  setSelectedFromPlayer(null);
                  setSelectedToPlayer(null);
                  setProcessMedium('');
                  setProcessDuration('');
                  setProcessDescription('');
                  setSelectedProcessObject(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titel / Kurzbeschreibung *</label>
                <input
                  type="text"
                  placeholder="z.B. Anfrage bearbeiten"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Zusätzliche Informationen */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <h3 className="text-sm font-semibold text-white">Zusätzliche Informationen (optional)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Medium</label>
                    <input
                      type="text"
                      placeholder="z.B. E-Mail, Telefon, System"
                      value={processMedium}
                      onChange={(e) => setProcessMedium(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Dauer</label>
                    <input
                      type="text"
                      placeholder="z.B. 5 Min, 2 Std, 1 Tag"
                      value={processDuration}
                      onChange={(e) => setProcessDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Detaillierte Beschreibung</label>
                  <textarea
                    placeholder="Weitere Details zum Prozessschritt..."
                    value={processDescription}
                    onChange={(e) => setProcessDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Von (Absender)</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {players.filter(p => p.onBoard !== false).map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          if (selectedFromPlayer === player.id) {
                            setSelectedFromPlayer(null);
                          } else {
                            setSelectedFromPlayer(player.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          selectedFromPlayer === player.id
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-white/10 hover:border-white/20 bg-slate-700/30'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-lg"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-white text-sm">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">An (Empfänger)</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {players.filter(p => p.onBoard !== false).map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          if (selectedToPlayer === player.id) {
                            setSelectedToPlayer(null);
                          } else {
                            setSelectedToPlayer(player.id);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          selectedToPlayer === player.id
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 hover:border-white/20 bg-slate-700/30'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-lg"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.icon}
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-white text-sm">{player.name}</div>
                          <div className="text-xs text-gray-400">{player.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddCard}
                disabled={!inputText.trim() || !selectedFromPlayer || !selectedToPlayer}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GitBranch className="w-5 h-5" />
                Prozessschritt erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
          onClick={() => {
            setShowDecisionModal(false);
            setDecisionQuestion('');
            setDecisionType('binary');
            setDecisionOptions([
              { label: 'Ja', description: '' },
              { label: 'Nein', description: '' }
            ]);
            setDecisionStarter(null);
            setSelectedProcessObject(null);
            setIsDecisionMode(false);
          }}
        >
          <div 
            className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedProcessObject && (
                  <div className="text-4xl">{selectedProcessObject.icon}</div>
                )}
                <h2 className="text-2xl font-bold text-white">
                  Entscheidungspunkt erstellen
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowDecisionModal(false);
                  setDecisionQuestion('');
                  setDecisionType('binary');
                  setDecisionOptions([
                    { label: 'Ja', description: '' },
                    { label: 'Nein', description: '' }
                  ]);
                  setDecisionStarter(null);
                  setSelectedProcessObject(null);
                  setIsDecisionMode(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Starter Player Info */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-2">Entscheidung getroffen von:</label>
                {decisionStarter && (() => {
                  const starter = players.find(p => p.id === decisionStarter);
                  if (!starter) return null;
                  return (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg"
                        style={{ backgroundColor: starter.color }}
                      >
                        {starter.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{starter.name}</div>
                        <div className="text-sm text-gray-400">{starter.role}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Decision Question */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entscheidungsfrage *</label>
                <input
                  type="text"
                  placeholder="z.B. Ist der Antrag genehmigt?"
                  value={decisionQuestion}
                  onChange={(e) => setDecisionQuestion(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Decision Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entscheidungstyp</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDecisionType('binary');
                      setDecisionOptions([
                        { label: 'Ja', description: '' },
                        { label: 'Nein', description: '' }
                      ]);
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      decisionType === 'binary'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-white/10 bg-slate-700/30 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold">Binär (Ja/Nein)</div>
                    <div className="text-xs mt-1">Zwei Optionen</div>
                  </button>
                  <button
                    onClick={() => {
                      setDecisionType('multiple');
                      setDecisionOptions([
                        { label: 'Option 1', description: '' },
                        { label: 'Option 2', description: '' },
                        { label: 'Option 3', description: '' }
                      ]);
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      decisionType === 'multiple'
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-white/10 bg-slate-700/30 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold">Mehrfach</div>
                    <div className="text-xs mt-1">Mehrere Optionen</div>
                  </button>
                </div>
              </div>

              {/* Decision Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Entscheidungsoptionen</label>
                  {decisionType === 'multiple' && (
                    <button
                      onClick={handleAddDecisionOption}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Option hinzufügen
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {decisionOptions.map((option, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            placeholder="Option Label (z.B. Ja, Nein, Hoch, Niedrig)"
                            value={option.label}
                            onChange={(e) => handleUpdateDecisionOption(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                          />
                          
                          <input
                            type="text"
                            placeholder="Beschreibung (optional)"
                            value={option.description}
                            onChange={(e) => handleUpdateDecisionOption(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm placeholder-gray-500"
                          />
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                              Führt zu Spieler:
                            </label>
                            <select
                              value={option.toPlayerId || ''}
                              onChange={(e) => handleUpdateDecisionOption(index, 'toPlayerId', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white text-sm"
                            >
                              <option value="">-- Spieler wählen --</option>
                              {players.filter(p => p.onBoard !== false).map((player) => (
                                <option key={player.id} value={player.id}>
                                  {player.icon} {player.name} ({player.role})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {decisionOptions.length > 2 && (
                          <button
                            onClick={() => handleRemoveDecisionOption(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddDecision}
                disabled={!decisionQuestion.trim() || !decisionStarter || !decisionOptions.every(opt => opt.label.trim() && opt.toPlayerId)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GitBranch className="w-5 h-5" />
                Entscheidung erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Quick Info Card */}
      {selectedConnectionDetail && (() => {
        // Check if this is a decision line
        const isDecisionLine = selectedConnectionDetail.from.startsWith('decision-');
        
        if (isDecisionLine) {
          // Handle decision line
          const decisionBox = (selectedConnectionDetail as any).decisionBox;
          if (!decisionBox) return null;
          
          const fromPlayer = players.find(p => p.id === decisionBox.fromPlayerId);
          const toPlayer = players.find(p => p.id === selectedConnectionDetail.to);
          if (!fromPlayer || !toPlayer) return null;
          
          // Find which option this is
          const option = decisionBox.options.find((opt: any) => opt.toPlayerId === selectedConnectionDetail.to);
          if (!option) return null;
          
          return (
            <div 
              className="fixed inset-0 z-[110]" 
              onClick={() => setSelectedConnectionDetail(null)}
            >
              <div 
                className="absolute bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-yellow-400/30 w-96 overflow-hidden flex flex-col"
                style={{
                  left: `${selectedConnectionDetail.x}px`,
                  top: `${selectedConnectionDetail.y}px`,
                  transform: 'translate(10px, -50%)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center transform rotate-45">
                        <span className="transform -rotate-45 text-xl">❓</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">Entscheidungspfad</div>
                        <div className="text-xs text-yellow-300">{option.label}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedConnectionDetail(null)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Question */}
                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 mb-3">
                    <div className="text-xs text-yellow-300 mb-1">Frage</div>
                    <div className="text-white font-medium">{decisionBox.question}</div>
                  </div>

                  {/* From/To */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="text-gray-400">Von:</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-xs"
                          style={{ backgroundColor: fromPlayer.color }}
                        >
                          {fromPlayer.icon}
                        </div>
                        <span className="text-white font-medium">{fromPlayer.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="text-gray-400">Nach:</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-xs"
                          style={{ backgroundColor: toPlayer.color }}
                        >
                          {toPlayer.icon}
                        </div>
                        <span className="text-white font-medium">{toPlayer.name}</span>
                      </div>
                    </div>
                  </div>

                  {option.description && (
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-white/10 mb-3">
                      <div className="text-xs text-gray-400 mb-1">Beschreibung</div>
                      <div className="text-white text-sm">{option.description}</div>
                    </div>
                  )}

                  {/* Inspect Button */}
                  <div className="pt-3 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConnectionDetail(null);
                        setInspectedDecisionBox(decisionBox.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      <GitBranch className="w-4 h-4" />
                      Entscheidung anzeigen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Handle normal process connection
        const conn = getConnections().find(
          c => c.from === selectedConnectionDetail.from && c.to === selectedConnectionDetail.to
        );
        if (!conn) return null;

        const fromPlayer = players.find(p => p.id === conn.from);
        const toPlayer = players.find(p => p.id === conn.to);
        
        if (!fromPlayer || !toPlayer) return null;

        return (
          <div 
            className="fixed inset-0 z-[110]" 
            onClick={() => setSelectedConnectionDetail(null)}
          >
            <div 
              className="absolute bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 w-96 max-h-[70vh] overflow-hidden flex flex-col"
              style={{
                left: `${selectedConnectionDetail.x}px`,
                top: `${selectedConnectionDetail.y}px`,
                transform: 'translate(10px, -50%)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-lg"
                        style={{ backgroundColor: fromPlayer.color }}
                      >
                        {fromPlayer.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{fromPlayer.name}</div>
                        <div className="text-xs text-gray-400">{fromPlayer.role}</div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-lg">→</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-lg"
                        style={{ backgroundColor: toPlayer.color }}
                      >
                        {toPlayer.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{toPlayer.name}</div>
                        <div className="text-xs text-gray-400">{toPlayer.role}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConnectionDetail(null)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Stats */}
                <div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20 mb-3">
                  <div className="text-xs text-indigo-300 mb-1">Prozessschritte</div>
                  <div className="text-2xl font-bold text-white">{conn.count}</div>
                </div>

                {/* Preview of first 3 steps */}
                <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                  {conn.cards.slice(0, 3).map((card, index) => (
                    <div
                      key={card.id}
                      className="bg-slate-700/50 rounded-lg p-3 border border-white/10 text-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: fromPlayer.color }}
                        >
                          {index + 1}
                        </div>
                        <div className="text-xs text-gray-400">Runde {card.round}</div>
                      </div>
                      <p className="text-white text-sm line-clamp-2">{card.text}</p>
                    </div>
                  ))}
                  {conn.cards.length > 3 && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      +{conn.cards.length - 3} weitere
                    </div>
                  )}
                </div>

                {/* Inspect Button */}
                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnectionDetail(null);
                      // Open the first card in inspector mode if available
                      if (conn.cards.length > 0) {
                        setInspectedProcessStep(conn.cards[0].id);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <GitBranch className="w-4 h-4" />
                    Details anzeigen
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Process Steps Full Modal (opened from quick card) */}
      {selectedConnection && (() => {
        const conn = getConnections().find(
          c => c.from === selectedConnection.from && c.to === selectedConnection.to
        );
        if (!conn) return null;

        const fromPlayer = players.find(p => p.id === conn.from);
        const toPlayer = players.find(p => p.id === conn.to);
        
        if (!fromPlayer || !toPlayer) return null;

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg"
                      style={{ backgroundColor: fromPlayer.color }}
                    >
                      {fromPlayer.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{fromPlayer.name}</div>
                      <div className="text-xs text-gray-400">{fromPlayer.role}</div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-2xl">→</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg"
                      style={{ backgroundColor: toPlayer.color }}
                    >
                      {toPlayer.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{toPlayer.name}</div>
                      <div className="text-xs text-gray-400">{toPlayer.role}</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-3 text-sm text-gray-400">
                {conn.count} {conn.count === 1 ? 'Prozessschritt' : 'Prozessschritte'}
              </div>

              {/* Process steps list */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {conn.cards.map((card, index) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedConnection(null);
                      setInspectedProcessStep(card.id);
                    }}
                    className="bg-slate-700/50 rounded-lg p-4 border border-white/10 hover:border-indigo-500/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: fromPlayer.color }}
                        >
                          {index + 1}
                        </div>
                        <div className="text-xs text-gray-400">
                          Runde {card.round}
                        </div>
                        {(card.medium || card.duration || card.description) && (
                          <div className="text-xs text-indigo-400 flex items-center gap-1">
                            <span>•</span>
                            <span>Details</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(card.timestamp).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <p className="text-white leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Share Game Modal */}
      {showShareModal && gameId && (
        <ShareGameModal 
          gameId={gameId} 
          onClose={() => setShowShareModal(false)} 
        />
      )}

      {/* Connection Type Selection Menu (Orange-style) */}
      {showConnectionTypeMenu && connectionMenuPosition && connectionMenuTarget !== undefined && dragConnectionFrom && (
        <div
          className="fixed inset-0 z-[200]"
          onClick={() => {
            setShowConnectionTypeMenu(false);
            setDragConnectionFrom(null);
            setConnectionMenuTarget(null);
            setDragConnectionPosition(null);
          }}
        >
          <div
            className="absolute"
            style={{
              left: connectionMenuPosition.x,
              top: connectionMenuPosition.y,
              transform: 'translate(-50%, -10px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border-2 border-purple-400/50 overflow-hidden">
            <div className="p-2 space-y-1">
              {connectionMenuTarget ? (
                <>
                  {/* Connecting to a player */}
                  <div className="text-xs text-gray-400 px-2 py-1 font-semibold mb-1">
                    Verbindung zu {players.find(p => p.id === connectionMenuTarget)?.name}
                  </div>
                  
                  {/* Process Option */}
                  <button
                    onClick={() => {
                      setShowProcessModal(true);
                      setSelectedFromPlayer(dragConnectionFrom);
                      setSelectedToPlayer(connectionMenuTarget);
                      setShowConnectionTypeMenu(false);
                      setDragConnectionFrom(null);
                      setConnectionMenuTarget(null);
                      setDragConnectionPosition(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-500/20 transition-colors rounded-lg text-left group"
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30">
                      <GitBranch className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Prozessschritt</div>
                      <div className="text-xs text-gray-400">Normaler Prozess zwischen Spielern</div>
                    </div>
                  </button>

                  {/* Decision Options */}
                  <div className="border-t border-white/10 my-1"></div>
                  <div className="text-xs text-gray-400 px-2 py-1 font-semibold">Entscheidungslogik</div>
                </>
              ) : (
                <>
                  {/* Creating new element in empty space */}
                  <div className="text-xs text-gray-400 px-2 py-1 font-semibold mb-1">
                    Verbindung zu Spieler
                  </div>
                  
                  {/* Waiting Players */}
                  {players.filter(p => p.onBoard === false).length > 0 ? (
                    players.filter(p => p.onBoard === false).map(waitingPlayer => (
                      <button
                        key={waitingPlayer.id}
                        onClick={() => {
                          console.log('🎯 Placing player at position:', dragConnectionPosition);
                          // Place player on board and create connection
                          if (onUpdatePlayerPosition && dragConnectionPosition) {
                            onUpdatePlayerPosition(waitingPlayer.id, {
                              x: dragConnectionPosition.x,
                              y: dragConnectionPosition.y
                            });
                          }
                          // Open process modal
                          setShowProcessModal(true);
                          setSelectedFromPlayer(dragConnectionFrom);
                          setSelectedToPlayer(waitingPlayer.id);
                          setShowConnectionTypeMenu(false);
                          setDragConnectionFrom(null);
                          setConnectionMenuTarget(null);
                          setDragConnectionPosition(null);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-500/20 transition-colors rounded-lg text-left group"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: waitingPlayer.color }}
                        >
                          {waitingPlayer.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{waitingPlayer.name}</div>
                          <div className="text-xs text-gray-400 truncate">{waitingPlayer.role}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => {
                        setShowPlayerModal(true);
                        setShowConnectionTypeMenu(false);
                        setDragConnectionFrom(null);
                        setConnectionMenuTarget(null);
                        setDragConnectionPosition(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-500/20 transition-colors rounded-lg text-left group"
                    >
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/30">
                        <UserPlus className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">Neuer Spieler</div>
                        <div className="text-xs text-gray-400">Einen neuen Teilnehmer hinzufügen</div>
                      </div>
                    </button>
                  )}

                  {/* Decision Options */}
                  <div className="border-t border-white/10 my-1"></div>
                  <div className="text-xs text-gray-400 px-2 py-1 font-semibold">Entscheidung erstellen</div>
                </>
              )}
              
              {[
                { icon: '⊕', name: 'XOR (Entweder-oder)', desc: 'Genau eine Option', color: '#F59E0B' },
                { icon: '∧', name: 'AND (Und)', desc: 'Alle Optionen parallel', color: '#3B82F6' },
                { icon: '∨', name: 'OR (Oder)', desc: 'Eine oder mehrere', color: '#10B981' }
              ].map((logic) => {
                const logicObject = processObjects.find(obj => obj.icon === logic.icon && obj.category === 'connector');
                if (!logicObject) return null;
                
                return (
                  <button
                    key={logic.icon}
                    onClick={() => {
                      setDecisionStarter(dragConnectionFrom);
                      setShowDecisionModal(true);
                      setSelectedProcessObject(logicObject);
                      setShowConnectionTypeMenu(false);
                      setDragConnectionFrom(null);
                      setConnectionMenuTarget(null);
                      setDragConnectionPosition(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors rounded-lg text-left group"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: logic.color + '20' }}
                    >
                      {logic.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{logic.name}</div>
                      <div className="text-xs text-gray-400">{logic.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
