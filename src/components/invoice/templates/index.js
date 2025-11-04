// Export all invoice templates
export { default as ClassicTemplate } from './ClassicTemplate';
export { default as ModernTemplate } from './ModernTemplate';
export { default as MinimalTemplate } from './MinimalTemplate';
export { default as ProfessionalTemplate } from './ProfessionalTemplate';
export { default as CleanDataSheetTemplate } from './CleanDataSheetTemplate';
export { default as AeroTemplate } from './AeroTemplate';
export { default as AetherTemplate } from './AetherTemplate';
export { default as ApexTemplate } from './ApexTemplate';
export { default as AuraTemplate } from './AuraTemplate';
export { default as AuroraTemplate } from './AuroraTemplate';
export { default as AurumTemplate } from './AurumTemplate';
export { default as CelesteTemplate } from './CelesteTemplate';
export { default as CosmicReceiptTemplate } from './CosmicReceiptTemplate';
export { default as CrystalTemplate } from './CrystalTemplate';
export { default as EclipseTemplate } from './EclipseTemplate';
export { default as ElegantTemplate } from './ElegantTemplate';
export { default as ElitePaperTemplate } from './ElitePaperTemplate';
export { default as FlexViewTemplate } from './FlexviewTemplate';
export { default as FusionTemplate } from './FusionTemplate';
export { default as GeometricEdgeTemplate } from './GeometricEdgeTemplate';
export { default as LuminousLedgerTemplate } from './LuminousLedgerTemplate';
export { default as LumosTemplate } from './LumosTemplate';
export { default as MatrixLedgerTemplate } from './MatrixLedgerTemplate';
export { default as MinimalistMonochromeTemplate } from './MinimalistMonochromeTemplate';
export { default as ModernStackedTemplate } from './ModernStackedTemplate';
export { default as NeoEdgeTemplate } from './NeoEdgeTemplate';
export { default as NeoGeometricTemplate } from './NeoGeometricTemplate';
export { default as OrionTemplate } from './OrionTemplate';
export { default as PillarProTemplate } from './PillarProTemplate';
export { default as PrismTemplate } from './PrismTemplate';
export { default as ProfessionalBlueTemplate } from './ProfessionalBlueTemplate';
export { default as RoyalEdgeTemplate } from './RoyalEdgeTemplate';
export { default as RusticEleganceTemplate } from './RusticEleganceTemplate';
export { default as SleekStreamTemplate } from './SleekStreamTemplate';
export { default as SpectrumTemplate } from './SpectrumTemplate';
export { default as StructedTemplate } from './StructedTemplate';
export { default as TerraTemplate } from './TerraTemplate';
export { default as VelocityLedgerTemplate } from './VelocityLedgerTemplate';
export { default as VintageTemplate } from './VintageTemplate';
export { default as ZenTithTemplate } from './ZentithTemplate'; 

// Template configuration
export const TEMPLATE_CONFIG = {
  cleandatasheet :{
    name: 'Clean Data Sheet',
    description: 'Data sheet style invoice with minimal design',
    component: 'CleanDataSheetTemplate',
    preview: '/images/templates/clean-datasheet-preview.png'
  },
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
  },
  aero : {
    name: 'Aero',
    description: 'Lightweight and airy design',
    component: 'AeroTemplate',
    preview: '/images/templates/aero-preview.png'
  },
  aether :{
    name: 'Aether',
    description: 'Elegant and sophisticated design',
    component: 'AetherTemplate',
    preview: '/images/templates/aether-preview.png'
  },
  apex : {
    name: 'Apex',
    description: 'Bold and modern design',
    component: 'ApexTemplate',
    preview: '/images/templates/apex-preview.png'
  },
  aura : {
    name: 'Aura',
    description: 'Bright and vibrant design',
    component: 'AuraTemplate',
    preview: '/images/templates/aura-preview.png'
  },
  aurora : {
    name: 'Aurora',
    description: 'Colorful and dynamic design',
    component: 'AuroraTemplate',
    preview: '/images/templates/aurora-preview.png'
  },
  aurum : {
    name: 'Aurum',
    description: 'Luxurious and premium design',
    component: 'AurumTemplate',
    preview: '/images/templates/aurum-preview.png'
  },
  celeste : {
    name: 'Celeste',
    description: 'Soft and calming design',
    component: 'CelesteTemplate',
    preview: '/images/templates/celeste-preview.png'
  },
  cosmicreceipt : {
    name: 'Cosmic Receipt',
    description: 'Futuristic and space-themed design',
    component: 'CosmicReceiptTemplate',
    preview: '/images/templates/cosmic-receipt-preview.png'
  },
  crystal : {
    name: 'Crystal',
    description: 'Clear and transparent design',
    component: 'CrystalTemplate',
    preview: '/images/templates/crystal-preview.png'
  },
  eclipse : {
    name: 'Eclipse',
    description: 'Dark mode inspired design',
    component: 'EclipseTemplate',
    preview: '/images/templates/eclipse-preview.png'
  },
  elegant : {
    name: 'Elegant',
    description: 'Refined and stylish design',
    component: 'ElegantTemplate',
    preview: '/images/templates/elegant-preview.png'
  },
  elitepaper : {
    name: 'Elite Paper',
    description: 'High-end paper style design',
    component: 'ElitePaperTemplate',
    preview: '/images/templates/elite-paper-preview.png'
  },
  flexview : {
    name: 'Flex View',
    description: 'Flexible and adaptable design',
    component: 'FlexviewTemplate',
    preview: '/images/templates/flex-view-preview.png'
  },
  fusion :{
    name: 'Fusion',
    description: 'Blend of classic and modern design',
    component: 'FusionTemplate',
    preview: '/images/templates/fusion-preview.png'
  },
  geometricedge : {
    name: 'Geometric Edge',
    description: 'Sharp and angular design',
    component: 'GeometricEdgeTemplate',
    preview: '/images/templates/geometric-edge-preview.png'
  },
  luminousledger : {
    name: 'Luminous Ledger',
    description: 'Bright and eye-catching design',
    component: 'LuminousLedgerTemplate',
    preview: '/images/templates/luminous-ledger-preview.png'
  },
  lumos : {
    name: 'Lumos',
    description: 'Light-themed elegant design',
    component: 'LumosTemplate',
    preview: '/images/templates/lumos-preview.png'
  },
  matrixledger : {
    name: 'Matrix Ledger',
    description: 'Tech-inspired grid design',
    component: 'MatrixLedgerTemplate',
    preview: '/images/templates/matrix-ledger-preview.png'
  },
  minimalistmonochrome:{
    name: 'Minimalist Monochrome',
    description: 'Sleek black and white design',
    component: 'MinimalistMonochromeTemplate',
    preview: '/images/templates/minimalist-monochrome-preview.png'
  },
  modernstacked:{
    name: 'Modern Stacked',
    description: 'Layered modern design',
    component: 'ModernStackedTemplate',
    preview: '/images/templates/modern-stacked-preview.png'
  },
  neoedge:{
    name: 'Neo Edge',
    description: 'Cutting-edge modern design',
    component: 'NeoEdgeTemplate',
    preview: '/images/templates/neo-edge-preview.png'
  },
  neogeometric : {
    name: 'Neo Geometric',
    description: 'Contemporary geometric design',
    component: 'NeoGeometricTemplate',
    preview: '/images/templates/neo-geometric-preview.png'
  },
  orion : {
    name: 'Orion',
    description: 'Stellar and modern design',
    component: 'OrionTemplate',
    preview: '/images/templates/orion-preview.png'
  },
  pillarpro:{
    name: 'Pillar Pro',
    description: 'Professional pillar-style design',
    component: 'PillarProTemplate',
    preview: '/images/templates/pillar-pro-preview.png'
  },
  prism : {
    name: 'Prism',
    description: 'Color spectrum inspired design',
    component: 'PrismTemplate',
    preview: '/images/templates/prism-preview.png'
  },
  professionalblue: {
    name: 'Professional Blue',
    description: 'Business blue-themed design',
    component: 'ProfessionalBlueTemplate',
    preview: '/images/templates/professional-blue-preview.png'
  },
  royaledge:{
    name: 'Royal Edge',
    description: 'Regal and sophisticated design',
    component: 'RoyalEdgeTemplate',
    preview: '/images/templates/royal-edge-preview.png'
  },
  rusticelegance : {
    name: 'Rustic Elegance',
    description: 'Warm and vintage design',
    component: 'RusticEleganceTemplate',
    preview: '/images/templates/rustic-elegance-preview.png'
  },
  sleekstream:{
    name: 'Sleek Stream',
    description: 'Smooth and modern design',
    component: 'SleekStreamTemplate',
    preview: '/images/templates/sleek-stream-preview.png'
  },
  spectrum:{
    name: 'Spectrum',
    description: 'Vibrant and colorful design',
    component: 'SpectrumTemplate',
    preview: '/images/templates/spectrum-preview.png'
  },
  structed:{
    name: 'Structed',
    description: 'Organized and clean design',
    component: 'StructedTemplate',
    preview: '/images/templates/structed-preview.png'
  },
  terra:{
    name: 'Terra',
    description: 'Earth-toned natural design',
    component: 'TerraTemplate',
    preview: '/images/templates/terra-preview.png'
  },
  velocityledger:{
    name: 'Velocity Ledger',
    description: 'Dynamic and fast-paced design',
    component: 'VelocityLedgerTemplate',
    preview: '/images/templates/velocity-ledger-preview.png'
  },
  vintage:{
    name: 'Vintage',
    description: 'Classic retro design',
    component: 'VintageTemplate',
    preview: '/images/templates/vintage-preview.png'
  },
  zentith:{
    name: 'ZenTith',
    description: 'Calm and balanced design',
    component: 'ZenTithTemplate',
    preview: '/images/templates/zentith-preview.png'
  }
};

// Template selector options
export const TEMPLATE_OPTIONS = [
  { value: 'cleandatasheet', label: 'Clean Sheet',  description: 'Data sheet design', preview: '/images/templates/clean-datasheet-preview.png' },
  { value: 'vintage', label: 'Vintage', description: 'Classic retro design', preview: '/images/templates/vintage-preview.png' },
  { value: 'classic', label: 'Classic', description: 'Traditional formal style', preview: '/images/templates/classic-preview.png' },
  { value: 'modern', label: 'Modern', description: 'Contemporary clean design', preview: '/images/templates/modern-preview.png' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and elegant', preview: '/images/templates/minimal-preview.png' },
  { value: 'professional', label: 'Professional', description: 'Business with signatures', preview: '/images/templates/professional-preview.png' },
  { value: 'aero', label: 'Aero', description: 'Lightweight and airy design', preview: '/images/templates/aero-preview.png' },
  { value: 'aether', label: 'Aether', description: 'Elegant and sophisticated design', preview: '/images/templates/aether-preview.png' },
  { value: 'apex', label: 'Apex', description: 'Bold and modern design', preview: '/images/templates/apex-preview.png' },
  { value: 'aura', label: 'Aura', description: 'Bright and vibrant design', preview: '/images/templates/aura-preview.png' },
  { value: 'aurora', label: 'Aurora', description: 'Colorful and dynamic design', preview: '/images/templates/aurora-preview.png' },
  { value: 'aurum', label: 'Aurum', description: 'Luxurious and premium design', preview: '/images/templates/aurum-preview.png' },
  { value: 'celeste', label: 'Celeste', description: 'Soft and calming design', preview: '/images/templates/celeste-preview.png' },
  { value: 'cosmicreceipt', label: 'Cosmic Receipt', description: 'Futuristic and space-themed design', preview: '/images/templates/cosmic-receipt-preview.png' },
  { value: 'crystal', label: 'Crystal', description: 'Clear and transparent design', preview: '/images/templates/crystal-preview.png' },
  { value: 'eclipse', label: 'Eclipse', description: 'Dark mode inspired design', preview: '/images/templates/eclipse-preview.png' },
  { value: 'elegant', label: 'Elegant', description: 'Refined and stylish design', preview: '/images/templates/elegant-preview.png' },
  { value: 'elitepaper', label: 'Elite Paper', description: 'High-end paper style design', preview: '/images/templates/elite-paper-preview.png' },
  { value: 'flexview', label: 'Flex View', description: 'Flexible and adaptable design', preview: '/images/templates/flex-view-preview.png' },
  { value: 'fusion', label: 'Fusion', description: 'Blend of classic and modern design', preview: '/images/templates/fusion-preview.png' },
  { value: 'geometricedge', label: 'Geometric Edge', description: 'Sharp and angular design', preview: '/images/templates/geometric-edge-preview.png' },
  { value: 'luminousledger', label: 'Luminous Ledger', description: 'Bright and eye-catching design', preview: '/images/templates/luminous-ledger-preview.png' },
  { value: 'lumos', label: 'Lumos', description: 'Light-themed elegant design', preview: '/images/templates/lumos-preview.png' },
  { value: 'matrixledger', label: 'Matrix Ledger', description: 'Tech-inspired grid design', preview: '/images/templates/matrix-ledger-preview.png' },
  { value: 'minimalistmonochrome', label: 'Minimalist', description: 'Sleek black and white design', preview: '/images/templates/minimalist-monochrome-preview.png' },
  { value: 'modernstacked', label: 'Modern Stacked', description: 'Layered modern design', preview: '/images/templates/modern-stacked-preview.png' },
  { value: 'neoedge', label: 'Neo Edge', description: 'Cutting-edge modern design', preview: '/images/templates/neo-edge-preview.png' },
  { value: 'neogeometric', label: 'Neo Geometric', description: 'Contemporary geometric design', preview: '/images/templates/neo-geometric-preview.png' },
  { value: 'orion', label: 'Orion', description: 'Stellar and modern design', preview: '/images/templates/orion-preview.png' },
  { value: 'pillarpro', label: 'Pillar Pro', description: 'Professional pillar-style design', preview: '/images/templates/pillar-pro-preview.png' },
  { value: 'prism', label: 'Prism', description: 'Color spectrum inspired design', preview: '/images/templates/prism-preview.png' },
  { value: 'professionalblue', label: 'Professional Blue', description: 'Business blue-themed design', preview: '/images/templates/professional-blue-preview.png' },
  { value: 'royaledge', label: 'Royal Edge', description: 'Regal and sophisticated design', preview: '/images/templates/royal-edge-preview.png' },
  { value: 'rusticelegance', label: 'Rustic Elegance', description: 'Warm and vintage design', preview: '/images/templates/rustic-elegance-preview.png' },
  { value: 'sleekstream', label: 'Sleek Stream', description: 'Smooth and modern design', preview: '/images/templates/sleek-stream-preview.png' },
  { value: 'spectrum', label: 'Spectrum', description: 'Vibrant and colorful design', preview: '/images/templates/spectrum-preview.png' },
  { value: 'structed', label: 'Structed', description: 'Organized and clean design', preview: '/images/templates/structed-preview.png' },
  { value: 'terra', label: 'Terra', description: 'Earth-toned natural design' , preview: '/images/templates/terra-preview.png' },
  { value: 'velocityledger', label: 'Velocity Ledger', description: 'Dynamic and fast-paced design', preview: '/images/templates/velocity-ledger-preview.png' },
  { value: 'zentith', label: 'ZenTith', description: 'Calm and balanced design', preview: '/images/templates/zentith-preview.png' }
];
