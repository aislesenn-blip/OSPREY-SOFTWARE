export type FoodItem = {
  id: string
  name: string
  businessName: string
  distance: string
  originalPrice: number
  kijikoPrice: number
  quantity: number
  pickupStart: string
  pickupEnd: string
  image: string
  itemsList: string[]
  category: string
  address: string
}

export type Order = {
  id: string
  foodItem: FoodItem
  quantity: number
  totalPrice: number
  status: 'upcoming' | 'completed' | 'cancelled'
  pickupCode: string
  date: string
}

export const mockFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Chicken & Chips",
    businessName: "Mambo Restaurant",
    distance: "1.2 km",
    originalPrice: 8000,
    kijikoPrice: 4000,
    quantity: 2,
    pickupStart: "18:30",
    pickupEnd: "19:00",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600",
    itemsList: ["1 Quarter Chicken", "1 Large Portion Chips", "Salad (Kachumbari)"],
    category: "Fast Food",
    address: "Ali Hassan Mwinyi Rd, Dar es Salaam"
  },
  {
    id: "2",
    name: "Beef Biryani",
    businessName: "Zanzibar Spice House",
    distance: "2.5 km",
    originalPrice: 12000,
    kijikoPrice: 6000,
    quantity: 4,
    pickupStart: "19:00",
    pickupEnd: "19:30",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    itemsList: ["Beef Biryani", "1 Banana", "Pili Pili sauce"],
    category: "Local Food",
    address: "Kariakoo, Dar es Salaam"
  },
  {
    id: "3",
    name: "Chapati & Beans",
    businessName: "Mama Lishe Corner",
    distance: "0.5 km",
    originalPrice: 4000,
    kijikoPrice: 2000,
    quantity: 5,
    pickupStart: "17:00",
    pickupEnd: "18:00",
    image: "https://images.unsplash.com/photo-1626074961596-caa8721660f5?auto=format&fit=crop&q=80&w=600",
    itemsList: ["3 Chapati", "1 Bowl Yellow Beans"],
    category: "Local Food",
    address: "Kinondoni, Dar es Salaam"
  },
  {
    id: "4",
    name: "Assorted Pastries",
    businessName: "City Bakery",
    distance: "3.0 km",
    originalPrice: 10000,
    kijikoPrice: 5000,
    quantity: 3,
    pickupStart: "20:00",
    pickupEnd: "21:00",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    itemsList: ["2 Croissants", "1 Meat Pie", "1 Donut"],
    category: "Bakery",
    address: "Masaki, Dar es Salaam"
  }
]

export const mockOrders: Order[] = [
  {
    id: "ORD-1234",
    foodItem: mockFoodItems[0],
    quantity: 1,
    totalPrice: 4000,
    status: 'upcoming',
    pickupCode: "KJ-8921",
    date: new Date().toISOString()
  },
  {
    id: "ORD-1235",
    foodItem: mockFoodItems[1],
    quantity: 2,
    totalPrice: 12000,
    status: 'completed',
    pickupCode: "KJ-4452",
    date: new Date(Date.now() - 86400000).toISOString() // yesterday
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
