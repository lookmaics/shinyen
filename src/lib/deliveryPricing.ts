import { IndustryCategory } from "@/types";

export type DeliveryZone = "zone_1_core" | "zone_2_valley" | "zone_3_hills";
export type DeliveryMethod = 
  | "std_doorstep" 
  | "express_same_day" 
  | "pudo_bazar" 
  | "winger_counter";

export interface DeliveryOption {
  id: DeliveryMethod;
  name: string;
  description: string;
  fee: number;
  riderCut: number;
  bagPool: number;
  insurancePool: number;
  estimatedHours: string;
}

export function getDeliveryZone(district: string): DeliveryZone {
  const d = district.toLowerCase();
  if (d.includes("imphal")) {
    return "zone_1_core";
  }
  if (d.includes("thoubal") || d.includes("kakching") || d.includes("bishnupur")) {
    return "zone_2_valley";
  }
  return "zone_3_hills"; // Churachandpur, Ukhrul, Senapati, etc.
}

export function getAvailableDeliveryOptions(district: string): DeliveryOption[] {
  const zone = getDeliveryZone(district);

  if (zone === "zone_1_core") {
    return [
      {
        id: "std_doorstep",
        name: "Standard Next-Day (24h)",
        description: "Doorstep delivery via Lookmai gig rider",
        fee: 50,
        riderCut: 45,
        bagPool: 3,
        insurancePool: 2,
        estimatedHours: "Within 24 Hours",
      },
      {
        id: "express_same_day",
        name: "Express Same-Day (4h)",
        description: "Priority bike dispatch within 4 hours",
        fee: 90,
        riderCut: 80,
        bagPool: 5,
        insurancePool: 5,
        estimatedHours: "Within 4 Hours",
      },
    ];
  }

  if (zone === "zone_2_valley") {
    return [
      {
        id: "pudo_bazar",
        name: "Bazar PUDO Pickup",
        description: "Pick up from our partner shop in Main Bazar",
        fee: 50,
        riderCut: 45,
        bagPool: 3,
        insurancePool: 2,
        estimatedHours: "Next Day 12 PM",
      },
      {
        id: "std_doorstep",
        name: "Town Doorstep Delivery",
        description: "Direct to your leikai doorstep",
        fee: 80,
        riderCut: 72,
        bagPool: 5,
        insurancePool: 3,
        estimatedHours: "Within 36 Hours",
      },
    ];
  }

  // Zone 3: Hills (Churachandpur, Ukhrul, Senapati)
  return [
    {
      id: "winger_counter",
      name: "Winger Counter Transit",
      description: "Pick up at district Winger counter (Khuman Lampak route)",
      fee: 75,
      riderCut: 65,
      bagPool: 5,
      insurancePool: 5,
      estimatedHours: "Within 48 Hours",
    },
    {
      id: "std_doorstep",
      name: "Hill Town Doorstep Delivery",
      description: "Delivered to local town address",
      fee: 115,
      riderCut: 100,
      bagPool: 8,
      insurancePool: 7,
      estimatedHours: "2-3 Days",
    },
  ];
}

export function calculatePlatformFee(
  itemPrice: number,
  category: IndustryCategory
): { platformFeeRate: number; platformFeeAmount: number } {
  let rate = 0.07; // default thrift 7%

  if (category === "jewellery") {
    rate = 0.08; // 8%
  } else if (category === "handloom") {
    rate = 0.05; // 5% for artisans
  } else if (category === "lifestyle") {
    rate = 0.06; // 6%
  }

  const feeAmount = Math.round(itemPrice * rate);
  return {
    platformFeeRate: rate,
    platformFeeAmount: feeAmount,
  };
}
