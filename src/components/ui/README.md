# DragBizz UI Components

Welcome to the **DragBizz Store Design System**. This library contains a comprehensive suite of reusable React components built with Tailwind CSS, designed for high performance, accessibility, and a premium aesthetic.

## 🏗️ Architecture

All components are located in `src/components/ui` and are exported via a central `index.js` for easy access.

```javascript
import { Button, Input, Card, MultiSelect } from '@/components/ui';
```

---

## 📝 Form & Input Components

### Standard Inputs
- **Button**: Variants include `primary`, `secondary`, `danger`, and `outline`.
- **Input**: Support for icons, validation states, and password toggles.
- **Checkbox / CheckboxGroup**: Accessible tick boxes with description support.
- **Select / MultiSelect**: Advanced dropdowns with search, multi-selection, and virtualization.
- **Textarea**: Auto-resizing support with character counters.
- **Toggle / ViewToggle**: Switch-style inputs for boolean states.

### Advanced Editors
- **RichTextEditor**: Full-featured WYSIWYG editor for product descriptions and emails.
- **TagInput**: Multi-tag management for categories and SEO keywords.
- **FileUpload**: Drag-and-drop zone with progress tracking and preview.

```javascript
// Example: MultiSelect
<MultiSelect
  label="Categories"
  options={categories}
  value={selected}
  onChange={setSelected}
  placeholder="Select categories..."
/>

// Example: RichTextEditor
<RichTextEditor
  label="Description"
  value={content}
  onChange={setContent}
  placeholder="Start typing..."
/>
```

---

## 📊 Data Display & Layout

### Containers
- **Card**: Modular container with `Header`, `Body`, `Footer`, `Image`, and `Actions` sub-components.
- **Table**: Semantic table structure with `Header`, `Body`, `Row`, and `Cell`.
- **EmptyState**: Standardized "No Data" screens with action buttons.

### Instrumentation
- **Badge / StatusBadge**: Colorful labels for status tracking (`pending`, `active`, `shipped`, etc.).
- **Pagination**: Controlled component for navigating large datasets.
- **StepProgress**: Visual tracker for multi-step wizards (e.g., checkout, onboarding).

```javascript
// Example: Status Badge
<StatusBadge status="completed" />

// Example: Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Product</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {products.map(p => (
      <TableRow key={p.id}>
        <TableCell>{p.name}</TableCell>
        <TableCell>{p.price}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🔔 Feedback & Overlays

### Modals & Drawers
- **Modal**: Centralized dialogs with backdrop blur and focus trapping.
- **SideDrawer**: Slide-out panels for filters, settings, or details.
- **LogoutModal / UpgradeModal**: Domain-specific pre-configured dialogs.

### Toasts & Alerts
- **Toast / ToastContainer**: Non-obstructive notifications (Success, Error, Info).
- **Alert**: Inline messaging for warnings or critical errors.
- **NetworkError**: Specialized component for handling offline/server-down states.

### Loading States
- **Spinner**: SVG-based loading indicator.
- **Skeleton / SkeletonCard**: Shimmer-effect placeholders for perceived performance.
- **ProgressBar / CircularProgress**: Visualizing task completion percentages.

---

## 🗺️ Navigation & Menus

- **Tabs / TabPanel**: Horizontal navigation for switching content contexts.
- **Accordion / AccordionItem**: Vertical collapsible sections for FAQs or nested settings.
- **ActionMenu / SendMenu / AddActionButton**: Specialized menus for common CRUD and communication actions.
- **IconButton**: Compact buttons for actions inside tables or headers.

---

## ✨ Aesthetics & System

- **AnimatedBackground**: Vibrant, moving backgrounds tailored for login and marketing pages.
- **AnimatedGridPattern**: Subtle background patterns for a premium "tech" feel.
- **Divider**: Horizontal or vertical separators with optional text.
- **ThemeSelector / SettingsPanel**: Global controls for skinning and system preferences.

---

## 🛠️ Usage Guidelines

### Consistency
Always prefer these components over raw HTML or ad-hoc Tailwind classes to ensure a uniform UX across the application.

### Customization
Most components accept standard Tailwind class names via the `className` prop for layout adjustments.

```javascript
<Button className="mt-4 shadow-xl">Custom Button</Button>
```

### Accessibility
All components follow WAI-ARIA guidelines. Do not remove `aria-*` attributes or focus styles unless providing an alternative accessible implementation.

---

**DragBizz Store FE** - *Building the future of e-commerce, one component at a time.* 🚀
