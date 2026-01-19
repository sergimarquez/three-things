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

- **Searchable Journal** - Browse and search all your past reflections with debounced search
- **Progress Insights** - Monthly completion rates and motivational feedback
- **Monthly Reviews** - Full-page workflow to select your top 5 favorite moments from starred entries, with optional review mode to star additional moments
- **Year in Review** - Annual summary with stats, top moments, and yearly reflection
- **Edit & Delete** - Modify past entries as needed

### Data Control

- **Export Options** - Download your data in JSON (v1.1.0), CSV, Text, or Markdown
- **Year Review Export** - Export your annual review as PDF or Markdown
- **Import Backups** - Restore from previous exports with version compatibility checks
- **Privacy First** - All data stays on your device (localStorage)

## Tech Stack

- **React 19.1** + **TypeScript 5.8** + **Vite 6.3** - Modern React with strict type safety
- **React Compiler** - Automatic memoization and performance optimization
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
- **SPA Routing** - Netlify redirects configured for client-side routing with dedicated pages for reviews
- **React Compiler** - Automatic memoization of components and expensive calculations, eliminating manual `useMemo`/`useCallback` overhead
- **Performance** - Debounced search input, automatic compiler optimizations

### Robustness & Error Handling

- **React Error Boundaries** - Graceful error handling with fallback UI when components crash
- **localStorage Error Handling** - Detects quota exceeded and disabled storage with user-friendly messages
- **Data Validation** - Validates data structure on load and import, filters out corrupted entries automatically
- **Type Safety** - Minimal use of `any` types, strict validation for imported data

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
- **React Compiler** - Automatic performance optimization at build time

## Versioning

3Good uses semantic versioning (SemVer) for data exports and compatibility:

- **Current Version**: v1.1.0
- **Version Format**: `MAJOR.MINOR.PATCH` (e.g., `1.1.0`)

### Version Strategy

- **Major Version (1.x.x)**: Breaking changes to data structure that require migration
- **Minor Version (x.1.x)**: New features, backward compatible with existing data
- **Patch Version (x.x.1)**: Bug fixes and improvements, fully backward compatible

### Version in Exports

All JSON exports include a `version` field for compatibility tracking. The app validates version compatibility when importing backups to prevent data corruption.

### Updating Versions

When adding features or making changes:

1. **Update `DATA_VERSION`** in `src/hooks/useEntries.ts`
2. **Update README** if features change significantly
3. **Test import/export** with previous version backups
4. **Add migration logic** if breaking changes are needed (major version bump)

The version is displayed in:

- App footer
- About page
- JSON export files

## Design Philosophy

3Good is built for people who value:

- **Simplicity** - Clean, distraction-free interface
- **Privacy** - Your reflections stay on your device (localStorage only)
- **Consistency** - Gentle encouragement to build the habit
- **Mindfulness** - Thoughtful design that promotes reflection

## License

MIT License - feel free to fork and adapt for your own use.

---

_Built with intention — a tool for mindful reflection_
