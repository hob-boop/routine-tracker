# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step or dependencies required. Open `index.html` directly in a browser:

```bash
# Any of these work:
open index.html                          # macOS
xdg-open index.html                      # Linux
python3 -m http.server 8080              # Serve locally if needed
```

`calendar-tracker.html` is an identical copy of `index.html` — changes must be kept in sync between both files.

## Architecture

This is a zero-dependency, single-file vanilla JS application. All HTML, CSS, and JavaScript live inline in `index.html`. There is no build system, no npm, no framework, and no backend. Data persists entirely via `localStorage` under the key `'routine-tracker'`.

### State

All runtime state lives in a single object `S`:

```js
let S = {
  view: 'week' | 'day',
  currentDate: Date,
  events: [...],
  categories: [...],
  tasks: [...],
  filteredCategories: string[],
  expandedCategories: string[],
  theme: 'light' | 'dark',
  mobileTab: 'calendar' | 'tasks' | 'settings',
  mobileDay: string
}
```

The cycle is: **user action → mutate `S` → call `save()` → call `render()`**. There is no reactive framework; re-renders are triggered manually.

### Key Functions

| Function | Purpose |
|---|---|
| `loadState()` | Hydrate `S` from `localStorage` on startup |
| `save()` | Serialize `S` to `localStorage` |
| `render()` | Top-level re-render dispatcher |
| `renderCalendar()` | Render the week/day grid and positioned event blocks |
| `renderCategories()` | Render sidebar category list and tasks |
| `renderMobileTasks()` | Render mobile task panel |
| `navigate(dir)` | Move current date forward/back by week or day |
| `goToday()` | Jump to today |
| `openNewEvent()` / `saveEvent()` / `deleteEvent()` | Event CRUD via modal |
| `openCategoryModal()` / `saveCategory()` / `deleteCategory()` | Category CRUD |
| `toggleTask()` / `submitAddTask()` / `deleteTask()` | Task management |

### Data Schema (localStorage)

```js
{
  events: [{
    id: string,          // timestamp-based unique ID
    date: 'YYYY-MM-DD',
    title: string,
    startTime: 'h:mm AM/PM',
    endTime: 'h:mm AM/PM',
    categoryId: string,
    status: 'none' | 'progress' | 'complete' | 'missed',
    notes?: string
  }],
  categories: [{ id: string, name: string, color: string }],  // color is hex
  tasks: [{ id: string, categoryId: string, text: string, done: boolean }],
  filteredCategories: string[],   // category IDs hidden from calendar
  expandedCategories: string[],   // category IDs expanded in sidebar
  theme: 'light' | 'dark'
}
```

### Layout & Responsive Behaviour

- **Desktop (> 768px):** Fixed sidebar (categories + tasks) + main calendar area
- **Mobile (≤ 768px):** Bottom tab bar with three panels — Calendar, Tasks, Settings; week strip at top; touch swipe navigation between days

### Hardcoded Constants

- `SLOT_H = 40` — pixel height of each 30-minute time slot in the calendar grid
- `COLORS` — 16-colour palette array for category picker
- `DEFAULT_CATS` — 5 default categories seeded on first load (Work, Fitness, Personal, Rest, Groceries)

### PWA

A Web App Manifest is generated and injected at runtime, making the app installable as a standalone PWA on iOS/Android.

### Keyboard Shortcuts

`←` / `→` navigate, `T` jumps to today, `W` switches to week view, `D` switches to day view.
