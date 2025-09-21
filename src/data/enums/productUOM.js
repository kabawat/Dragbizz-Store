// Product Unit of Measure (UOM) Enum Values

export const PRODUCT_UOM = [
  // 📦 General / Retail
  "PCS",
  "UNIT",
  "PAIR",
  "SET",
  "DOZEN",
  "GROSS",     // 144 pcs
  "BUNDLE",
  "PACK",
  "BOX",
  "CARTON",
  "CASE",
  "SACK",
  "BAG",

  // ⚖️ Weight
  "MG",
  "GRAM",
  "KG",
  "QUINTAL",
  "TON",

  // 🧪 Volume
  "ML",
  "LITER",
  "KL",        // kiloliter
  "CUBIC_CM",
  "CUBIC_METER",
  "CUBIC_FEET",
  "GALLON",
  "PINT",
  "BARREL",

  // 📏 Length
  "MM",
  "CM",
  "METER",
  "KM",
  "INCH",
  "FEET",
  "YARD",
  "MILE",

  // 📐 Area
  "SQMM",
  "SQCM",
  "SQM",
  "SQFT",
  "SQYARD",
  "ACRE",
  "HECTARE",

  // ⚙️ Construction / Hardware
  "ROD",
  "COIL",
  "ROLL",
  "SHEET",
  "PIPE",
  "LENGTH",
  "BAR",

  // 💊 Pharmacy / Medical
  "STRIP",
  "TABLET",
  "CAPSULE",
  "SYRINGE",
  "BOTTLE",
  "VIAL",
  "AMPULE",
  "TUBE",
  "DROPS",
  "INHALER",

  // 🍔 Food / Beverages
  "PIECE",
  "SLICE",
  "LOAF",
  "CUP",
  "GLASS",
  "JAR",
  "TIN",
  "CAN",
  "PACKET",
  "TRAY",
  "BOWL",
  "PLATE",

  // 👕 Garments / Textile
  "SUIT",

  // 🛠 Services / Time Based
  "HOUR",
  "DAY",
  "MONTH",
  "YEAR",
  "SERVICE",
  "SESSION",
  "VISIT",
  "JOB",

  // 💻 Digital Goods / IT
  "KB",
  "MB",
  "GB",
  "TB",
  "LICENSE",
  "USER",
  "SUBSCRIPTION",

  // 🚗 Auto / Machinery
  "LITRE",
  "TYRE",
  "ENGINE",
  "MACHINE",
  "VEHICLE",

  // 🏗 Special Bulk / Others
  "LOT",
  "LOAD",
  "TRUCK",
  "CONTAINER",
  "PALLET"
];

/**
 * UOM Options for Select Component
 * Formatted for dropdown usage with labels and descriptions
 */
export const UOM_OPTIONS = PRODUCT_UOM.map(uom => {
  const descriptions = {
    // General / Retail
    'PCS': 'Pieces',
    'UNIT': 'Unit',
    'PAIR': 'Pair',
    'SET': 'Set',
    'DOZEN': 'Dozen',
    'GROSS': 'Gross (144 pcs)',
    'BUNDLE': 'Bundle',
    'PACK': 'Pack',
    'BOX': 'Box',
    'CARTON': 'Carton',
    'CASE': 'Case',
    'SACK': 'Sack',
    'BAG': 'Bag',
    
    // Weight
    'MG': 'Milligram',
    'GRAM': 'Gram',
    'KG': 'Kilogram',
    'QUINTAL': 'Quintal',
    'TON': 'Ton',
    
    // Volume
    'ML': 'Milliliter',
    'LITER': 'Liter',
    'KL': 'Kiloliter',
    'CUBIC_CM': 'Cubic Centimeter',
    'CUBIC_METER': 'Cubic Meter',
    'CUBIC_FEET': 'Cubic Feet',
    'GALLON': 'Gallon',
    'PINT': 'Pint',
    'BARREL': 'Barrel',
    
    // Length
    'MM': 'Millimeter',
    'CM': 'Centimeter',
    'METER': 'Meter',
    'KM': 'Kilometer',
    'INCH': 'Inch',
    'FEET': 'Feet',
    'YARD': 'Yard',
    'MILE': 'Mile',
    
    // Area
    'SQMM': 'Square Millimeter',
    'SQCM': 'Square Centimeter',
    'SQM': 'Square Meter',
    'SQFT': 'Square Feet',
    'SQYARD': 'Square Yard',
    'ACRE': 'Acre',
    'HECTARE': 'Hectare',
    
    // Construction / Hardware
    'ROD': 'Rod',
    'COIL': 'Coil',
    'ROLL': 'Roll',
    'SHEET': 'Sheet',
    'PIPE': 'Pipe',
    'LENGTH': 'Length',
    'BAR': 'Bar',
    
    // Pharmacy / Medical
    'STRIP': 'Strip',
    'TABLET': 'Tablet',
    'CAPSULE': 'Capsule',
    'SYRINGE': 'Syringe',
    'BOTTLE': 'Bottle',
    'VIAL': 'Vial',
    'AMPULE': 'Ampule',
    'TUBE': 'Tube',
    'DROPS': 'Drops',
    'INHALER': 'Inhaler',
    
    // Food / Beverages
    'PIECE': 'Piece',
    'SLICE': 'Slice',
    'LOAF': 'Loaf',
    'CUP': 'Cup',
    'GLASS': 'Glass',
    'JAR': 'Jar',
    'TIN': 'Tin',
    'CAN': 'Can',
    'PACKET': 'Packet',
    'TRAY': 'Tray',
    'BOWL': 'Bowl',
    'PLATE': 'Plate',
    
    // Garments / Textile
    'SUIT': 'Suit',
    
    // Services / Time Based
    'HOUR': 'Hour',
    'DAY': 'Day',
    'MONTH': 'Month',
    'YEAR': 'Year',
    'SERVICE': 'Service',
    'SESSION': 'Session',
    'VISIT': 'Visit',
    'JOB': 'Job',
    
    // Digital Goods / IT
    'KB': 'Kilobyte',
    'MB': 'Megabyte',
    'GB': 'Gigabyte',
    'TB': 'Terabyte',
    'LICENSE': 'License',
    'USER': 'User',
    'SUBSCRIPTION': 'Subscription',
    
    // Auto / Machinery
    'LITRE': 'Litre',
    'TYRE': 'Tyre',
    'ENGINE': 'Engine',
    'MACHINE': 'Machine',
    'VEHICLE': 'Vehicle',
    
    // Special Bulk / Others
    'LOT': 'Lot',
    'LOAD': 'Load',
    'TRUCK': 'Truck',
    'CONTAINER': 'Container',
    'PALLET': 'Pallet'
  };

  return {
    value: uom,
    label: `${uom} - ${descriptions[uom] || uom}`
  };
});

export default PRODUCT_UOM;
