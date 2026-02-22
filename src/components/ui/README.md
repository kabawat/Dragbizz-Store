# UI Components - Our Custom Design System

Hey! This folder contains all the reusable UI components we've built for our DragBizz Store. Think of it as our own personal toolkit for creating beautiful user interfaces.

## What's This All About?

We've created a bunch of custom components so we don't have to write the same code over and over again. Each component is designed to be:
- Easy to use
- Consistent in design
- Customizable
- Accessible

## How to Use These Components

### First, Import What You Need
```javascript
import { Button, Input, Card } from '@/components/ui';
```

## Form Components

### Button - Click Me!
Our button component with different styles and sizes.

```javascript
// Basic button
<Button onClick={handleClick}>Click me</Button>

// Different styles
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="danger">Delete Button</Button>
<Button variant="outline">Outline Button</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading={true}>Loading...</Button>

// With icons
<Button leftIcon={PlusIcon}>Add Item</Button>
<Button rightIcon={ArrowRightIcon}>Next</Button>
```

### Input - Text Fields
Input fields with validation and icons.

```javascript
// Basic input
<Input
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
/>

// With label and error
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

// Password with show/hide toggle
<Input
  type="password"
  placeholder="Password"
  value={password}
  onChange={setPassword}
  showPasswordToggle
/>
```

### Checkbox - Tick Boxes
Checkboxes for forms and selections.

```javascript
// Basic checkbox
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
  description="Get updates about new products"
/>

// With error
<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Accept terms"
  error={true}
  errorMessage="You must accept the terms"
  required
/>
```

### Select - Dropdown Menus
Dropdown select boxes with search and multi-select options.

```javascript
const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
];

// Basic select
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
```

### Textarea - Big Text Boxes
Text areas for longer text input.

```javascript
// Basic textarea
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
```

## Layout Components

### Card - Content Containers
Cards for organizing content with headers, body, and footers.

```javascript
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>

// With hover effect
<Card hover>
  <CardBody>
    Hover over this card
  </CardBody>
</Card>
```

### Modal - Pop-up Windows
Modal dialogs for forms and important messages.

```javascript
// Basic modal
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
```

## Feedback Components

### Alert - Messages
Alert boxes for showing messages to users.

```javascript
// Different alert types
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

### Badge - Status Labels
Badges for showing status, counts, and labels.

```javascript
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
```

### Loading - Wait Indicators
Loading components for when data is being fetched.

```javascript
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

## Navigation Components

### Tabs - Tabbed Content
Tabs for organizing content into sections.

```javascript
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

### Accordion - Collapsible Content
Accordion for collapsible content sections.

```javascript
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

### Divider - Content Separators
Dividers for separating content sections.

```javascript
// Basic divider
<Divider />

// With text
<Divider>OR</Divider>

// Different styles
<Divider orientation="vertical" />
<Divider variant="dashed" />
<Divider color="blue" thickness="thick" />
```

## Background Components

### AnimatedBackground - Pretty Backgrounds
Beautiful animated backgrounds for forms and pages.

```javascript
// Different variants
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

## Complete Form Example

Here's how to build a complete form using our components:

```javascript
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

All components use Tailwind CSS and follow our design system. You can customize them using:
- Built-in variants (primary, secondary, etc.)
- Custom className props
- Size options (sm, md, lg)

## Accessibility

We've made sure all components are accessible:
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Good color contrast

## Browser Support

Our components work in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Need Help?

- **Form components** → Button, Input, Checkbox, Select, Textarea
- **Layout components** → Card, Modal
- **Feedback components** → Alert, Badge, Loading
- **Navigation components** → Tabs, Accordion, Divider
- **Background components** → AnimatedBackground

That's it! Our UI components make building beautiful interfaces super easy. Just pick the components you need and start building! 🎨
