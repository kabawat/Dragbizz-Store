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
    zentith: ZenithTemplate,
    terra: TerraTemplate,
    lumos: LumosTemplate,
    aura: AuraTemplate,
    fusion: FusionTemplate,
    orion: OrionTemplate,
    spectrum: SpectrumTemplate,
    PrismTemplate: PrismTemplate,
    flexview: FlexviewTemplate,
    elitepaper: ElitePaperTemplate,
    neoedge: NeoEdgeTemplate,
    luminousledger: LuminousLedgerTemplate,
    aurum: AurumTemplate,
    velocityledger: VelocityLedgerTemplate,
    sleekstream: SleekStreamTemplate,
    royaledge: RoyalEdgeTemplate,
    cosmicreceipt: CosmicReceiptTemplate,
    geometricedge: GeometricEdgeTemplate,
    cleandatasheet: CleanDataSheetTemplate,
    neogeometric: NeoGeometricTemplate,
    pillarPro: PillarProTemplate,
    matrixLedger: MatrixLedgerTemplate,
    professionalblue: ProfessionalBlueTemplate,
    minimalistmonochrome: MinimalistMonochromeTemplate,
    modernstacked: ModernStackedTemplate,
    rusticelegance: RusticEleganceTemplate,
  };

  return templates[selectedTemplate] || ModernTemplate;
};
