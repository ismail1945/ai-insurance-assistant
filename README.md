# To-Do List Application

A polished, responsive to-do list web app built with React + Vite.

## Features

- Create, edit, complete, and delete tasks
- Filter by **All / Active / Completed**
- Clear completed tasks
- Remaining task counter
- Task fields: `id`, `title`, `completed`, `createdAt`, optional `dueDate`, `priority`
- localStorage persistence for tasks and selected filter
- Accessible form controls, keyboard-friendly editing (`Enter` to save, `Escape` to cancel)
- Empty states and validation for blank task titles
- Responsive layout for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 20+ (or current LTS)
- npm 10+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test
```

## Persistence Notes

The app stores data in browser localStorage using:

- `todo.tasks` for task data
- `todo.filter` for current filter

Storage parsing is defensive: invalid or malformed data falls back safely to defaults.
