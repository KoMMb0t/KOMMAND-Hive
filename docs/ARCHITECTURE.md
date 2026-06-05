# KOMMAND Hive — Architektur

## Übersicht

KOMMAND Hive besteht aus vier Hauptschichten:

```
┌─────────────────────────────────────────────────┐
│              Electron Shell (Main)               │
│   BrowserWindow + BrowserView Management         │
└──────────────────┬──────────────────────────────┘
                   │ IPC (contextBridge)
┌──────────────────▼──────────────────────────────┐
│              React Renderer (UI)                 │
│   Sidebar · AgentTabs · MissionBoard · Hivemind  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Agent Cells                         │
│   BrowserView (persist:[agentId])                │
│   Vollständig isolierte Cookie/Storage-Partition │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Hivemind (Shared Storage)           │
│   GitHub · Google Drive · OneDrive · Custom S3   │
└─────────────────────────────────────────────────┘
```

## Komponenten

### 1. Electron Main Process (`src/main/`)
- Erstellt und verwaltet `BrowserWindow`
- Instanziiert `BrowserView` pro Agent Cell mit isolierter Partition
- IPC Handler für: Cell erstellen/löschen, Hivemind lesen/schreiben, State speichern

### 2. Preload Script (`src/main/preload.ts`)
- `contextBridge` Sicherheitsschicht
- Exponiert `window.hiveAPI` für den Renderer

### 3. React Renderer (`src/renderer/`)
- **Sidebar:** Liste aller Agent Cells + Quicklinks
- **AgentTabs:** Aktive Cell anzeigen, zwischen Cells wechseln
- **MissionBoard:** Hackathon-Discovery, Projektübersicht
- **HivemindPanel:** Gemeinsame Dateien aller Agenten

### 4. Agent Cells (`src/agents/`)
- Lifecycle: create, activate, reload, remove
- Jede Cell hat: id, name, url, icon, partition (`persist:[id]`)
- Predefined Templates: Manus, ChatGPT, GitHub, Gmail, Custom

### 5. Cloud Storage Packages (`packages/cloud-storage/`)
- `StorageManager` — einheitliche API
- Provider: `GitHubProvider`, `GoogleDriveProvider`, `OneDriveProvider`, `S3Provider`
- Agenten schreiben Ergebnisse → Hivemind liest → andere Agenten reagieren

## Dateifluss zwischen Agenten

```
Scout-Agent (hackathon-hunter)
    → findet Hackathon mit Deadline
    → schreibt mission.json in Hivemind

Researcher-Agent
    → liest mission.json
    → generiert requirements.md
    → schreibt in Hivemind

Coder-Agent
    → liest requirements.md
    → generiert Code-Skeleton
    → schreibt src/ in Hivemind

Tester-Agent (virtAndronix)
    → liest src/ aus Hivemind
    → deployed auf Android-VM
    → schreibt test-results.json in Hivemind
```

## Sicherheitsmodell
- `contextIsolation: true`
- `nodeIntegration: false`
- Alle IPC nur über definierte `hiveAPI`-Methoden
- Storage-Keys werden nie im Renderer gespeichert
