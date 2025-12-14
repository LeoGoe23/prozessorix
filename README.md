# Processorix - Kollaboratives Prozessspiel

Ein interaktives Multiplayer-Prozessspiel, entwickelt mit React, TypeScript und Tailwind CSS.

## Features

- 👥 **Mehrere Spieler**: Fügen Sie beliebig viele Spieler mit Namen und Rollen hinzu
- 🎮 **Rundenbasiertes Gameplay**: Spieler wechseln sich ab und erstellen gemeinsam einen Prozess
- 🎨 **Visuelle Swimlanes**: Jeder Spieler hat seine eigene farbcodierte Lane
- 📊 **Prozess-Karten**: Schritte werden als verbundene Karten dargestellt
- ✨ **Modern UI**: Entwickelt mit Tailwind CSS für ein elegantes Design
- 🚀 **Live Frontend**: Kein Backend erforderlich - alle Zustände werden lokal verwaltet

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build erstellen
npm run build
```

## Spielanleitung

1. **Spieler hinzufügen**: 
   - Geben Sie Namen und Rollen für mindestens 2 Spieler ein
   - Empfohlene Rollen: Vertrieb, HR, Kunde, Manager, IT, Produktion

2. **Spiel starten**:
   - Klicken Sie auf "Spiel starten" wenn alle Spieler hinzugefügt sind

3. **Prozessschritte erstellen**:
   - Der aktuelle Spieler gibt einen Prozessschritt ein (z.B. "Ich leite den Vertrag weiter")
   - Die Karte erscheint in der entsprechenden Lane
   - Klicken Sie auf "Zug beenden" um zum nächsten Spieler zu wechseln

4. **Spielende**:
   - Das Spiel läuft über 6 Runden (anpassbar)
   - Nach der letzten Runde wird der fertige Prozess angezeigt

## Technologie-Stack

- **React 18** - UI Framework
- **TypeScript** - Type-safe Development
- **Tailwind CSS** - Utility-First CSS
- **Vite** - Build Tool
- **Lucide React** - Icon Library

## Projektstruktur

```
src/
├── components/
│   ├── PlayerSetup.tsx    # Spieler-Einrichtung
│   └── GameBoard.tsx      # Hauptspielfeld mit Swimlanes
├── types/
│   └── game.ts            # TypeScript Interfaces
├── App.tsx                # Hauptkomponente mit State Management
├── main.tsx              # Entry Point
└── index.css             # Global Styles
```

## Anpassungen

- **Rundenzahl ändern**: Bearbeiten Sie `MAX_ROUNDS` in `src/App.tsx`
- **Spielerfarben**: Passen Sie `PLAYER_COLORS` in `src/types/game.ts` an
- **Standard-Rollen**: Ändern Sie `DEFAULT_ROLES` in `src/types/game.ts`

## Entwicklung

Die App nutzt:
- Funktionale React-Komponenten mit Hooks
- TypeScript für Type Safety
- Tailwind CSS für responsives Design
- Lokaler State Management (kein Backend)

## Lizenz

MIT
