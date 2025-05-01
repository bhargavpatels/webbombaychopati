export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  cover?: string; // Optional cover image for 750ml products
  sizes: ProductSize[];
}

export interface ProductSize {
  id?: string;  // ID from the API for the specific size
  size: string;
  price: number;
  mrp: number;
  status?: string; // "In Stock" or "Out of Stock"
}
