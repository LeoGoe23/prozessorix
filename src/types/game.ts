export interface Player {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;  // Emoji icon for the player
  description?: string;  // Freitext-Beschreibung der Rolle/Aufgaben
  position?: { x: number; y: number };  // Custom position (in percentage)
  onBoard?: boolean;  // Ist der Spieler auf dem Spielfeld? (false = im Wartebereich)
  input?: string;  // Was kommt rein?
  output?: string;  // Was geht raus?
  medium?: string;  // Über welches Medium?
  processRole?: string;  // Rolle im Prozess
}

export interface Decision {
  id: string;
  question: string;  // Die Entscheidungsfrage
  options: DecisionOption[];  // Verschiedene Entscheidungsoptionen
  type: 'binary' | 'multiple';  // Ja/Nein oder mehrere Optionen
  position?: { x: number; y: number };  // Position der Entscheidungsbox auf dem Board (in %)
}

export interface DecisionOption {
  id: string;
  label: string;  // z.B. "Ja", "Nein", "Hoch", "Mittel", "Niedrig"
  description?: string;  // Optionale Beschreibung der Option
  toPlayerId?: string;  // An wen führt diese Option
  color?: string;  // Farbe für visuelle Darstellung
}

export interface ProcessCard {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  round: number;
  order: number;
  timestamp: number;
  fromPlayerId: string;  // Wer übergibt
  toPlayerId: string;    // An wen wird übergeben
  medium?: string;       // Über welches Medium wird übergeben (Text)
  duration?: string;     // Wie lange dauert der Schritt
  description?: string;  // Detaillierte Beschreibung
  communicationObjectIds?: string[];  // IDs der Kommunikationsmittel-Objekte (für visuelle Darstellung)
  isDecision?: boolean;  // Ist dies ein Entscheidungspunkt?
  decision?: Decision;   // Die Entscheidungsinformationen
}

// Process Object Types
export interface ProcessStep {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: 'process-step';
  timestamp: number;
}

export interface SystemTool {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: 'system-tool';
  timestamp: number;
}

export interface CommunicationMethod {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: 'communication';
  timestamp: number;
  // Zusätzliche Attribute
  speed?: string;        // z.B. "Sofort", "1 Stunde", "1 Tag"
  reliability?: string;  // z.B. "Hoch", "Mittel", "Niedrig"
  formality?: string;    // z.B. "Formal", "Informell"
  cost?: string;         // z.B. "Kostenlos", "Niedrig", "Hoch"
  attributes?: { [key: string]: string };  // Flexible zusätzliche Attribute
}

export interface ProcessConnector {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: 'connector';
  timestamp: number;
}

export type ProcessObject = ProcessStep | SystemTool | CommunicationMethod | ProcessConnector;

export type GameBoardView = 'player-centric' | 'process-centric' | 'swimlane';

export interface GameState {
  players: Player[];
  cards: ProcessCard[];
  processObjects?: ProcessObject[];
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  isGameStarted: boolean;
  isGameFinished: boolean;
}

export const PLAYER_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export const PLAYER_ICONS = [
  // Business & Professional
  '💼', '📊', '📈', '📉', '💰', '💳', '🏢', '🏦',
  '💻', '🖥', '⌨', '�', '📞', '☎', '📠', '✉',
  '📧', '📮', '📬', '📭', '📫', '📪', '�', '�',
  '�', '�', '�', '✏', '✒', '🖊', '📝', '�',
  // People & Roles
  '👤', '👥', '👨', '👩', '👔', '🎓', '👨‍🏫', '👩‍🏫',
  '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧', '👨‍🔬', '👩‍🔬', '�', '🧑',
  // Goals & Success
  '🎯', '🏆', '🥇', '🥈', '🥉', '🏅', '⭐', '🌟',
  '✨', '💫', '💡', '🔔', '📢', '📣', '🎪', '🎨',
  // Process & Action
  '⚡', '🚀', '🔥', '💪', '✅', '✔', '☑', '🔄',
  '🔃', '↩', '↪', '⬆', '⬇', '➡', '⬅', '🔀',
  // Tools & Settings
  '⚙', '🔧', '🔨', '🛠', '⚒', '🔩', '⛓', '🔗',
];

export const DEFAULT_ROLES = [
  'Vertrieb',
  'HR',
  'Kunde',
  'Manager',
  'IT',
  'Produktion',
];

// Process Object Defaults
export const PROCESS_STEP_ICONS = [
  '📝', '✅', '📋', '📌', '🎯', '⚡', '🔄', '🚀',
  '📊', '📈', '💡', '🔍', '✏️', '📎', '🎨', '🔔'
];

export const SYSTEM_TOOL_ICONS = [
  '💻', '🖥️', '⚙️', '🔧', '🛠️', '📱', '⌨️', '🖱️',
  '💾', '🗄️', '☁️', '🌐', '🔌', '📡', '🖨️', '📠'
];

export const COMMUNICATION_ICONS = [
  '📧', '📨', '💬', '📞', '☎️', '📱', '📲', '💌',
  '✉️', '📮', '📬', '📭', '📫', '📪', '🔔', '📢'
];

export const CONNECTOR_ICONS = [
  '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️',
  '🔀', '🔁', '🔄', '↩️', '↪️', '⤴️', '⤵️', '🔃'
];

// Decision Logic Icons
export const DECISION_ICONS = [
  '⊕', // XOR (Entweder-oder)
  '∧', // AND (Und)
  '∨'  // OR (Oder)
];

export const OBJECT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#14B8A6', // teal
];
