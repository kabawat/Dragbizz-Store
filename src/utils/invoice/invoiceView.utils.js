export const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]";
    case "RELEASED":
      return "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]";
    case "CANCELLED":
      return "bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]";
    default:
      return "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]";
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]";
    case "UNPAID":
      return "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]";
    case "PAY_LATTER":
      return "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]";
    case "CANCELLED":
      return "bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]";
    default:
      return "bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]";
  }
};

import {
  AeroTemplate,
  AetherTemplate,
  ApexTemplate,
  AuraTemplate,
  AuroraTemplate,
  AurumTemplate,
  CelesteTemplate,
  ClassicTemplate,
  CleanDataSheetTemplate,
  CosmicReceiptTemplate,
  CrystalTemplate,
  EclipseTemplate,
  ElegantTemplate,
  ElitePaperTemplate,
  FlexviewTemplate,
  FusionTemplate,
  GeometricEdgeTemplate,
  LuminousLedgerTemplate,
  LumosTemplate,
  MatrixLedgerTemplate,
  MinimalistMonochromeTemplate,
  MinimalTemplate,
  ModernStackedTemplate,
  ModernTemplate,
  NeoEdgeTemplate,
  NeoGeometricTemplate,
  OrionTemplate,
  PillarProTemplate,
  PrismTemplate,
  ProfessionalBlueTemplate,
  ProfessionalTemplate,
  RoyalEdgeTemplate,
  RusticEleganceTemplate,
  SleekStreamTemplate,
  SpectrumTemplate,
  StructedTemplate,
  TerraTemplate,
  VelocityLedgerTemplate,
  VintageTemplate,
  ZenithTemplate,
  ThermalClassicTemplate,
  ThermalModernTemplate,
  ThermalCompactTemplate,
  ThermalMinimalTemplate,
  ThermalBoldTemplate,
} from "@/components/templates/invoice";

export const getTemplateComponent = (selectedTemplate) => {
  const templates = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    minimal: MinimalTemplate,
    professional: ProfessionalTemplate,
    elegant: ElegantTemplate,
    vintage: VintageTemplate,
    aero: AeroTemplate,
    crystal: CrystalTemplate,
    structed: StructedTemplate,
    aether: AetherTemplate,
    aurora: AuroraTemplate,
    celeste: CelesteTemplate,
    eclipse: EclipseTemplate,
    apex: ApexTemplate,
    zenith: ZenithTemplate,
    terra: TerraTemplate,
    lumos: LumosTemplate,
    aura: AuraTemplate,
    fusion: FusionTemplate,
    orion: OrionTemplate,
    spectrum: SpectrumTemplate,
    prism: PrismTemplate,
    flexview: FlexviewTemplate,
    elitepaper: ElitePaperTemplate,
    "neo-edge": NeoEdgeTemplate,
    luminousledger: LuminousLedgerTemplate,
    aurum: AurumTemplate,
    "velocity-ledger": VelocityLedgerTemplate,
    "sleek-stream": SleekStreamTemplate,
    "royal-edge": RoyalEdgeTemplate,
    cosmicreceipt: CosmicReceiptTemplate,
    geometricedge: GeometricEdgeTemplate,
    "clean-datasheet": CleanDataSheetTemplate,
    "neo-geometric": NeoGeometricTemplate,
    "pillar-pro": PillarProTemplate,
    "matrix-ledger": MatrixLedgerTemplate,
    "professional-blue": ProfessionalBlueTemplate,
    minimalistmonochrome: MinimalistMonochromeTemplate,
    modernstacked: ModernStackedTemplate,
    "rustic-elegance": RusticEleganceTemplate,
    "thermal-classic": ThermalClassicTemplate,
    "thermal-modern": ThermalModernTemplate,
    "thermal-compact": ThermalCompactTemplate,
    "thermal-minimal": ThermalMinimalTemplate,
    "thermal-bold": ThermalBoldTemplate,
  };

  return templates[selectedTemplate] || ModernTemplate;
};
