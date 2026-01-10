# React Memoization Guide

## What is Memoization?

**Memoization** is a performance optimization technique that caches the result of an expensive computation and only recalculates it when the inputs (dependencies) change.

Think of it like this: Instead of recalculating `2 + 2` every time, you remember the answer is `4` and only recalculate if the numbers change.

## Why Use Memoization in React?

React components re-render when:

- State changes
- Props change
- Parent component re-renders

Without memoization, expensive calculations run on **every render**, even if the inputs haven't changed. This can cause:

- Slow UI updates
- Unnecessary CPU usage
- Poor user experience

## React Memoization Hooks

### `useMemo` - For Values

Caches a **computed value** and only recalculates when dependencies change.

**Syntax:**

```typescript
const memoizedValue = useMemo(() => {
  // Expensive calculation
  return computeExpensiveValue(a, b);
}, [a, b]); // Dependencies array
```

### `useCallback` - For Functions

Caches a **function reference** and only creates a new function when dependencies change. Useful when passing functions to child components.

**Syntax:**

```typescript
const memoizedCallback = useCallback(() => {
  // Function logic
  doSomething(a, b);
}, [a, b]); // Dependencies array
```

## Examples from Our Codebase

### Example 1: Streak Calculation (Streak.tsx)

**Before (Without Memoization):**

```typescript
const calculateStreak = () => {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  // ... expensive calculation runs on EVERY render
  return streak;
};

const streak = calculateStreak(); // Called every render!
```

**Problem:** This function runs on every render, even if `entries` hasn't changed. If the component re-renders 10 times, the calculation runs 10 times unnecessarily.

**After (With Memoization):**

```typescript
const streak = useMemo(() => {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  // ... expensive calculation
  return streak;
}, [entries]); // Only recalculate when entries change
```

**Benefit:** The calculation only runs when `entries` actually changes. If the component re-renders for other reasons (like state updates), the cached value is reused.

### Example 2: Filtered Data (Archive.tsx)

**Before:**

```typescript
const filteredEntries = entries.filter((entry) => {
  // Complex filtering logic
  if (debouncedSearchTerm) {
    // Search through all items...
  }
  // Date range filtering...
  // Starred filtering...
  return matches;
});
```

**After:**

```typescript
const filteredEntries = useMemo(() => {
  let result = entries.filter((entry) => {
    // Complex filtering logic
    if (debouncedSearchTerm) {
      // Search through all items...
    }
    // Date range filtering...
    return matches;
  });

  if (showStarredOnly) {
    result = result.map(/* ... */).filter(/* ... */);
  }

  return result;
}, [entries, debouncedSearchTerm, showStarredOnly, dateFrom, dateTo]);
```

**Why it matters:** Filtering can be expensive with large datasets. With memoization, we only filter when:

- `entries` changes (new entry added)
- `debouncedSearchTerm` changes (user types)
- `showStarredOnly` changes (user toggles filter)
- Date filters change

If the component re-renders for other reasons (like hover states), the filtered result is reused.

### Example 3: Grouped Data (YearReview.tsx)

**Before:**

```typescript
const momentsByMonth = topMoments.reduce((acc, moment) => {
  const monthKey = format(parseISO(moment.date), "MMMM yyyy");
  if (!acc[monthKey]) {
    acc[monthKey] = [];
  }
  acc[monthKey].push(moment);
  return acc;
}, {});

const sortedMonths = Object.keys(momentsByMonth).sort((a, b) => {
  return (
    parseISO(momentsByMonth[a][0].date).getTime() - parseISO(momentsByMonth[b][0].date).getTime()
  );
});
```

**After:**

```typescript
const { momentsByMonth, sortedMonths } = useMemo(() => {
  const grouped = topMoments.reduce((acc, moment) => {
    const monthKey = format(parseISO(moment.date), "MMMM yyyy");
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(moment);
    return acc;
  }, {} as Record<string, typeof topMoments>);

  const sorted = Object.keys(grouped).sort((a, b) => {
    return parseISO(grouped[a][0].date).getTime() - parseISO(grouped[b][0].date).getTime();
  });

  return { momentsByMonth: grouped, sortedMonths: sorted };
}, [topMoments]);
```

**Why it matters:** Grouping and sorting operations run on every render. With memoization, they only run when `topMoments` changes.

### Example 4: Derived Data (MonthlyReviewCard.tsx)

**Before:**

```typescript
const favoriteItems = reflection.selectedFavorites
  .map((key) => {
    // Parse key, find entry, extract item
    const entry = entries.find((e) => e.id === entryId);
    return { text: entry.items[itemIndex].text, date: entry.date };
  })
  .filter(Boolean);
```

**After:**

```typescript
const favoriteItems = useMemo(
  () =>
    reflection.selectedFavorites
      .map((key) => {
        // Parse key, find entry, extract item
        const entry = entries.find((e) => e.id === entryId);
        return { text: entry.items[itemIndex].text, date: entry.date };
      })
      .filter(Boolean),
  [entries, reflection.selectedFavorites]
);
```

**Why it matters:** Mapping over favorites and finding entries in a large array can be slow. Memoization ensures this only happens when the actual data changes.

## Key Rules for Memoization

### 1. Include All Dependencies

**❌ Wrong:**

```typescript
const result = useMemo(() => {
  return compute(a, b, c); // Uses c but doesn't list it
}, [a, b]); // Missing c!
```

**✅ Correct:**

```typescript
const result = useMemo(() => {
  return compute(a, b, c);
}, [a, b, c]); // All dependencies listed
```

### 2. Don't Memoize Everything

**❌ Don't memoize simple calculations:**

```typescript
const sum = useMemo(() => a + b, [a, b]); // Overkill! Addition is fast
```

**✅ Memoize expensive operations:**

```typescript
const filtered = useMemo(() => {
  return largeArray.filter(/* complex logic */).map(/* transform */);
}, [largeArray, filterCriteria]);
```

### 3. When to Use `useMemo` vs `useCallback`

**Use `useMemo` for:**

- Computed values (arrays, objects, numbers, strings)
- Filtered/sorted data
- Derived state

**Use `useCallback` for:**

- Functions passed to child components
- Event handlers in dependency arrays
- Functions used in other hooks

**Example of `useCallback`:**

```typescript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]); // Only recreate function when id changes

// Pass to child - child won't re-render unnecessarily
<ChildComponent onClick={handleClick} />;
```

## Performance Impact

### Before Memoization:

- Component renders → All calculations run
- State updates → All calculations run again
- Parent re-renders → All calculations run again
- **Result:** Unnecessary work, slower UI

### After Memoization:

- Component renders → Calculations run (first time)
- State updates → Cached value reused ✅
- Parent re-renders → Cached value reused ✅
- Data changes → Calculations run (only when needed) ✅
- **Result:** Faster UI, better performance

## When NOT to Use Memoization

1. **Simple calculations** - The overhead isn't worth it

   ```typescript
   const total = items.length; // Don't memoize
   ```

2. **Values that change every render** - No benefit

   ```typescript
   const timestamp = useMemo(() => Date.now(), []); // Wrong! Always same
   ```

3. **Primitive values** - Already cheap to compute
   ```typescript
   const isActive = status === "active"; // Don't memoize
   ```

## Summary

**Memoization is a tool for:**

- ✅ Expensive calculations (filtering, sorting, aggregations)
- ✅ Derived data that depends on other state
- ✅ Functions passed to child components
- ✅ Preventing unnecessary recalculations

**Remember:**

- Include all dependencies in the dependency array
- Only memoize expensive operations
- Use `useMemo` for values, `useCallback` for functions
- Don't over-optimize - measure first, then optimize

## Real-World Impact in Our App

After adding memoization to:

- Streak calculations
- Filtered entries
- Grouped moments
- Favorite items mapping

**Result:** The app feels more responsive, especially with large datasets. Calculations only run when the actual data changes, not on every render.

---

_This guide was created while optimizing the 3Good app. Use it as a reference for future React projects!_

