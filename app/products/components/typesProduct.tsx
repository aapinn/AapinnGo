export interface Product {
  _id: string;
  name: string;
  variants: string[];
  active: boolean;
  roomId?: string;
  adminUid?: string;
}