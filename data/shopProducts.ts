import { ShopProduct } from '../types/shop';

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'hoodie-blue',
    name: 'Wake - Hoodie Azul',
    brand: 'Wake Officials',
    price: 129,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    description:
      'Sudadera premium de Wake Officials hecha con algodón orgánico. Edición limitada con interior afelpado y capucha ajustable.',
    reviews: 10000,
    gallery: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    ],
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'hoodie-red',
    name: 'Wake - Hoodie Rojo',
    brand: 'Wake Officials',
    price: 129,
    image: 'https://images.unsplash.com/photo-1531771686035-25f47595c87a?auto=format&fit=crop&w=600&q=80',
    description:
      'Hoodie rojo con corte oversized y bolsillos laterales. Ideal para días fríos con estilo urbano.',
    reviews: 8600,
    gallery: [
      'https://images.unsplash.com/photo-1531771686035-25f47595c87a?auto=format&fit=crop&w=900&q=80',
    ],
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'jacket-green',
    name: 'Urban Jacket',
    brand: 'Wake Officials',
    price: 142,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    description:
      'Chaqueta impermeable con interior térmico. Pensada para quienes buscan estilo y protección.',
    reviews: 5400,
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'sneaker-white',
    name: 'Air Flow Sneaker',
    brand: 'Nova',
    price: 158,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
    description:
      'Zapatillas de malla transpirable con suela memory foam que entregan soporte durante todo el día.',
    reviews: 12500,
    type: 'shoe',
    availableSizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
  },
  {
    id: 'pants-black',
    name: 'Future Joggers',
    brand: 'Urban Edge',
    price: 98,
    image: 'https://images.unsplash.com/photo-1582738413179-0de6d1aac9f7?auto=format&fit=crop&w=600&q=80',
    description:
      'Joggers negros con paneles elásticos y bolsillos con cierre invisible. Perfectos para uso diario.',
    reviews: 4300,
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'ball-pro',
    name: 'Pro Match Ball',
    brand: 'Futsal Pro',
    price: 75,
    image: 'https://images.unsplash.com/photo-1603985558168-3895efefd2d5?auto=format&fit=crop&w=600&q=80',
    description: 'Balón profesional cosido a mano con recubrimiento antideslizante para partidos de alta velocidad.',
    reviews: 3100,
    type: 'gear',
  },
];
