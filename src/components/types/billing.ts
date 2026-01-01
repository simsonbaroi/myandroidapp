export interface InventoryItem {
  id: number;
  name: string;
  strength?: string;
  price: number;
  type?: string;
  category?: string;
}

export interface BillItem extends InventoryItem {
  qty: number;
  subtotal: number;
}

export type ViewType = 'home' | 'outpatient' | 'inpatient' | 'pricing' | 'patients';

export const INPATIENT_CATEGORIES = [
  "Medicine",
  "Laboratory",
  "Blood",
  "Surgery, O.R. & Delivery",
  "Registration Fees",
  "Physical Therapy",
  "Limb and Brace",
  "Food",
  "Halo, O2, NO2, etc.",
  "Orthopedic, S.Roll, etc.",
  "IV.'s",
  "Discharge Medicine",
  "Procedures",
  "Seat & Ad. Fee"
];
