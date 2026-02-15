# Table View Implementation Roadmap

## Overview
Add a Monday.com-style table view for kanban boards that displays the same data in a spreadsheet-like format with inline editing, sorting, filtering, and column customization.

## Architecture

### Data Flow
- **Same Database Tables**: Uses existing `kanban_cards`, `kanban_columns`, and `kanban_card_assignments` tables
- **Same API Routes**: Reuses existing CRUD endpoints in `/app/api/kanban/`
- **Shared State**: Both views (Kanban and Table) work with the same data source
- **View Preference**: Store user's preferred view (kanban/table) per board

### Technical Stack
- **TanStack Table (React Table v8)**: Advanced table features with built-in sorting, filtering, pagination
- **Inline Editing**: Click-to-edit cells with form inputs
- **Drag and Drop**: Use dnd-kit for row reordering (same library as kanban)
- **Responsive Design**: Horizontal scroll on mobile, optimized for desktop

---

## Task Breakdown

### Task 1: Create Table View Component with TanStack Table

**Goal**: Build the foundation table component that displays kanban cards in a spreadsheet format.

**Files to Create**:
- `components/kanban/table-view.tsx` - Main table view component
- `components/kanban/table-columns.tsx` - Column definitions for TanStack Table
- `lib/table-utils.ts` - Helper functions for table operations

**Features**:
- Display all cards from a board in table rows
- Columns: Title, Status, Assignee, Due Date, Priority, Labels, Custom Fields
- Basic cell rendering (read-only for now)
- Loading states and empty states
- Responsive container with horizontal scroll

**Dependencies**:
\`\`\`bash
npm install @tanstack/react-table
\`\`\`

**Estimated Time**: 15 minutes

---

### Task 2: Add View Toggle Between Kanban and Table

**Goal**: Allow users to switch between Kanban and Table views seamlessly.

**Files to Modify**:
- `app/dashboard/unity/[boardId]/page.tsx` - Add view state and toggle
- `components/kanban/view-toggle.tsx` - Create toggle button component

**Features**:
- Toggle button in board header (Kanban icon / Table icon)
- Persist view preference in localStorage per board
- Smooth transition between views
- Both views use the same data fetching logic

**UI Design**:
- Segmented control with icons (like Monday.com)
- Position: Top right of board header
- Icons: LayoutGrid (kanban) and Table (table)

**Estimated Time**: 10 minutes

---

### Task 3: Implement Inline Cell Editing

**Goal**: Enable users to edit card properties directly in table cells.

**Files to Create**:
- `components/kanban/editable-cell.tsx` - Reusable editable cell component
- `components/kanban/cell-editors/` - Specific editors for different field types
  - `text-editor.tsx` - For title and text fields
  - `status-editor.tsx` - Dropdown for status column
  - `assignee-editor.tsx` - User picker for assignee
  - `date-editor.tsx` - Date picker for due dates
  - `priority-editor.tsx` - Dropdown for priority
  - `labels-editor.tsx` - Multi-select for labels

**Features**:
- Click any cell to enter edit mode
- Show appropriate input type based on column (text, dropdown, date picker, etc.)
- Save on blur or Enter key
- Cancel on Escape key
- Optimistic updates with error handling
- Visual feedback during save

**API Integration**:
- Use existing `/api/kanban/cards/[cardId]/route.ts` for updates
- Handle validation errors gracefully

**Estimated Time**: 20 minutes

---

### Task 4: Add Sorting and Filtering System

**Goal**: Enable users to sort and filter table data like a spreadsheet.

**Files to Create**:
- `components/kanban/table-filters.tsx` - Filter UI component
- `components/kanban/column-header.tsx` - Sortable column headers

**Features**:

**Sorting**:
- Click column header to sort ascending/descending
- Visual indicator for sort direction (arrow icons)
- Multi-column sorting (hold Shift)
- Sort by: Title (alphabetical), Status (custom order), Due Date (chronological), Priority (high to low)

**Filtering**:
- Filter bar above table
- Filter by Status (multi-select dropdown)
- Filter by Assignee (multi-select user picker)
- Filter by Labels (multi-select)
- Filter by Due Date (date range picker)
- "Clear all filters" button
- Show active filter count

**Implementation**:
- Use TanStack Table's built-in sorting and filtering
- Persist filter state in URL query params
- Client-side filtering for performance

**Estimated Time**: 15 minutes

---

### Task 5: Add Column Customization Features

**Goal**: Allow users to customize which columns are visible and their order.

**Files to Create**:
- `components/kanban/column-settings-dialog.tsx` - Column customization UI
- `lib/table-column-preferences.ts` - Save/load column preferences

**Features**:

**Show/Hide Columns**:
- Settings button in table header
- Checklist of all available columns
- Toggle visibility for each column
- Some columns always visible (Title, Status)

**Reorder Columns**:
- Drag and drop columns in settings dialog
- Visual feedback during drag
- Apply new order to table

**Resize Columns**:
- Drag column borders to resize
- Double-click border to auto-fit content
- Minimum and maximum widths

**Column Presets**:
- Save custom column configurations
- Quick presets: "Minimal", "Full Details", "Custom"

**Persistence**:
- Store preferences in localStorage per board
- Option to reset to default

**Estimated Time**: 15 minutes

---

## Additional Enhancements (Future)

### Bulk Actions
- Select multiple rows with checkboxes
- Bulk update status, assignee, labels
- Bulk delete cards
- "Select all" functionality

### Export
- Export table to CSV
- Export to Excel
- Include filters in export

### Advanced Features
- Grouping rows by column (like Monday.com)
- Subtasks as expandable rows
- Inline comments
- Cell history/audit log
- Keyboard shortcuts (arrow keys to navigate, Enter to edit)

---

## Testing Checklist

- [ ] Table displays all cards correctly
- [ ] View toggle switches between Kanban and Table
- [ ] Inline editing saves changes to database
- [ ] Sorting works for all column types
- [ ] Filters correctly filter data
- [ ] Column show/hide works
- [ ] Column reordering works
- [ ] Column resizing works
- [ ] Preferences persist across page reloads
- [ ] Responsive design works on mobile
- [ ] Loading states display correctly
- [ ] Error handling works for failed saves
- [ ] Multiple users can edit simultaneously (optimistic updates)

---

## Total Estimated Time
**75 minutes** (1 hour 15 minutes) for full implementation with all features.

---

## Notes

- The table view and kanban view share the same data source, so changes in one view are immediately reflected in the other
- Use optimistic updates for better UX (update UI immediately, rollback on error)
- Consider adding keyboard shortcuts for power users
- Mobile experience: table scrolls horizontally, consider a card-based mobile view
- Performance: For boards with 1000+ cards, implement virtual scrolling with `@tanstack/react-virtual`

---

## Dependencies

\`\`\`json
{
  "@tanstack/react-table": "^8.11.0",
  "@tanstack/react-virtual": "^3.0.0" // Optional, for large datasets
}
\`\`\`

---

## File Structure

\`\`\`
components/kanban/
├── table-view.tsx                 # Main table component
├── table-columns.tsx              # Column definitions
├── view-toggle.tsx                # Kanban/Table switcher
├── editable-cell.tsx              # Editable cell wrapper
├── table-filters.tsx              # Filter UI
├── column-header.tsx              # Sortable header
├── column-settings-dialog.tsx     # Column customization
└── cell-editors/
    ├── text-editor.tsx
    ├── status-editor.tsx
    ├── assignee-editor.tsx
    ├── date-editor.tsx
    ├── priority-editor.tsx
    └── labels-editor.tsx

lib/
├── table-utils.ts                 # Table helper functions
└── table-column-preferences.ts    # Column preference storage

app/dashboard/unity/[boardId]/
└── page.tsx                       # Modified to support both views
\`\`\`

---

## Implementation Order

1. **Task 1** - Foundation (table component)
2. **Task 2** - View switching (user can toggle between views)
3. **Task 3** - Inline editing (core functionality)
4. **Task 4** - Sorting/filtering (data manipulation)
5. **Task 5** - Column customization (polish and UX)

Each task builds on the previous one, so they should be completed in order.
