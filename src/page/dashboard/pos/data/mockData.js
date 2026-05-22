import { Banknote, CreditCard, Smartphone } from "lucide-react";

export const CATEGORIES = [
    { id: "all", name: "All Items" },
    { id: "beverages", name: "Beverages" },
    { id: "snacks", name: "Snacks" },
    { id: "dairy", name: "Dairy" },
    { id: "bakery", name: "Bakery" },
    { id: "personal-care", name: "Personal Care" },
    { id: "household", name: "Household" },
];

export const PRODUCTS = [
    // ── Beverages ──────────────────────────────────────────────────────────────
    { id: "p1", name: "Coca-Cola 500ml", price: 40, category: "beverages", sku: "BEV001", stock: 50, tax: 12, emoji: "🥤" },
    { id: "p2", name: "Pepsi 500ml", price: 40, category: "beverages", sku: "BEV002", stock: 45, tax: 12, emoji: "🥤" },
    { id: "p3", name: "Mineral Water 1L", price: 20, category: "beverages", sku: "BEV003", stock: 100, tax: 0, emoji: "💧" },
    { id: "p4", name: "Orange Juice 250ml", price: 30, category: "beverages", sku: "BEV004", stock: 30, tax: 12, emoji: "🍊" },
    { id: "p21", name: "Limca 500ml", price: 40, category: "beverages", sku: "BEV005", stock: 40, tax: 12, emoji: "🍋" },
    { id: "p22", name: "Sprite 500ml", price: 40, category: "beverages", sku: "BEV006", stock: 38, tax: 12, emoji: "🟢" },
    { id: "p23", name: "Maaza Mango 200ml", price: 20, category: "beverages", sku: "BEV007", stock: 60, tax: 12, emoji: "🥭" },
    { id: "p24", name: "Red Bull 250ml", price: 125, category: "beverages", sku: "BEV008", stock: 20, tax: 18, emoji: "🐂" },
    // ── Snacks ─────────────────────────────────────────────────────────────────
    { id: "p5", name: "Lays Classic 50g", price: 20, category: "snacks", sku: "SNK001", stock: 80, tax: 12, emoji: "🟡" },
    { id: "p6", name: "Kurkure 50g", price: 20, category: "snacks", sku: "SNK002", stock: 75, tax: 12, emoji: "🌽" },
    { id: "p7", name: "Biscuit Oreo", price: 35, category: "snacks", sku: "SNK003", stock: 60, tax: 12, emoji: "🍪" },
    { id: "p8", name: "Britannia Good Day", price: 30, category: "snacks", sku: "SNK004", stock: 55, tax: 12, emoji: "🍪" },
    { id: "p25", name: "Hide & Seek 100g", price: 30, category: "snacks", sku: "SNK005", stock: 50, tax: 12, emoji: "🍫" },
    { id: "p26", name: "Haldiram Bhujia 200g", price: 55, category: "snacks", sku: "SNK006", stock: 45, tax: 12, emoji: "🫘" },
    { id: "p27", name: "Parle-G 250g", price: 25, category: "snacks", sku: "SNK007", stock: 90, tax: 12, emoji: "🍪" },
    { id: "p28", name: "Doritos Nacho 50g", price: 30, category: "snacks", sku: "SNK008", stock: 35, tax: 12, emoji: "🔺" },
    // ── Dairy ──────────────────────────────────────────────────────────────────
    { id: "p9", name: "Amul Milk 500ml", price: 28, category: "dairy", sku: "DAI001", stock: 40, tax: 5, emoji: "🥛" },
    { id: "p10", name: "Amul Butter 100g", price: 56, category: "dairy", sku: "DAI002", stock: 25, tax: 12, emoji: "🧈" },
    { id: "p11", name: "Curd 200g", price: 22, category: "dairy", sku: "DAI003", stock: 35, tax: 5, emoji: "🥣" },
    { id: "p12", name: "Cheese Slice 200g", price: 85, category: "dairy", sku: "DAI004", stock: 20, tax: 12, emoji: "🧀" },
    { id: "p29", name: "Paneer 200g", price: 95, category: "dairy", sku: "DAI005", stock: 15, tax: 5, emoji: "🧀" },
    { id: "p30", name: "Lassi 200ml", price: 30, category: "dairy", sku: "DAI006", stock: 25, tax: 5, emoji: "🥛" },
    // ── Bakery ─────────────────────────────────────────────────────────────────
    { id: "p13", name: "White Bread Loaf", price: 45, category: "bakery", sku: "BAK001", stock: 30, tax: 5, emoji: "🍞" },
    { id: "p14", name: "Brown Bread", price: 55, category: "bakery", sku: "BAK002", stock: 20, tax: 5, emoji: "🍞" },
    { id: "p15", name: "Pav (6pcs)", price: 25, category: "bakery", sku: "BAK003", stock: 40, tax: 5, emoji: "🍞" },
    { id: "p31", name: "Croissant", price: 40, category: "bakery", sku: "BAK004", stock: 15, tax: 5, emoji: "🥐" },
    { id: "p32", name: "Muffin Choco", price: 50, category: "bakery", sku: "BAK005", stock: 18, tax: 5, emoji: "🧁" },
    { id: "p33", name: "Sourdough Loaf", price: 90, category: "bakery", sku: "BAK006", stock: 10, tax: 5, emoji: "🍞" },
    // ── Personal Care ──────────────────────────────────────────────────────────
    { id: "p16", name: "Dove Soap 100g", price: 75, category: "personal-care", sku: "PC001", stock: 50, tax: 18, emoji: "🧼" },
    { id: "p17", name: "Colgate 200g", price: 110, category: "personal-care", sku: "PC002", stock: 45, tax: 18, emoji: "🦷" },
    { id: "p18", name: "Shampoo 200ml", price: 185, category: "personal-care", sku: "PC003", stock: 30, tax: 18, emoji: "🧴" },
    { id: "p34", name: "Dettol Handwash 250ml", price: 120, category: "personal-care", sku: "PC004", stock: 40, tax: 18, emoji: "🫧" },
    { id: "p35", name: "Nivea Moisturizer 50ml", price: 160, category: "personal-care", sku: "PC005", stock: 25, tax: 18, emoji: "🧴" },
    { id: "p36", name: "Gillette Razor", price: 175, category: "personal-care", sku: "PC006", stock: 20, tax: 18, emoji: "🪒" },
    // ── Household ──────────────────────────────────────────────────────────────
    { id: "p19", name: "Surf Excel 500g", price: 120, category: "household", sku: "HH001", stock: 40, tax: 18, emoji: "🪣" },
    { id: "p20", name: "Vim Bar 250g", price: 45, category: "household", sku: "HH002", stock: 55, tax: 18, emoji: "🍋" },
    { id: "p37", name: "Lizol Floor Cleaner 1L", price: 185, category: "household", sku: "HH003", stock: 30, tax: 18, emoji: "🫧" },
    { id: "p38", name: "Colin Glass Cleaner", price: 130, category: "household", sku: "HH004", stock: 25, tax: 18, emoji: "🪟" },
    { id: "p39", name: "Harpic Toilet Cleaner", price: 115, category: "household", sku: "HH005", stock: 35, tax: 18, emoji: "🚽" },
    { id: "p40", name: "Scotch-Brite Scrub Pad", price: 55, category: "household", sku: "HH006", stock: 60, tax: 18, emoji: "🟩" },

    { id: "p41", name: "Surf Excel 500g", price: 120, category: "household", sku: "HH001", stock: 40, tax: 18, emoji: "🪣" },
    { id: "p42", name: "Vim Bar 250g", price: 45, category: "household", sku: "HH002", stock: 55, tax: 18, emoji: "🍋" },
    { id: "p43", name: "Lizol Floor Cleaner 1L", price: 185, category: "household", sku: "HH003", stock: 30, tax: 18, emoji: "🫧" },
    { id: "p44", name: "Colin Glass Cleaner", price: 130, category: "household", sku: "HH004", stock: 25, tax: 18, emoji: "🪟" },
    { id: "p45", name: "Harpic Toilet Cleaner", price: 115, category: "household", sku: "HH005", stock: 35, tax: 18, emoji: "🚽" },
    { id: "p46", name: "Scotch-Brite Scrub Pad", price: 55, category: "household", sku: "HH006", stock: 60, tax: 18, emoji: "🟩" },
];

export const PAYMENT_METHODS = [
    { id: "cash", label: "Cash", icon: Banknote },
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "card", label: "Card", icon: CreditCard },
];
