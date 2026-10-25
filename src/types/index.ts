export type IndustryCategory = 
  | "thrift" 
  | "jewellery" 
  | "handloom" 
  | "lifestyle";

export type SellingMode = "fixed_price" | "auction";

export type SizeTag = "Free Size" | "S" | "M" | "L" | "XL" | "Oversized" | "One Size";

export interface SellerProfile {
  id: string;
  handle: string; // e.g. "imphalthrift"
  name: string;
  avatar: string;
  isVerified: boolean;
  followerCount: number;
  totalSales: number;
  rating: number; // e.g. 4.9
  location: string; // e.g. "Yaiskul, Imphal West"
  bio: string;
}

export interface ProductItem {
  id: string;
  sellerId: string;
  seller: SellerProfile;
  title: string;
  description: string;
  category: IndustryCategory;
  mode: SellingMode;
  price: number; // Current price or Buy Now price
  
  // Auction specific
  isAuction: boolean;
  isDropTeaser?: boolean;
  startTime?: string;
  startingBid?: number;
  currentBid?: number;
  bidCount?: number;
  endTime?: string; // ISO string
  minIncrement?: number; // default: 50
  
  // Sizing & Measurements
  sizeTag: SizeTag;
  chestInches?: number;
  lengthInches?: number;
  isVerifiedFit?: boolean;
  
  // Flaw disclosure
  hasFlaw: boolean;
  flawNote?: string;
  flawImage?: string;
  
  // Media & Stock
  images: string[];
  stockQuantity: number;
  isSoldOut: boolean;
  soldDurationMinutes?: number; // e.g. "Sold in 14 mins"
  
  createdAt: string;
}

export interface StoryShowcaseItem {
  id: string;
  productId: string;
  name: string;
  dimensionLabel: string; // e.g. "23 × 26 in" or "Silk Zari"
  price: number;
  thumbnailUrl: string;
  badgeText?: string;
}

export interface StoryThemeConfig {
  id: "mint" | "violet" | "amber" | "rose";
  blobStart: string;
  blobEnd: string;
  accentHex: string;
  softBgHex: string;
  orbPrimary: string;
  orbSecondary: string;
  textTint: string;
  svgPath: string;
}

export interface BoutiqueStory {
  id: string;
  sellerId: string;
  sellerHandle: string;
  sellerName?: string;
  sellerLocation?: string;
  sellerAvatar: string;
  mediaUrl: string;
  type: "new_drop" | "live_auction" | "artisan_craft";
  title: string;
  productId?: string;
  ctaText?: string;
  hasUnseen?: boolean;
  // 3D Orbital Showcase Extensions
  heroDisplayLines?: [string, string]; // e.g. ["Rani", "Phi"]
  vaultTitle?: string; // e.g. "Artisan Loom"
  floatingTag?: string; // e.g. "Fly-Shuttle Silk"
  theme?: StoryThemeConfig;
  showcaseItems?: StoryShowcaseItem[];
}

export interface BidRecord {
  id: string;
  auctionId: string;
  bidderMasked: string; // e.g. "B***m"
  amount: number;
  timestamp: string;
}

export type OrderStatus = 
  | "PAID_ESCROW_LOCKED"
  | "READY_FOR_PICKUP"
  | "IN_TRANSIT"
  | "DELIVERED_INSPECTION_WINDOW"
  | "COMPLETED_SETTLED"
  | "DISPUTE_LOCKED";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  district: string;
  leikai: string;
  landmark: string;
  gateNotes?: string;
  latitude?: number;
  longitude?: number;
}
