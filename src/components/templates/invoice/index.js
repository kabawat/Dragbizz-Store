// Export all invoice templates (sorted alphabetically)

export { default as AeroTemplate } from "./aero";
export { default as AetherTemplate } from "./aether";
export { default as ApexTemplate } from "./apex";
export { default as AuraTemplate } from "./aura";
export { default as AuroraTemplate } from "./aurora";
export { default as AurumTemplate } from "./aurum";
export { default as CelesteTemplate } from "./celeste";
export { default as ClassicTemplate } from "./classic";
export { default as CleanDataSheetTemplate } from "./clean-datasheet";
export { default as CosmicReceiptTemplate } from "./cosmic-receipt";
export { default as CrystalTemplate } from "./crystal";
export { default as EclipseTemplate } from "./eclipse";
export { default as ElegantTemplate } from "./elegant";
export { default as ElitePaperTemplate } from "./elitepaper";
export { default as FlexviewTemplate } from "./flexview";
export { default as FusionTemplate } from "./fusion";
export { default as GeometricEdgeTemplate } from "./geometric-edge";
export { default as InvoiceContainer } from "./InvoiceContainer";
export { default as LuminousLedgerTemplate } from "./luminous-ledger";
export { default as LumosTemplate } from "./lumos";
export { default as MatrixLedgerTemplate } from "./matrix-ledger";
export { default as MinimalTemplate } from "./minimal";
export { default as MinimalistMonochromeTemplate } from "./minimalist-monochrome";
export { default as ModernStackedTemplate } from "./modern-stacked";
export { default as ModernTemplate } from "./modern";
export { default as NeoEdgeTemplate } from "./neo-edge";
export { default as NeoGeometricTemplate } from "./neo-geometric";
export { default as OrionTemplate } from "./orion";
export { default as PillarProTemplate } from "./pillar-pro";
export { default as PrismTemplate } from "./prism";
export { default as ProfessionalBlueTemplate } from "./professional-blue";
export { default as ProfessionalTemplate } from "./professional";
export { default as RoyalEdgeTemplate } from "./royal-edge";
export { default as RusticEleganceTemplate } from "./rustic-elegance";
export { default as SleekStreamTemplate } from "./sleek-stream";
export { default as SpectrumTemplate } from "./spectrum";
export { default as StructedTemplate } from "./structed";
export { default as TerraTemplate } from "./terra";
export { default as VelocityLedgerTemplate } from "./velocity-ledger";
export { default as VintageTemplate } from "./vintage";
export { default as ZenithTemplate } from "./zenith";

// Template selector options (sorted alphabetically by label)
export const TEMPLATE_OPTIONS = [
  {
    value: "aero",
    label: "Aero",
    description: "Light and airy design",
    preview: "/images/templates/aero-preview.png",
  },
  {
    value: "aether",
    label: "Aether",
    description: "Ethereal and modern feel",
    preview: "/images/templates/aether-preview.png",
  },
  {
    value: "apex",
    label: "Apex",
    description: "Bold and striking design",
    preview: "/images/templates/apex-preview.png",
  },
  {
    value: "aura",
    label: "Aura",
    description: "Soft and calming aesthetics",
    preview: "/images/templates/aura-preview.png",
  },
  {
    value: "aurora",
    label: "Aurora",
    description: "Vibrant and dynamic design",
    preview: "/images/templates/aurora-preview.png",
  },
  {
    value: "aurum",
    label: "Aurum",
    description: "Luxurious gold-themed design",
    preview: "/images/templates/aurum-preview.png",
  },
  {
    value: "celeste",
    label: "Celeste",
    description: "Light and elegant design",
    preview: "/images/templates/celeste-preview.png",
  },
  {
    value: "classic",
    label: "Classic",
    description: "Traditional formal style",
    preview: "/images/templates/classic-preview.png",
  },
  {
    value: "cleandatasheet",
    label: "Clean Data Sheet",
    description: "Structured and data-focused design",
    preview: "/images/templates/clean-datasheet-preview.png",
  },
  {
    value: "cosmicreceipt",
    label: "Cosmic Receipt",
    description: "Futuristic dark mode receipt style",
    preview: "/images/templates/cosmic-receipt-preview.png",
  },
  {
    value: "crystal",
    label: "Crystal",
    description: "Clear and polished style",
    preview: "/images/templates/crystal-preview.png",
  },
  {
    value: "eclipse",
    label: "Eclipse",
    description: "Dark mode with modern aesthetics",
    preview: "/images/templates/eclipse-preview.png",
  },
  {
    value: "elegant",
    label: "Elegant",
    description: "Sophisticated and stylish",
    preview: "/images/templates/elegant-preview.png",
  },
  {
    value: "elitepaper",
    label: "Elite Paper",
    description: "Premium and sophisticated design",
    preview: "/images/templates/elite-paper-preview.png",
  },
  {
    value: "flexview",
    label: "Flexview",
    description: "Versatile and modern design",
    preview: "/images/templates/flex-view-preview.png",
  },
  {
    value: "fusion",
    label: "Fusion",
    description: "Dynamic and vibrant design",
    preview: "/images/templates/fusion-preview.png",
  },
  {
    value: "geometricedge",
    label: "Geometric Edge",
    description: "Bold geometric shapes with sharp edges",
    preview: "/images/templates/geometric-edge-preview.png",
  },
  {
    value: "luminousledger",
    label: "Luminous Ledger",
    description: "Bright and clear design with emphasis on readability",
    preview: "/images/templates/luminous-ledger-preview.png",
  },
  {
    value: "lumos",
    label: "Lumos",
    description: "Bright and clear design",
    preview: "/images/templates/lumos-preview.png",
  },
  {
    value: "matrix-ledger",
    label: "Matrix Ledger",
    description: "Structured design with emphasis on clarity",
    preview: "/images/templates/matrix-ledger-preview.png",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Simple and elegant",
    preview: "/images/templates/minimal-preview.png",
  },
  {
    value: "minimalistmonochrome",
    label: "Minimalist Monochrome",
    description: "Clean and simple monochrome design",
    preview: "/images/templates/minimalist-monochrome-preview.png",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Contemporary clean design",
    preview: "/images/templates/modern-preview.png",
  },
  {
    value: "modernstacked",
    label: "Modern Stacked",
    description: "Contemporary stacked layout with bold accents",
    preview: "/images/templates/modern-stacked-preview.png",
  },
  {
    value: "neo-geometric",
    label: "Neo Geometric",
    description: "Sleek design with geometric elements",
    preview: "/images/templates/neo-geometric-preview.png",
  },
  {
    value: "neo-edge",
    label: "Neo Edge",
    description: "Sleek and modern design with sharp edges",
    preview: "/images/templates/neo-edge-preview.png",
  },
  {
    value: "orion",
    label: "Orion",
    description: "Stellar and modern look",
    preview: "/images/templates/orion-preview.png",
  },
  {
    value: "pillar-pro",
    label: "Pillar Pro",
    description: "Professional design with brand colors",
    preview: "/images/templates/pillar-pro-preview.png",
  },
  {
    value: "prism",
    label: "Prism",
    description: "Clear and polished style",
    preview: "/images/templates/prism-preview.png",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Business with signatures",
    preview: "/images/templates/professional-preview.png",
  },
  {
    value: "professional-blue",
    label: "Professional Blue",
    description: "Professional design with blue accents",
    preview: "/images/templates/professional-blue-preview.png",
  },
  {
    value: "royal-edge",
    label: "Royal Edge",
    description: "Elegant design with regal accents",
    preview: "/images/templates/royal-edge-preview.png",
  },
  {
    value: "rustic-elegance",
    label: "Rustic Elegance",
    description: "Warm and charming rustic design",
    preview: "/images/templates/rustic-elegance-preview.png",
  },
  {
    value: "sleek-stream",
    label: "Sleek Stream",
    description: "Modern design with fluid elements",
    preview: "/images/templates/sleek-stream-preview.png",
  },
  {
    value: "spectrum",
    label: "Spectrum",
    description: "Vibrant and colorful design",
    preview: "/images/templates/spectrum-preview.png",
  },
  {
    value: "structed",
    label: "Structured",
    description: "Organized and neat layout",
    preview: "/images/templates/structed-preview.png",
  },
  {
    value: "terra",
    label: "Terra",
    description: "Earthy and natural tones",
    preview: "/images/templates/terra-preview.png",
  },
  {
    value: "velocity-ledger",
    label: "Velocity Ledger",
    description: "Dynamic and fast-paced design",
    preview: "/images/templates/velocity-ledger-preview.png",
  },
  {
    value: "vintage",
    label: "Vintage",
    description: "Retro and classic look",
    preview: "/images/templates/vintage-preview.png",
  },
  {
    value: "zenith",
    label: "Zenith",
    description: "Peak professional style",
    preview: "/images/templates/zentith-preview.png",
  },
];
