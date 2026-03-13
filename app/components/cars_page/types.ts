export const CATEGORIES = ["Wszystkie", "ekonomiczny", "komfort", "premium", "SUV", "van"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "ekonomiczny" | "komfort" | "premium" | "SUV" | "van";
  price_per_day: number;
  images: string[];
  seats?: number;
  gearbox: string;
  fuel_type: string;
  status: string;
  mileage?: number;
  color?: string;
  description?: string;
  features?: string[];
  license_plate?: string;
}

export const MAX_PRICE = 16000;