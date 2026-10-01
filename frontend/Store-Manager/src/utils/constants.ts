import { Home, ShoppingBag, Truck } from 'lucide-react';

export const calmSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.8,
}
export const overlaySpring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 34,
  mass: 0.9,
}

export const navigation = [
  { label: "Home", icon: Home },
  { label: "Orders", icon: ShoppingBag },
  { label: "Deliveries", icon: Truck },
]
