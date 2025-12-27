# Complete Frontend Prompt for Maintenance Management System

## Role & Context
You are an expert UI/UX engineer building a **Maintenance Management System** - a comprehensive equipment tracking and maintenance request platform. The system should feel professional, efficient, and data-dense while remaining clean and intuitive.

---

## Design System & Aesthetic

### Visual Style
- **Theme**: Modern Enterprise SaaS (think Linear, Notion, or Asana)
- **Aesthetic**: Clean, data-focused, professional with subtle depth
- **Color Philosophy**: Information hierarchy through color, not decoration

### Color Palette
```
Primary Blue: #2563eb (actions, links, active states)
Success Green: #10b981 (completed, healthy status)
Warning Orange: #f59e0b (reopened, medium priority)
Danger Red: #ef4444 (critical, high priority, overdue)
Info Blue: #06b6d4 (in progress, technician load)
Neutral Gray: #64748b (text, borders, inactive)
Background: #ffffff (light) / #0f172a (dark)
Surface: #f8fafc (light) / #1e293b (dark)
```

### Typography
```
Font Family: Inter or 'SF Pro Display' or 'Geist Sans'
Headings: 600-700 weight, tight tracking
Body: 400-500 weight, comfortable line-height (1.6)
Data/Numbers: Tabular numbers, monospace for codes
```

### Spacing System
```
Tight: 4px, 8px (inline elements)
Default: 12px, 16px (component padding)
Comfortable: 24px, 32px (section spacing)
Loose: 48px, 64px (page sections)
```

---

## Technical Stack

### Framework & Libraries
```javascript
Framework: React 18 with Vite or Next.js 14
Styling: Tailwind CSS v3+
Icons: Lucide React (consistent, modern icon set)
Animation: Framer Motion (for smooth transitions)
Tables: TanStack Table (advanced sorting, filtering)
Forms: React Hook Form + Zod validation
Date/Time: date-fns or dayjs
Calendar: React Big Calendar or FullCalendar
State: Zustand or React Context (lightweight)
Routing: React Router v6
```

### Key Tailwind Patterns
```css
/* Card/Surface */
bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm

/* Input Fields */
border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500

/* Buttons Primary */
bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors

/* Status Badges */
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
```

---

## Layout Structure

### 1. App Shell (Main Container)
```
┌─────────────────────────────────────┐
│  Navigation Tabs (Sticky Top)      │
├─────────────────────────────────────┤
│  Page Header (Title + Actions)     │
├─────────────────────────────────────┤
│                                     │
│  Main Content Area                  │
│  (Dashboard/Forms/Tables)           │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Navigation Tabs (Sticky, Full Width)
- **Position**: Fixed top, below any global header
- **Style**: Horizontal tabs with subtle underline indicator
- **Tabs**: Maintenance | Dashboard | Calendar | Equipment | Reporting | Teams
- **Right Side**: Search bar + Theme toggle + User avatar dropdown

---

## Page-by-Page Specifications

### 🔐 **Page 1: Login / Sign Up**

**Layout**: Centered card (max-width 400px) on gradient background

**Login Form**:
```
┌──────────────────────────┐
│  Logo + "Welcome Back"    │
│                          │
│  Email [__________]      │
│  Password [________]     │
│                          │
│  [Sign In Button]        │
│                          │
│  Forgot Password? SignUp │
└──────────────────────────┘
```

**Specifications**:
- Logo: Monochrome icon + "Maintenance Pro" text
- Inputs: Floating labels that shrink on focus
- Button: Full-width, prominent, with loading spinner
- Links: Small, subtle text links below button
- Animation: Fade in on load, shake on error
- Validation: Real-time inline error messages (red text under field)

**Sign Up Form**:
- Same layout, add Name field + Confirm Password
- Password strength indicator (visual bar below password field)
- Terms checkbox before submit

---

### 📊 **Page 2: Dashboard**

**Layout**: Full-width with sections

**Top Section - KPI Cards** (3-column grid):
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Critical Eq. │ │ Tech Load    │ │ Open Requests│
│              │ │              │ │              │
│  🔴 5 Units  │ │  🔵 85%      │ │  🟢 12 Pend  │
│ (Health<30%) │ │ (Careful)    │ │  3 Overdue   │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Card Specifications**:
- Height: 120px, rounded corners
- Background: Gradient matching status color (subtle, 10% opacity)
- Icon: Large (48px) in corner or top
- Main number: Bold, 32px
- Subtitle: 14px, muted
- Hover: Lift effect (transform: translateY(-2px)) + shadow increase

**Bottom Section - Data Table**:
- Title: "Recent Maintenance Requests" with "View All" link
- Columns: Subject | Technician | Equipment | Status | Date
- Row height: 56px (comfortable)
- Status: Colored badges with dot indicator
- Hover: Light gray background
- Click: Navigate to detail page
- Pagination: Bottom right, "Showing 1-10 of 45"

**Interactions**:
- Search bar filters table in real-time
- Status filter dropdown (All, New, In Progress, Completed)
- Date range picker for filtering

---

### 📝 **Page 3: Maintenance Request Form**

**Layout**: Centered wide form (max-width 900px)

**Header Section**:
```
┌─────────────────────────────────────┐
│ Request Type: ○ Equipment ○ Work Ctr│
├─────────────────────────────────────┤
│ Workflow: New → In Progress → Done  │
└─────────────────────────────────────┘
```

**Form Sections** (Stacked vertically):

**Section 1: Request Details** (2-column grid on desktop):
```
Left Column:               Right Column:
- Subject*                 - Team
- Created By (readonly)    - Technician
- Maintenance For*         - Scheduled Date
- Equipment (auto-fill)    - Duration
- Request Date*            - Priority (⟡⟡⟡)
- Type: ○ Corrective       - Company
        ○ Preventive
```

**Section 2: Notes** (Full width):
- Tabbed textarea: [Notes] [Instructions]
- Height: 200px
- Markdown preview option

**Section 3: Comments** (Collapsible):
- Timeline view of all comments
- Avatar + Name + Timestamp
- "Add Comment" button opens drawer from right

**Form Specifications**:
- Labels: Above fields, 500 weight
- Required fields: Red asterisk
- Dropdowns: Searchable with keyboard navigation
- Date/Time: Calendar popup picker
- Priority: Three diamond icons (clickable, highlight on select)
- Save buttons: Bottom right - "Save Draft" (outline) + "Submit" (solid)
- Validation: Show errors on blur, all errors on submit attempt

**Priority Selector Visual**:
```
Low        Medium      High
⟡ gray     ⟡⟡ yellow   ⟡⟡⟡ red
```

**Workflow Indicator** (Top of form):
- Horizontal stepper with connecting lines
- Active step: Bold + colored
- Completed: Checkmark icon
- Future: Gray, dotted line

---

### 📅 **Page 4: Maintenance Calendar**

**Layout**: Full-width calendar view

**Top Controls**:
- View toggle: [Day] [Week] [Month] (active is solid)
- Date navigator: ← Today →
- Filter: Status dropdown + Technician dropdown
- Mini calendar: Small month view in top-right corner

**Calendar Grid**:
- Week view: 7 columns (days) × time rows (30min intervals)
- Events: Colored blocks with title + time
- Event colors match request status
- Drag-to-reschedule functionality
- Click event → open modal with details

**Event Card** (in calendar):
```
┌────────────────┐
│ 2:00 PM - 3:30 │ ← Time (small, top)
│ Fix AC Unit    │ ← Title (medium)
│ John Smith     │ ← Technician (small)
└────────────────┘
```

**Specifications**:
- Past events: 50% opacity
- Today: Highlighted column
- Current time: Red line across calendar
- Hover: Tooltip with full details
- Empty slots: Click to create new request

---

### 🔧 **Page 5: Equipment Module**

**Two Sub-Pages**: List View + Form View

#### **Equipment List** (Table):
```
[New Button]                    [Search...] [Filter ▾]

┌─────────────────────────────────────────────────────┐
│ Name          │ Serial     │ Category  │ Technician│
├─────────────────────────────────────────────────────┤
│ Sanitary #18  │ KT/054/... │ Monitors  │ Mitchell  │
│ Acer Laptop   │ KT/054/... │ Computers │ Marc J.   │
└─────────────────────────────────────────────────────┘
```

**Specifications**:
- Sortable columns (arrow indicators)
- Filterable by category, company, status
- Row actions: Edit icon (pencil) + Delete icon (trash) on hover
- Bulk actions: Checkbox in first column for multi-select
- Export button: Download as CSV/Excel

#### **Equipment Form**:
- Auto-number button: "Sanitary Number 18" (clickable, opens number picker modal)
- Three collapsible sections (accordions):
  - **Basic Information**: 2-column grid
  - **Technical Details**: 2-column grid
  - **Description**: Full-width textarea

**Visual Pattern**:
```
┌─ Basic Information ────────────────┐
│ Name:          [____________]      │
│ Category:      [Dropdown ▾]        │
│ Company:       [Dropdown ▾]        │
└────────────────────────────────────┘
```

---

### 👥 **Page 6: Teams**

**Layout**: Grid of team cards (3 columns on desktop)

**Team Card**:
```
┌─────────────────────────┐
│  Internal Maintenance   │ ← Team Name (bold)
├─────────────────────────┤
│  👤 Anna Muller         │
│  👤 Marc Jason          │ ← Members (avatars + names)
│  👤 +3 more             │
├─────────────────────────┤
│  [Edit] [View Details]  │ ← Actions
└─────────────────────────┘
```

**Specifications**:
- Card hover: Border highlight + slight shadow
- Avatar row: Overlapping circles (z-index stacking)
- "+X more": Shows tooltip on hover with full list
- "Add Team" FAB button (floating bottom-right)

---

## Component Library (Reusable)

### 1. **StatusBadge Component**
```jsx
<StatusBadge status="In Progress" />

Renders:
[🔵 In Progress] ← rounded pill, colored bg, white text
```

**Variants**:
- New Request: Gray
- In Progress: Blue
- Reopened: Yellow/Orange
- Completed: Green
- Scrap: Red

### 2. **DataTable Component**
**Props**: columns, data, onRowClick, sortable, filterable
**Features**:
- Header with sort arrows
- Row hover effect
- Empty state (icon + message)
- Loading skeleton
- Pagination controls

### 3. **FormField Component**
**Props**: type, label, required, error, ...inputProps
**Types**: text, email, password, select, date, datetime, time, textarea, radio, checkbox
**Features**:
- Floating labels (Material Design style)
- Error message below field (red, small text)
- Helper text (gray, small text)
- Icon prefix/suffix support

### 4. **Button Component**
**Variants**:
- Primary: Solid blue, white text
- Secondary: Outline blue, blue text
- Danger: Solid red, white text
- Ghost: Transparent, gray text (hover: light bg)

**Sizes**: sm (32px), md (40px), lg (48px)

**States**: Default, Hover, Active, Disabled, Loading (spinner)

### 5. **Modal Component**
**Structure**:
```
[Dark Overlay 60% opacity]
  ┌─────────────────┐
  │  [×] Header     │
  ├─────────────────┤
  │  Content Area   │
  ├─────────────────┤
  │  [Cancel] [OK]  │
  └─────────────────┘
```

**Animation**: Scale in from center, fade in overlay

### 6. **Toast Notification**
**Position**: Top-right corner, stacked
**Types**: success (green), error (red), warning (yellow), info (blue)
**Duration**: Auto-dismiss after 3-5 seconds
**Action**: Close button (×)

---

## Animations & Interactions

### Page Transitions
```javascript
// Fade in on mount
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

### List Items
```javascript
// Stagger children
variants={{
  container: { staggerChildren: 0.05 },
  item: { opacity: [0, 1], y: [10, 0] }
}}
```

### Hover Effects
- **Buttons**: Background darken + scale(1.02)
- **Cards**: Shadow increase + translateY(-2px)
- **Table Rows**: Background lighten 5%
- **Icons**: Color shift + rotate slightly

### Loading States
- **Skeleton screens**: Pulsing gray rectangles matching content shape
- **Spinners**: Circular, rotating, blue color
- **Progress bars**: Linear, determinate when possible

---

## Responsive Breakpoints

```css
Mobile:     < 640px  (1 column, stack everything)
Tablet:     640-1024px (2 columns, compact navigation)
Desktop:    > 1024px (Full layout, 3 columns)
Wide:       > 1536px (Max-width container centered)
```

**Mobile Adaptations**:
- Navigation tabs → Hamburger menu
- Data tables → Horizontal scroll + compact view
- Forms → Single column, full-width inputs
- KPI cards → Stack vertically
- Modal → Full-screen on mobile

---

## Dark Mode Implementation

### Strategy
```javascript
// Use CSS variables
:root {
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
}
```

### Toggle Component
```
☀️ ← Sun icon for light mode
🌙 ← Moon icon for dark mode
Smooth transition (0.2s) between states
```

**Persist**: Save preference to localStorage

---

## Form Validation Rules

### Email
- Format: valid email pattern
- Unique: Check against existing users
- Error: "Please enter a valid email address"

### Password
- Min length: 8 characters
- Must contain: uppercase, lowercase, special char
- Visual: Strength indicator bar (weak/medium/strong)
- Error: "Password must be at least 8 characters with mixed case and special character"

### Required Fields
- Show asterisk (*) in label
- Error: "[Field name] is required"
- Trigger: onBlur (don't annoy user while typing)

### Date Fields
- Request Date: Cannot be in past
- Scheduled Date: Must be after request date
- Error: "Scheduled date must be after request date"

---

## Accessibility (A11y)

### Requirements
- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Indicators**: Visible blue outline on focus
- **ARIA Labels**: All icons and buttons have labels
- **Color Contrast**: Minimum 4.5:1 ratio (WCAG AA)
- **Screen Readers**: Semantic HTML, proper heading hierarchy
- **Error Announcements**: Use aria-live regions

### Focus Management
- Trap focus inside modals
- Return focus to trigger element on close
- Skip links for keyboard users

---

## Performance Optimizations

### Code Splitting
```javascript
// Lazy load heavy components
const Calendar = lazy(() => import('./Calendar'));
const ReportingDashboard = lazy(() => import('./Reporting'));
```

### Virtualization
- Large tables: Use react-window for row virtualization
- Long lists: Render only visible items

### Caching
- API responses: Cache with SWR or React Query
- Images: Lazy load, use next/image optimization

### Bundle Size
- Tree-shake unused Tailwind classes
- Import only needed icons from lucide-react
- Analyze bundle with webpack-bundle-analyzer

---


## Final Checklist Before Launch

### Functionality
- ✅ All CRUD operations work (Create, Read, Update, Delete)
- ✅ Form validations prevent invalid submissions
- ✅ Search and filters function correctly
- ✅ Calendar shows correct scheduled requests
- ✅ Status changes reflect in database
- ✅ Data persists across page refreshes

### UI/UX
- ✅ Responsive on mobile, tablet, desktop
- ✅ Dark mode toggle works smoothly
- ✅ All animations smooth (60fps)
- ✅ Loading states for all async actions
- ✅ Empty states with helpful messages
- ✅ Error states with actionable guidance

### Accessibility
- ✅ Keyboard navigation works
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA
- ✅ Screen reader tested
- ✅ All images have alt text

### Performance
- ✅ Initial load < 3 seconds
- ✅ Table renders 1000+ rows smoothly
- ✅ No memory leaks
- ✅ Optimized images
- ✅ Code split for large components

### Browser Support
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

---

**This comprehensive spec gives you everything needed to build a production-ready Maintenance Management System with Vibe or any AI coding tool. Start with Phase 1 (Login + Dashboard), iterate, and build up systematically!**