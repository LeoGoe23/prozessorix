import React from 'react';
import { Player, ProcessCard, ProcessObject, ProcessStep, PLAYER_COLORS, DEFAULT_ROLES, PLAYER_ICONS, GameBoardView, DECISION_ICONS, FreeLine, DecisionLine } from '../types/game';
import { Users, Plus, Trash2, ChevronDown, UserPlus, GitBranch, X, Share2, User, Settings, LayoutGrid, Copy } from 'lucide-react';
import ShareGameModal from './ShareGameModal';
import IconPicker from './IconPicker';
import ProcessObjectToolbox from './ProcessObjectToolbox';
import * as gameService from '../firebase/gameService';

interface GameBoardProps {
  players: Player[];
  cards: ProcessCard[];
  processObjects: ProcessObject[];
  freeLines: FreeLine[];  // Freie Linien
  decisionLines: DecisionLine[];  // Entscheidungslinien
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  onAddCard: (text: string, fromPlayerId: string | '', toPlayerId: string | '', medium?: string, duration?: string, description?: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<ProcessCard>) => void;
  onRemoveCard?: (cardId: string) => void;
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
  onAddFreeLine: (line: Omit<FreeLine, 'id' | 'timestamp'>) => void;
  onUpdateFreeLine: (lineId: string, updates: Partial<FreeLine>) => void;
  onRemoveFreeLine: (lineId: string) => void;
  onAddDecisionLine: (line: Omit<DecisionLine, 'id' | 'timestamp'>) => void;
  onUpdateDecisionLine: (lineId: string, updates: Partial<DecisionLine>) => void;
  onRemoveDecisionLine: (lineId: string) => void;
  gameId?: string;
  userName?: string;
  onShowLogin?: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  players,
  cards,
  processObjects,
  freeLines,
  decisionLines,
  onAddCard,
  onUpdateCard,
  onRemoveCard,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerPosition,
  onAddProcessObject,
  onRemoveProcessObject,
  onUpdateProcessObject,
  onAddFreeLine,
  onUpdateFreeLine,
  onRemoveFreeLine,
  onAddDecisionLine,
  onUpdateDecisionLine,
  onRemoveDecisionLine,
  gameId,
  userName,
  onShowLogin,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showPlayerModal, setShowPlayerModal] = React.useState(false);
  const [showProcessModal, setShowProcessModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showResultsModal, setShowResultsModal] = React.useState(false);
  
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
  const [draggedProcessStep, setDraggedProcessStep] = React.useState<string | null>(null);
  const [draggedProcessStepOriginalState, setDraggedProcessStepOriginalState] = React.useState<{inWaitingArea: boolean, position: any, assignedToPlayerId: any} | null>(null);
  const [processStepTargetPlayer, setProcessStepTargetPlayer] = React.useState<string | null>(null); // Highlight target player for process step
  const gameBoardRef = React.useRef<HTMLDivElement>(null);
  
  // Placed communication objects on field
  const [placedCommObjects, setPlacedCommObjects] = React.useState<Array<{ objectId: string; x: number; y: number }>>([]);
  const [draggedCommObject, setDraggedCommObject] = React.useState<number | null>(null);
  
  // Dragging entire connections (process cards)
  const [draggedConnectionState, setDraggedConnectionState] = React.useState<{ from: string; to: string | null } | null>(null);
  
  // Wrapper function that keeps ref in sync
  const setDraggedConnection = React.useCallback((value: { from: string; to: string | null } | null) => {
    console.log('🔄 setDraggedConnection called with:', value);
    setDraggedConnectionState(value);
    draggedConnectionRef.current = value;
    console.log('✅ Both state and ref updated. Ref is now:', draggedConnectionRef.current);
  }, []);
  
  const draggedConnection = draggedConnectionState;
  
  const [connectionDragOffset, setConnectionDragOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Process Step Detail View
  const [selectedConnection, setSelectedConnection] = React.useState<{ from: string; to?: string } | null>(null);
  
  // Player context menu
  const [contextMenuPlayer, setContextMenuPlayer] = React.useState<string | null>(null);
  
  // Player detail view (for quick info card)
  const [selectedPlayerDetail, setSelectedPlayerDetail] = React.useState<string | null>(null);
  
  // Track if player was actually dragged (to prevent modal opening on drag)
  const [wasPlayerDragged, setWasPlayerDragged] = React.useState(false);
  
  // Player inspection mode (for split screen)
  const [inspectedPlayer, setInspectedPlayer] = React.useState<string | null>(null);
  
  // Process step inspection mode (for split screen)
  const [inspectedProcessStep, setInspectedProcessStep] = React.useState<string | null>(null);
  
  // Decision box inspection mode (for split screen)
  const [inspectedDecisionBox, setInspectedDecisionBox] = React.useState<string | null>(null);
  
  // Hover state for connections
  const [hoveredConnection, setHoveredConnection] = React.useState<{ from: string; to?: string } | null>(null);
  
  // Quick info card for connections (similar to player cards)
  const [selectedConnectionDetail, setSelectedConnectionDetail] = React.useState<{ from: string; to?: string; x: number; y: number } | null>(null);
  
  // Selected free line modal
  const [selectedFreeLine, setSelectedFreeLine] = React.useState<string | null>(null);
  
  // Selected decision line modal
  const [selectedDecisionLine, setSelectedDecisionLine] = React.useState<string | null>(null);
  
  // Drag preview position for waiting area players
  const [dragPreviewPosition, setDragPreviewPosition] = React.useState<{ x: number; y: number } | null>(null);
  
  // State for free line middle drag
  const [freeLineMiddleDragOffset, setFreeLineMiddleDragOffset] = React.useState<{ offsetX: number; offsetY: number } | null>(null);
  
  // State for snap target highlighting
  const [snapTargetPlayerId, setSnapTargetPlayerId] = React.useState<string | null>(null);
  
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
  const [connectionMenuPosition, _setConnectionMenuPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [connectionMenuTarget, setConnectionMenuTarget] = React.useState<string | null>(null);
  
  // State for dragging open connection ends
  const [draggedConnectionEnd, setDraggedConnectionEnd] = React.useState<{ cardId: string; isStart: boolean } | null>(null);
  
  // View mode state
  const [viewMode, setViewMode] = React.useState<GameBoardView>('player-centric');
  
  // Management menu state
  const [showManagementMenu, setShowManagementMenu] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [gameName, setGameName] = React.useState(''); // Neuer State für Spielnamen
  const [saveMessage, setSaveMessage] = React.useState('');
  const [gameVersions, setGameVersions] = React.useState<Array<{ id: string, gameId: string, gameName: string, versionName: string, timestamp: any, players?: Player[], cards?: ProcessCard[], processObjects?: ProcessObject[], freeLines?: FreeLine[], decisionLines?: DecisionLine[] }>>([]);
  const [showVersions, setShowVersions] = React.useState(false);
  
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
    dockedToPlayerId?: string;  // Optional: Ist die Box an einen Spieler angedockt?
    options: Array<{ label: string; toPlayerId: string; description?: string; color?: string }>;
    position: { x: number; y: number };
    type: 'binary' | 'multiple';
  }>>([]);

  // Ref to always have current players array (for closures in event listeners)
  const playersRef = React.useRef(players);
  React.useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const playersByNewest = React.useMemo(() => {
    return [...players].sort((a, b) => {
      try {
        const ta = parseInt(String(a.id).split('-')[1] || '0', 10);
        const tb = parseInt(String(b.id).split('-')[1] || '0', 10);
        return tb - ta; // newest first
      } catch (e) {
        return 0;
      }
    });
  }, [players]);

  const renderIcon = (icon?: string | null) => {
    if (!icon) return null;
    const isImage = typeof icon === 'string' && (icon.includes('/') || icon.startsWith('data:') || icon.startsWith('http'));
    return isImage ? <img src={icon} alt="icon" className="max-w-[60%] max-h-[60%] object-contain mx-auto" /> : <>{icon}</>;
  };
  
  // Effect: Aktualisiere angedockte Decision Boxes wenn Spieler bewegt werden
  React.useEffect(() => {
    setDecisionBoxes(prev => prev.map(box => {
      if (!box.dockedToPlayerId) return box;
      
      const dockedPlayer = players.find(p => p.id === box.dockedToPlayerId);
      if (!dockedPlayer?.position) return box;
      
      // Aktualisiere Position zur Spieler-Position
      return {
        ...box,
        position: { x: dockedPlayer.position.x, y: dockedPlayer.position.y }
      };
    }));
  }, [players]); // Triggert wenn players sich ändern (z.B. Position-Updates)

  // Refs for connection dragging - managed manually, NOT synced with state automatically
  // This prevents race conditions where state updates clear the ref before mouseUp
  const draggedConnectionRef = React.useRef<{from: string; to: string | null} | null>(null);
  const connectionDragStartRef = React.useRef<{x: number; y: number} | null>(null);
  const connectionDragOffsetRef = React.useRef<{x: number; y: number}>({ x: 0, y: 0 });
  const cardsRef = React.useRef(cards); // Keep current cards in ref for closure
  
  // Update cardsRef when cards change
  React.useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);
  
  // CRITICAL: Sync draggedConnectionRef when draggedConnection state changes
  // This ensures the ref is always in sync, regardless of how the state is set
  React.useEffect(() => {
    if (draggedConnection) {
      draggedConnectionRef.current = draggedConnection;
      console.log('🔄 Syncing ref from state:', draggedConnection);
    }
  }, [draggedConnection]);

  // Keyboard event handler für Delete/Backspace auf ausgewählten Connections
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace: Lösche ausgewählte Connection
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnectionDetail) {
        e.preventDefault();
        
        console.log('🗑️ Versuche Connection zu löschen:', selectedConnectionDetail);
        
        // Finde alle Cards dieser Connection und lösche sie
        const connection = getConnections().find(
          c => c.from === selectedConnectionDetail.from && c.to === selectedConnectionDetail.to
        );
        
        if (connection && onRemoveCard) {
          console.log('🗑️ Lösche Connection mit', connection.cards.length, 'Karten');
          connection.cards.forEach(card => {
            console.log('🗑️ Lösche Karte:', card.id);
            onRemoveCard(card.id);
          });
          setSelectedConnectionDetail(null);
        } else {
          console.log('❌ Connection nicht gefunden oder onRemoveCard fehlt');
        }
      }
      
      // Delete/Backspace: Lösche ausgewählte freie Linie
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFreeLine) {
        e.preventDefault();
        
        console.log('🗑️ Lösche freie Linie:', selectedFreeLine);
        onRemoveFreeLine(selectedFreeLine);
        setSelectedFreeLine(null);
      }
      
      // Delete/Backspace: Lösche ausgewählte Entscheidungslinie
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedDecisionLine) {
        e.preventDefault();
        
        console.log('🗑️ Lösche Entscheidungslinie:', selectedDecisionLine);
        onRemoveDecisionLine(selectedDecisionLine);
        setSelectedDecisionLine(null);
      }
      
      // Strg+C: Kopiere ausgewählten Spieler
      if (e.ctrlKey && e.key === 'c' && inspectedPlayer) {
        e.preventDefault();
        
        const player = players.find(p => p.id === inspectedPlayer);
        if (player) {
          console.log('📋 Kopiere Spieler:', player.name);
          
          // Erstelle Kopie mit neuem Namen und ID
          const newPlayer: Player = {
            ...player,
            id: `player-${Date.now()}`,
            name: `${player.name} (Kopie)`,
            onBoard: false, // Kopie startet im Wartebereich
            position: undefined, // Keine Position
          };
          
          onAddPlayer(newPlayer);
          console.log('✅ Spieler kopiert:', newPlayer.name);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedConnectionDetail, selectedFreeLine, selectedDecisionLine, inspectedPlayer, players, cards, onRemoveCard, onRemoveFreeLine, onRemoveDecisionLine, onAddPlayer]);

  // Subscribe to ALL game versions (spielübergreifend)
  React.useEffect(() => {
    const unsubscribe = gameService.subscribeToAllGameVersions((versions) => {
      setGameVersions(versions);
    });
    
    return unsubscribe;
  }, []);

  // Global MouseMove/MouseUp for connection dragging
  // Move entire connection (both endpoints) smoothly
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const currentDraggedConnection = draggedConnectionRef.current;
      if (!currentDraggedConnection || !gameBoardRef.current) return;
      
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const mouseY = ((e.clientY - boardRect.top) / boardRect.height) * 100;

      // Calculate offset from drag start using ref
      const dragStart = connectionDragStartRef.current;
      if (dragStart) {
        const offsetX = mouseX - dragStart.x;
        const offsetY = mouseY - dragStart.y;
        
        setConnectionDragOffset({ x: offsetX, y: offsetY });
        connectionDragOffsetRef.current = { x: offsetX, y: offsetY }; // Update ref!
      }
      
      document.body.style.cursor = 'grabbing';
    };

    const handleGlobalMouseUp = () => {
      console.log('🎯 Global mouseUp handler triggered!');
      const currentDraggedConnection = draggedConnectionRef.current;
      const currentDragOffset = connectionDragOffsetRef.current;
      const currentDragStart = connectionDragStartRef.current;
      
      console.log('🔍 draggedConnectionRef.current:', currentDraggedConnection);
      console.log('🔍 connectionDragOffsetRef.current:', currentDragOffset);
      console.log('🔍 connectionDragStartRef.current:', currentDragStart);
      
      // If draggedConnection is null but we have offset and dragStart, something went wrong
      // Try to recover by finding which connection was being dragged
      if (!currentDraggedConnection && currentDragOffset && currentDragStart && 
          (currentDragOffset.x !== 0 || currentDragOffset.y !== 0)) {
        console.log('⚠️ draggedConnection is null but we have offset - trying to recover');
        console.log('🔍 Checking all connections to find the one being dragged...');
        
        // We can't reliably recover without knowing which connection was dragged
        // Reset and warn user
        console.error('❌ Cannot save - draggedConnection was lost!');
        setConnectionDragOffset({ x: 0, y: 0 });
        document.body.style.cursor = '';
        return;
      }
      
      if (!currentDraggedConnection) {
        console.log('⚠️ No dragged connection - exiting early');
        return;
      }
      
      console.log(`🌍 Global mouseUp - connection moved by (${currentDragOffset.x.toFixed(2)}, ${currentDragOffset.y.toFixed(2)})`);
      
      // Save the offset permanently to Firebase
      if (currentDragOffset.x !== 0 || currentDragOffset.y !== 0) {
        const currentCards = cardsRef.current; // Use ref to get current cards
        console.log('💾 Attempting to save. Cards count:', currentCards.length);
        console.log('💾 Looking for: from=' + JSON.stringify(currentDraggedConnection.from) + ' to=' + JSON.stringify(currentDraggedConnection.to));
        
        // Find cards directly
        const matchingCards = currentCards.filter(card => {
          const fromMatch = (card.fromPlayerId || '') === (currentDraggedConnection.from || '');
          const toMatch = (card.toPlayerId || '') === (currentDraggedConnection.to || '');
          console.log(`  Card ${card.id}: from="${card.fromPlayerId}" to="${card.toPlayerId}" - fromMatch=${fromMatch} toMatch=${toMatch}`);
          return fromMatch && toMatch;
        });
        
        console.log('✅ Found', matchingCards.length, 'matching cards');
        
        if (matchingCards.length > 0 && onUpdateCard) {
          matchingCards.forEach(card => {
            // Save the accumulated offset
            const currentOffset = card.connectionOffset || { x: 0, y: 0 };
            const newOffset = {
              x: currentOffset.x + currentDragOffset.x,
              y: currentOffset.y + currentDragOffset.y
            };
            console.log(`💾 Saving card ${card.id}: offset (${currentOffset.x.toFixed(2)},${currentOffset.y.toFixed(2)}) + drag (${currentDragOffset.x.toFixed(2)},${currentDragOffset.y.toFixed(2)}) = new (${newOffset.x.toFixed(2)},${newOffset.y.toFixed(2)})`);
            onUpdateCard(card.id, {
              connectionOffset: newOffset
            });
          });
        } else {
          console.log('❌ Cannot save - matchingCards:', matchingCards.length, 'onUpdateCard:', !!onUpdateCard);
        }
      }
      
      // Reset drag state - keep offset briefly to prevent jump
      setDraggedConnection(null);
      // Clear refs manually
      draggedConnectionRef.current = null;
      connectionDragStartRef.current = null;
      // Don't reset offset immediately - let Firebase update propagate first
      setTimeout(() => {
        setConnectionDragOffset({ x: 0, y: 0 });
        connectionDragOffsetRef.current = { x: 0, y: 0 };
      }, 100);
      document.body.style.cursor = '';
    };
    
    // Handle click to end drag (same as mouseUp)
    const handleGlobalClick = () => {
      const currentDraggedConnection = draggedConnectionRef.current;
      if (currentDraggedConnection) {
        console.log('🖱️ Click detected - ending connection drag');
        handleGlobalMouseUp();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('click', handleGlobalClick);
      document.body.style.cursor = '';
    };
  }, []); // Empty dependency array - handlers use refs

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
    const playersOnBoard = playersByNewest.filter(p => p.onBoard !== false);
    
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
    const availablePlayers = playersByNewest.filter(p => p.onBoard !== false);
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
    let testPlayers = playersByNewest.filter(p => p.onBoard !== false);
    
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
    if (decisionQuestion.trim() && decisionStarter && decisionOptions.every(opt => opt.label.trim() && opt.toPlayerId)) {
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

  const handleDragConnectionMove = (e: React.MouseEvent) => {
    if (!isDraggingConnection || !gameBoardRef.current) return;
    
    const boardRect = gameBoardRef.current.getBoundingClientRect();
    setDragConnectionPosition({
      x: ((e.clientX - boardRect.left) / boardRect.width) * 100,
      y: ((e.clientY - boardRect.top) / boardRect.height) * 100
    });
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
      // Normaler Klick: Zeige Details nur wenn NICHT gedraggt wurde
      if (wasPlayerDragged) {
        console.log('🚫 Modal nicht öffnen - Spieler wurde gedraggt');
        return;
      }
      
      if (selectedPlayerDetail === playerId) {
        setSelectedPlayerDetail(null);
      } else {
        setSelectedPlayerDetail(playerId);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, playerId: string) => {
    console.log('👆 handleMouseDown called', playerId);
    if (showProcessModal) return; // Don't drag during process modal
    
    // Close context menu if open
    if (contextMenuPlayer) {
      setContextMenuPlayer(null);
    }
    
    // Reset drag tracking
    setWasPlayerDragged(false);
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('✅ Setting draggedPlayer to', playerId);
    setDraggedPlayer(playerId);
  };

  const handleProcessStepMouseDown = (e: React.MouseEvent, processStepId: string) => {
    if (showProcessModal) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 handleProcessStepMouseDown - ID:', processStepId);
    
    // Speichere den ursprünglichen Zustand
    const processStep = processObjects.find(obj => obj.id === processStepId);
    console.log('📦 Gefundener Prozessschritt:', processStep);
    
    if (processStep && 'inWaitingArea' in processStep) {
      const step = processStep as ProcessStep;
      const originalState = {
        inWaitingArea: step.inWaitingArea || false,
        position: step.position,
        assignedToPlayerId: step.assignedToPlayerId
      };
      console.log('💾 Speichere ursprünglichen Zustand:', originalState);
      setDraggedProcessStepOriginalState(originalState);
    }
    
    setDraggedProcessStep(processStepId);
    console.log('✅ draggedProcessStep gesetzt auf:', processStepId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((!draggedPlayer && !draggedProcessStep && !draggedConnectionEnd && draggedCommObject === null && !draggedConnection) || !gameBoardRef.current) return;
    
    console.log('🔴 handleMouseMove - players.length:', players.length);
    
    // Ziehe gesamte Verbindung
    if (draggedConnection) {
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const mouseY = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      console.log('🎯 Dragging connection, mouse:', { mouseX, mouseY });
      console.log('🎯 Looking for:', draggedConnection);
      
      // Finde die Verbindung
      const allConnections = getConnections();
      console.log('🌐 All connections:', allConnections.map(c => ({ from: c.from, to: c.to, cardCount: c.cards.length })));
      
      const conn = allConnections.find(c => 
        c.from === draggedConnection.from && 
        (c.to === draggedConnection.to || (!c.to && !draggedConnection.to))
      );
      
      console.log('🔍 Found connection:', conn);
      
      if (conn && conn.cards.length > 0 && onUpdateCard) {
        console.log('🔑 Connection IDs:', { from: conn.from, to: conn.to });
        console.log('🔑 Available player IDs:', players.map(p => p.id));
        
        // Berechne ursprünglichen Kontrollpunkt OHNE Offset
        const fromPlayer = players.find(p => p.id === conn.from);
        const toPlayer = conn.to ? players.find(p => p.id === conn.to) : null;
        
        console.log('👥 Players:', { fromPlayer: fromPlayer?.name, toPlayer: toPlayer?.name, hasFrom: !!fromPlayer, hasTo: !!toPlayer, connTo: conn.to });
        
        console.log('🔍 Checking condition:', { 
          hasFromPlayer: !!fromPlayer, 
          hasToPlayerOrNoTo: !!(toPlayer || !conn.to),
          willProceed: !!(fromPlayer && (toPlayer || !conn.to))
        });
        
        if (fromPlayer && (toPlayer || !conn.to)) {
          console.log('✅ Condition passed, calculating positions...');
          const fromIndex = players.indexOf(fromPlayer);
          const fromPos = getPlayerPosition(fromPlayer, fromIndex, players.length);
          
          let toPos;
          if (toPlayer) {
            const toIndex = players.indexOf(toPlayer);
            toPos = getPlayerPosition(toPlayer, toIndex, players.length);
          } else {
            // Für freie Verbindungen
            const firstCard = conn.cards[0];
            toPos = firstCard.openEndPosition || { x: fromPos.x + 20, y: fromPos.y };
          }
          
          const { controlX: originalControlX, controlY: originalControlY } = calculateCurveControlPoint(
            fromPos,
            toPos,
            conn.from,
            conn.to || 'open-end'
          );
          
          console.log('📐 Control point:', { originalControlX, originalControlY });
          
          // Berechne neues Offset
          const newOffsetX = mouseX - originalControlX;
          const newOffsetY = mouseY - originalControlY;
          
          console.log('📊 New offset:', { newOffsetX, newOffsetY });
          
          // Update alle Cards dieser Verbindung
          conn.cards.forEach(card => {
            console.log('💾 Updating card:', card.id);
            onUpdateCard(card.id, {
              curveOffset: { x: newOffsetX, y: newOffsetY }
            });
          });
        }
      }
      return;
    }
    
    // Ziehe Kommunikationsobjekt
    if (draggedCommObject !== null) {
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      setPlacedCommObjects(prev => prev.map((obj, idx) => 
        idx === draggedCommObject 
          ? { ...obj, x: clampedX, y: clampedY }
          : obj
      ));
      return;
    }
    
    // Ziehe offenes Verbindungsende
    if (draggedConnectionEnd) {
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      // Aktualisiere die openEndPosition der Card
      if (onUpdateCard) {
        onUpdateCard(draggedConnectionEnd.cardId, {
          openEndPosition: { x: clampedX, y: clampedY }
        });
      }
      return;
    }
    
    // Check if dragging a free line middle (entire line)
    if (draggedPlayer && draggedPlayer.startsWith('freeline-middle-')) {
      const lineId = draggedPlayer.replace('freeline-middle-', '');
      const line = freeLines.find(l => l.id === lineId);
      if (!line) return;
      
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const mouseY = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      // Beim ersten Move: Offset berechnen
      if (!freeLineMiddleDragOffset) {
        const midX = (line.startPosition.x + line.endPosition.x) / 2;
        const midY = (line.startPosition.y + line.endPosition.y) / 2;
        setFreeLineMiddleDragOffset({
          offsetX: mouseX - midX,
          offsetY: mouseY - midY
        });
        return;
      }
      
      // Mit Offset: Neue Position berechnen
      const newMidX = mouseX - freeLineMiddleDragOffset.offsetX;
      const newMidY = mouseY - freeLineMiddleDragOffset.offsetY;
      
      // Delta von alter zu neuer Mitte
      const oldMidX = (line.startPosition.x + line.endPosition.x) / 2;
      const oldMidY = (line.startPosition.y + line.endPosition.y) / 2;
      const deltaX = newMidX - oldMidX;
      const deltaY = newMidY - oldMidY;
      
      // Beide Endpunkte um Delta verschieben
      const newStartX = Math.max(8, Math.min(92, line.startPosition.x + deltaX));
      const newStartY = Math.max(8, Math.min(92, line.startPosition.y + deltaY));
      const newEndX = Math.max(8, Math.min(92, line.endPosition.x + deltaX));
      const newEndY = Math.max(8, Math.min(92, line.endPosition.y + deltaY));
      
      // Check for nearby players for start and end points (in pixel space)
      const startPixelX = (newStartX / 100) * boardRect.width + boardRect.left;
      const startPixelY = (newStartY / 100) * boardRect.height + boardRect.top;
      const endPixelX = (newEndX / 100) * boardRect.width + boardRect.left;
      const endPixelY = (newEndY / 100) * boardRect.height + boardRect.top;
      
      // Check for snap at start point
      const nearbyPlayerStart = players.find(player => {
        if (!player.position || player.onBoard === false) return false;
        const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
        const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
        const distance = Math.sqrt(Math.pow(startPixelX - playerX, 2) + Math.pow(startPixelY - playerY, 2));
        return distance < 80;
      });
      
      // Check for snap at end point
      const nearbyPlayerEnd = players.find(player => {
        if (!player.position || player.onBoard === false) return false;
        const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
        const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
        const distance = Math.sqrt(Math.pow(endPixelX - playerX, 2) + Math.pow(endPixelY - playerY, 2));
        return distance < 80;
      });
      
      // Highlight both if found
      if (nearbyPlayerStart || nearbyPlayerEnd) {
        setSnapTargetPlayerId(nearbyPlayerStart?.id || nearbyPlayerEnd?.id || null);
      } else {
        setSnapTargetPlayerId(null);
      }
      
      onUpdateFreeLine(lineId, {
        startPosition: { x: newStartX, y: newStartY },
        endPosition: { x: newEndX, y: newEndY }
      });
      return;
    }
    
    // Check if dragging a free line start point
    if (draggedPlayer && draggedPlayer.startsWith('freeline-start-')) {
      const lineId = draggedPlayer.replace('freeline-start-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      // Check for nearby player to highlight
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const nearbyPlayer = players.find(player => {
        if (!player.position || player.onBoard === false) return false;
        const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
        const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
        const distance = Math.sqrt(Math.pow(mouseX - playerX, 2) + Math.pow(mouseY - playerY, 2));
        return distance < 80;
      });
      setSnapTargetPlayerId(nearbyPlayer?.id || null);
      
      onUpdateFreeLine(lineId, {
        startPosition: { x: clampedX, y: clampedY }
      });
      return;
    }
    
    // Check if dragging a decision line box
    if (draggedPlayer && draggedPlayer.startsWith('decisionline-box-')) {
      const lineId = draggedPlayer.replace('decisionline-box-', '');
      const line = decisionLines.find(l => l.id === lineId);
      if (!line) return;
      
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      // Calculate the offset from the old position
      const deltaX = clampedX - line.decisionBoxPosition.x;
      const deltaY = clampedY - line.decisionBoxPosition.y;
      
      // Move all endpoints along with the box
      onUpdateDecisionLine(lineId, {
        decisionBoxPosition: { x: clampedX, y: clampedY },
        startPosition: { 
          x: Math.max(8, Math.min(92, line.startPosition.x + deltaX)), 
          y: Math.max(8, Math.min(92, line.startPosition.y + deltaY))
        },
        option1Position: { 
          x: Math.max(8, Math.min(92, line.option1Position.x + deltaX)), 
          y: Math.max(8, Math.min(92, line.option1Position.y + deltaY))
        },
        option2Position: { 
          x: Math.max(8, Math.min(92, line.option2Position.x + deltaX)), 
          y: Math.max(8, Math.min(92, line.option2Position.y + deltaY))
        }
      });
      return;
    }
    
    // Check if dragging a decision line start point
    if (draggedPlayer && draggedPlayer.startsWith('decisionline-start-')) {
      const lineId = draggedPlayer.replace('decisionline-start-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      onUpdateDecisionLine(lineId, {
        startPosition: { x: clampedX, y: clampedY }
      });
      return;
    }
    
    // Check if dragging a decision line option1 point
    if (draggedPlayer && draggedPlayer.startsWith('decisionline-option1-')) {
      const lineId = draggedPlayer.replace('decisionline-option1-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      onUpdateDecisionLine(lineId, {
        option1Position: { x: clampedX, y: clampedY }
      });
      return;
    }
    
    // Check if dragging a decision line option2 point
    if (draggedPlayer && draggedPlayer.startsWith('decisionline-option2-')) {
      const lineId = draggedPlayer.replace('decisionline-option2-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      onUpdateDecisionLine(lineId, {
        option2Position: { x: clampedX, y: clampedY }
      });
      return;
    }
    
    // Check if dragging a free line end point
    if (draggedPlayer && draggedPlayer.startsWith('freeline-end-')) {
      const lineId = draggedPlayer.replace('freeline-end-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      // Check for nearby player to highlight
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const nearbyPlayer = players.find(player => {
        if (!player.position || player.onBoard === false) return false;
        const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
        const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
        const distance = Math.sqrt(Math.pow(mouseX - playerX, 2) + Math.pow(mouseY - playerY, 2));
        return distance < 80;
      });
      setSnapTargetPlayerId(nearbyPlayer?.id || null);

      
      onUpdateFreeLine(lineId, {
        endPosition: { x: clampedX, y: clampedY }
      });
      return;
    }
    
    // Check if dragging a simple connection line
    if (draggedPlayer && draggedPlayer.startsWith('connection-')) {
      const connectionCardId = draggedPlayer.replace('connection-', '');
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      // Find the card and update position directly (like decision boxes)
      const card = cards.find(c => c.id === connectionCardId);
      
      if (card && onUpdateCard) {
        // Save the absolute position
        onUpdateCard(card.id, {
          openEndPosition: { x: clampedX, y: clampedY }
        });
      }
      return;
    }
    
    // Check if dragging a decision box
    if (draggedPlayer && draggedPlayer.startsWith('decision-')) {
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
    
    // Drag-Preview für Prozessschritte
    if (draggedProcessStep) {
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const x = ((e.clientX - boardRect.left) / boardRect.width) * 100;
      const y = ((e.clientY - boardRect.top) / boardRect.height) * 100;
      
      const clampedX = Math.max(8, Math.min(92, x));
      const clampedY = Math.max(8, Math.min(92, y));
      
      // Finde nahegelegene Spieler zum Highlighten
      const playersOnBoard = players.filter(p => p.onBoard !== false);
      let targetPlayer = null;
      let minDistance = Infinity;

      for (const player of playersOnBoard) {
        const playerPos = getPlayerPosition(player, players.indexOf(player), players.length);
        
        const dx = playerPos.x - clampedX;
        const dy = playerPos.y - clampedY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 8 && distance < minDistance) {
          minDistance = distance;
          targetPlayer = player;
        }
      }
      
      setProcessStepTargetPlayer(targetPlayer?.id || null);
      setDragPreviewPosition({ x: clampedX, y: clampedY });
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
    
    // Prüfe ob Spieler nahe an offenen Enden von freien Linien ist
    let snapToFreeLine = null;
    for (const line of freeLines) {
      // Startpunkt prüfen (wenn nicht angedockt)
      if (!line.startPlayerId) {
        const dx = clampedX - line.startPosition.x;
        const dy = clampedY - line.startPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 8) { // 8% Radius
          snapToFreeLine = { lineId: line.id, endpoint: 'start', position: line.startPosition };
          break;
        }
      }
      // Endpunkt prüfen (wenn nicht angedockt)
      if (!line.endPlayerId) {
        const dx = clampedX - line.endPosition.x;
        const dy = clampedY - line.endPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 8) { // 8% Radius
          snapToFreeLine = { lineId: line.id, endpoint: 'end', position: line.endPosition };
          break;
        }
      }
    }
    
    // Prüfe ob Spieler nahe an offenen Enden von Entscheidungslinien ist
    let snapToDecisionLine = null;
    if (!snapToFreeLine) { // Nur wenn nicht bereits bei freier Linie
      for (const line of decisionLines) {
        // Startpunkt prüfen (wenn nicht angedockt)
        if (!line.startPlayerId) {
          const dx = clampedX - line.startPosition.x;
          const dy = clampedY - line.startPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 8) { // 8% Radius
            snapToDecisionLine = { lineId: line.id, endpoint: 'start', position: line.startPosition };
            break;
          }
        }
        // Option1 Endpunkt prüfen (wenn nicht angedockt)
        if (!line.option1PlayerId) {
          const dx = clampedX - line.option1Position.x;
          const dy = clampedY - line.option1Position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 8) { // 8% Radius
            snapToDecisionLine = { lineId: line.id, endpoint: 'option1', position: line.option1Position };
            break;
          }
        }
        // Option2 Endpunkt prüfen (wenn nicht angedockt)
        if (!line.option2PlayerId) {
          const dx = clampedX - line.option2Position.x;
          const dy = clampedY - line.option2Position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 8) { // 8% Radius
            snapToDecisionLine = { lineId: line.id, endpoint: 'option2', position: line.option2Position };
            break;
          }
        }
      }
    }
    
    // Setze Snap-Target für visuelle Hervorhebung
    if (snapToFreeLine) {
      setSnapTargetPlayerId(snapToFreeLine.lineId + '-' + snapToFreeLine.endpoint); // Verwende lineId als Marker
    } else if (snapToDecisionLine) {
      setSnapTargetPlayerId('decision-' + snapToDecisionLine.lineId + '-' + snapToDecisionLine.endpoint);
    } else {
      setSnapTargetPlayerId(null);
    }
    
    // Wenn der Spieler bereits auf dem Board ist (hat eine Position oder onBoard === true), aktualisiere die Position
    if (player.onBoard === true || (player.onBoard !== false && player.position)) {
      if (onUpdatePlayerPosition && draggedPlayer) {
        console.log('🔵🔵🔵 PLAYER MOVE:', player.name, 'to', { x: clampedX, y: clampedY });
        setWasPlayerDragged(true); // Mark that player was dragged
        onUpdatePlayerPosition(draggedPlayer, { x: clampedX, y: clampedY });
      }
    }
    // Wenn der Spieler aus dem Wartebereich gezogen wird (onBoard === false), zeige nur eine Vorschau
    else if (player.onBoard === false) {
      setWasPlayerDragged(true); // Mark that player was dragged
      setDragPreviewPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    console.log('🖱️ handleMouseUp called - draggedConnection:', !!draggedConnection, 'refDraggedConnection:', !!draggedConnectionRef.current);
    
    // Connection dragging is now handled by global window mouseUp handler
    // Don't interfere with it here - check BOTH state and ref!
    if (draggedConnection || draggedConnectionRef.current) {
      console.log('⏭️ Skipping - connection drag handled by global mouseUp');
      return;
    }
    
    console.log('⚠️ NOT skipping - continuing with handleMouseUp cleanup');
    
    // Wenn ein Kommunikationsobjekt gezogen wurde
    if (draggedCommObject !== null) {
      console.log('✅ Kommunikationsobjekt erfolgreich positioniert');
      setDraggedCommObject(null);
      return;
    }
    
    // Wenn eine freie Linie gezogen wurde
    if (draggedPlayer && (draggedPlayer.startsWith('freeline-start-') || draggedPlayer.startsWith('freeline-end-') || draggedPlayer.startsWith('freeline-middle-'))) {
      console.log('✅ Freie Linie erfolgreich positioniert');
      
      const lineId = draggedPlayer.replace('freeline-start-', '').replace('freeline-end-', '').replace('freeline-middle-', '');
      const line = freeLines.find(l => l.id === lineId);
      
      // Prüfe ob über einem Spieler losgelassen
      if (gameBoardRef.current) {
        const boardRect = gameBoardRef.current.getBoundingClientRect();
        
        // Für Middle-Drag: Prüfe beide Endpunkte
        if (draggedPlayer.startsWith('freeline-middle-')) {
          if (line) {
            // Prüfe Startpunkt
            const startPixelX = (line.startPosition.x / 100) * boardRect.width + boardRect.left;
            const startPixelY = (line.startPosition.y / 100) * boardRect.height + boardRect.top;
            
            const nearbyPlayerStart = players.find(player => {
              if (!player.position || player.onBoard === false) return false;
              const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
              const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
              const distance = Math.sqrt(Math.pow(startPixelX - playerX, 2) + Math.pow(startPixelY - playerY, 2));
              return distance < 80;
            });
            
            if (nearbyPlayerStart && nearbyPlayerStart.position) {
              console.log(`🔗 Linie Start an Spieler ${nearbyPlayerStart.name} angedockt (Middle-Drag)`);
              onUpdateFreeLine(lineId, {
                startPlayerId: nearbyPlayerStart.id,
                startPosition: { x: nearbyPlayerStart.position.x, y: nearbyPlayerStart.position.y }
              });
            }
            
            // Prüfe Endpunkt
            const endPixelX = (line.endPosition.x / 100) * boardRect.width + boardRect.left;
            const endPixelY = (line.endPosition.y / 100) * boardRect.height + boardRect.top;
            
            const nearbyPlayerEnd = players.find(player => {
              if (!player.position || player.onBoard === false) return false;
              const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
              const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
              const distance = Math.sqrt(Math.pow(endPixelX - playerX, 2) + Math.pow(endPixelY - playerY, 2));
              return distance < 80;
            });
            
            if (nearbyPlayerEnd && nearbyPlayerEnd.position) {
              console.log(`🔗 Linie Ende an Spieler ${nearbyPlayerEnd.name} angedockt (Middle-Drag)`);
              onUpdateFreeLine(lineId, {
                endPlayerId: nearbyPlayerEnd.id,
                endPosition: { x: nearbyPlayerEnd.position.x, y: nearbyPlayerEnd.position.y }
              });
            }
          }
        } 
        // Für Start/End-Drag: Prüfe nur das gezogene Ende
        else {
          const isStart = draggedPlayer.startsWith('freeline-start-');
          
          // Verwende den bereits während des Drags identifizierten Snap-Target
          if (snapTargetPlayerId) {
            const targetPlayer = players.find(p => p.id === snapTargetPlayerId);
            if (targetPlayer && targetPlayer.position) {
              console.log(`🔗 Linie ${isStart ? 'Start' : 'Ende'} an Spieler ${targetPlayer.name} angedockt (via snapTarget)`);
              if (isStart) {
                onUpdateFreeLine(lineId, {
                  startPlayerId: targetPlayer.id,
                  startPosition: { x: targetPlayer.position.x, y: targetPlayer.position.y }
                });
              } else {
                onUpdateFreeLine(lineId, {
                  endPlayerId: targetPlayer.id,
                  endPosition: { x: targetPlayer.position.x, y: targetPlayer.position.y }
                });
              }
            }
          } else {
            // Fallback: Suche manuell nach Spieler in der Nähe
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            console.log(`🔍 Suche Spieler in der Nähe von (${mouseX}, ${mouseY})`);
            
            const nearbyPlayer = players.find(player => {
              if (!player.position) return false;
              if (player.onBoard === false) return false;
              
              const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
              const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
              
              const distance = Math.sqrt(
                Math.pow(mouseX - playerX, 2) + Math.pow(mouseY - playerY, 2)
              );
              
              console.log(`  - ${player.name}: position (${playerX}, ${playerY}), distance ${distance.toFixed(1)}px`);
              
              return distance < 80;
            });
            
            if (nearbyPlayer && nearbyPlayer.position) {
              console.log(`🔗 Linie ${isStart ? 'Start' : 'Ende'} an Spieler ${nearbyPlayer.name} angedockt`);
              if (isStart) {
                onUpdateFreeLine(lineId, {
                  startPlayerId: nearbyPlayer.id,
                  startPosition: { x: nearbyPlayer.position.x, y: nearbyPlayer.position.y }
                });
              } else {
                onUpdateFreeLine(lineId, {
                  endPlayerId: nearbyPlayer.id,
                  endPosition: { x: nearbyPlayer.position.x, y: nearbyPlayer.position.y }
                });
              }
            } else {
              console.log('❌ Kein Spieler in der Nähe gefunden');
              // Lösche die Verbindung zum Spieler, falls die Linie wegbewegt wird
              if (line && isStart && line.startPlayerId) {
                onUpdateFreeLine(lineId, {
                  startPlayerId: undefined
                });
              } else if (line && !isStart && line.endPlayerId) {
                onUpdateFreeLine(lineId, {
                  endPlayerId: undefined
                });
              }
            }
          }
        }
      }
      
      setDraggedPlayer(null);
      setFreeLineMiddleDragOffset(null);
      setSnapTargetPlayerId(null);
      return;
    }
    
    // Wenn eine einfache Verbindungslinie gezogen wurde
    if (draggedPlayer && draggedPlayer.startsWith('connection-')) {
      console.log('✅ Simple connection line erfolgreich positioniert');
      setDraggedPlayer(null);
      return;
    }
    
    // Wenn eine Decision Box gezogen wurde
    if (draggedPlayer && draggedPlayer.startsWith('decision-')) {
      const decisionId = draggedPlayer.replace('decision-', '');
      
      if (gameBoardRef.current) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const boardRect = gameBoardRef.current.getBoundingClientRect();
        
        // Prüfe ob über einem Spieler gedroppt
        const nearbyPlayer = players.find(player => {
          if (!player.position || player.onBoard === false) return false;
          
          const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
          const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
          
          const distance = Math.sqrt(
            Math.pow(mouseX - playerX, 2) + Math.pow(mouseY - playerY, 2)
          );
          
          return distance < 80;
        });
        
        if (nearbyPlayer && nearbyPlayer.position) {
          // Andocken an Spieler
          console.log(`🔗 Decision Box an Spieler ${nearbyPlayer.name} angedockt`);
          setDecisionBoxes(prev => prev.map(box => 
            box.id === decisionId 
              ? { 
                  ...box, 
                  dockedToPlayerId: nearbyPlayer.id,
                  position: { x: nearbyPlayer.position!.x, y: nearbyPlayer.position!.y }
                }
              : box
          ));
        }
      }
      
      console.log('✅ Decision Box erfolgreich positioniert');
      setDraggedPlayer(null);
      return;
    }
    
    // Wenn eine Decision Line Endpoint gezogen wurde - Andocken an Spieler
    if (draggedPlayer && (draggedPlayer.startsWith('decisionline-start-') || 
                          draggedPlayer.startsWith('decisionline-option1-') || 
                          draggedPlayer.startsWith('decisionline-option2-'))) {
      if (gameBoardRef.current) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const boardRect = gameBoardRef.current.getBoundingClientRect();
        
        // Bestimme welcher Endpoint
        let lineId: string;
        let endpointType: 'start' | 'option1' | 'option2';
        if (draggedPlayer.startsWith('decisionline-start-')) {
          lineId = draggedPlayer.replace('decisionline-start-', '');
          endpointType = 'start';
        } else if (draggedPlayer.startsWith('decisionline-option1-')) {
          lineId = draggedPlayer.replace('decisionline-option1-', '');
          endpointType = 'option1';
        } else {
          lineId = draggedPlayer.replace('decisionline-option2-', '');
          endpointType = 'option2';
        }
        
        // Prüfe ob über einem Spieler gedroppt
        const nearbyPlayer = players.find(player => {
          if (!player.position || player.onBoard === false) return false;
          
          const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
          const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
          
          const distance = Math.sqrt(
            Math.pow(mouseX - playerX, 2) + Math.pow(mouseY - playerY, 2)
          );
          
          return distance < 80;
        });
        
        if (nearbyPlayer && nearbyPlayer.position) {
          console.log(`🔗 Decision Line ${endpointType} an Spieler ${nearbyPlayer.name} angedockt`);
          
          // Andocken je nach Endpoint-Typ
          if (endpointType === 'start') {
            onUpdateDecisionLine(lineId, {
              startPlayerId: nearbyPlayer.id,
              startPosition: { x: nearbyPlayer.position.x, y: nearbyPlayer.position.y }
            });
          } else if (endpointType === 'option1') {
            onUpdateDecisionLine(lineId, {
              option1PlayerId: nearbyPlayer.id,
              option1Position: { x: nearbyPlayer.position.x, y: nearbyPlayer.position.y }
            });
          } else {
            onUpdateDecisionLine(lineId, {
              option2PlayerId: nearbyPlayer.id,
              option2Position: { x: nearbyPlayer.position.x, y: nearbyPlayer.position.y }
            });
          }
        } else {
          // Kein Spieler in der Nähe - löse Verbindung falls vorhanden
          const line = decisionLines.find(l => l.id === lineId);
          if (line) {
            if (endpointType === 'start' && line.startPlayerId) {
              onUpdateDecisionLine(lineId, { startPlayerId: undefined });
            } else if (endpointType === 'option1' && line.option1PlayerId) {
              onUpdateDecisionLine(lineId, { option1PlayerId: undefined });
            } else if (endpointType === 'option2' && line.option2PlayerId) {
              onUpdateDecisionLine(lineId, { option2PlayerId: undefined });
            }
          }
        }
      }
      
      setDraggedPlayer(null);
      return;
    }
    
    // Wenn ein offenes Verbindungsende gezogen wurde
    if (draggedConnectionEnd && gameBoardRef.current) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      
      // Prüfe ob über einem Spieler gedroppt
      const targetPlayer = players.find(player => {
        if (!player.position || player.onBoard === false) return false;
        
        const playerX = (player.position.x / 100) * boardRect.width + boardRect.left;
        const playerY = (player.position.y / 100) * boardRect.height + boardRect.top;
        
        const distance = Math.sqrt(
          Math.pow(mouseX - playerX, 2) + Math.pow(mouseY - playerY, 2)
        );
        
        return distance < 60;
      });
      
      if (targetPlayer && onUpdateCard) {
        // Verbinde mit Spieler
        const card = cards.find(c => c.id === draggedConnectionEnd.cardId);
        if (card) {
          if (draggedConnectionEnd.isStart) {
            // Verbinde Start mit Spieler
            onUpdateCard(card.id, {
              fromPlayerId: targetPlayer.id,
              playerId: targetPlayer.id,
              playerName: targetPlayer.name,
              text: card.toPlayerId 
                ? `Prozess: ${targetPlayer.name} → ${players.find(p => p.id === card.toPlayerId)?.name}`
                : `Prozess von ${targetPlayer.name}`,
              openEndPosition: undefined
            });
          } else {
            // Verbinde Ende mit Spieler
            const fromPlayer = players.find(p => p.id === card.fromPlayerId);
            onUpdateCard(card.id, {
              toPlayerId: targetPlayer.id,
              text: fromPlayer
                ? `Prozess: ${fromPlayer.name} → ${targetPlayer.name}`
                : `Prozess → ${targetPlayer.name}`,
              openEndPosition: undefined
            });
          }
        }
      }
      
      setDraggedConnectionEnd(null);
      return;
    }
    
    // Speichere die Werte BEVOR sie zurückgesetzt werden
    const currentDraggedPlayer = draggedPlayer;
    const currentDraggedProcessStep = draggedProcessStep;

    // Wenn ein Spieler gezogen wurde (aus Wartebereich ODER bereits auf dem Board)
    if (currentDraggedPlayer && gameBoardRef.current) {
      const player = players.find(p => p.id === currentDraggedPlayer);

      if (player) {
        const boardRect = gameBoardRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Prüfe ob die Maus über dem Spielfeld ist
        const isOverBoard = mouseX >= boardRect.left && 
                           mouseX <= boardRect.right && 
                           mouseY >= boardRect.top && 
                           mouseY <= boardRect.bottom;

        if (isOverBoard) {
          // Berechne Position auf dem Spielfeld
          const dropX = ((mouseX - boardRect.left) / boardRect.width) * 100;
          const dropY = ((mouseY - boardRect.top) / boardRect.height) * 100;

          // 1. Prüfe ob Spieler auf ein offenes Ende einer freien Linie gezogen wird
          let connectedToFreeLine = false;
          for (const line of freeLines) {
            // Startpunkt prüfen
            if (!line.startPlayerId) {
              const startX = line.startPosition.x;
              const startY = line.startPosition.y;
              const dx = dropX - startX;
              const dy = dropY - startY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 12) { // Größerer Snap-Radius: 12% statt 8%
                // Andocken am Startpunkt
                if (onUpdateFreeLine) {
                  onUpdateFreeLine(line.id, {
                    startPlayerId: player.id,
                    startPosition: { x: player.position?.x ?? dropX, y: player.position?.y ?? dropY }
                  });
                }
                if (onUpdatePlayerPosition) {
                  onUpdatePlayerPosition(currentDraggedPlayer, { x: startX, y: startY });
                }
                connectedToFreeLine = true;
                console.log(`🔗 Spieler ${player.name} an Startpunkt von Linie ${line.id} angedockt`);
                break;
              }
            }
            // Endpunkt prüfen
            if (!line.endPlayerId) {
              const endX = line.endPosition.x;
              const endY = line.endPosition.y;
              const dx = dropX - endX;
              const dy = dropY - endY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 12) { // Größerer Snap-Radius: 12% statt 8%
                // Andocken am Endpunkt
                if (onUpdateFreeLine) {
                  onUpdateFreeLine(line.id, {
                    endPlayerId: player.id,
                    endPosition: { x: player.position?.x ?? dropX, y: player.position?.y ?? dropY }
                  });
                }
                if (onUpdatePlayerPosition) {
                  onUpdatePlayerPosition(currentDraggedPlayer, { x: endX, y: endY });
                }
                connectedToFreeLine = true;
                console.log(`🔗 Spieler ${player.name} an Endpunkt von Linie ${line.id} angedockt`);
                break;
              }
            }
          }

          // 2. Prüfe ob Spieler auf ein offenes Ende einer Entscheidungslinie gezogen wird
          let connectedToDecisionLine = false;
          if (!connectedToFreeLine) {
            for (const line of decisionLines) {
              // Startpunkt prüfen
              if (!line.startPlayerId) {
                const startX = line.startPosition.x;
                const startY = line.startPosition.y;
                const dx = dropX - startX;
                const dy = dropY - startY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 12) { // Größerer Snap-Radius: 12% statt 8%
                  // Andocken am Startpunkt
                  if (onUpdateDecisionLine) {
                    onUpdateDecisionLine(line.id, {
                      startPlayerId: player.id,
                      startPosition: { x: player.position?.x ?? dropX, y: player.position?.y ?? dropY }
                    });
                  }
                  if (onUpdatePlayerPosition) {
                    onUpdatePlayerPosition(currentDraggedPlayer, { x: startX, y: startY });
                  }
                  connectedToDecisionLine = true;
                  console.log(`🔗 Spieler ${player.name} an Startpunkt von Entscheidung ${line.id} angedockt`);
                  break;
                }
              }
              // Option1 Endpunkt prüfen
              if (!line.option1PlayerId) {
                const option1X = line.option1Position.x;
                const option1Y = line.option1Position.y;
                const dx = dropX - option1X;
                const dy = dropY - option1Y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 12) { // Größerer Snap-Radius: 12% statt 8%
                  // Andocken an Option1
                  if (onUpdateDecisionLine) {
                    onUpdateDecisionLine(line.id, {
                      option1PlayerId: player.id,
                      option1Position: { x: player.position?.x ?? dropX, y: player.position?.y ?? dropY }
                    });
                  }
                  if (onUpdatePlayerPosition) {
                    onUpdatePlayerPosition(currentDraggedPlayer, { x: option1X, y: option1Y });
                  }
                  connectedToDecisionLine = true;
                  console.log(`🔗 Spieler ${player.name} an Option1 von Entscheidung ${line.id} angedockt`);
                  break;
                }
              }
              // Option2 Endpunkt prüfen
              if (!line.option2PlayerId) {
                const option2X = line.option2Position.x;
                const option2Y = line.option2Position.y;
                const dx = dropX - option2X;
                const dy = dropY - option2Y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 12) { // Größerer Snap-Radius: 12% statt 8%
                  // Andocken an Option2
                  if (onUpdateDecisionLine) {
                    onUpdateDecisionLine(line.id, {
                      option2PlayerId: player.id,
                      option2Position: { x: player.position?.x ?? dropX, y: player.position?.y ?? dropY }
                    });
                  }
                  if (onUpdatePlayerPosition) {
                    onUpdatePlayerPosition(currentDraggedPlayer, { x: option2X, y: option2Y });
                  }
                  connectedToDecisionLine = true;
                  console.log(`🔗 Spieler ${player.name} an Option2 von Entscheidung ${line.id} angedockt`);
                  break;
                }
              }
            }
          }

          // 3. Prüfe ob Spieler auf eine offene Verbindung gezogen wird (wie bisher)
          if (!connectedToFreeLine && !connectedToDecisionLine) {
            // Placeholder für zukünftige Connection-Logik
            // Wenn nicht an offenes Ende gedockt: normal platzieren
            if (player.onBoard === false && onUpdatePlayerPosition) {
              const clampedX = Math.max(8, Math.min(92, dropX));
              const clampedY = Math.max(8, Math.min(92, dropY));
              onUpdatePlayerPosition(currentDraggedPlayer, { x: clampedX, y: clampedY });
            }
          }
        }
      }
    }
    
    // Wenn ein Prozessschritt gezogen wurde
    if (currentDraggedProcessStep && gameBoardRef.current && onUpdateProcessObject) {
      console.log('🖱️ MouseUp mit Prozessschritt:', currentDraggedProcessStep);
      console.log('📍 Ursprünglicher Zustand:', draggedProcessStepOriginalState);

      // Berechne Drop-Position in Prozent
      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = ((e.clientX - rect.left) / rect.width) * 100;
      const dropY = ((e.clientY - rect.top) / rect.height) * 100;

      // Finde Spieler in der Nähe (60px Radius entspricht ~6%)
      const playersOnBoard = players.filter(p => p.onBoard !== false);
      
      let targetPlayer = null;
      let minPlayerDistance = Infinity;

      for (const player of playersOnBoard) {
        const playerPos = getPlayerPosition(player, players.indexOf(player), players.length);
        
        const dx = playerPos.x - dropX;
        const dy = playerPos.y - dropY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 8 && distance < minPlayerDistance) {
          minPlayerDistance = distance;
          targetPlayer = player;
        }
      }

      if (targetPlayer) {
        // Prozessschritt an Spieler andocken
        console.log('🔗 Docke Prozessschritt an Spieler an:', currentDraggedProcessStep, '→', targetPlayer.name);
        
        const processStep = processObjects.find(obj => obj.id === currentDraggedProcessStep) as ProcessStep;
        
        if (processStep) {
          onUpdateProcessObject(currentDraggedProcessStep, {
            assignedToPlayerId: targetPlayer.id,
            inWaitingArea: false,
            position: undefined, // Position wird nicht mehr benötigt, da er am Spieler hängt
          });
        }
      } else {
        // Wenn kein Spieler in der Nähe: Prozessschritt auf dem Board platzieren oder zurück in Wartebox
        const processStep = processObjects.find(obj => obj.id === currentDraggedProcessStep) as ProcessStep;
        
        if (processStep && draggedProcessStepOriginalState) {
          // Prüfe ob der Drop auf dem Board erfolgte
          if (dropX >= 5 && dropX <= 95 && dropY >= 5 && dropY <= 95) {
            // Auf dem Board platzieren
            console.log('📍 Platziere Prozessschritt auf dem Board:', dropX, dropY);
            onUpdateProcessObject(currentDraggedProcessStep, {
              position: { x: dropX, y: dropY },
              inWaitingArea: false,
              assignedToPlayerId: undefined,
            });
          } else {
            // Zurück zum ursprünglichen Zustand
            console.log('↩️ Prozessschritt zurück zum ursprünglichen Zustand');
            onUpdateProcessObject(currentDraggedProcessStep, {
              position: draggedProcessStepOriginalState.position,
              inWaitingArea: draggedProcessStepOriginalState.inWaitingArea,
              assignedToPlayerId: draggedProcessStepOriginalState.assignedToPlayerId,
            });
          }
        }
      }
    }
    
    setDraggedPlayer(null);
    setDraggedProcessStep(null);
    setDraggedProcessStepOriginalState(null);
    setProcessStepTargetPlayer(null);
    setDragPreviewPosition(null);
    setDraggedConnectionEnd(null);
    setDraggedCommObject(null);
    setDraggedConnection(null);
    setConnectionDragOffset({ x: 0, y: 0 });
    setSnapTargetPlayerId(null); // Reset Snap-Target für freie Linien
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
  const calculateCurveControlPoint = (fromPos: {x: number, y: number}, toPos: {x: number, y: number}, fromId: string, toId: string, curveOffset?: {x: number, y: number}) => {
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
      let controlX = midX + perpX * controlPointDistance * curveDirection;
      let controlY = midY + perpY * controlPointDistance * curveDirection;
      
      // Apply curve offset if provided
      if (curveOffset) {
        controlX += curveOffset.x;
        controlY += curveOffset.y;
      }
      
      return { controlX, controlY, controlPointDistance, finalDirection: curveDirection };
    }
    
    // For normal connections: ALWAYS bend away from center (outward)
    // Determine which perpendicular direction points away from center
    const dot1 = perpX * midToCenterX + perpY * midToCenterY;
    const dot2 = -perpX * midToCenterX + -perpY * midToCenterY;
    
    // Choose direction that points away from center (positive dot product = same direction)
    const curveDirection = dot1 > dot2 ? 1 : -1;
    
    let controlX = midX + perpX * controlPointDistance * curveDirection;
    let controlY = midY + perpY * controlPointDistance * curveDirection;
    
    // Apply curve offset if provided
    if (curveOffset) {
      controlX += curveOffset.x;
      controlY += curveOffset.y;
    }
    
    return { controlX, controlY, controlPointDistance, finalDirection: curveDirection };
  };

  const getConnections = () => {
    const connections: Array<{ from: string; to: string | null; count: number; cards: ProcessCard[] }> = [];
    
    cards.forEach(card => {
      // Erlaube auch Verbindungen ohne Empfänger (to kann leer sein)
      const existing = connections.find(
        c => c.from === card.fromPlayerId && c.to === (card.toPlayerId || null)
      );
      
      if (existing) {
        existing.count++;
        existing.cards.push(card);
      } else {
        connections.push({
          from: card.fromPlayerId,
          to: card.toPlayerId || null,
          count: 1,
          cards: [card],
        });
      }
    });
    
    return connections;
  };

  // Render swimlane view with horizontal lanes

  // Render swimlane view with horizontal lanes
  const renderSwimlaneView = () => {
    const connections = getConnections();
    const activePlayers = playersByNewest.filter(p => p.onBoard !== false);
    
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
        toId: conn.to || undefined,
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
                    <div className="text-3xl mb-1">{renderIcon(player.icon)}</div>
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
            {processSteps.filter(s => s.isDecision).map((step) => {
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
              
              return box.options.map((option: any, optIdx: number) => {
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
                      setInspectedProcessStep(step.id);
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
                      <div className="text-2xl mb-2">{renderIcon(player.icon)}</div>
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Simplified Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-white/10 shadow-2xl flex-shrink-0 relative z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Processorix</h1>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Verwaltung Button */}
            <div className="relative">
              <button
                onClick={() => setShowManagementMenu(!showManagementMenu)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border text-sm font-medium bg-slate-700/50 hover:bg-slate-600/50 border-white/10 text-white"
              >
                <Settings className="w-4 h-4" />
                <span>Verwaltung</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showManagementMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showManagementMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowManagementMenu(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-[500px] bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-purple-400/30 z-50 overflow-hidden">
                    {!showVersions ? (
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                            <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-2xl">Spiel speichern</h3>
                            <p className="text-gray-400 text-sm">Erstelle eine neue Version</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-300 mb-3">Spielname (optional)</label>
                          <input
                            type="text"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            placeholder="z.B. Projektname, Kunde, Abteilung..."
                            className="w-full px-5 py-4 bg-slate-700/50 text-white rounded-xl border-2 border-purple-400/30 focus:border-purple-400 focus:outline-none text-base placeholder-gray-500 transition-all shadow-lg"
                          />
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-300 mb-3">Versionsname</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="z.B. Version 1.0, Zwischenstand, Finale Version..."
                            className="w-full px-5 py-4 bg-slate-700/50 text-white rounded-xl border-2 border-purple-400/30 focus:border-purple-400 focus:outline-none text-base placeholder-gray-500 transition-all shadow-lg"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && companyName.trim() && gameId) {
                                e.preventDefault();
                                const saveBtn = document.getElementById('save-process-btn');
                                saveBtn?.click();
                              }
                            }}
                          />
                        </div>
                        
                        {saveMessage && (
                          <div className="mb-6 px-5 py-4 bg-green-500/20 text-green-300 rounded-xl text-sm font-semibold flex items-center gap-3 border border-green-400/30 shadow-lg">
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {saveMessage}
                          </div>
                        )}
                        
                        <div className="space-y-3 mb-6">
                          <button
                            id="save-process-btn"
                            onClick={async () => {
                              if (companyName.trim() && gameId) {
                                try {
                                  await gameService.saveGameVersion(gameId, companyName.trim(), {
                                    players,
                                    cards,
                                    processObjects,
                                    freeLines,
                                    decisionLines
                                  }, gameName.trim() || undefined);
                                  setSaveMessage('Prozess erfolgreich gespeichert!');
                                  setTimeout(() => {
                                    setSaveMessage('');
                                    setCompanyName('');
                                    setGameName('');
                                  }, 3000);
                                } catch (error) {
                                  console.error('Fehler beim Speichern:', error);
                                  setSaveMessage('Fehler beim Speichern');
                                }
                              }
                            }}
                            disabled={!companyName.trim()}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:shadow-none disabled:scale-100"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Prozess speichern
                          </button>
                          
                          <button
                            onClick={() => setShowVersions(true)}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all font-bold text-base border-2 border-purple-400/30 hover:border-purple-400/50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            Prozess öffnen
                            {gameVersions.length > 0 && (
                              <span className="ml-auto px-3 py-1.5 bg-purple-500/30 text-purple-300 rounded-lg text-sm font-bold border border-purple-400/30">
                                {gameVersions.length}
                              </span>
                            )}
                          </button>
                        </div>
                        
                        <div className="pt-4 border-t-2 border-slate-700/50">
                          <button
                            onClick={() => {
                              if (window.confirm('Möchtest du dich wirklich abmelden?')) {
                                // Logout-Logik hier
                                setShowManagementMenu(false);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/30 hover:bg-red-500/20 text-gray-300 hover:text-red-300 rounded-xl transition-all font-semibold text-base border-2 border-slate-600/30 hover:border-red-400/30"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Abmelden
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                              <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-xl">Gespeicherte Versionen</h3>
                              <p className="text-gray-400 text-sm">{gameVersions.length} {gameVersions.length === 1 ? 'Version' : 'Versionen'} verfügbar</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowVersions(false)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                        
                        {gameVersions.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-400 font-medium">Keine gespeicherten Versionen</p>
                            <p className="text-gray-500 text-sm mt-1">Erstelle deine erste Version im Speichern-Tab</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Gruppiere Versionen nach Spielname */}
                            {Object.entries(
                              gameVersions.reduce((acc, version) => {
                                const key = version.gameName;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(version);
                                return acc;
                              }, {} as Record<string, typeof gameVersions>)
                            ).map(([gameName, versions]) => (
                              <div key={gameName} className="border border-purple-400/20 rounded-xl p-4 bg-slate-800/30">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                                  <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{gameName}</h4>
                                    <p className="text-gray-400 text-xs">{versions[0].gameId}</p>
                                  </div>
                                  <span className="ml-auto px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-bold">
                                    {versions.length} {versions.length === 1 ? 'Version' : 'Versionen'}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {versions.map((version, index) => (
                                    <button
                                      key={version.id}
                                      onClick={async () => {
                                        if (gameId && window.confirm(`Version "${version.versionName}" von "${version.gameName}" laden?\n\nDer aktuelle Spielstand wird überschrieben!`)) {
                                          try {
                                            await gameService.loadGameVersion(gameId, version.id);
                                            setSaveMessage('Version geladen!');
                                            setShowVersions(false);
                                            setTimeout(() => {
                                              setSaveMessage('');
                                              setShowManagementMenu(false);
                                            }, 1500);
                                          } catch (error) {
                                            console.error('Fehler beim Laden:', error);
                                            alert('Fehler beim Laden der Version');
                                          }
                                        }
                                      }}
                                      className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all border border-white/10 hover:border-purple-400/30 group"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-bold">
                                              #{versions.length - index}
                                            </span>
                                            <div className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">
                                              {version.versionName}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                              </svg>
                                              {version.timestamp?.toDate ? new Date(version.timestamp.toDate()).toLocaleString('de-DE', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              }) : 'Gerade eben'}
                                            </div>
                                          </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 18l6-6-6-6" />
                                        </svg>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Ansichtsansicht Button */}
            <button
              onClick={() => {
                if (viewMode === 'swimlane') setViewMode('player-centric');
                else setViewMode('swimlane');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border text-sm font-medium ${
                viewMode === 'swimlane' 
                  ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-200' 
                  : 'bg-slate-700/50 hover:bg-slate-600/50 border-white/10 text-white'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="4" rx="1" />
                <rect x="2" y="10" width="20" height="4" rx="1" />
                <rect x="2" y="16" width="20" height="4" rx="1" />
              </svg>
              <span>Ansichtsansicht</span>
            </button>
            
            {/* Ergebnisse Button */}
            <button
              onClick={() => setShowResultsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl transition-all border border-emerald-500/30 text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Ergebnisse</span>
            </button>
            
            {/* Share Button */}
            {gameId && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all border border-white/10 text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Teilen</span>
              </button>
            )}

            {/* Hinzufügen Dropdown */}
            <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg font-medium relative z-[300] text-sm"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
              <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
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
                  disabled={playersByNewest.filter(p => p.onBoard !== false).length === 0}
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
                  onClick={() => {
                    // Füge eine neue freie Linie hinzu
                    onAddFreeLine({
                      startPosition: { x: 30, y: 30 },
                      endPosition: { x: 70, y: 30 },
                      color: '#3B82F6',
                      thickness: 2,
                      style: 'solid'
                    });
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <span className="text-lg">📏</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Freie Linie</div>
                    <div className="text-xs text-gray-400">Verschiebbare Linie hinzufügen</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Füge eine neue Entscheidungslinie hinzu
                    onAddDecisionLine({
                      startPosition: { x: 30, y: 50 },
                      option1Position: { x: 60, y: 35 },
                      option2Position: { x: 60, y: 65 },
                      decisionBoxPosition: { x: 45, y: 50 },
                      question: 'Entscheidung?',
                      option1Label: 'Ja',
                      option2Label: 'Nein',
                      color: '#F59E0B'
                    });
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Entscheidung</div>
                    <div className="text-xs text-gray-400">Zwei Optionen mit Decision Box</div>
                  </div>
                </button>

                <button
                  onClick={handleAddTestProcesses}
                  disabled={playersByNewest.filter(p => p.onBoard !== false).length < 4}
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
                  disabled={playersByNewest.filter(p => p.onBoard !== false).length < 4}
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
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                    <span className="text-lg">🔗</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Freie Verbindung</div>
                    <div className="text-xs text-gray-400">Ohne Sender und Empfänger</div>
                  </div>
                </button>
              </div>
            )}
            </div>

            {/* User Name Display - ganz rechts */}
            {userName ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">{userName}</span>
              </div>
            ) : (
              <button
                onClick={onShowLogin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border text-sm font-medium bg-slate-700/50 hover:bg-slate-600/50 border-white/10 text-white"
              >
                <User className="w-4 h-4" />
                <span>Anmelden</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col gap-4 p-4 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
            onClick={(e) => {
              // Schließe Spieler-Details wenn auf freies Feld geklickt wird
              if (e.target === e.currentTarget) {
                setSelectedPlayerDetail(null);
              }
            }}
            onMouseDown={(e) => {
              if (gameBoardRef.current) {
                const boardRect = gameBoardRef.current.getBoundingClientRect();
                const mouseX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
                const mouseY = ((e.clientY - boardRect.top) / boardRect.height) * 100;
                console.log('🖱️ GLOBAL Board mouseDown at:', mouseX.toFixed(2), mouseY.toFixed(2));
                console.log('   Target element:', e.target);
                console.log('   Target tagName:', (e.target as any).tagName);
                console.log('   Target className:', (e.target as any).className);
              }
            }}
            onMouseMove={(e) => {
              // Handle connection curve dragging (existing connections)
              if (draggedConnection) {
                console.log('📋 Board mouseMove - connection drag detected', draggedConnection);
                handleMouseMove(e);
                return; // Don't handle other drag operations
              }
              // Handle new connection creation
              if (isDraggingConnection) {
                handleDragConnectionMove(e);
              }
            }}
            onMouseUp={(e) => {
              console.log('📋 Board mouseUp', { draggedConnection, draggedPlayer, refDraggedConnection: draggedConnectionRef.current });
              
              // Handle connection dragging - Check BOTH state and ref!
              if (draggedConnection || draggedConnectionRef.current) {
                console.log('✅ Connection drag detected in board mouseUp, skipping handleMouseUp');
                // Don't call handleMouseUp - let global handler deal with it
                e.stopPropagation();
                return;
              }
              
              // Always call handleMouseUp for player/process step dragging
              handleMouseUp(e);
            }}
          >
          
          {/* Render based on viewMode */}
          {viewMode === 'swimlane' ? (
            renderSwimlaneView()
          ) : (
            <>
          {/* SVG for connections */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            style={{ zIndex: 30, pointerEvents: 'none' }}
            onMouseDown={(e) => {
              // Only handle if clicking directly on SVG (not on a child element)
              if ((e.target as any).tagName === 'svg') {
                console.log('🎨 SVG mouseDown - checking for nearby connections');
                
                if (gameBoardRef.current) {
                  // Check all connections to see if click is near any of them
                  const allConnections = getConnections();
                  for (const conn of allConnections) {
                    // We'll check if the click is close enough to start dragging
                    // For now, just log that we're checking
                    console.log('  Checking connection from', conn.from, 'to', conn.to);
                  }
                  
                  // If no connection path caught the event, maybe start dragging the nearest one
                  console.log('  No path element was clicked - you clicked on empty SVG space');
                }
              }
            }}
            onMouseMove={(e) => {
              // Wenn ein Verbindungsende gezogen wird, aktualisiere Position
              if (draggedConnectionEnd) {
                handleMouseMove(e as any);
              }
              // Wenn die gesamte Verbindung gezogen wird (bestehende Verbindung verschieben)
              if (draggedConnection) {
                console.log('🎨 SVG mouseMove - calling handleMouseMove for connection drag');
                handleMouseMove(e as any);
              }
            }}
            onMouseUp={(e) => {
              // Wenn ein Verbindungsende gezogen wird, behandle es hier
              if (draggedConnectionEnd) {
                e.stopPropagation();
                handleMouseUp(e as any);
              }
              // Wenn die gesamte Verbindung gezogen wird, auch hier behandeln
              if (draggedConnection) {
                e.stopPropagation();
                console.log('🎨 SVG mouseUp - connection drag detected');
                handleMouseUp(e as any);
              }
            }}
          >
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
              const fromPos = getPlayerPosition(fromPlayer, fromIndex, playersByNewest.filter(p => p.onBoard !== false).length);
              
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
              
              // Verbindung ohne Empfänger: Einfache gerade Linie (wird später außerhalb SVG gerendert)
              if (!conn.to) {
                // Skip rendering in SVG - we'll render these as HTML elements below
                return null;
              }
              
              const toPlayer = players.find(p => p.id === conn.to);
              
              if (!toPlayer) return null;
              
              const fromIndex = fromPlayer ? players.indexOf(fromPlayer) : -1;
              const toIndex = players.indexOf(toPlayer);
              const fromPos = fromPlayer 
                ? getPlayerPosition(fromPlayer, fromIndex, players.length)
                : { x: 30, y: 30 }; // Default Position für freie Verbindungen
              const toPos = getPlayerPosition(toPlayer, toIndex, players.length);
              
              // Check if we're currently dragging THIS connection
              const isDraggingThisConn = draggedConnection?.from === conn.from && 
                (draggedConnection.to === conn.to || (!draggedConnection.to && !conn.to));
              
              // Apply offset to move entire connection (saved + current drag)
              const savedOffset = conn.cards[0]?.connectionOffset || { x: 0, y: 0 };
              const currentOffset = isDraggingThisConn ? connectionDragOffset : { x: 0, y: 0 };
              const totalOffset = {
                x: savedOffset.x + currentOffset.x,
                y: savedOffset.y + currentOffset.y
              };
              
              let adjustedFromPos = {
                x: fromPos.x + totalOffset.x,
                y: fromPos.y + totalOffset.y
              };
              let adjustedToPos = {
                x: toPos.x + totalOffset.x,
                y: toPos.y + totalOffset.y
              };
              
              // Get port positions (lines start/end at ports, not center)
              const startPort = getPlayerPortPosition(adjustedFromPos, adjustedToPos, true);
              const endPort = getPlayerPortPosition(adjustedFromPos, adjustedToPos, false);
              
              // Use helper function to calculate curve
              const { controlX, controlY } = calculateCurveControlPoint(
                adjustedFromPos,
                adjustedToPos,
                conn.from,
                conn.to,
                conn.cards[0]?.curveOffset
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
                    style={{ cursor: selectedCommObject ? 'copy' : 'move', pointerEvents: 'stroke' }}
                    onMouseDown={(e) => {
                      // If communication object is selected, don't start dragging
                      if (selectedCommObject) return;
                      
                      console.log('🎯 MouseDown on NORMAL connection path - starting drag');
                      e.stopPropagation();
                      const connData = { from: conn.from, to: conn.to };
                      console.log('🔗 Setting draggedConnection to:', connData);
                      
                      // Calculate mouse position relative to board
                      if (gameBoardRef.current) {
                        const boardRect = gameBoardRef.current.getBoundingClientRect();
                        const mouseX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
                        const mouseY = ((e.clientY - boardRect.top) / boardRect.height) * 100;
                        connectionDragStartRef.current = { x: mouseX, y: mouseY };
                      }
                      
                      setDraggedConnection(connData);
                      draggedConnectionRef.current = connData;
                      console.log('✅ Refs set from NORMAL path - draggedConnectionRef.current:', draggedConnectionRef.current);
                    }}
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
                          to: conn.to || undefined,
                          x: e.clientX,
                          y: e.clientY
                        });
                      }
                    }}
                    onMouseEnter={() => {
                      console.log('Connection hover START');
                      setHoveredConnection({ from: conn.from, to: conn.to || undefined });
                    }}
                    onMouseLeave={() => {
                      console.log('Connection hover END');
                      setHoveredConnection(null);
                    }}
                  />
                  {/* Visible path */}
                  <path
                    d={path}
                    stroke={fromPlayer?.color || '#888888'}
                    strokeWidth={isSelected ? "0.8" : isHovered ? "0.7" : "0.5"}
                    fill="none"
                    opacity={isSelected ? "1" : isHovered ? "0.9" : "0.75"}
                    markerEnd={fromPlayer ? `url(#arrowhead-${fromPlayer.id})` : undefined}
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
                  
                  {/* Drag-Handle in der Mitte der Verbindung */}
                  {(() => {
                    const isDraggingThisConnection = draggedConnection?.from === conn.from && 
                      (draggedConnection.to === conn.to || (!draggedConnection.to && !conn.to));
                    
                    return (
                      <g>
                        {/* TEST: Sichtbarer roter Test-Kreis um zu sehen ob klickbar */}
                        <circle
                          cx={controlX}
                          cy={controlY}
                          r="5"
                          fill="red"
                          fillOpacity="0.3"
                          style={{ cursor: 'grab', pointerEvents: 'auto' }}
                          onClick={() => console.log('🔴 TEST: Roter Kreis geklickt!')}
                        />
                        {/* Unsichtbarer großer Klickbereich - VIEL GRÖSSER für bessere UX */}
                        <circle
                          cx={controlX}
                          cy={controlY}
                          r="8"
                          fill="transparent"
                          style={{ cursor: 'grab', pointerEvents: 'auto' }}
                          onMouseDown={(e) => {
                            console.log('🎯 DRAG HANDLE MOUSE DOWN TRIGGERED!');
                            e.stopPropagation();
                            const connData = { from: conn.from, to: conn.to };
                            console.log('🖱️ Mouse down on connection drag handle:', connData);
                            
                            // Calculate mouse position relative to board
                            if (gameBoardRef.current) {
                              const boardRect = gameBoardRef.current.getBoundingClientRect();
                              const mouseX = ((e.clientX - boardRect.left) / boardRect.width) * 100;
                              const mouseY = ((e.clientY - boardRect.top) / boardRect.height) * 100;
                              connectionDragStartRef.current = { x: mouseX, y: mouseY };
                            }
                            
                            setDraggedConnection(connData);
                            draggedConnectionRef.current = connData; // Set ref immediately
                            console.log('✅ draggedConnection and ref set to:', connData);
                          }}
                        />
                        {/* Äußerer Ring - DEUTLICH SICHTBAR */}
                        <circle
                          cx={controlX}
                          cy={controlY}
                          r={isDraggingThisConnection ? "4" : isHovered ? "3.5" : "3"}
                          fill="white"
                          fillOpacity={isHovered || isDraggingThisConnection ? "0.7" : "0.5"}
                          className="transition-all"
                          style={{ pointerEvents: 'none' }}
                        />
                        {/* Mittlerer Ring - DEUTLICH SICHTBAR */}
                        <circle
                          cx={controlX}
                          cy={controlY}
                          r={isDraggingThisConnection ? "2.8" : isHovered ? "2.5" : "2.2"}
                          fill="white"
                          fillOpacity={isHovered || isDraggingThisConnection ? "0.8" : "0.6"}
                          className="transition-all"
                          style={{ pointerEvents: 'none' }}
                        />
                        {/* Innerer Punkt - DEUTLICH SICHTBAR */}
                        <circle
                          cx={controlX}
                          cy={controlY}
                          r={isDraggingThisConnection ? "1.8" : isHovered ? "1.5" : "1.3"}
                          fill="white"
                          fillOpacity={isDraggingThisConnection ? "1" : isHovered ? "0.95" : "0.85"}
                          stroke={fromPlayer?.color || '#888888'}
                          strokeWidth="0.4"
                          className="transition-all"
                          style={{ pointerEvents: 'none' }}
                        />
                        {/* Pulsierender Effekt beim Dragging */}
                        {isDraggingThisConnection && (
                          <circle
                            cx={controlX}
                            cy={controlY}
                            r="3.5"
                            fill="white"
                            fillOpacity="0.4"
                            className="animate-ping"
                            style={{ pointerEvents: 'none' }}
                          />
                        )}
                      </g>
                    );
                  })()}
                  
                  {/* Ziehbarer Start-Handle wenn kein fromPlayer */}
                  {!fromPlayer && (
                    <circle
                      cx={startPort.x}
                      cy={startPort.y}
                      r="2"
                      fill="#888888"
                      stroke="white"
                      strokeWidth="0.3"
                      opacity={isSelected ? "1" : isHovered ? "0.9" : "0.7"}
                      style={{ cursor: 'grab', pointerEvents: 'auto' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        console.log('🎯 Dragging start of connection to player');
                        // Start dragging from this connection to connect to a player
                        setIsDraggingConnection(true);
                        setDragConnectionFrom(''); // Empty = looking for start player
                        // Store which connection we're editing
                        conn.cards.forEach(card => {
                          (card as any)._editingStart = true;
                        });
                      }}
                    />
                  )}
                </g>
              );
            })}
            
            {/* Decision box connections */}
            {decisionBoxes.map((decisionBox) => {
              const fromPlayer = decisionBox.fromPlayerId ? players.find(p => p.id === decisionBox.fromPlayerId) : null;
              
              const boxPos = decisionBox.position;
              
              // Line from player to decision box (if player exists)
              const lineToBox = fromPlayer ? (
                <g key={`line-to-${decisionBox.id}`}>
                  <line
                    x1={getPlayerPosition(fromPlayer, players.indexOf(fromPlayer), players.length).x}
                    y1={getPlayerPosition(fromPlayer, players.indexOf(fromPlayer), players.length).y}
                    x2={boxPos.x}
                    y2={boxPos.y}
                    stroke={fromPlayer.color}
                    strokeWidth="0.6"
                    strokeDasharray="4,4"
                    opacity="0.8"
                    markerEnd={`url(#arrowhead-${fromPlayer.id})`}
                  />
                </g>
              ) : (
                // Offenes Ende zum Decision Box (ziehbar)
                <g key={`line-to-${decisionBox.id}`}>
                  <line
                    x1={boxPos.x - 15}
                    y1={boxPos.y}
                    x2={boxPos.x}
                    y2={boxPos.y}
                    stroke="#888888"
                    strokeWidth="0.6"
                    strokeDasharray="4,4"
                    opacity="0.8"
                  />
                  <circle
                    cx={boxPos.x - 15}
                    cy={boxPos.y}
                    r="2"
                    fill="#888888"
                    stroke="white"
                    strokeWidth="0.3"
                    style={{ cursor: 'grab', pointerEvents: 'auto' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      console.log('🎯 Dragging decision box input');
                    }}
                  />
                </g>
              );
              
              // Lines from decision box to target players (curved only for back-connections)
              const linesToTargets = decisionBox.options.map((option, optionIndex) => {
                const toPlayer = option.toPlayerId ? players.find(p => p.id === option.toPlayerId) : null;
                
                // Wenn kein Ziel-Spieler: zeichne offenes Ende
                if (!toPlayer) {
                  const angle = optionIndex * 60 - 30; // Verteile Ausgänge
                  const endX = boxPos.x + 15 * Math.cos(angle * Math.PI / 180);
                  const endY = boxPos.y + 15 * Math.sin(angle * Math.PI / 180);
                  
                  return (
                    <g key={`line-from-${decisionBox.id}-option-${optionIndex}`}>
                      <line
                        x1={boxPos.x}
                        y1={boxPos.y}
                        x2={endX}
                        y2={endY}
                        stroke={option.color || '#888888'}
                        strokeWidth="0.6"
                        strokeDasharray="4,4"
                        opacity="0.8"
                      />
                      <circle
                        cx={endX}
                        cy={endY}
                        r="2"
                        fill={option.color || '#888888'}
                        stroke="white"
                        strokeWidth="0.3"
                        style={{ cursor: 'grab', pointerEvents: 'auto' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          console.log('🎯 Dragging decision box output');
                        }}
                      />
                    </g>
                  );
                }
                
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
                      stroke={fromPlayer?.color || '#888888'}
                      strokeWidth={isHoveredDecision ? "0.7" : "0.6"}
                      fill="none"
                      opacity={isHoveredDecision ? "1" : "0.8"}
                      markerEnd={fromPlayer ? `url(#arrowhead-${fromPlayer.id})` : 'url(#arrowhead-default)'}
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
            
            // Get firstCard BEFORE using it
            const firstCard = conn.cards[0];
            
            // Use helper function to calculate curve (same logic as line drawing)
            const { controlX, controlY } = calculateCurveControlPoint(
              fromPos,
              toPos,
              conn.from,
              conn.to || 'open-end',
              firstCard?.curveOffset
            );
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
            onClick={() => {
              setContextMenuPlayer(null);
              setSelectedPlayerDetail(null);
            }}
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
                        {renderIcon(player.icon)}
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

            {/* Drag Preview für Prozessschritte aus Wartebereich */}
            {draggedProcessStep && dragPreviewPosition && (() => {
              const step = processObjects.find(obj => obj.id === draggedProcessStep);
              if (!step || step.category !== 'process-step') return null;
              
              return (
                <div
                  key={`preview-${step.id}`}
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
                  <div className="bg-teal-500/90 backdrop-blur rounded-lg p-3 shadow-lg border border-teal-400/50 w-40">
                    <div className="font-bold text-white text-sm mb-1">{step.name}</div>
                    {step.input && (
                      <div className="text-xs text-teal-100 mb-1">
                        📥 {step.input}
                      </div>
                    )}
                    {step.output && (
                      <div className="text-xs text-teal-100">
                        📤 {step.output}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {playersByNewest.filter(p => p.onBoard !== false).map((player, index) => {
              const onBoardPlayers = playersByNewest.filter(p => p.onBoard !== false);
              const pos = getPlayerPosition(player, index, onBoardPlayers.length);
              
              const isFromPlayer = selectedFromPlayer === player.id;
              const isToPlayer = selectedToPlayer === player.id;
              const isDragging = draggedPlayer === player.id;
              const hasContextMenu = contextMenuPlayer === player.id;
              
              // Connector mode highlighting
              const isConnectorStarter = isConnectorMode && connectorStarter === player.id;
              const isConnectorEmpfaenger = isConnectorMode && connectorEmpfaenger === player.id;
              
              // Process step target highlighting
              const isProcessStepTarget = processStepTargetPlayer === player.id;
              
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
                    <div className="relative" data-player-id={player.id}>
                      {/* Hauptkörper der Spielfigur */}
                      <div
                        data-player-id={player.id}
                        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl relative overflow-hidden"
                        style={{
                          backgroundColor: player.color,
                          boxShadow: isProcessStepTarget
                            ? `0 6px 16px rgba(0,0,0,0.3), 0 0 0 6px #14b8a6, 0 0 20px 8px rgba(20, 184, 166, 0.4), inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`
                            : snapTargetPlayerId === player.id
                            ? `0 6px 16px rgba(0,0,0,0.3), 0 0 0 6px #22c55e, 0 0 20px 8px rgba(34, 197, 94, 0.4), inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.2)`
                            : isConnectorStarter
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
                        <div className="relative z-10 drop-shadow-lg" data-player-id={player.id} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                          {renderIcon(player.icon)}
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
                      
                      {/* Connection Port - Right side (für FreeLine erstellen) */}
                      <div
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-125 shadow-lg border-2 border-white opacity-70 hover:opacity-100"
                        style={{ pointerEvents: 'auto', zIndex: 25 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          
                          if (!player.position) return;
                          
                          // Erstelle neue FreeLine vom Spieler und starte sofort das Dragging des Endpunkts
                          const newLineData = {
                            startPosition: { x: player.position.x, y: player.position.y },
                            endPosition: { x: player.position.x, y: player.position.y },
                            startPlayerId: player.id,
                            color: player.color,
                            thickness: 2,
                            style: 'solid' as const
                          };
                          
                          onAddFreeLine(newLineData);
                          
                          // Setze einen temporären State, um nach der nächsten Render-Zyklen die neue Linie zu finden und zu draggen
                          // Dies wird im nächsten Frame ausgeführt, wenn freeLines aktualisiert ist
                          requestAnimationFrame(() => {
                            // Finde die gerade erstellte Linie (neueste mit diesem Spieler als Start)
                            const sortedLines = [...freeLines].sort((a, b) => b.timestamp - a.timestamp);
                            const newLine = sortedLines.find(l => 
                              l.startPlayerId === player.id && 
                              Math.abs(l.startPosition.x - player.position!.x) < 0.1 &&
                              Math.abs(l.startPosition.y - player.position!.y) < 0.1
                            );
                            
                            if (newLine) {
                              setDraggedPlayer(`freeline-end-${newLine.id}`);
                              console.log('🎯 FreeLine-Drag gestartet:', newLine.id);
                            }
                          });
                          
                          console.log('🎯 FreeLine vom Port erstellt:', player.name);
                        }}
                        title="Linie ziehen"
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const copiedPlayer: Player = {
                                    ...player,
                                    id: `player-${Date.now()}`,
                                    name: `${player.name} (Kopie)`,
                                    onBoard: player.onBoard,
                                    position: player.position ? {
                                      x: player.position.x + 5,
                                      y: player.position.y + 5
                                    } : undefined,
                                  };
                                  onAddPlayer(copiedPlayer);
                                  setSelectedPlayerDetail(null);
                                }}
                                className="p-2 hover:bg-green-500/20 rounded transition-colors group"
                                title="Spieler kopieren"
                              >
                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                              </button>
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

                          {/* Buttons */}
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

                    {/* Verknüpfte Prozessschritte beim Spieler */}
                    {(() => {
                      const linkedSteps = processObjects.filter(
                        obj => obj.category === 'process-step' && obj.assignedToPlayerId === player.id
                      );
                      if (linkedSteps.length === 0) return null;

                      return (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8 flex flex-col gap-2">
                          {linkedSteps.map((obj) => {
                            const step = obj as ProcessStep;
                            const isDragging = draggedProcessStep === step.id;
                            
                            // Wenn dieser Prozessschritt gerade gedraggt wird, blende ihn hier aus (zeige nur Preview)
                            if (isDragging) return null;
                            
                            return (
                            <div
                              key={step.id}
                              className={`group bg-gradient-to-br from-teal-500 to-teal-600 backdrop-blur rounded-xl p-3 shadow-xl border-2 border-teal-300/50 w-44 transition-all relative cursor-grab active:cursor-grabbing hover:shadow-2xl hover:scale-105`}
                              style={{ zIndex: 10 }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                // Speichere ursprünglichen Zustand
                                setDraggedProcessStepOriginalState({
                                  inWaitingArea: step.inWaitingArea || false,
                                  position: step.position,
                                  assignedToPlayerId: step.assignedToPlayerId
                                });
                                setDraggedProcessStep(step.id);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                console.log('📋 Process Step Details:', step);
                              }}
                            >
                              {/* Visueller Drag-Indikator oben rechts */}
                              <div className="absolute top-2 right-2 flex items-center gap-1 text-white/70 group-hover:text-white transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="9" cy="5" r="2"/>
                                  <circle cx="9" cy="12" r="2"/>
                                  <circle cx="9" cy="19" r="2"/>
                                  <circle cx="15" cy="5" r="2"/>
                                  <circle cx="15" cy="12" r="2"/>
                                  <circle cx="15" cy="19" r="2"/>
                                </svg>
                              </div>
                              
                              {/* Drag Handle - Zentraler Punkt (für zusätzliche visuelle Feedback) */}
                              <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 z-10 pointer-events-none"
                              >
                                {/* Äußerer Ring */}
                                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                {/* Mittlerer Ring */}
                                <div className="absolute inset-[5px] rounded-full bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                {/* Innerer Punkt */}
                                <div className={`absolute inset-[9px] rounded-full bg-white shadow-lg transition-all duration-200 ${
                                  isDragging ? 'scale-150 bg-teal-200' : 'group-hover:scale-125'
                                }`}></div>
                                {/* Pulsierender Effekt beim Dragging */}
                                {isDragging && (
                                  <div className="absolute inset-0 rounded-full bg-white/40 animate-ping"></div>
                                )}
                              </div>
                              <div className="font-bold text-white text-sm mb-2 leading-tight">
                                {step.name}
                              </div>
                              {step.input && (
                                <div className="text-[11px] text-teal-50/90 mb-1.5 flex items-start gap-1.5 bg-white/10 rounded-lg px-2 py-1">
                                  <span className="opacity-70 flex-shrink-0">📥</span>
                                  <span className="flex-1">{step.input}</span>
                                </div>
                              )}
                              {step.output && (
                                <div className="text-[11px] text-teal-50/90 mb-1.5 flex items-start gap-1.5 bg-white/10 rounded-lg px-2 py-1">
                                  <span className="opacity-70 flex-shrink-0">📤</span>
                                  <span className="flex-1">{step.output}</span>
                                </div>
                              )}
                              {step.duration && (
                                <div className="text-[11px] text-teal-50/90 mt-2 pt-2 border-t border-teal-400/30 flex items-center gap-1.5">
                                  <span className="opacity-70">⏱️</span>
                                  <span className="font-medium">{step.duration}</span>
                                </div>
                              )}
                            </div>
                          );})}
                        </div>
                      );
                    })()}


                  </div>
                </div>
              );
            })}

            {/* Platzierte Prozessschritte auf dem Spielfeld */}
            {processObjects
              .filter(obj => obj.category === 'process-step' && obj.position && !obj.inWaitingArea && !obj.assignedToPlayerId)
              .map((obj) => {
                const step = obj as ProcessStep;
                const isDragging = draggedProcessStep === step.id;
                
                return (
                  <div
                    key={`placed-step-${step.id}`}
                    className="absolute group"
                    style={{
                      left: `${step.position!.x}%`,
                      top: `${step.position!.y}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'auto',
                      zIndex: isDragging ? 50 : 30,
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      // Doppelklick öffnet Details (später implementieren)
                      console.log('📋 Process Step Details:', step);
                    }}
                  >
                    <div className={`bg-teal-500/90 backdrop-blur rounded-lg p-3 shadow-xl border-2 border-teal-400/50 w-48 transition-all ${
                      isDragging ? 'scale-105 shadow-2xl ring-4 ring-teal-400/50' : 'hover:shadow-2xl'
                    }`}>
                      {/* Drag Handle - Zentraler Punkt */}
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 cursor-grab active:cursor-grabbing z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          // Speichere ursprünglichen Zustand
                          setDraggedProcessStepOriginalState({
                            inWaitingArea: step.inWaitingArea || false,
                            position: step.position,
                            assignedToPlayerId: step.assignedToPlayerId
                          });
                          setDraggedProcessStep(step.id);
                          setDragPreviewPosition({ x: step.position!.x, y: step.position!.y });
                        }}
                      >
                        {/* Äußerer Ring */}
                        <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {/* Mittlerer Ring */}
                        <div className="absolute inset-[6px] rounded-full bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {/* Innerer Punkt */}
                        <div className={`absolute inset-[10px] rounded-full bg-white shadow-lg transition-all duration-200 ${
                          isDragging ? 'scale-150 bg-teal-200' : 'group-hover:scale-125'
                        }`}></div>
                        {/* Pulsierender Effekt beim Dragging */}
                        {isDragging && (
                          <div className="absolute inset-0 rounded-full bg-white/40 animate-ping"></div>
                        )}
                      </div>
                      
                      <div className="font-bold text-white text-sm mb-2">{step.name}</div>
                      {step.input && (
                        <div className="text-xs text-teal-100 mb-1.5 flex items-start gap-1">
                          <span className="flex-shrink-0">📥</span>
                          <span>{step.input}</span>
                        </div>
                      )}
                      {step.output && (
                        <div className="text-xs text-teal-100 mb-1.5 flex items-start gap-1">
                          <span className="flex-shrink-0">📤</span>
                          <span>{step.output}</span>
                        </div>
                      )}
                      {step.duration && (
                        <div className="text-xs text-teal-100 flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{step.duration}</span>
                        </div>
                      )}
                    </div>
                    {/* Remove button */}
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateProcessObject) {
                          onUpdateProcessObject(step.id, {
                            inWaitingArea: true,
                            position: undefined
                          } as Partial<ProcessObject>);
                        }
                      }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <span className="text-white text-sm font-bold">×</span>
                    </button>
                  </div>
                );
              })}

            {/* Placed Communication Objects */}
            {placedCommObjects.map((placed, idx) => {
              const commObj = processObjects.find(obj => obj.id === placed.objectId);
              if (!commObj) return null;
              
              const isDragging = draggedCommObject === idx;

              return (
                <div
                  key={`placed-comm-${idx}`}
                  className="absolute group"
                  style={{
                    left: `${placed.x}%`,
                    top: `${placed.y}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                    zIndex: isDragging ? 50 : 25,
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    // Doppelklick öffnet Details (später implementieren)
                    console.log('📧 Communication Object Details:', commObj);
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 transition-all relative ${
                      isDragging ? 'scale-110 shadow-2xl ring-4 ring-opacity-50' : 'hover:shadow-xl'
                    }`}
                    style={{
                      backgroundColor: commObj.color + '40',
                      borderColor: commObj.color,
                    }}
                    title={commObj.name}
                  >
                    {/* Drag Handle - Zentraler Punkt */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 cursor-grab active:cursor-grabbing z-10"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggedCommObject(idx);
                      }}
                    >
                      {/* Äußerer Ring */}
                      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      {/* Innerer Punkt */}
                      <div className={`absolute inset-[8px] rounded-full bg-white shadow-md transition-all duration-200 ${
                        isDragging ? 'scale-150' : 'group-hover:scale-125'
                      }`}></div>
                      {/* Pulsierender Effekt beim Dragging */}
                      {isDragging && (
                        <div className="absolute inset-0 rounded-full bg-white/40 animate-ping"></div>
                      )}
                    </div>
                    
                    {/* Icon */}
                    <span className="relative z-0">{commObj.icon}</span>
                  </div>
                  {/* Remove button */}
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
            
            {/* Simple straight lines for connections without receiver */}
            {(() => {
              const allConnections = getConnections();
              console.log('🟢 ALL CONNECTIONS:', allConnections.map(c => ({ from: c.from, to: c.to, cards: c.cards.length })));
              
              return allConnections.map((conn) => {
                // Nur rendern wenn KEIN toPlayer existiert
                const toPlayer = conn.to ? players.find(p => p.id === conn.to) : null;
                if (toPlayer) return null;
                
                const firstCard = conn.cards[0];
                if (!firstCard) return null;
                
                const connectionId = firstCard.id;
                const fromPlayer = conn.from ? players.find(p => p.id === conn.from) : null;
                
                let startX, startY;
                if (fromPlayer) {
                  const fromPlayerIndex = players.indexOf(fromPlayer);
                  const fromPlayerPos = getPlayerPosition(fromPlayer, fromPlayerIndex, players.length);
                  startX = fromPlayerPos.x;
                  startY = fromPlayerPos.y;
                } else {
                  const savedPos = firstCard.openEndPosition || { x: 20, y: 20 };
                  startX = savedPos.x;
                  startY = savedPos.y;
                }
                
                const isDragging = draggedPlayer === `connection-${connectionId}`;
                
                let posX, posY;
                const savedPos = firstCard.openEndPosition;
                if (savedPos) {
                  posX = savedPos.x;
                  posY = savedPos.y;
                } else {
                  posX = startX + 30;
                  posY = startY;
                }
                
                const lineColor = fromPlayer?.color || '#888888';
                
                return (
                  <div
                    key={connectionId}
                    className="absolute group"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDragging ? 30 : 18,
                      pointerEvents: 'auto',
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('✊ Connection Line mouseDown - aufnehmen', connectionId);
                      setDraggedPlayer(`connection-${connectionId}`);
                    }}
                  >
                    <svg
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: '1px',
                        height: '1px',
                        overflow: 'visible',
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <line
                        x1={0}
                        y1={0}
                        x2={(startX - posX) * 10}
                        y2={(startY - posY) * 10}
                        stroke={lineColor}
                        strokeWidth="3"
                        opacity={isDragging ? 1 : 0.8}
                      />
                    </svg>
                    
                    <div
                      className={`rounded-full transition-all ${
                        isDragging ? 'scale-110' : 'hover:scale-110'
                      }`}
                      style={{
                        width: isDragging ? '30px' : '22px',
                        height: isDragging ? '30px' : '22px',
                        backgroundColor: 'white',
                        border: `3px solid ${lineColor}`,
                        boxShadow: isDragging 
                          ? `0 0 20px ${lineColor}80, 0 0 40px ${lineColor}40, 0 0 0 4px ${lineColor}50` 
                          : '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                );
              })})()}
            
            {/* Free Lines - Freie Linien */}
            {freeLines.map((line) => {
                            // ...existing code...
                            const isDraggingStart = draggedPlayer === `freeline-start-${line.id}`;
                            const isDraggingEnd = draggedPlayer === `freeline-end-${line.id}`;
                            const isDraggingMiddle = draggedPlayer === `freeline-middle-${line.id}`;
                            const isDragging = isDraggingStart || isDraggingEnd || isDraggingMiddle;
                            const isSelected = selectedFreeLine === line.id;
                            
                            // Prüfe ob ein Spieler über einem offenen Ende dieser Linie ist
                            const isStartHighlighted = !line.startPlayerId && snapTargetPlayerId === `${line.id}-start`;
                            const isEndHighlighted = !line.endPlayerId && snapTargetPlayerId === `${line.id}-end`;
                            
                            // Startposition: Wenn angedockt, folge IMMER dem Spieler (außer wenn diese Linie selbst gedraggt wird)
                            const startPlayer = line.startPlayerId ? players.find(p => p.id === line.startPlayerId) : null;
                            const startX = (isDraggingStart || isDraggingMiddle)
                              ? line.startPosition.x  // Während des Draggings der Linie: Verwende gespeicherte Position
                              : (startPlayer?.position?.x ?? line.startPosition.x);  // Angedockt: Folge dem Spieler
                            const startY = (isDraggingStart || isDraggingMiddle)
                              ? line.startPosition.y
                              : (startPlayer?.position?.y ?? line.startPosition.y);
                            
                            // Endposition: Wenn angedockt, folge IMMER dem Spieler (außer wenn diese Linie selbst gedraggt wird)
                            const endPlayer = line.endPlayerId ? players.find(p => p.id === line.endPlayerId) : null;
                            const endX = (isDraggingEnd || isDraggingMiddle)
                              ? line.endPosition.x  // Während des Draggings der Linie: Verwende gespeicherte Position
                              : (endPlayer?.position?.x ?? line.endPosition.x);  // Angedockt: Folge dem Spieler
                            const endY = (isDraggingEnd || isDraggingMiddle)
                              ? line.endPosition.y
                              : (endPlayer?.position?.y ?? line.endPosition.y);
                            // Berechne Mittelpunkt
                            const midX = (startX + endX) / 2;
                            const midY = (startY + endY) / 2;
              
              return (
                <React.Fragment key={line.id}>
                  {/* SVG Line */}
                  <svg
                    className="absolute inset-0"
                    style={{
                      zIndex: isDragging ? 30 : 18,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    <line
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke={line.color}
                      strokeWidth={line.thickness || 2}
                      strokeDasharray={
                        line.style === 'dashed' ? '10,5' :
                        line.style === 'dotted' ? '2,3' : 
                        undefined
                      }
                      opacity={isDragging ? 1 : 0.8}
                      style={{ 
                        pointerEvents: 'stroke',
                        cursor: 'pointer',
                        strokeWidth: (line.thickness || 2) + 10, // Larger hit area
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFreeLine(line.id);
                      }}
                    />
                    {/* Visible line on top */}
                    <line
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${endX}%`}
                      y2={`${endY}%`}
                      stroke={line.color}
                      strokeWidth={line.thickness || 2}
                      strokeDasharray={
                        line.style === 'dashed' ? '10,5' :
                        line.style === 'dotted' ? '2,3' : 
                        undefined
                      }
                      opacity={isDragging ? 1 : 0.8}
                      style={{ pointerEvents: 'none' }}
                    />
                    {/* Selection indicator */}
                    {isSelected && (
                      <line
                        x1={`${startX}%`}
                        y1={`${startY}%`}
                        x2={`${endX}%`}
                        y2={`${endY}%`}
                        stroke="#3b82f6"
                        strokeWidth={(line.thickness || 2) + 4}
                        opacity={0.3}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </svg>
                  
                  {/* Angedockt Indikator am Start */}
                  {line.startPlayerId && startPlayer && (
                    <div
                      className="absolute group"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 19,
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Löse Verbindung und setze Position auf aktuelle Spieler-Position
                        onUpdateFreeLine(line.id, { 
                          startPlayerId: null as any,
                          startPosition: { x: startX, y: startY }
                        });
                        console.log('🔓 Start-Verbindung gelöst');
                      }}
                      title="Rechtsklick zum Lösen"
                    >
                      <div
                        className="rounded-full animate-pulse group-hover:scale-125 transition-transform"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: line.color,
                          border: '2px solid white',
                          boxShadow: `0 0 10px ${line.color}80`,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Angedockt Indikator am Ende */}
                  {line.endPlayerId && endPlayer && (
                    <div
                      className="absolute group"
                      style={{
                        left: `${endX}%`,
                        top: `${endY}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 19,
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Löse Verbindung und setze Position auf aktuelle Spieler-Position
                        onUpdateFreeLine(line.id, { 
                          endPlayerId: null as any,
                          endPosition: { x: endX, y: endY }
                        });
                        console.log('🔓 End-Verbindung gelöst');
                      }}
                      title="Rechtsklick zum Lösen"
                    >
                      <div
                        className="rounded-full animate-pulse group-hover:scale-125 transition-transform"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: line.color,
                          border: '2px solid white',
                          boxShadow: `0 0 10px ${line.color}80`,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Middle Handle - für gesamte Linie verschieben */}
                  <div
                    className="absolute group"
                    style={{
                      left: `${midX}%`,
                      top: `${midY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDraggingMiddle ? 30 : 19,
                      pointerEvents: 'auto',
                      cursor: isDraggingMiddle ? 'grabbing' : 'move'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggedPlayer(`freeline-middle-${line.id}`);
                    }}
                  >
                    <div
                      className={`rounded-lg transition-all ${
                        isDraggingMiddle ? 'scale-125' : 'group-hover:scale-110'
                      }`}
                      style={{
                        width: isDraggingMiddle ? '32px' : '24px',
                        height: isDraggingMiddle ? '24px' : '18px',
                        backgroundColor: line.color,
                        border: '2px solid white',
                        boxShadow: isDraggingMiddle 
                          ? `0 0 20px ${line.color}80, 0 0 0 4px ${line.color}30` 
                          : '0 2px 8px rgba(0,0,0,0.3)',
                        opacity: isDraggingMiddle ? 1 : 0.9,
                      }}
                    />
                  </div>
                  
                  {/* Start Point Handle - immer anzeigen */}
                  <div
                    className="absolute"
                    style={{
                      left: `${startX}%`,
                      top: `${startY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDraggingStart ? 30 : (line.startPlayerId ? 19 : 18),
                      pointerEvents: 'auto',
                      cursor: isDraggingStart ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Wenn angedockt, löse Verbindung und setze Position
                      if (line.startPlayerId) {
                        const currentX = startPlayer?.position?.x || line.startPosition.x;
                        const currentY = startPlayer?.position?.y || line.startPosition.y;
                        onUpdateFreeLine(line.id, { 
                          startPlayerId: null as any,
                          startPosition: { x: currentX, y: currentY }
                        });
                      }
                      setDraggedPlayer(`freeline-start-${line.id}`);
                    }}
                  >
                    <div
                      className={`rounded-full transition-all ${
                        isDraggingStart || isStartHighlighted ? 'scale-125' : 'hover:scale-110'
                      }`}
                      style={{
                        width: (isDraggingStart || isStartHighlighted) ? '20px' : '16px',
                        height: (isDraggingStart || isStartHighlighted) ? '20px' : '16px',
                        backgroundColor: line.color,
                        border: '2px solid white',
                        boxShadow: (isDraggingStart || isStartHighlighted)
                          ? `0 0 20px ${line.color}80, 0 0 0 4px ${line.color}30` 
                          : '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                  
                  {/* End Point Handle - immer anzeigen */}
                  <div
                    className="absolute"
                    style={{
                      left: `${endX}%`,
                      top: `${endY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDraggingEnd ? 30 : (line.endPlayerId ? 19 : 18),
                      pointerEvents: 'auto',
                      cursor: isDraggingEnd ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Wenn angedockt, löse Verbindung und setze Position
                      if (line.endPlayerId) {
                        const currentX = endPlayer?.position?.x || line.endPosition.x;
                        const currentY = endPlayer?.position?.y || line.endPosition.y;
                        onUpdateFreeLine(line.id, { 
                          endPlayerId: null as any,
                          endPosition: { x: currentX, y: currentY }
                        });
                      }
                      setDraggedPlayer(`freeline-end-${line.id}`);
                    }}
                  >
                    <div
                      className={`rounded-full transition-all ${
                        isDraggingEnd || isEndHighlighted ? 'scale-125' : 'hover:scale-110'
                      }`}
                      style={{
                        width: (isDraggingEnd || isEndHighlighted) ? '20px' : '16px',
                        height: (isDraggingEnd || isEndHighlighted) ? '20px' : '16px',
                        backgroundColor: line.color,
                        border: '2px solid white',
                        boxShadow: (isDraggingEnd || isEndHighlighted)
                          ? `0 0 20px ${line.color}80, 0 0 0 4px ${line.color}30` 
                          : '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                </React.Fragment>
              );
            })}
            
            {/* Decision Lines - Entscheidungslinien mit Box in der Mitte */}
            {decisionLines.map((line) => {
              const isDraggingBox = draggedPlayer === `decisionline-box-${line.id}`;
              const isDraggingStart = draggedPlayer === `decisionline-start-${line.id}`;
              const isDraggingOption1 = draggedPlayer === `decisionline-option1-${line.id}`;
              const isDraggingOption2 = draggedPlayer === `decisionline-option2-${line.id}`;
              const isSelected = selectedDecisionLine === line.id;
              
              // Prüfe ob ein Spieler über einem offenen Ende dieser Entscheidungslinie ist
              const isStartHighlighted = !line.startPlayerId && snapTargetPlayerId === `decision-${line.id}-start`;
              const isOption1Highlighted = !line.option1PlayerId && snapTargetPlayerId === `decision-${line.id}-option1`;
              const isOption2Highlighted = !line.option2PlayerId && snapTargetPlayerId === `decision-${line.id}-option2`;
              
              // Spieler finden
              const startPlayer = line.startPlayerId ? players.find(p => p.id === line.startPlayerId) : null;
              const option1Player = line.option1PlayerId ? players.find(p => p.id === line.option1PlayerId) : null;
              const option2Player = line.option2PlayerId ? players.find(p => p.id === line.option2PlayerId) : null;
              
              // Positionen berechnen (folge Spielern wenn angedockt)
              const startX = (isDraggingStart || !startPlayer?.position) ? line.startPosition.x : startPlayer.position.x;
              const startY = (isDraggingStart || !startPlayer?.position) ? line.startPosition.y : startPlayer.position.y;
              
              const option1X = (isDraggingOption1 || !option1Player?.position) ? line.option1Position.x : option1Player.position.x;
              const option1Y = (isDraggingOption1 || !option1Player?.position) ? line.option1Position.y : option1Player.position.y;
              
              const option2X = (isDraggingOption2 || !option2Player?.position) ? line.option2Position.x : option2Player.position.x;
              const option2Y = (isDraggingOption2 || !option2Player?.position) ? line.option2Position.y : option2Player.position.y;
              
              const boxX = isDraggingBox ? line.decisionBoxPosition.x : line.decisionBoxPosition.x;
              const boxY = isDraggingBox ? line.decisionBoxPosition.y : line.decisionBoxPosition.y;
              
              return (
                <React.Fragment key={line.id}>
                  {/* SVG Linien */}
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      zIndex: 17,
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    {/* Linie vom Start zur Box */}
                    <line
                      x1={`${startX}%`}
                      y1={`${startY}%`}
                      x2={`${boxX}%`}
                      y2={`${boxY}%`}
                      stroke={line.color}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    {/* Linie von Box zu Option 1 */}
                    <line
                      x1={`${boxX}%`}
                      y1={`${boxY}%`}
                      x2={`${option1X}%`}
                      y2={`${option1Y}%`}
                      stroke={line.color}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    {/* Linie von Box zu Option 2 */}
                    <line
                      x1={`${boxX}%`}
                      y1={`${boxY}%`}
                      x2={`${option2X}%`}
                      y2={`${option2Y}%`}
                      stroke={line.color}
                      strokeWidth="3"
                      opacity="0.8"
                    />
                    {/* Selection indicators */}
                    {isSelected && (
                      <>
                        <line
                          x1={`${startX}%`}
                          y1={`${startY}%`}
                          x2={`${boxX}%`}
                          y2={`${boxY}%`}
                          stroke="#3b82f6"
                          strokeWidth="7"
                          opacity="0.3"
                        />
                        <line
                          x1={`${boxX}%`}
                          y1={`${boxY}%`}
                          x2={`${option1X}%`}
                          y2={`${option1Y}%`}
                          stroke="#3b82f6"
                          strokeWidth="7"
                          opacity="0.3"
                        />
                        <line
                          x1={`${boxX}%`}
                          y1={`${boxY}%`}
                          x2={`${option2X}%`}
                          y2={`${option2Y}%`}
                          stroke="#3b82f6"
                          strokeWidth="7"
                          opacity="0.3"
                        />
                      </>
                    )}
                  </svg>
                  
                  {/* Minimalist Decision Box in der Mitte */}
                  <div
                    className="absolute group"
                    style={{
                      left: `${boxX}%`,
                      top: `${boxY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDraggingBox ? 30 : 20,
                      pointerEvents: 'auto',
                      cursor: isDraggingBox ? 'grabbing' : 'move'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggedPlayer(`decisionline-box-${line.id}`);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDecisionLine(line.id);
                    }}
                    title={line.question || 'Entscheidung'}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                        isDraggingBox ? 'scale-125' : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: line.color,
                        boxShadow: isDraggingBox 
                          ? `0 0 30px ${line.color}90, 0 0 60px ${line.color}40`
                          : `0 4px 12px rgba(0,0,0,0.3), 0 0 15px ${line.color}50`,
                      }}
                    >
                      <span className="text-2xl">?</span>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border-2 border-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDecisionLine(line.id);
                      }}
                      style={{ pointerEvents: 'auto', zIndex: 31 }}
                      title="Löschen"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  
                  {/* Angedockt-Indikatoren und Handles */}
                  {/* Start Handle */}
                  {startPlayer && (
                    <div
                      className="absolute"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 19,
                        pointerEvents: 'auto',
                      }}
                      title={`Angedockt an ${startPlayer.name}`}
                    >
                      <div
                        className="rounded-full animate-pulse"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: startPlayer.color,
                          border: '2px solid white',
                          boxShadow: `0 0 10px ${startPlayer.color}80`,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Option 1 Handle */}
                  {option1Player && (
                    <div
                      className="absolute"
                      style={{
                        left: `${option1X}%`,
                        top: `${option1Y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 19,
                        pointerEvents: 'auto',
                      }}
                      title={`${line.option1Label || 'Option 1'} - ${option1Player.name}`}
                    >
                      <div
                        className="rounded-full animate-pulse"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: option1Player.color,
                          border: '2px solid white',
                          boxShadow: `0 0 10px ${option1Player.color}80`,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Option 2 Handle */}
                  {option2Player && (
                    <div
                      className="absolute"
                      style={{
                        left: `${option2X}%`,
                        top: `${option2Y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 19,
                        pointerEvents: 'auto',
                      }}
                      title={`${line.option2Label || 'Option 2'} - ${option2Player.name}`}
                    >
                      <div
                        className="rounded-full animate-pulse"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: option2Player.color,
                          border: '2px solid white',
                          boxShadow: `0 0 10px ${option2Player.color}80`,
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Draggable Endpoints - nur wenn NICHT angedockt */}
                  {!startPlayer && (
                    <div
                      className="absolute"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isDraggingStart ? 30 : 18,
                        pointerEvents: 'auto',
                        cursor: isDraggingStart ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDraggedPlayer(`decisionline-start-${line.id}`);
                      }}
                    >
                      <div
                        className={`rounded-full transition-all ${
                          isDraggingStart || isStartHighlighted ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{
                          width: (isDraggingStart || isStartHighlighted) ? '20px' : '16px',
                          height: (isDraggingStart || isStartHighlighted) ? '20px' : '16px',
                          backgroundColor: line.color,
                          border: '2px solid white',
                          boxShadow: (isDraggingStart || isStartHighlighted)
                            ? `0 0 20px ${line.color}80, 0 0 0 4px ${line.color}30`
                            : '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  )}
                  
                  {!option1Player && (
                    <div
                      className="absolute"
                      style={{
                        left: `${option1X}%`,
                        top: `${option1Y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isDraggingOption1 ? 30 : 18,
                        pointerEvents: 'auto',
                        cursor: isDraggingOption1 ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDraggedPlayer(`decisionline-option1-${line.id}`);
                      }}
                    >
                      <div
                        className={`rounded-full transition-all ${
                          isDraggingOption1 || isOption1Highlighted ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{
                          width: (isDraggingOption1 || isOption1Highlighted) ? '20px' : '16px',
                          height: (isDraggingOption1 || isOption1Highlighted) ? '20px' : '16px',
                          backgroundColor: line.color,
                          border: '2px solid white',
                          boxShadow: (isDraggingOption1 || isOption1Highlighted)
                            ? `0 0 20px ${line.color}80, 0 0 0 4px ${line.color}30`
                            : '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  )}
                  
                  {!option2Player && (
                    <div
                      className="absolute"
                      style={{
                        left: `${option2X}%`,
                        top: `${option2Y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isDraggingOption2 ? 30 : 18,
                        pointerEvents: 'auto',
                        cursor: isDraggingOption2 ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDraggedPlayer(`decisionline-option2-${line.id}`);
                      }}
                    >
                      <div
                        className={`rounded-full transition-all ${
                          isDraggingOption2 || isOption2Highlighted ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{
                          width: (isDraggingOption2 || isOption2Highlighted) ? '20px' : '16px',
                          height: (isDraggingOption2 || isOption2Highlighted) ? '20px' : '16px',
                          backgroundColor: line.color,
                          border: '2px solid white',
                          boxShadow: (isDraggingOption2 || isOption2Highlighted)
                            ? `0 0 20px ${line.color}80, 0 0 0 4px ${line.color}30`
                            : '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            
            {/* Decision Boxes */}
            {decisionBoxes.map((decisionBox) => {
              const fromPlayer = decisionBox.fromPlayerId ? players.find(p => p.id === decisionBox.fromPlayerId) : null;
              const dockedPlayer = decisionBox.dockedToPlayerId ? players.find(p => p.id === decisionBox.dockedToPlayerId) : null;
              
              const isDraggingDecision = draggedPlayer === `decision-${decisionBox.id}`;
              
              // Wenn angedockt, folge der Spieler-Position (außer während des Draggings dieser Box)
              const posX = (isDraggingDecision || !dockedPlayer?.position) 
                ? decisionBox.position.x 
                : dockedPlayer.position.x;
              const posY = (isDraggingDecision || !dockedPlayer?.position) 
                ? decisionBox.position.y 
                : dockedPlayer.position.y;
              
              return (
                <React.Fragment key={decisionBox.id}>
                  {/* Verbindungslinie zum angedockten Spieler (wie bei freien Linien) */}
                  {decisionBox.dockedToPlayerId && dockedPlayer?.position && (
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        zIndex: 17,
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <line
                        x1={`${dockedPlayer.position.x}%`}
                        y1={`${dockedPlayer.position.y}%`}
                        x2={`${posX}%`}
                        y2={`${posY}%`}
                        stroke={dockedPlayer.color}
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                    </svg>
                  )}
                  
                  <div
                    className="absolute group"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isDraggingDecision ? 30 : 18,
                      pointerEvents: 'auto',
                      cursor: isDraggingDecision ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('✊ Decision Box mouseDown - aufnehmen', decisionBox.id);
                      setDraggedPlayer(`decision-${decisionBox.id}`);
                    }}
                    onContextMenu={(e) => {
                      // Rechtsklick: Andocken lösen
                      if (decisionBox.dockedToPlayerId) {
                        e.preventDefault();
                        e.stopPropagation();
                        setDecisionBoxes(prev => prev.map(box => 
                          box.id === decisionBox.id 
                            ? { ...box, dockedToPlayerId: undefined }
                            : box
                        ));
                        console.log('🔓 Decision Box von Spieler gelöst');
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      // Nur öffnen wenn nicht am Ziehen
                      if (!isDraggingDecision) {
                        setInspectedDecisionBox(decisionBox.id);
                      }
                    }}
                  >
                    {/* Angedockt-Indikator - größer und auffälliger wie bei freien Linien */}
                    {decisionBox.dockedToPlayerId && dockedPlayer && (
                      <div
                        className="absolute -top-3 -right-3 z-10 group/dock"
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        title="Rechtsklick zum Lösen"
                      >
                        <div
                          className="rounded-full animate-pulse group-hover/dock:scale-125 transition-transform"
                          style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: dockedPlayer.color,
                            border: '2px solid white',
                            boxShadow: `0 0 15px ${dockedPlayer.color}90, 0 0 5px white`,
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Diamond-shaped decision box */}
                    <div className="relative">
                      {/* Main diamond */}
                      <div 
                        className={`w-20 h-20 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 transform rotate-45 rounded-lg shadow-xl border-3 ${
                          decisionBox.dockedToPlayerId ? 'border-white' : 'border-white/50'
                        } transition-all ${
                          isDraggingDecision ? 'scale-110' : 'hover:scale-105'
                        }`}
                        style={{
                          boxShadow: isDraggingDecision 
                            ? '0 15px 40px rgba(251, 191, 36, 0.9), 0 0 0 5px rgba(251, 191, 36, 0.6)' 
                            : decisionBox.dockedToPlayerId && dockedPlayer
                            ? `0 6px 20px rgba(0,0,0,0.4), 0 0 20px ${dockedPlayer.color}70, 0 0 40px ${dockedPlayer.color}30`
                            : '0 6px 15px rgba(0,0,0,0.3), 0 2px 8px rgba(251, 191, 36, 0.5)',
                          borderWidth: '3px',
                        }}
                        title={decisionBox.question}
                      >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-lg opacity-70"></div>
                        
                        {/* Glow effect when docked */}
                        {decisionBox.dockedToPlayerId && (
                          <div 
                            className="absolute inset-0 rounded-lg animate-pulse"
                            style={{
                              background: `radial-gradient(circle at center, ${dockedPlayer?.color}30, transparent)`,
                            }}
                          />
                        )}
                        
                        {/* Icon container (counter-rotated) */}
                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                          <span className="text-3xl drop-shadow-lg filter brightness-110">❓</span>
                        </div>
                      </div>
                      
                      {/* Question label on hover */}
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
                        <div className="bg-slate-900/95 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-lg shadow-2xl border border-white/30 text-center font-semibold">
                          {decisionBox.question}
                        </div>
                      </div>
                      
                      {/* Option labels around the diamond */}
                      {decisionBox.options.map((option, index) => {
                        const angle = (360 / decisionBox.options.length) * index + 90;
                        const radius = 60;
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
                              backgroundColor: option.color || fromPlayer?.color || '#888888'
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
                    className="absolute -top-3 -left-3 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg border-2 border-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDecisionBoxes(prev => prev.filter(d => d.id !== decisionBox.id));
                    }}
                    style={{ pointerEvents: 'auto', zIndex: 30 }}
                    title="Löschen"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </React.Fragment>
              );
            })}
            </div>
            {/* End of Zoom and Pan Transform Container */}

            {/* Empty state */}
            {playersByNewest.filter(p => p.onBoard !== false).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 5, pointerEvents: 'none' }}>
                <div className="text-center" style={{ pointerEvents: 'auto' }}>
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
                      {renderIcon(player.icon)}
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
              <div className={`col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border-2 ${playersByNewest.filter(p => p.onBoard === false).length > 0 ? 'border-amber-400/30' : 'border-gray-500/20'} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Spieler
                      <span className="text-xs font-normal text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        {playersByNewest.filter(p => p.onBoard === false).length}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-400">
                      {playersByNewest.filter(p => p.onBoard === false).length > 0 
                        ? 'Ziehe sie aufs Spielfeld' 
                        : 'Alle Spieler sind auf dem Spielfeld'}
                    </p>
                  </div>
                </div>
                {playersByNewest.filter(p => p.onBoard === false).length > 0 ? (
                  <div className="flex gap-6 overflow-x-auto pb-2">
                    {playersByNewest.filter(p => p.onBoard === false).map((player) => {
                      const isDragging = draggedPlayer === player.id;
                      const isInspected = inspectedPlayer === player.id;
                      
                      // Während des Draggings den Spieler im Wartebereich transparent machen statt verstecken
                      // if (isDragging) return null;
                      
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
                              style={{ pointerEvents: 'auto' }}
                            >
                              <User className="w-3 h-3" />
                            </button>
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: player.color,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 1px 6px rgba(255,255,255,0.2)',
                                cursor: 'grab',
                                pointerEvents: 'auto',
                              }}
                              onClick={() => console.log('🖱️ onClick:', player.name)}
                              onMouseDown={(e) => {
                                console.log('🎯 Player mouseDown in waiting area:', player.name);
                                handleMouseDown(e, player.id);
                              }}
                            >
                              {renderIcon(player.icon)}
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
                
                {/* Prozessschritte in der gleichen Wartebox */}
                {(() => {
                  const waitingSteps = processObjects.filter(obj => {
                    if (obj.category !== 'process-step') return false;
                    const step = obj as ProcessStep;
                    // Explizit auf true prüfen UND dass keine andere Platzierung existiert
                    return step.inWaitingArea === true || (!step.position && !step.assignedToPlayerId);
                  });
                  console.log('All process objects:', processObjects);
                  console.log('Waiting steps:', waitingSteps);
                  console.log('Process objects details:', processObjects.map(obj => ({
                    id: obj.id,
                    category: obj.category,
                    inWaitingArea: (obj as any).inWaitingArea,
                    assignedToPlayerId: (obj as any).assignedToPlayerId,
                    position: (obj as any).position
                  })));
                  return waitingSteps.length > 0 && (
                    <>
                      <div className="border-t border-white/10 my-4"></div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            Prozessschritte
                            <span className="text-xs font-normal text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-full">
                              {waitingSteps.length}
                            </span>
                          </h3>
                          <p className="text-sm text-gray-400">Wartebox</p>
                        </div>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {waitingSteps.map((step) => {
                          const processStep = step as ProcessStep;
                          const isDragging = draggedProcessStep === step.id;
                          
                          return (
                            <div
                              key={step.id}
                              className={`flex-shrink-0 bg-gradient-to-br from-teal-600/80 to-teal-800/80 rounded-xl p-3 border-2 border-teal-400/30 hover:border-teal-400/50 transition-all hover:scale-105 cursor-grab active:cursor-grabbing min-w-[140px] hover:shadow-xl ${isDragging ? 'opacity-30 scale-95' : ''}`}
                              onMouseDown={(e) => handleProcessStepMouseDown(e, step.id)}
                            >
                              <div className="text-white">
                                <div className="text-sm font-bold mb-2 line-clamp-2 leading-tight">{step.name}</div>
                                {processStep.duration && (
                                  <div className="text-[10px] text-teal-200/80 flex items-center gap-1 bg-white/10 rounded px-2 py-1">
                                    <span>⏱</span>
                                    <span>{processStep.duration}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
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
                  onAddPlayer={onAddPlayer}
                  onAddFreeLine={onAddFreeLine}
                  onAddDecisionLine={onAddDecisionLine}
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
            className="bg-slate-800 rounded-2xl shadow-2xl border border-white/10 max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
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
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <IconPicker 
                    selectedIcon={currentIcon}
                    onSelectIcon={setCurrentIcon}
                    uploadedFirst={true}
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
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
                    {playersByNewest.filter(p => p.onBoard !== false).map((player) => (
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
                          {renderIcon(player.icon)}
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
                    {playersByNewest.filter(p => p.onBoard !== false).map((player) => (
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
                          {renderIcon(player.icon)}
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
                              {playersByNewest.filter(p => p.onBoard !== false).map((player) => (
                                <option key={player.id} value={player.id}>
                                  {(typeof player.icon === 'string' && !(player.icon.includes('/') || player.icon.startsWith('http') || player.icon.startsWith('data:'))) ? player.icon + ' ' : ''}{player.name} ({player.role})
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
                    <div className="flex items-center gap-2">
                      {onRemoveCard && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const cardsToDelete = cards.filter(
                              c => c.fromPlayerId === selectedConnectionDetail.from && 
                                   c.toPlayerId === selectedConnectionDetail.to &&
                                   (c as any).decisionBoxId === decisionBox.id
                            );
                            cardsToDelete.forEach(card => onRemoveCard(card.id));
                            setSelectedConnectionDetail(null);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors group"
                          title="Pfad löschen"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedConnectionDetail(null)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
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
        
        // Handle open-ended connection (no receiver yet)
        if (!selectedConnectionDetail.to) {
          const openCards = cards.filter(c => c.fromPlayerId === selectedConnectionDetail.from && !c.toPlayerId);
          if (openCards.length === 0) return null;
          
          const fromPlayer = players.find(p => p.id === selectedConnectionDetail.from);
          if (!fromPlayer) return null;
          
          return (
            <div 
              className="fixed inset-0 z-[110]" 
              onClick={() => setSelectedConnectionDetail(null)}
            >
              <div 
                className="absolute bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-400/30 w-96 overflow-hidden flex flex-col"
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
                          <div className="text-xs text-orange-300">Offener Prozessschritt</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onRemoveCard && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCards.forEach(card => onRemoveCard(card.id));
                            setSelectedConnectionDetail(null);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors group"
                          title="Prozessschritt löschen"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedConnectionDetail(null)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20 mb-3">
                    <div className="text-xs text-orange-300 mb-1">Status</div>
                    <div className="text-white text-sm">Wartet auf Empfänger</div>
                  </div>

                  {/* Stats */}
                  <div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20 mb-3">
                    <div className="text-xs text-indigo-300 mb-1">Anzahl Schritte</div>
                    <div className="text-2xl font-bold text-white">{openCards.length}</div>
                  </div>

                  {/* Preview of steps */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {openCards.slice(0, 3).map((card, index) => (
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
                    {openCards.length > 3 && (
                      <div className="text-center text-xs text-gray-400 py-2">
                        +{openCards.length - 3} weitere
                      </div>
                    )}
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
                  <div className="flex items-center gap-2">
                    {onRemoveCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🗑️ Lösche Connection mit', conn.cards.length, 'Karten');
                          conn.cards.forEach(card => {
                            onRemoveCard(card.id);
                          });
                          setSelectedConnectionDetail(null);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors group"
                        title="Verbindung löschen"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedConnectionDetail(null)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
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
                <div className="flex items-center gap-2">
                  {onRemoveCard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        conn.cards.forEach(card => {
                          onRemoveCard(card.id);
                        });
                        setSelectedConnection(null);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                      title="Verbindung löschen"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedConnection(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
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

      {/* Connection Type Selection Menu (Orange-style) - Nur für leeren Raum */}
      {showConnectionTypeMenu && connectionMenuPosition && connectionMenuTarget === null && dragConnectionFrom && (
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
              {/* Creating new element in empty space */}
              <div className="text-xs text-gray-400 px-2 py-1 font-semibold mb-1">
                Verbindung zu Spieler
              </div>
                  
                  {/* Waiting Players */}
                  {playersByNewest.filter(p => p.onBoard === false).length > 0 ? (
                    playersByNewest.filter(p => p.onBoard === false).map(waitingPlayer => (
                      <button
                        key={waitingPlayer.id}
                        onClick={() => {
                          console.log('🎯 Placing player at position:', dragConnectionPosition);
                          // Place player on board and create direct connection
                          if (onUpdatePlayerPosition && dragConnectionPosition) {
                            onUpdatePlayerPosition(waitingPlayer.id, {
                              x: dragConnectionPosition.x,
                              y: dragConnectionPosition.y
                            });
                          }
                          
                          // Erstelle direkt eine Prozessverbindung
                          const fromPlayer = players.find(p => p.id === dragConnectionFrom);
                          if (fromPlayer && onAddCard) {
                            onAddCard(
                              `Prozess: ${fromPlayer.name} → ${waitingPlayer.name}`,
                              dragConnectionFrom,
                              waitingPlayer.id,
                              '', // medium
                              '', // duration
                              '' // description
                            );
                          }
                          
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

      {/* Ergebnisse Modal */}
      {showResultsModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-6"
          onClick={() => setShowResultsModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 p-6 rounded-t-3xl backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Spielergebnisse</h2>
                    <p className="text-gray-400">Exportiere und teile deine Prozessergebnisse</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content - Kacheln Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Swim Lane Darstellung */}
                <button
                  onClick={() => {
                    setViewMode('swimlane');
                    setShowResultsModal(false);
                  }}
                  className="group relative bg-gradient-to-br from-blue-500/10 to-indigo-600/10 hover:from-blue-500/20 hover:to-indigo-600/20 border-2 border-blue-500/30 hover:border-blue-400/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="4" rx="1" />
                          <rect x="2" y="10" width="20" height="4" rx="1" />
                          <rect x="2" y="16" width="20" height="4" rx="1" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Swim Lane Darstellung</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Visualisiere Prozesse in horizontalen Bahnen pro Akteur
                    </p>
                  </div>
                </button>

                {/* Prozessdokumentation */}
                <button
                  className="group relative bg-gradient-to-br from-purple-500/10 to-pink-600/10 hover:from-purple-500/20 hover:to-pink-600/20 border-2 border-purple-500/30 hover:border-purple-400/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Prozessdokumentation erstellen</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Generiere automatisch eine strukturierte Prozessbeschreibung
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 font-semibold">
                      Bald verfügbar
                    </div>
                  </div>
                </button>

                {/* Prozessschulung (Ablaufmatrix) */}
                <button
                  className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-600/10 hover:from-emerald-500/20 hover:to-teal-600/20 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Prozessschulung (Ablaufmatrix)</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Erstelle Schulungsunterlagen mit detaillierter Ablaufmatrix
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 font-semibold">
                      Bald verfügbar
                    </div>
                  </div>
                </button>

                {/* Kommunikationsmatrix */}
                <button
                  className="group relative bg-gradient-to-br from-orange-500/10 to-red-600/10 hover:from-orange-500/20 hover:to-red-600/20 border-2 border-orange-500/30 hover:border-orange-400/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Kommunikationsmatrix</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Analysiere Kommunikationsflüsse zwischen Akteuren
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 font-semibold">
                      Bald verfügbar
                    </div>
                  </div>
                </button>

                {/* Systemliste */}
                <button
                  className="group relative bg-gradient-to-br from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border-2 border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Systemliste erstellen</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Erfasse alle verwendeten Systeme und Tools im Prozess
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 font-semibold">
                      Bald verfügbar
                    </div>
                  </div>
                </button>

                {/* Vorschlag Prozessverbesserung */}
                <button
                  className="group relative bg-gradient-to-br from-violet-500/10 to-fuchsia-600/10 hover:from-violet-500/20 hover:to-fuchsia-600/20 border-2 border-violet-500/30 hover:border-violet-400/50 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Vorschlag Prozessverbesserung</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      KI-basierte Optimierungsvorschläge für deinen Prozess
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 font-semibold">
                      Bald verfügbar
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Line Detail Modal */}
      {selectedFreeLine && (() => {
        const line = freeLines.find(l => l.id === selectedFreeLine);
        if (!line) return null;
        
        const startPlayer = line.startPlayerId ? players.find(p => p.id === line.startPlayerId) : null;
        const endPlayer = line.endPlayerId ? players.find(p => p.id === line.endPlayerId) : null;
        
        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
            onClick={() => setSelectedFreeLine(null)}
          >
            <div
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Verbindungslinie</h3>
                    <p className="text-sm text-gray-400">Details & Optionen</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFreeLine(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Line Preview */}
              <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-white/10">
                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: line.color }}
                  />
                  <div
                    className="flex-1 h-0.5"
                    style={{
                      backgroundColor: line.color,
                      borderStyle: line.style === 'dashed' ? 'dashed' : line.style === 'dotted' ? 'dotted' : 'solid',
                      borderWidth: line.style !== 'solid' ? '1px' : '0',
                      borderColor: line.color,
                      height: line.style === 'solid' ? `${line.thickness}px` : '0'
                    }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: line.color }}
                  />
                </div>
              </div>

              {/* Connection Info */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Von</div>
                  <div className="text-white font-semibold">
                    {startPlayer ? `${startPlayer.icon} ${startPlayer.name}` : '🔵 Freie Position'}
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Zu</div>
                  <div className="text-white font-semibold">
                    {endPlayer ? `${endPlayer.icon} ${endPlayer.name}` : '🔵 Freie Position'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Stil</div>
                    <div className="text-white font-semibold capitalize">{line.style}</div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Dicke</div>
                    <div className="text-white font-semibold">{line.thickness}px</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFreeLine(null)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all font-semibold"
                >
                  Schließen
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Möchtest du diese Verbindungslinie wirklich löschen?')) {
                      try {
                        console.log('🗑️ Lösche Linie:', line.id);
                        await onRemoveFreeLine(line.id);
                        console.log('✅ Linie gelöscht');
                        setSelectedFreeLine(null);
                      } catch (error) {
                        console.error('❌ Fehler beim Löschen der Linie:', error);
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all font-semibold border border-red-500/30 hover:border-red-500/50"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      
      {/* Decision Line Detail Modal */}
      {(() => {
        const line = decisionLines.find(l => l.id === selectedDecisionLine);
        if (!line) return null;
        
        const startPlayer = line.startPlayerId ? players.find(p => p.id === line.startPlayerId) : null;
        const option1Player = line.option1PlayerId ? players.find(p => p.id === line.option1PlayerId) : null;
        const option2Player = line.option2PlayerId ? players.find(p => p.id === line.option2PlayerId) : null;
        
        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setSelectedDecisionLine(null)}
          >
            <div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: line.color }}
                  >
                    <span className="text-2xl">?</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Entscheidung</h3>
                    <p className="text-sm text-gray-400">Details & Optionen</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDecisionLine(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Question */}
              {line.question && (
                <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Frage</div>
                  <div className="text-white font-semibold">{line.question}</div>
                </div>
              )}

              {/* Connection Info */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Von</div>
                  <div className="text-white font-semibold">
                    {startPlayer ? `${startPlayer.icon} ${startPlayer.name}` : '🔵 Freie Position'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">{line.option1Label || 'Option 1'}</div>
                    <div className="text-white font-semibold text-sm">
                      {option1Player ? `${option1Player.icon} ${option1Player.name}` : '🔵 Freie Position'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">{line.option2Label || 'Option 2'}</div>
                    <div className="text-white font-semibold text-sm">
                      {option2Player ? `${option2Player.icon} ${option2Player.name}` : '🔵 Freie Position'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDecisionLine(null)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all font-semibold"
                >
                  Schließen
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Möchtest du diese Entscheidung wirklich löschen?')) {
                      try {
                        console.log('🗑️ Lösche Entscheidung:', line.id);
                        await onRemoveDecisionLine(line.id);
                        console.log('✅ Entscheidung gelöscht');
                        setSelectedDecisionLine(null);
                      } catch (error) {
                        console.error('❌ Fehler beim Löschen der Entscheidung:', error);
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all font-semibold border border-red-500/30 hover:border-red-500/50"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default GameBoard;
