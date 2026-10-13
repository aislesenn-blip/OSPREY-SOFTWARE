export type Package = {
  id: string
  name: string
  mealCount: number
  price: number
  description: string
}

export type PickupPoint = {
  id: string
  name: string
  address: string
}

export type TimeWindow = {
  id: string
  start: string
  end: string
}

export type FoodItem = {
  id: string
  name: string
  quantity: number
  image: string
  itemsList: string[]
  category: string
}

export type Order = {
  id: string
  foodItem: FoodItem
  quantity: number
  status: 'upcoming' | 'completed' | 'cancelled'
  pickupCode: string
  date: string
  pickupPoint: PickupPoint
  timeWindow: TimeWindow
}

export const mockPackages: Package[] = [
  {
    id: "PKG-3",
    name: "Starter Pack",
    mealCount: 3,
    price: 15000,
    description: "Perfect for trying out Whemsy meals."
  },
  {
    id: "PKG-6",
    name: "Standard Pack",
    mealCount: 6,
    price: 28000,
    description: "Great for regular meals throughout the week."
  },
  {
    id: "PKG-12",
    name: "Pro Pack",
    mealCount: 12,
    price: 54000,
    description: "Best value for frequent eaters."
  }
]

export const mockPickupPoints: PickupPoint[] = [
  {
    id: "LOC-1",
    name: "Main Campus Library",
    address: "University Road, Dar es Salaam"
  },
  {
    id: "LOC-2",
    name: "Student Union Building",
    address: "Campus Square"
  },
  {
    id: "LOC-3",
    name: "Science Block Courtyard",
    address: "North Campus"
  }
]

export const mockTimeWindows: TimeWindow[] = [
  { id: "TW-1", start: "12:00", end: "13:30" },
  { id: "TW-2", start: "13:30", end: "15:00" },
  { id: "TW-3", start: "17:30", end: "19:00" }
]

export const mockFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Chicken & Chips",
    quantity: 20,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600",
    itemsList: ["1 Quarter Chicken", "1 Large Portion Chips", "Salad (Kachumbari)"],
    category: "Filling Meals"
  },
  {
    id: "2",
    name: "Beef Biryani",
    quantity: 15,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    itemsList: ["Beef Biryani", "1 Banana", "Pili Pili sauce"],
    category: "Local Food"
  },
  {
    id: "3",
    name: "Chapati & Beans",
    quantity: 30,
    image: "https://images.unsplash.com/photo-1626074961596-caa8721660f5?auto=format&fit=crop&q=80&w=600",
    itemsList: ["3 Chapati", "1 Bowl Yellow Beans"],
    category: "Local Food"
  },
  {
    id: "4",
    name: "Coconut Rice & Fish",
    quantity: 10,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    itemsList: ["Coconut Rice", "Fried Fish", "Vegetables"],
    category: "Seafood"
  }
]

export const mockOrders: Order[] = [
  {
    id: "ORD-1234",
    foodItem: mockFoodItems[0],
    quantity: 1,
    status: 'upcoming',
    pickupCode: "WH-8921",
    date: new Date().toISOString(),
    pickupPoint: mockPickupPoints[0],
    timeWindow: mockTimeWindows[0]
  },
  {
    id: "ORD-1235",
    foodItem: mockFoodItems[1],
    quantity: 1,
    status: 'completed',
    pickupCode: "WH-4452",
    date: new Date(Date.now() - 86400000).toISOString(), // yesterday
    pickupPoint: mockPickupPoints[1],
    timeWindow: mockTimeWindows[1]
  }
]

export const formatTZS = (amount: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
