# Smart File Organizer + AI Suggestions

Production-style hackathon demo app with a React + Vite frontend and FastAPI backend that scans messy folders, categorizes files, suggests cleanup actions, and organizes files safely with undo support.

## Project Structure

- `backend/` FastAPI service (`main.py`, `organizer.py`, `ai_engine.py`, `utils.py`, `history.json`)
- `frontend/` React + Vite + Tailwind app with animated SaaS UI

## Features

- Recursive folder scanner with metadata extraction
- Smart category grouping (Images, Videos, Documents, Code, Audio, Archives, Others)
- AI suggestion panel with local heuristics fallback
- Duplicate detection via MD5
- Large/old/screenshot clutter detection
- Organize and Undo file movements
- Dashboard stats and file table
- Modern dark glassmorphism UI with Framer Motion

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Routes

- `GET /`
- `POST /scan-folder`
- `POST /organize`
- `POST /undo`
- `GET /stats`
- `GET /ai-suggestions`

## Example Demo Layout (Mock Preview)

- Left sidebar with app branding/navigation
- Hero scan card with path input + Scan/Organize/Undo actions
- Animated progress bar during scans
- AI suggestions cards and category distribution panel
- File table with metadata rows and empty states

## Notes

- If `OPENAI_API_KEY` exists, backend switches to OpenAI-enhanced mode placeholder payload.
- Without API key, app uses robust local heuristics.
- Use absolute folder paths for scanning from the frontend input.
