# Smart File Organizer + AI Suggestions

Smart File Organizer + AI Suggestions is a production-style demo app that scans messy folders, categorizes files automatically, surfaces cleanup recommendations, and safely organizes content into structured directories with undo support.

The project is designed like a modern SaaS product for hackathons and portfolio demos:

- React + Vite frontend
- TailwindCSS glassmorphism UI
- Framer Motion animations
- FastAPI backend with recursive scanning and file moves
- Optional OpenAI-backed suggestions with a local heuristics fallback

## What It Does

- Recursively scans a folder and extracts metadata for every file
- Categorizes files into Images, Videos, Documents, Code, Audio, Archives, and Others
- Detects duplicates with MD5 hashes
- Flags large files, screenshot clutter, and old unused files
- Shows before/after folder previews
- Organizes files with `shutil.move()`
- Stores move history in JSON and restores files with Undo
- Displays analytics, charts, and AI suggestions in a dashboard

## Project Structure

```text
backend/
  main.py
  organizer.py
  ai_engine.py
  utils.py
  requirements.txt
  history.json

frontend/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  src/
    App.jsx
    main.jsx
    index.css
    components/
    pages/
    services/
```

## Backend Features

- `GET /` health/info route
- `POST /scan-folder` full recursive scan and analytics payload
- `POST /organize` safe file organization into category folders
- `POST /undo` restore the most recent organization session
- `GET /stats` lightweight analytics summary
- `GET /ai-suggestions` AI/local cleanup recommendations

## Frontend Pages

- Landing page with product-style marketing layout
- Folder scanner dashboard
- AI suggestions section
- Analytics section
- File table with search/filter
- Before/after preview tree

## Requirements

- Python 3.10+
- Node.js 18+

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs by default on `http://127.0.0.1:8000`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs by default on `http://localhost:5173`.

## Environment Variables

Optional backend env vars:

- `OPENAI_API_KEY` to enable OpenAI-powered suggestions
- `OPENAI_MODEL` to choose the chat model, defaults to `gpt-4o-mini`

Optional frontend env var:

- `VITE_API_BASE_URL` to point the UI at a different FastAPI host

## API Contract

### `POST /scan-folder`

Body:

```json
{ "path": "C:\\Users\\YourName\\Desktop\\Messy Folder" }
```

Returns:

- file metadata list
- stats block
- duplicate clusters
- large/old/screenshot detections
- before/after preview trees
- AI suggestions

### `POST /organize`

Moves files into:

```text
<selected folder>/Smart File Organizer/<Category>/...
```

Returns:

- moved count
- skipped count
- byte totals
- move history session id
- preview tree for the organized layout

### `POST /undo`

Restores the most recent organization session for the selected folder.

### `GET /stats`

Query example:

```text
/stats?path=C:\Users\YourName\Desktop\Messy Folder
```

### `GET /ai-suggestions`

Query example:

```text
/ai-suggestions?path=C:\Users\YourName\Desktop\Messy Folder
```

## Mock Preview Layout

The UI is structured like a startup dashboard:

```text
Landing Page
  - hero headline
  - CTA buttons
  - feature cards
  - demo cockpit panel

Dashboard
  - left sidebar
  - folder scan card
  - animated progress bar
  - stats cards
  - AI recommendations cards
  - category donut chart
  - largest files / duplicate clusters
  - before/after preview trees
  - searchable file table
```

## Notes

- The app expects an absolute folder path on the machine running FastAPI.
- Browser uploads are not required because the backend scans the local filesystem directly.
- If OpenAI credentials are missing, the app automatically falls back to local cleanup heuristics.
- The organize flow keeps a JSON history so Undo is safe and reversible.

## Demo Flow

1. Open the landing page
2. Switch to the dashboard
3. Paste an absolute folder path
4. Click Scan Folder
5. Review AI suggestions and analytics
6. Click Organize
7. Use Undo to restore the previous state

## Why This Feels Like a SaaS Demo

- Dark modern visual system
- Glass cards and layered gradients
- Motion on key transitions
- Real backend logic instead of static mock data
- Clear control surface for scanning, organizing, and undoing
- Analytics that make the cleanup story easy to explain on stage

