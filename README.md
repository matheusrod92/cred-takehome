# CRED Takehome

You can test the application using this URL: [https://cred-takehome.vercel.app/](https://cred-takehome.vercel.app/) or following the instructions below 👇

## Setup Instructions

```bash
# install PNPM if you don't have it
npm install -g pnpm@latest-10

# server run
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                        # Next.js app router
  page.tsx                  # Main page component
/components                 # UI components
  board.tsx                 # Main board with DnD context
  column.tsx                # Column with droppable area
  task.tsx                  # Individual task card
  add-task-dialog.tsx       # Task creation dialog
  task-details-dialog.tsx   # Task viewing/editing dialog
  /ui                       # Shadcn UI components
/lib
  /store                    # Zustand store
    index.ts                # Store setup with persist
    column-slice.ts         # Column state management
    task-slice.ts           # Task state management
    selectors.ts            # Memoized selectors
  types.ts                  # TypeScript types
```

## Time Spent

Approximately 3 to 4 hours total:
- Search libs, understand problem and define initial path: .5 hour
- Initial setup and core CRUD: .5 hour
- Drag-and-drop implementation: 1.5 hours
- Refactoring to denormalized structure: .5 hour
- Polish (mobile support, search, visual indicators): .5 hour

## Tradeoffs and Shortcuts

**Denormalized state**: Chose flat task storage over nested structure for better performance and simpler updates. The cost is additional filtering when rendering, but this is negligible with memoization.

**No UUID type safety**: Started with a branded UUID type but removed it to eliminate casting noise. Using plain strings sacrifices some type safety for cleaner code.

**Simple ordering system**: Tasks use numeric `order` properties rather than a linked list or fractional indexing. This requires order adjustments when inserting tasks at specific positions, but the implementation is straightforward and the performance impact is minimal for typical board sizes.

**No optimistic updates**: State updates are synchronous since we're using localStorage. A production app would implement optimistic updates with a backend API.

**Touch delay on mobile**: Set to 250ms to allow scrolling without triggering drag. This is a standard tradeoff between scroll responsiveness and drag activation on touch devices.

## Architecture Overview

### State Management

The application uses Zustand with a flat, denormalized state structure. Rather than nesting tasks inside columns, tasks are stored at the root level with a `columnId` reference pointing to their parent column.

**State Structure:**
```typescript
{
  columns: Record<string, Column>
  tasks: Record<string, Task>      // Flat structure
  maxTaskOrder: Record<string, number>
  maxColumnOrder: number
}
```

**Why Denormalized?**

Nested structures (tasks inside columns) create tight coupling and make state updates complex. The denormalized approach offers several advantages:

1. Tasks can be updated independently without modifying column state
2. Drag-and-drop operations only update the task's `columnId` and `order` properties
3. Filtering and searching become simpler (single iteration over tasks)
4. Better performance for frequent updates (no deep cloning of nested structures)

The tradeoff is that rendering requires filtering tasks by `columnId`, but this is handled efficiently through memoized selectors in `lib/store/selectors.ts`.

### Store Architecture

The Zustand store is split into two slices using the slice pattern:

**ColumnSlice**: Manages columns and their metadata
- CRUD operations for columns
- Tracks `maxColumnOrder` for append operations

**TaskSlice**: Manages all task operations
- CRUD operations for tasks
- Drag-and-drop logic (`moveTask`, `reorderTask`)
- Task history tracking (last 5 actions per task)
- Tracks `maxTaskOrder` per column to avoid expensive array filtering

Both slices are combined in `lib/store/index.ts` with Zustand's persist middleware for localStorage persistence.

### Performance Optimizations

**maxTaskOrder tracking**: Instead of filtering all tasks to find the maximum order when appending, we maintain a `maxTaskOrder` map that tracks the highest order value per column. This eliminates O(n) operations on every task addition.

**Memoized selectors**: The `useColumnTasks` selector filters and sorts tasks efficiently, and React's state subscription ensures components only re-render when their specific data changes.

## Technology Decisions

**Next.js 15**: Leverages the App Router for modern React patterns, server components where appropriate, and Turbopack for fast development builds.

**TailwindCSS v4**: Utility-first CSS for rapid UI development with excellent performance and minimal bundle size.

**@dnd-kit**: Modern, accessible drag-and-drop library chosen for its excellent TypeScript support, modular architecture, and built-in support for sortable lists.

**Zustand**: Lightweight state management (3kb) with minimal boilerplate. The slice pattern provides good code organization.

**Shadcn UI**: Component library built on Radix UI primitives. Provides accessible, customizable components without the overhead of a full component library. Components are copied into the project for full control.

## Features Implemented

### Core Functionality
- [x] Add a new task (title + optional description)
- [x] Drag and drop tasks within and across columns
- [x] Edit a task's title inline
- [x] Delete a task
- [x] Delete columns (with cascade delete of tasks)
- [x] Add new columns dynamically
- [x] Persist all changes using localStorage via Zustand persist middleware

### Stretch Goals
- [x] Filter tasks by keyword (searches both title and description)
- [x] Task history log (last 5 actions per task with timestamps)
- [x] Auto-focus on new task input
- [x] Mobile responsive layout with touch support

### Additional Features
- [x] Inline title editing with keyboard shortcuts (Enter to save, Escape to cancel)
- [x] Task details dialog for viewing/editing full task information
- [x] Visual drop indicators for cross-column drag operations
- [x] Action history with column context (tracks which column tasks were moved from/to)
- [x] Toast notifications for user feedback
- [x] Mobile touch sensor with delay activation to distinguish scrolling from dragging
