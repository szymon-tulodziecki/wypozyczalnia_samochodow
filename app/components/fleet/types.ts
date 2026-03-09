export const CATEGORIES = ["Wszystkie", "Sedan", "SUV", "Van", "Premium"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Car {
  id: number;
  name: string;
  category: "Sedan" | "SUV" | "Van" | "Premium";
  price: number;
  img: string;
  seats: number;
  transmission: string;
  fuel: string;
}

export const MAX_PRICE = 1500;

export const cars: Car[] = [
  { id: 1, name: "Audi A6",             category: "Sedan",   price: 420,  img: "/auto.jpg", seats: 5, transmission: "Automat",  fuel: "Diesel"  },
  { id: 2, name: "BMW 5 Series",        category: "Sedan",   price: 480,  img: "/auto.jpg", seats: 5, transmission: "Automat",  fuel: "Benzyna" },
  { id: 3, name: "Mercedes GLE",        category: "SUV",     price: 560,  img: "/auto.jpg", seats: 5, transmission: "Automat",  fuel: "Diesel"  },
  { id: 4, name: "Volkswagen Touareg",  category: "SUV",     price: 490,  img: "/auto.jpg", seats: 5, transmission: "Automat",  fuel: "Diesel"  },
  { id: 5, name: "Mercedes V-Class",    category: "Van",     price: 520,  img: "/auto.jpg", seats: 8, transmission: "Automat",  fuel: "Diesel"  },
  { id: 6, name: "Ford Tourneo",        category: "Van",     price: 360,  img: "/auto.jpg", seats: 9, transmission: "Manualna", fuel: "Diesel"  },
  { id: 7, name: "Porsche Panamera",    category: "Premium", price: 980,  img: "/auto.jpg", seats: 4, transmission: "Automat",  fuel: "Benzyna" },
  { id: 8, name: "Bentley Flying Spur", category: "Premium", price: 1400, img: "/auto.jpg", seats: 5, transmission: "Automat",  fuel: "Benzyna" },
];
