# UI Components Library

A comprehensive collection of reusable UI components built with React and Tailwind CSS for the DragBizz Store Frontend.

## Components Overview

### Core Form Components

#### Button
A versatile button component with multiple variants, sizes, and states.

```jsx
import { Button } from '@/components/ui';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="outline">Outline</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading={true}>Loading...</Button>

// With icons
<Button leftIcon={PlusIcon}>Add Item</Button>
<Button rightIcon={ArrowRightIcon}>Next</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost' | 'link'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `leftIcon`: React component
- `rightIcon`: React component
- `fullWidth`: boolean

#### Input
A flexible input component with validation states, icons, and password toggle.

```jsx
import { Input } from '@/components/ui';
import { Mail, Lock } from 'lucide-react';

// Basic usage
<Input
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
/>

// With label and validation
<Input
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={emailError}
  errorMessage="Please enter a valid email"
  required
/>

// With icons
<Input
  leftIcon={Mail}
  placeholder="Email"
  value={email}
  onChange={setEmail}
/>

// Password with toggle
<Input
  type="password"
  placeholder="Password"
  value={password}
  onChange={setPassword}
  showPasswordToggle
/>

// With success state
<Input
  value={email}
  onChange={setEmail}
  success={true}
  successMessage="Email is valid"
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | etc.
- `label`: string
- `placeholder`: string
- `value`: string
- `onChange`: function
- `error`: boolean
- `errorMessage`: string
- `success`: boolean
- `successMessage`: string
- `leftIcon`: React component
- `rightIcon`: React component
- `showPasswordToggle`: boolean
- `required`: boolean
- `disabled`: boolean

#### Checkbox
A checkbox component with label, description, and validation.

```jsx
import { Checkbox, CheckboxGroup } from '@/components/ui';

// Basic usage
<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="I agree to the terms"
/>

// With description
<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Subscribe to newsletter"
  description="Get updates about new products and offers"
/>

// With validation
<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Accept terms"
  error={true}
  errorMessage="You must accept the terms"
  required
/>

// Checkbox group
<CheckboxGroup label="Select your interests">
  <Checkbox
    checked={interests.includes('tech')}
    onChange={(checked) => handleInterestChange('tech', checked)}
    label="Technology"
  />
  <Checkbox
    checked={interests.includes('design')}
    onChange={(checked) => handleInterestChange('design', checked)}
    label="Design"
  />
</CheckboxGroup>
```

#### Select
A dropdown select component with search, multi-select, and keyboard navigation.

```jsx
import { Select } from '@/components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

// Basic usage
<Select
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Choose an option"
/>

// With search
<Select
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  searchable
  placeholder="Search and select"
/>

// Multi-select
<Select
  options={options}
  value={selectedValues}
  onChange={setSelectedValues}
  multiple
  placeholder="Select multiple options"
/>

// With validation
<Select
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  error={true}
  errorMessage="Please select an option"
  required
/>
```

#### Textarea
A textarea component with character count and validation.

```jsx
import { Textarea } from '@/components/ui';

// Basic usage
<Textarea
  placeholder="Enter your message"
  value={message}
  onChange={setMessage}
  rows={4}
/>

// With character count
<Textarea
  placeholder="Enter your message"
  value={message}
  onChange={setMessage}
  maxLength={500}
  showCharCount
/>

// With validation
<Textarea
  label="Description"
  placeholder="Enter description"
  value={description}
  onChange={setDescription}
  error={descriptionError}
  errorMessage="Description is required"
  required
/>
```

### Layout Components

#### Card
A flexible card component with header, body, and footer sections.

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter, CardActions } from '@/components/ui';

// Basic usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    <CardActions>
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </CardActions>
  </CardFooter>
</Card>

// With hover effect
<Card hover>
  <CardBody>
    Hover over this card
  </CardBody>
</Card>

// Different variants
<Card variant="elevated" padding="lg">
  <CardBody>Elevated card with large padding</CardBody>
</Card>
```

#### Modal
A modal component with overlay, header, body, and footer.

```jsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';

// Basic usage
<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <ModalHeader>
    <h2>Modal Title</h2>
  </ModalHeader>
  <ModalBody>
    Modal content goes here
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleSave}>
      Save
    </Button>
  </ModalFooter>
</Modal>

// Different sizes
<Modal isOpen={isOpen} onClose={onClose} size="lg">
  Large modal content
</Modal>
```

### Feedback Components

#### Alert
An alert component for displaying messages with different variants.

```jsx
import { Alert } from '@/components/ui';

// Different variants
<Alert variant="info" title="Information">
  This is an informational message.
</Alert>

<Alert variant="success" title="Success">
  Operation completed successfully!
</Alert>

<Alert variant="warning" title="Warning">
  Please review your input.
</Alert>

<Alert variant="error" title="Error">
  Something went wrong.
</Alert>

// Dismissible alert
<Alert
  variant="info"
  dismissible
  onDismiss={() => setShowAlert(false)}
>
  This alert can be dismissed.
</Alert>
```

#### Badge
A badge component for displaying status, counts, and labels.

```jsx
import { Badge, StatusBadge, NotificationBadge } from '@/components/ui';

// Basic badges
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="danger">Danger</Badge>

// Status badges
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="approved" />

// Notification badges
<NotificationBadge count={5} />
<NotificationBadge count={99} maxCount={50} />

// Dismissible badges
<Badge dismissible onDismiss={() => console.log('dismissed')}>
  Dismissible
</Badge>
```

#### Loading Components
Various loading components for different use cases.

```jsx
import { Loading, Spinner, Skeleton, SkeletonText, SkeletonCard, ProgressBar, CircularProgress } from '@/components/ui';

// Basic loading
<Loading text="Loading data..." />

// Spinner only
<Spinner size="lg" color="blue" />

// Skeleton loading
<Skeleton width="w-64" height="h-4" />
<SkeletonText lines={3} />
<SkeletonCard />

// Progress indicators
<ProgressBar progress={75} showPercentage />
<CircularProgress progress={60} size="lg" />
```

### Navigation Components

#### Tabs
A tab component for organizing content.

```jsx
import { Tabs } from '@/components/ui';

const tabs = [
  { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> }
];

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
/>
```

#### Accordion
An accordion component for collapsible content.

```jsx
import { Accordion } from '@/components/ui';

const accordionItems = [
  { id: 'item1', title: 'Item 1', content: <div>Content 1</div> },
  { id: 'item2', title: 'Item 2', content: <div>Content 2</div> }
];

<Accordion
  items={accordionItems}
  allowMultiple={false}
  defaultOpenItems={['item1']}
/>
```

#### Divider
A divider component for separating content.

```jsx
import { Divider } from '@/components/ui';

// Basic divider
<Divider />

// With text
<Divider>OR</Divider>

// Different orientations and styles
<Divider orientation="vertical" />
<Divider variant="dashed" />
<Divider color="blue" thickness="thick" />
```

### Background Components

#### AnimatedBackground
Beautiful animated background elements for forms and pages.

```jsx
import { AnimatedBackground } from '@/components/ui';

// Different variants for different contexts
<AnimatedBackground variant="default" />
<AnimatedBackground variant="login" />
<AnimatedBackground variant="register" />
<AnimatedBackground variant="success" />

// Usage in a form
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative">
  <AnimatedBackground variant="login" />
  <div className="relative z-10">
    {/* Your form content */}
  </div>
</div>
```

#### SVGBackground
SVG-based animated backgrounds with geometric shapes and waves.

```jsx
import { SVGBackground } from '@/components/ui';

// Different SVG variants
<SVGBackground variant="default" />
<SVGBackground variant="waves" />

// Usage
<div className="min-h-screen relative">
  <SVGBackground variant="waves" />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

## Usage Examples

### Complete Form Example
```jsx
import { Button, Input, Select, Checkbox, Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(value) => setFormData({...formData, name: value})}
            error={!!errors.name}
            errorMessage={errors.name}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({...formData, email: value})}
            error={!!errors.email}
            errorMessage={errors.email}
            required
          />
          
          <Select
            label="Subject"
            options={[
              { value: 'general', label: 'General Inquiry' },
              { value: 'support', label: 'Support' },
              { value: 'sales', label: 'Sales' }
            ]}
            value={formData.subject}
            onChange={(value) => setFormData({...formData, subject: value})}
            placeholder="Select a subject"
            required
          />
          
          <Textarea
            label="Message"
            value={formData.message}
            onChange={(value) => setFormData({...formData, message: value})}
            rows={4}
            maxLength={500}
            showCharCount
            required
          />
          
          <Checkbox
            checked={formData.newsletter}
            onChange={(checked) => setFormData({...formData, newsletter: checked})}
            label="Subscribe to newsletter"
            description="Get updates about new products and offers"
          />
        </form>
      </CardBody>
      <CardFooter>
        <Button type="submit" fullWidth>
          Send Message
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Styling

All components use Tailwind CSS classes and follow a consistent design system. The components are fully customizable through className props and built-in variant systems.

## Accessibility

All components are built with accessibility in mind, including:
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
