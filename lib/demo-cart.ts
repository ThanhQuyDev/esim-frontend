"use client";

import { addToCart, getCart } from "@/lib/cart";

/**
 * Seeds the cart with demo items for UI preview.
 * Only adds items if the cart is currently empty.
 */
export function seedDemoCart(): void {
  const cart = getCart();
  if (cart.items.length > 0) return;

  const demoItems = [
    {
      id: "plan-japan-5gb-7d",
      name: "Japan eSIM - 5GB",
      description: "5GB data plan for Japan, valid for 7 days. 4G/LTE speed.",
      price: 8.99,
      image: "/demo-img.jpg",
      destination: "Japan",
      dataMb: 5120,
      durationDays: 7,
    },
    {
      id: "plan-thailand-10gb-30d",
      name: "Thailand eSIM - 10GB",
      description: "10GB data plan for Thailand, valid for 30 days. 4G/LTE speed with hotspot.",
      price: 14.99,
      image: "/demo-img.jpg",
      destination: "Thailand",
      dataMb: 10240,
      durationDays: 30,
    },
    {
      id: "plan-europe-20gb-30d",
      name: "Europe eSIM - 20GB",
      description: "20GB data plan covering 30+ European countries, valid for 30 days.",
      price: 29.99,
      image: "/demo-img.jpg",
      destination: "Europe (30+ countries)",
      dataMb: 20480,
      durationDays: 30,
    },
    {
      id: "plan-usa-unlimited-15d",
      name: "USA eSIM - Unlimited",
      description: "Unlimited data plan for the United States, valid for 15 days.",
      price: 24.99,
      image: "/demo-img.jpg",
      destination: "United States",
      dataMb: 9999999,
      durationDays: 15,
    },
  ];

  for (const item of demoItems) {
    addToCart(item, 1);
  }
}
