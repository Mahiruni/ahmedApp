export type Role = "customer" | "driver" | "vendor" | "admin";
export type ServiceKey =
  | "food"
  | "taxi"
  | "market"
  | "construction"
  | "parts";

export type PaymentMethod = "wallet" | "card" | "cash";

export type IconName =
  | "food"
  | "taxi"
  | "market"
  | "construction"
  | "parts"
  | "search"
  | "location"
  | "bell"
  | "cart"
  | "wallet"
  | "plus"
  | "minus"
  | "close"
  | "arrow"
  | "map"
  | "clock"
  | "star"
  | "check"
  | "driver"
  | "vendor"
  | "admin"
  | "customer"
  | "home"
  | "receipt"
  | "support"
  | "shield"
  | "trend"
  | "inventory"
  | "alert"
  | "card"
  | "cash"
  | "phone"
  | "navigation";

export interface RoleOption {
  key: Role;
  label: string;
  description: string;
  icon: IconName;
}

export interface ServiceOption {
  key: ServiceKey;
  label: string;
  subtitle: string;
  icon: IconName;
  accent: string;
  soft: string;
}

export interface CatalogItem {
  id: string;
  service: Exclude<ServiceKey, "taxi">;
  merchant: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  eta: string;
  badge?: string;
  icon: string;
  stock?: number;
}

export interface CartLine {
  item: CatalogItem;
  quantity: number;
}

export interface ActiveOrder {
  id: string;
  service: ServiceKey;
  title: string;
  status: string;
  eta: string;
  progress: number;
  total: number;
  createdAt: string;
}

export interface BilooNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface DriverJob {
  id: string;
  type: "Taxi" | "Delivery";
  service: ServiceKey;
  pickup: string;
  dropoff: string;
  amount: number;
  distance: string;
  eta: string;
}

export interface VendorOrder {
  id: string;
  customer: string;
  total: number;
  items: number;
  status: "New" | "Accepted" | "Preparing" | "Ready" | "Dispatched";
  placed: string;
}

export interface AdminIncident {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  age: string;
  resolved: boolean;
}

export const roles: RoleOption[] = [
  {
    key: "customer",
    label: "Customer",
    description: "Book, shop and track",
    icon: "customer",
  },
  {
    key: "driver",
    label: "Driver",
    description: "Trips and deliveries",
    icon: "driver",
  },
  {
    key: "vendor",
    label: "Vendor",
    description: "Orders and inventory",
    icon: "vendor",
  },
  {
    key: "admin",
    label: "Admin",
    description: "Operations control",
    icon: "admin",
  },
];

export const services: ServiceOption[] = [
  {
    key: "food",
    label: "Food",
    subtitle: "Restaurants near you",
    icon: "food",
    accent: "#f97316",
    soft: "#fff7ed",
  },
  {
    key: "taxi",
    label: "Taxi",
    subtitle: "Ride across the city",
    icon: "taxi",
    accent: "#d99a1f",
    soft: "#fffbeb",
  },
  {
    key: "market",
    label: "Market",
    subtitle: "Groceries delivered",
    icon: "market",
    accent: "#059669",
    soft: "#ecfdf5",
  },
  {
    key: "construction",
    label: "Build",
    subtitle: "Construction materials",
    icon: "construction",
    accent: "#0284c7",
    soft: "#f0f9ff",
  },
  {
    key: "parts",
    label: "Car parts",
    subtitle: "Parts for your vehicle",
    icon: "parts",
    accent: "#7c3aed",
    soft: "#f5f3ff",
  },
];

export const catalog: CatalogItem[] = [
  {
    id: "food-1",
    service: "food",
    merchant: "Kategna Kitchen",
    name: "Special Beyaynetu",
    description: "A generous Ethiopian fasting platter with fresh injera.",
    category: "Ethiopian",
    price: 420,
    rating: 4.8,
    eta: "25–35 min",
    badge: "Popular",
    icon: "🍲",
  },
  {
    id: "food-2",
    service: "food",
    merchant: "Bole Grill",
    name: "Tibs Combo",
    description: "Sizzling beef tibs, vegetables, salad and injera.",
    category: "Grill",
    price: 560,
    rating: 4.7,
    eta: "30–40 min",
    badge: "Chef pick",
    icon: "🥘",
  },
  {
    id: "food-3",
    service: "food",
    merchant: "Addis Pizza Co.",
    name: "Family Margherita",
    description: "Large stone-baked pizza with mozzarella and basil.",
    category: "Pizza",
    price: 690,
    rating: 4.6,
    eta: "20–30 min",
    icon: "🍕",
  },
  {
    id: "food-4",
    service: "food",
    merchant: "Tomoca Express",
    name: "Coffee & Pastry Box",
    description: "Four hot drinks and a mixed pastry selection.",
    category: "Coffee",
    price: 480,
    rating: 4.9,
    eta: "15–25 min",
    badge: "Fast delivery",
    icon: "☕",
  },
  {
    id: "market-1",
    service: "market",
    merchant: "Fresh Corner",
    name: "Weekly Fresh Basket",
    description: "Seasonal vegetables, fruit, herbs and eggs.",
    category: "Fresh produce",
    price: 1480,
    rating: 4.8,
    eta: "25–35 min",
    badge: "Best value",
    icon: "🥬",
    stock: 22,
  },
  {
    id: "market-2",
    service: "market",
    merchant: "Sheger Market",
    name: "Home Essentials Pack",
    description: "Rice, pasta, oil, sugar, flour and cleaning basics.",
    category: "Household",
    price: 2320,
    rating: 4.7,
    eta: "30–45 min",
    icon: "🛍️",
    stock: 14,
  },
  {
    id: "market-3",
    service: "market",
    merchant: "Fresh Corner",
    name: "Baby Care Bundle",
    description: "Diapers, wipes, baby soap and lotion.",
    category: "Baby care",
    price: 1890,
    rating: 4.6,
    eta: "25–35 min",
    badge: "Limited stock",
    icon: "🧴",
    stock: 9,
  },
  {
    id: "market-4",
    service: "market",
    merchant: "Green Basket",
    name: "Organic Breakfast Box",
    description: "Milk, honey, oats, fruit and fresh bread.",
    category: "Breakfast",
    price: 1240,
    rating: 4.9,
    eta: "20–30 min",
    icon: "🥛",
    stock: 18,
  },
  {
    id: "construction-1",
    service: "construction",
    merchant: "Abay Building Supply",
    name: "OPC Cement · 50kg",
    description: "High-strength general construction cement.",
    category: "Cement",
    price: 1420,
    rating: 4.8,
    eta: "Same day",
    badge: "Verified supplier",
    icon: "🏗️",
    stock: 340,
  },
  {
    id: "construction-2",
    service: "construction",
    merchant: "Metro Steel",
    name: "Rebar 12mm · 12m",
    description: "Standard reinforced steel bar for structural work.",
    category: "Steel",
    price: 2380,
    rating: 4.7,
    eta: "2–4 hrs",
    icon: "🔩",
    stock: 186,
  },
  {
    id: "construction-3",
    service: "construction",
    merchant: "Addis Blocks",
    name: "Hollow Block · 20cm",
    description: "Machine-pressed construction block, sold per piece.",
    category: "Blocks",
    price: 96,
    rating: 4.6,
    eta: "Same day",
    badge: "Bulk pricing",
    icon: "🧱",
    stock: 2400,
  },
  {
    id: "construction-4",
    service: "construction",
    merchant: "BuildPro Tools",
    name: "Professional Drill Kit",
    description: "Corded drill, bits, case and safety accessories.",
    category: "Tools",
    price: 8650,
    rating: 4.9,
    eta: "1–2 hrs",
    icon: "🛠️",
    stock: 12,
  },
  {
    id: "parts-1",
    service: "parts",
    merchant: "Abyssinia Auto Parts",
    name: "Toyota Corolla Brake Pads",
    description: "Front ceramic brake pad set for selected Corolla models.",
    category: "Braking",
    price: 3850,
    rating: 4.9,
    eta: "1–3 hrs",
    badge: "Compatibility checked",
    icon: "⚙️",
    stock: 18,
  },
  {
    id: "parts-2",
    service: "parts",
    merchant: "Korean Motors Supply",
    name: "Hyundai Oil Filter",
    description: "OEM-grade engine oil filter for common Hyundai models.",
    category: "Engine",
    price: 780,
    rating: 4.8,
    eta: "1–2 hrs",
    icon: "🔧",
    stock: 46,
  },
  {
    id: "parts-3",
    service: "parts",
    merchant: "Bole Battery Center",
    name: "Maintenance-Free Battery",
    description: "12V 70Ah battery with installation support.",
    category: "Electrical",
    price: 13800,
    rating: 4.7,
    eta: "45–90 min",
    badge: "Installation available",
    icon: "🔋",
    stock: 8,
  },
  {
    id: "parts-4",
    service: "parts",
    merchant: "Abyssinia Auto Parts",
    name: "Universal Wiper Pair",
    description: "All-weather frameless wipers with multiple adapters.",
    category: "Exterior",
    price: 1450,
    rating: 4.6,
    eta: "1–3 hrs",
    icon: "🚘",
    stock: 31,
  },
];

export const initialOrders: ActiveOrder[] = [
  {
    id: "BL-20481",
    service: "market",
    title: "Fresh Corner order",
    status: "Driver is collecting your order",
    eta: "18 min",
    progress: 62,
    total: 1680,
    createdAt: "Today · 8:41 PM",
  },
  {
    id: "BL-20476",
    service: "taxi",
    title: "Airport taxi",
    status: "Driver arriving at pickup",
    eta: "4 min",
    progress: 84,
    total: 420,
    createdAt: "Today · 8:28 PM",
  },
];

export const initialNotifications: BilooNotification[] = [
  {
    id: "notification-1",
    title: "Driver assigned",
    message: "Mikiyas is heading to Fresh Corner to collect your order.",
    time: "2 min",
    read: false,
  },
  {
    id: "notification-2",
    title: "Wallet credited",
    message: "ETB 1,000 was added to your BILOO balance.",
    time: "1 hr",
    read: false,
  },
  {
    id: "notification-3",
    title: "Welcome to BILOO",
    message: "Your account is ready for the Addis Ababa pilot.",
    time: "Yesterday",
    read: true,
  },
];

export const initialDriverJobs: DriverJob[] = [
  {
    id: "JOB-301",
    type: "Delivery",
    service: "food",
    pickup: "Kategna Kitchen, Bole",
    dropoff: "CMC, Summit",
    amount: 186,
    distance: "8.4 km",
    eta: "29 min",
  },
  {
    id: "JOB-302",
    type: "Taxi",
    service: "taxi",
    pickup: "Mexico Square",
    dropoff: "Bole International Airport",
    amount: 420,
    distance: "7.1 km",
    eta: "22 min",
  },
  {
    id: "JOB-303",
    type: "Delivery",
    service: "construction",
    pickup: "Abay Building Supply",
    dropoff: "Ayat Site 14",
    amount: 640,
    distance: "13.7 km",
    eta: "48 min",
  },
];

export const initialVendorOrders: VendorOrder[] = [
  {
    id: "#20481",
    customer: "Samira K.",
    total: 1680,
    items: 6,
    status: "Preparing",
    placed: "4 min ago",
  },
  {
    id: "#20479",
    customer: "Yonas T.",
    total: 940,
    items: 3,
    status: "New",
    placed: "7 min ago",
  },
  {
    id: "#20474",
    customer: "Hanan M.",
    total: 2430,
    items: 9,
    status: "Ready",
    placed: "18 min ago",
  },
  {
    id: "#20469",
    customer: "Bereket A.",
    total: 1180,
    items: 4,
    status: "Accepted",
    placed: "24 min ago",
  },
];

export const initialIncidents: AdminIncident[] = [
  {
    id: "INC-71",
    title: "Payment reconciliation delay",
    severity: "High",
    age: "12 min ago",
    resolved: false,
  },
  {
    id: "INC-68",
    title: "Driver verification backlog",
    severity: "Medium",
    age: "36 min ago",
    resolved: false,
  },
  {
    id: "INC-64",
    title: "Vendor cancellation spike",
    severity: "Medium",
    age: "1 hr ago",
    resolved: false,
  },
];

export const rideTypes = [
  {
    id: "standard",
    name: "Biloo Standard",
    description: "Affordable everyday ride",
    eta: "3 min",
    fare: 420,
  },
  {
    id: "comfort",
    name: "Biloo Comfort",
    description: "Newer cars with extra space",
    eta: "6 min",
    fare: 610,
  },
  {
    id: "xl",
    name: "Biloo XL",
    description: "Up to six passengers",
    eta: "8 min",
    fare: 790,
  },
] as const;
