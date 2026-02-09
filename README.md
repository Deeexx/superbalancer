# SuperBalancer

SuperBalancer is a lightweight, shared balancing list application designed for two users to keep track of scores and items easily. It features a unique radial menu for scoring and supports persistent storage via LocalStorage.

# 🟢 Current Status: Stable & Modernized
The project is fully migrated to **Vite**, featuring a modularized codebase and a production-ready build system.
- **Health**: All core features (scoring, persistence, drag-and-drop) are active and verified.
- **Environment**: Optimized for both local development and LAN-based multi-device testing.
- **Modularized Code**: Separated into `index.html`, `src/style.css`, and `src/main.js`.
- **Network Accessibility**: Configured `vite.config.ts` with `host: true` to allow local area network access.
- **Production Ready**: Added a `base: './'` configuration for correct asset path resolution when deployed to subdirectories.

## 🛠 Tech Stack
- **Framework**: [Vite](https://vitejs.dev/)
- **Logic**: Vanilla JavaScript (ES Modules)
- **Styling**: Vanilla CSS
- **Persistence**: Browser `LocalStorage`

## 📂 Project Structure
```text
.
├── index.html          # Entry point
├── package.json        # Project metadata and scripts
├── vite.config.ts      # Vite configuration
├── src/
│   ├── main.js         # Application logic and UI rendering
│   └── style.css       # Global styles and layout
├── dist/               # Production build output (generated)
└── deploy.sh           # Deployment script for Synology NAS
```

## ⌨️ Scripts
- `npm run dev`: Start the local development server (accessible over LAN).
- `npm run build`: Generate a production-ready build in the `dist/` folder.
- `npm run preview`: Preview the production build locally.
- `npm run deploy`: Execute `deploy.sh` to build and sync files to the configured NAS and local web server.

## 🎨 Key Features & Interaction
- **Dual User Tracking**: Two synchronized columns for User 1 (Jane) and User 2 (Joe).
- **Radial Menu**: Clicking on a score trigger opens a circular menu for quick score selection (0-10).
- **Editable UI**: The app title and user names are directly editable and saved automatically.
- **Dynamic Sorting**: Items are automatically sorted by their total score (weighted sum).
- **Drag and Drop**: Easily move items between columns to balance them.
- **Persistence**: All data, including names and custom title, is persisted in `localStorage`.

## 📡 Deployment
The `deploy.sh` script automates:
1. Building the project with `npm run build`.
2. Syncing the `dist/` folder to a Synology NAS via `rsync` over SSH (Port 19091).
3. Copying the build assets to a local development path: `/home/dion/Daionys/Development/daionys_com/public/apps/superbalancer/`.

---
*Last Updated: February 9, 2026*
