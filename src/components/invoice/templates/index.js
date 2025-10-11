// Export all invoice templates
export { default as ClassicTemplate } from './ClassicTemplate';
export { default as ModernTemplate } from './ModernTemplate';
export { default as MinimalTemplate } from './MinimalTemplate';
export { default as ProfessionalTemplate } from './ProfessionalTemplate';

// Template configuration
export const TEMPLATE_CONFIG = {
  classic: {
    name: 'Classic',
    description: 'Traditional invoice with formal styling',
    component: 'ClassicTemplate',
    preview: '/images/templates/classic-preview.png'
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary design with clean lines',
    component: 'ModernTemplate',
    preview: '/images/templates/modern-preview.png'
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and clean design',
    component: 'MinimalTemplate',
    preview: '/images/templates/minimal-preview.png'
  },
  professional: {
    name: 'Professional',
    description: 'Business-ready with signature areas',
    component: 'ProfessionalTemplate',
    preview: '/images/templates/professional-preview.png'
  }
};

// Template selector options
export const TEMPLATE_OPTIONS = [
  { value: 'classic', label: 'Classic', description: 'Traditional formal style' },
  { value: 'modern', label: 'Modern', description: 'Contemporary clean design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
  { value: 'professional', label: 'Professional', description: 'Business with signatures' }
];
