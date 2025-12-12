# 3Good

A thoughtful daily gratitude practice app. Simple, focused, and privacy-first.

## What is 3Good?

3Good helps you build a consistent gratitude practice by reflecting on what you're grateful for each day. Record three good things, track your progress, and cultivate a more positive mindset over time.

## Features

### Core Practice
- **Daily Reflection** - Record three things you're grateful for today
- **Streak Tracking** - Build consistency with daily streak counters
- **Star Favorites** - Mark special moments that stand out

### Journal & Progress
- **Searchable Journal** - Browse and search all your past reflections
- **Progress Insights** - Monthly completion rates and motivational feedback
- **Monthly Reviews** - Reflect on each month, highlight your favorite moments, and track patterns
- **Year in Review** - Annual summary with stats, top moments, and yearly reflection
- **Edit & Delete** - Modify past entries as needed

### Data Control
- **Export Options** - Download your data in JSON, CSV, Text, or Markdown
- **Year Review Export** - Export your annual review as PDF or Markdown
- **Import Backups** - Restore from previous exports
- **Privacy First** - All data stays on your device (localStorage)

## Tech Stack

- **React 19.1** + **TypeScript 5.8** + **Vite 6.3** - Modern React with strict type safety
- **Tailwind CSS 3.4** - Utility-first styling
- **date-fns 4.1** - Immutable date utilities
- **Lucide React** - Icon library
- **React Router 6.30** - Client-side routing with SPA support

## Architecture

### State Management
- **Custom React Hooks** - Centralized state management via `useEntries` hook
- **localStorage Persistence** - Client-side data storage with automatic sync
- **Event-Driven Updates** - Custom events for cross-component communication
- **Type-Safe Data Models** - Strict TypeScript types for entries, monthly reflections, and yearly reviews

### Code Organization
```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks (state management)
├── layout/         # Layout components
├── pages/          # Route-level page components
└── assets/         # Static assets
```

### Technical Decisions
- **No External State Library** - Custom hooks provide sufficient abstraction without Redux/Zustand overhead
- **localStorage over IndexedDB** - Simpler API for small-scale personal data
- **TypeScript Strict Mode** - Full type safety with `noUnusedLocals` and `noImplicitAny`
- **SPA Routing** - Netlify redirects configured for client-side routing
- **Performance** - Memoization with `useMemo` for expensive calculations

### Type Safety
- Strict TypeScript configuration with comprehensive type definitions
- Type-safe data models for all entities (Entry, MonthlyReflection, YearlyReview)
- Minimal use of `any` types (limited to backward compatibility and union type handling)

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Deployment
The app is configured for Netlify with:
- SPA redirect rules (`public/_redirects`)
- TypeScript compilation in build process
- Optimized Vite production build

## Development Practices

- **ESLint** - Code quality and consistency
- **TypeScript Strict Mode** - Compile-time type checking
- **Component-Based Architecture** - Reusable, composable components
- **Custom Hooks Pattern** - Encapsulated business logic
- **Performance Optimization** - Memoization for expensive operations

## Design Philosophy

3Good is built for people who value:
- **Simplicity** - Clean, distraction-free interface
- **Privacy** - Your reflections stay on your device (localStorage only)
- **Consistency** - Gentle encouragement to build the habit
- **Mindfulness** - Thoughtful design that promotes reflection

## License

MIT License - feel free to fork and adapt for your own use.

---

*Built with intention — a tool for mindful reflection*
