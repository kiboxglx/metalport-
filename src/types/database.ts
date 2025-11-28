export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  rg: string | null;
  cpf: string | null;
  notes: string | null;
  created_at: string;
}

export interface Tent {
  id: string;
  name: string;
  size: string | null;
  daily_price: number;
  total_stock: number;
  created_at: string;
}

export interface Rental {
  id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'awaiting_payment' | 'confirmed' | 'ongoing' | 'collecting' | 'finished' | 'cancelled';
  total_value: number;
  notes: string | null;
  created_at: string;
  customer?: Customer;
  payment_method?: string | null;
  discount?: number | null;
  daily_rate?: number | null;
  delivery_fee?: number | null;
  installation_date?: string | null;
  installation_time?: string | null;
}

export interface RentalItem {
  id: string;
  rental_id: string;
  tent_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  tent?: Tent;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  daily_rental_price: number;
  total_stock: number;
  category: string | null;
  created_at: string;
}

export interface RentalProductItem {
  id: string;
  rental_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  product?: Product;
}

export interface RentalWithItems extends Rental {
  rental_items: RentalItem[];
  rental_product_items?: RentalProductItem[];
}

export type CustomerInsert = Omit<Customer, 'id' | 'created_at'>;
export type CustomerUpdate = Partial<CustomerInsert>;

export type TentInsert = Omit<Tent, 'id' | 'created_at'>;
export type TentUpdate = Partial<TentInsert>;

export type RentalInsert = Omit<Rental, 'id' | 'created_at' | 'customer'>;
export type RentalItemInsert = Omit<RentalItem, 'id' | 'created_at' | 'tent'>;
export type RentalProductItemInsert = Omit<RentalProductItem, 'id' | 'created_at' | 'product'>;
