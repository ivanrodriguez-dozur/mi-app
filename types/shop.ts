export type ShopCategory = {
  id: string;
  label: string;
};

export type ShopProductType = 'clothing' | 'shoe' | 'accessory' | 'gear';

export type ShopProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  isNew?: boolean;
  description?: string;
  reviews?: number;
  gallery?: string[];
  type?: ShopProductType;
  availableSizes?: string[];
};
