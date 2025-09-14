# Common Components

This folder contains reusable UI components that maintain consistent design across the application.

## Input Component

A flexible input component that supports left icons and right elements while maintaining the exact same design as the original implementation.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `'text' \| 'email' \| 'tel' \| 'password' \| 'number'` | No | Input type (default: 'text') |
| `placeholder` | `string` | No | Placeholder text |
| `value` | `string` | Yes | Input value |
| `onChange` | `(value: string) => void` | Yes | Change handler |
| `leftIcon` | `LucideIcon` | No | Left side icon component |
| `rightElement` | `React.ReactNode` | No | Right side element (icon, button, etc.) |
| `error` | `string` | No | Error message to display |
| `className` | `string` | No | Additional CSS classes |
| `autoFocus` | `boolean` | No | Auto focus on mount (default: false) |
| `disabled` | `boolean` | No | Disable input (default: false) |
| `name` | `string` | No | Input name attribute |
| `id` | `string` | No | Input id attribute |

### Usage Examples

#### Basic Input
```tsx
import { Input } from '../common';
import { User } from 'lucide-react';

<Input
  type="text"
  placeholder="Enter your name"
  value={name}
  onChange={setName}
  leftIcon={User}
/>
```

#### Input with Right Element
```tsx
import { Input } from '../common';
import { Mail, CheckCircle } from 'lucide-react';

<Input
  type="email"
  placeholder="your@email.com"
  value={email}
  onChange={setEmail}
  leftIcon={Mail}
  rightElement={<CheckCircle className="w-5 h-5 text-green-500" />}
/>
```

#### Input with Error State
```tsx
<Input
  type="text"
  placeholder="First Name"
  value={firstName}
  onChange={setFirstName}
  leftIcon={User}
  error="This field is required"
/>
```

### Design Features

- **Consistent Styling**: Maintains exact same design as original implementation
- **Left Icon Support**: Automatically adjusts padding when left icon is present
- **Right Element Support**: Automatically adjusts padding when right element is present
- **Error States**: Red border and background when error is present
- **Focus States**: Blue ring and border on focus
- **Responsive**: Works across all screen sizes
- **Accessible**: Proper ARIA attributes and keyboard navigation
