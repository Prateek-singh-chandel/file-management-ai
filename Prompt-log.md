## [Date] - Task1
Goal:
Initialization

Prompt:
Act as my prompt engineer.

the project is the following

Habit Tracker with Streak Logic 
Use Case: Personal productivity
Problem Statement:
Building habits requires consistency, but most users struggle to track progress over time. Create a habit tracking application where users can add habits (e.g., "study 2 hrs", "exercise") and mark completion daily. The system should track streaks, display progress visually, and motivate users with simple feedback (e.g., streak count, completion rate). The goal is to build a clean productivity app with strong logic and user experience.
Tech Stack:
Frontend: React
Backend: Node.js / simple local storage
Al Tools:
• ChatGPT → UI/UX ideas
• GitHub Copilot → implementation
Expected Output:
• Habit list
Daily tracking 
Streak visualization

make a prompt that can describe the entire project, in which i can add the features and other changes.


Response Summary:
A prompt with suggestions of features implementation methods

Result:
worked

## [Date] - Task2
Goal:
using a modified prompt to generate the basic application

Prompt:
You are a senior full-stack engineer working inside a fresh repository.

Your task is to BUILD a complete Habit Tracker web app with streak logic using React (frontend) and Node.js (backend with JSON storage).

Follow instructions strictly. Work step-by-step. Create files, write code, and ensure everything runs.

---

# STEP 1 — Initialize Project Structure

Create this structure:

/habit-tracker
/server
server.js
data.json
/client
/src
/components
/utils
App.js
index.js
package.json

---

# STEP 2 — Backend (Node.js + Express)

Inside /server:

1. Setup Express server
2. Use data.json as storage (read/write using fs)

Habit object:
{
id: string,
name: string,
createdAt: string,
completedDates: string[]
}

---

## Implement API endpoints:

GET /habits → return all habits
POST /habits → create habit
DELETE /habits/:id → delete habit
PUT /habits/:id/toggle → toggle today's completion

Rules:

* Store dates in YYYY-MM-DD
* Prevent duplicate dates
* If toggled again → remove today's date

---

# STEP 3 — Streak Logic (CRITICAL)

Create file:
/client/src/utils/streak.js

Implement:

1. calculateStreak(completedDates)
2. calculateLongestStreak(completedDates)
3. calculateCompletionRate(completedDates, createdAt)

Rules:

* Streak only counts consecutive days up to today
* If today missing → streak = 0
* Handle gaps correctly
* Remove duplicates before processing

---

# STEP 4 — Frontend (React)

Build UI with functional components and hooks.

Components:

* HabitList
* HabitCard
* AddHabit

Features:

* Fetch habits from backend
* Add habit
* Delete habit
* Toggle completion

---

# STEP 5 — UI Behavior

Each HabitCard must show:

* Habit name
* Checkbox for today
* Current streak
* Longest streak
* Completion %

UI rules:

* Clean minimal layout
* Highlight active streak (green)
* Instant UI update after toggle

---

# STEP 6 — Integration

* Connect frontend to backend using fetch/axios
* Ensure state updates after every action
* Handle loading + errors

---

# STEP 7 — Run Instructions

Provide commands:

Backend:
cd server
npm install express
node server.js

Frontend:
cd client
npm install
npm start

---

# STEP 8 — Code Quality

* Modular code
* No unnecessary libraries
* Clear variable names
* Comments only where needed

---

# FINAL OUTPUT

* Working full-stack app
* All files created
* Code ready to run without modification

Start with backend implementation first, then frontend, then integration.


Response Summary:
Key decisions:

the files are generated and the application can be run locally.
run the server and client in separate terminals to view the application

Result:
worked partially

## [Date] - Task3
Goal:
resolve an error that occured.

Prompt:
an error occured when running npm start in client.
the error is the following-
Failed to compile.

[eslint] Plugin "react" was conflicted between "..\package.json » eslint-config-react-app » C:\Users\prate\Desktop\Prateek\habit-tracker\node_modules\eslint-config-react-app\base.js" and "BaseConfig » C:\Users\prate\Desktop\Prateek\habit-tracker\client\node_modules\eslint-config-react-app\base.js".
ERROR in [eslint] Plugin "react" was conflicted between "..\package.json » eslint-config-react-app » C:\Users\prate\Desktop\Prateek\habit-tracker\node_modules\eslint-config-react-app\base.js" and "BaseConfig » C:\Users\prate\Desktop\Prateek\habit-tracker\client\node_modules\eslint-config-react-app\base.js".

webpack compiled with 1 error
(node:19416) [DEP0060] DeprecationWarning: The util._extend API is deprecated. Please use Object.assign() instead.

tell me a workaround for this.

Response Summary:
a react plugin was causing conflict and the problemm can be fixed by making client ignore the duplicate.

Result:
worked after some fixing around.

## [Date] - Task4
Goal:

Prompt:

Response Summary:

Result:
worked / partial / failed

## [Date] - Task5
Goal:

Prompt:

Response Summary:

Result:
worked / partial / failed