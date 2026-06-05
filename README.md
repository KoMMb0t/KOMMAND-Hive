# 🐝 KOMMAND Hive

> **Command your AI swarm.**

KOMMAND Hive ist eine persönliche KI-Agenten-Orchestrierungsplattform — ein Desktop-Workspace, der mehrere KI-Agenten in isolierten Sessions koordiniert, einen gemeinsamen Cloud-Speicher teilt und reale Ziele (wie Hackathons) als Mission-Board nutzt.

---

## 🧠 Die Idee

Anstatt viele einzelne KI-Tools nebeneinander zu nutzen, orchestriert KOMMAND Hive sie als **kooperierenden Schwarm**:

```
┌──────────────── KOMMAND Hive (Electron Shell) ─────────────────┐
│                                                                  │
│  [🔬 Researcher]  [💻 Coder]  [🧪 Tester]  [🎯 Scout]         │
│   isolierte        isolierte    virtAndronix  hackathon-        │
│   KI-Session       KI-Session   Android-VM    hunter           │
│        │               │             │             │            │
│        └───────────────┴─────────────┴─────────────┘            │
│                               │                                  │
│                    ┌──────────▼──────────┐                      │
│                    │    🍯 Hivemind       │                      │
│                    │  (Shared Storage)    │                      │
│                    │  GitHub/Drive/S3     │                      │
│                    └─────────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

Jeder Agent hat eine **isolierte Browser-Partition** (keine Cookie-Konflikte), aber alle teilen denselben **Hivemind** — einen universellen Cloud-Speicher für Wissen, Dateien und Ergebnisse.

---

## 🗺️ Architektur

### Agent Cells (isolierte Sessions)
Basierend auf Electron `BrowserView` — jede Cell ist ein vollständig getrennter Browser-Kontext.

### Hivemind (Shared Brain)
Universelle Storage-Abstraktion: GitHub Repos, Google Drive, OneDrive oder eigener Server — einheitliche API für alle Agenten.

### Mission Board
KI-gestützte Hackathon-Discovery: Finde Events, generiere Ideen, verwalte Projekte — direkt als Agenten-Ziele.

### Code Intelligence
Inline-Assistent in jeder Agent-Cell: Explain, Refactor, Test, Debug — ohne App-Wechsel.

---

## 📦 Repo-Quellen (gemergte Projekte)

| Package | Ursprungs-Repo | Funktion |
|---|---|---|
| `electron-shell` | `multi-account-connector-builder` | Isolierte Agent-Sessions |
| `cloud-storage` | `universeller-ki-cloud-speicher` | Hivemind / Shared Brain |
| `mission-board` | `hackathon-hunter` | Ziele & Hackathon-Discovery |
| `code-intel` | `manus-monica-fusion` | Inline Code-Assistent |
| `android-test` | `virtandronix` | Android-Test-Agent |

---

## 🚀 Tech Stack

- **Shell:** Electron 28+, BrowserView (isolierte Partitionen)
- **Frontend:** React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, tRPC
- **Datenbank:** PostgreSQL / SQLite (lokal), Drizzle ORM
- **Storage:** GitHub API, Google Drive API, OneDrive API, S3
- **AI:** OpenAI-kompatible APIs (benutzerdefinierter Key)
- **Mobile Testing:** ADB, QEMU, Docker-Android
- **Build:** Vite, pnpm, electron-builder

---

## 🗂️ Projektstruktur

```
KOMMAND-Hive/
├── src/
│   ├── main/            # Electron Main Process
│   ├── renderer/        # React UI (Shell, Sidebar, Tabs)
│   ├── agents/          # Agent-Lifecycle & IPC
│   └── shared/          # Typen, Konstanten
├── packages/
│   ├── cloud-storage/   # Hivemind Storage Abstraktion
│   └── code-intel/      # Code Intelligence Layer
├── docs/
│   └── ARCHITECTURE.md
└── ...
```

---

## ⌨️ Keyboard Shortcuts

| Aktion | Windows/Linux | macOS |
|---|---|---|
| Neue Agent Cell | `Ctrl+N` | `Cmd+N` |
| Nächste Cell | `Ctrl+Tab` | `Cmd+Tab` |
| Mission Board | `Ctrl+M` | `Cmd+M` |
| Hivemind öffnen | `Ctrl+H` | `Cmd+H` |
| Cell neu laden | `Ctrl+R` | `Cmd+R` |

---

## 🛣️ Roadmap

### Phase 1 — Kern (jetzt)
- [x] Repo-Setup & Architektur
- [ ] Electron Shell mit isolierten BrowserViews
- [ ] Agent-Sidebar & Tab-Management
- [ ] Zustandsspeicherung (electron-store)

### Phase 2 — Hivemind
- [ ] GitHub Storage Provider
- [ ] Google Drive Provider
- [ ] Agent-zu-Agent Datenaustausch via Shared Storage

### Phase 3 — Mission Board
- [ ] Hackathon-Discovery Integration
- [ ] KI-Ideengenerator
- [ ] Projekt-Workflow (Idea → Code → Test → Submit)

### Phase 4 — Intelligence
- [ ] Inline Code-Assistent in jeder Cell
- [ ] Android-Test-Agent (virtAndronix)
- [ ] Automatischer Event-Bus zwischen Agenten

---

## 🏁 Schnellstart

```bash
git clone https://github.com/KoMMb0t/KOMMAND-Hive.git
cd KOMMAND-Hive
pnpm install
pnpm dev
```

---

## 📄 Lizenz

MIT License — © KoMMb0t

---

*Dein Schwarm. Dein Kommando.*
