import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from './config';
import { Player, ProcessCard, ProcessObject } from '../types/game';

// Get the base URL - priority: Firebase Config > Environment Variable > Current Location
let cachedBaseUrl: string | null = null;

export const getBaseUrl = async (): Promise<string> => {
  // Return cached value if available
  if (cachedBaseUrl) return cachedBaseUrl;

  try {
    // Try to get from Firebase config
    const configRef = doc(db, 'config', 'app');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists() && configSnap.data().baseUrl) {
      cachedBaseUrl = configSnap.data().baseUrl as string;
      return cachedBaseUrl;
    }
  } catch (error) {
    console.log('Firebase config not available, using default');
  }

  // Fallback to current location
  cachedBaseUrl = window.location.origin;
  return cachedBaseUrl;
};

// Update base URL in Firebase
export const setBaseUrl = async (baseUrl: string) => {
  const configRef = doc(db, 'config', 'app');
  await setDoc(configRef, { 
    baseUrl,
    updatedAt: serverTimestamp() 
  }, { merge: true });
  cachedBaseUrl = baseUrl; // Update cache
};

// Helper to get base URL synchronously (uses cached value or current origin)
export const getBaseUrlSync = (): string => {
  return cachedBaseUrl || window.location.origin;
};

// Generate a simple game ID
export const generateGameId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new game session
export const createGame = async (gameId: string) => {
  const gameRef = doc(db, 'games', gameId);
  await setDoc(gameRef, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return gameId;
};

// Add a player to a game
export const addPlayer = async (gameId: string, player: Player) => {
  const playerRef = doc(db, 'games', gameId, 'players', player.id);
  
  // Remove undefined values - Firebase doesn't allow them
  const playerData: any = {
    name: player.name,
    role: player.role,
    color: player.color,
    icon: player.icon,
    createdAt: serverTimestamp(),
  };
  
  if (player.position !== undefined) playerData.position = player.position;
  if (player.onBoard !== undefined) playerData.onBoard = player.onBoard;
  if (player.input !== undefined) playerData.input = player.input;
  if (player.output !== undefined) playerData.output = player.output;
  if (player.medium !== undefined) playerData.medium = player.medium;
  if (player.processRole !== undefined) playerData.processRole = player.processRole;
  
  await setDoc(playerRef, playerData);
};

// Update player position
export const updatePlayerPosition = async (
  gameId: string, 
  playerId: string, 
  position: { x: number; y: number },
  setOnBoard?: boolean
) => {
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  const updateData: any = { position };
  
  // Wenn setOnBoard übergeben wurde, aktualisiere auch den onBoard Status
  if (setOnBoard !== undefined) {
    updateData.onBoard = setOnBoard;
  }
  
  await updateDoc(playerRef, updateData);
};

// Remove a player
export const removePlayer = async (gameId: string, playerId: string) => {
  const playerRef = doc(db, 'games', gameId, 'players', playerId);
  await deleteDoc(playerRef);
};

// Add a process step
export const addProcessStep = async (gameId: string, card: ProcessCard) => {
  console.log('🔥 gameService: addProcessStep called', { gameId, card });
  
  try {
    const stepsRef = collection(db, 'games', gameId, 'processSteps');
    
    // Remove undefined fields (Firebase doesn't allow undefined)
    const cleanCard: any = { ...card };
    Object.keys(cleanCard).forEach(key => {
      if (cleanCard[key] === undefined) {
        delete cleanCard[key];
      }
    });
    
    const docRef = await addDoc(stepsRef, {
      ...cleanCard,
      createdAt: serverTimestamp(),
    });
    console.log('✅ gameService: Process step added with ID:', docRef.id);
  } catch (error) {
    console.error('❌ gameService: Error adding process step:', error);
    throw error;
  }
};

// Update a process step
export const updateProcessStep = async (
  gameId: string, 
  stepId: string, 
  updates: Partial<ProcessCard>
) => {
  const stepRef = doc(db, 'games', gameId, 'processSteps', stepId);
  await updateDoc(stepRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Remove a process step
export const removeProcessStep = async (gameId: string, stepId: string) => {
  const stepRef = doc(db, 'games', gameId, 'processSteps', stepId);
  await deleteDoc(stepRef);
};

// Subscribe to players (real-time)
export const subscribeToPlayers = (
  gameId: string, 
  callback: (players: Player[]) => void
) => {
  const playersRef = collection(db, 'games', gameId, 'players');
  
  return onSnapshot(playersRef, (snapshot) => {
    const players: Player[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      players.push({
        id: doc.id,
        name: data.name,
        role: data.role,
        color: data.color,
        icon: data.icon,
        position: data.position,
        onBoard: data.onBoard,
        input: data.input,
        output: data.output,
        medium: data.medium,
        processRole: data.processRole,
      });
    });
    callback(players);
  });
};

// Subscribe to process steps (real-time)
export const subscribeToProcessSteps = (
  gameId: string, 
  callback: (steps: ProcessCard[]) => void
) => {
  const stepsRef = collection(db, 'games', gameId, 'processSteps');
  const q = query(stepsRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const steps: ProcessCard[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      steps.push({
        id: doc.id,
        playerId: data.playerId,
        playerName: data.playerName,
        text: data.text,
        round: data.round,
        order: data.order,
        timestamp: data.timestamp,
        fromPlayerId: data.fromPlayerId,
        toPlayerId: data.toPlayerId,
        medium: data.medium,
        duration: data.duration,
        description: data.description,
        communicationObjectIds: data.communicationObjectIds,
      });
    });
    callback(steps);
  });
};

// Add a process object
export const addProcessObject = async (gameId: string, processObject: Omit<ProcessObject, 'id' | 'timestamp'>) => {
  const objectsRef = collection(db, 'games', gameId, 'processObjects');
  await addDoc(objectsRef, {
    ...processObject,
    timestamp: Date.now(),
    createdAt: serverTimestamp(),
  });
};

// Update a process object
export const updateProcessObject = async (
  gameId: string, 
  objectId: string, 
  updates: Partial<ProcessObject>
) => {
  const objectRef = doc(db, 'games', gameId, 'processObjects', objectId);
  await updateDoc(objectRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Remove a process object
export const removeProcessObject = async (gameId: string, objectId: string) => {
  const objectRef = doc(db, 'games', gameId, 'processObjects', objectId);
  await deleteDoc(objectRef);
};

// Subscribe to process objects (real-time)
export const subscribeToProcessObjects = (
  gameId: string,
  callback: (objects: ProcessObject[]) => void
) => {
  const objectsRef = collection(db, 'games', gameId, 'processObjects');
  const q = query(objectsRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const objects: ProcessObject[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      objects.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        category: data.category,
        timestamp: data.timestamp,
      } as ProcessObject);
    });
    callback(objects);
  });
};
