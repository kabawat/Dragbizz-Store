export const getStatusColor = (status) => {
    switch (status) {
        case 'DRAFT': return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
        case 'RELEASED': return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
        case 'CANCELLED': return 'bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]';
        default: return 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]';
    }
};

export const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'PAID': return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
        case 'UNPAID': return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
        case 'PAY_LATTER': return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
        case 'CANCELLED': return 'bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]';
        default: return 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]';
    }
};

import {
    ClassicTemplate,
    ModernTemplate,
    MinimalTemplate,
    ProfessionalTemplate,
    ElegantTemplate,
    VintageTemplate,
    AeroTemplate,
    CrystalTemplate,
    StructedTemplate,
    AetherTemplate,
    AuroraTemplate,
    CelesteTemplate,
    EclipseTemplate,
    ApexTemplate,
    ZenithTemplate,
    TerraTemplate,
    LumosTemplate,
    AuraTemplate,
    FusionTemplate,
    OrionTemplate,
    PrismTemplate,
    SpectrumTemplate,
    FlexviewTemplate,
    ElitePaperTemplate,
    NeoEdgeTemplate,
    LuminousLedgerTemplate,
    AurumTemplate,
    VelocityLedgerTemplate,
    SleekStreamTemplate,
    RoyalEdgeTemplate,
    CosmicReceiptTemplate,
    GeometricEdgeTemplate,
    CleanDataSheetTemplate,
    NeoGeometricTemplate,
    PillarProTemplate,
    MatrixLedgerTemplate,
    ProfessionalBlueTemplate,
    MinimalistMonochromeTemplate,
    ModernStackedTemplate,
    RusticEleganceTemplate
} from '@/components/invoice/templates';

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
        rusticelegance: RusticEleganceTemplate
    };
    
    return templates[selectedTemplate] || ModernTemplate;
};

