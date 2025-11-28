import React from 'react';

export enum View {
  CLIENTS = 'CLIENTS',
  DASHBOARD = 'DASHBOARD',
  EVENTS = 'EVENTS',
  SCHEDULE = 'SCHEDULE',
  SERVICE_ORDERS = 'SERVICE_ORDERS',
  FINANCE = 'FINANCE',
  PRODUCTS = 'PRODUCTS',
  RENTALS = 'RENTALS',
  CALENDAR = 'CALENDAR',
  REPORTS = 'REPORTS',
  USERS = 'USERS',
  CONTRACTS = 'CONTRACTS'
}

export interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  role: string;
}

// Metalport Tendas - Types

export type UserRole = 'ADMIN' | 'COMERCIAL' | 'OPERACIONAL';

export type TentStatus = 'DISPONIVEL' | 'EM_MANUTENCAO' | 'INATIVA';
export type TentType = 'PIRAMIDAL' | 'CHAPEU_DE_BRUXA' | 'INDUSTRIAL' | 'CRISTAL';

export type RentalStatus =
  | 'ORCAMENTO'
  | 'CONFIRMADO'
  | 'EM_PREPARACAO'
  | 'EM_TRANSPORTE'
  | 'EM_INSTALACAO'
  | 'EM_ANDAMENTO'
  | 'EM_DESMONTAGEM'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type PaymentStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO' | 'BOLETO' | 'OUTRO';
export type ClientType = 'PF' | 'PJ';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Tent {
  id: string;
  code: string;
  description: string;
  width_m: number;
  length_m: number;
  area_m2: number;
  color: string;
  type: TentType;
  daily_rate_brl: number;
  status: TentStatus;
  stock_total: number; // Total quantity available in stock
  notes?: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  cpf_cnpj: string;
  phone_whatsapp: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_neighborhood?: string;
  address_city: string;
  address_state: string;
  address_zip?: string;
  notes?: string;
  created_at: string;
}

export interface Rental {
  id: string;
  client_id: string;
  client?: Client;
  event_name: string;
  event_address_street: string;
  event_address_number: string;
  event_address_neighborhood: string;
  event_address_city: string;
  event_address_state: string;
  start_date: string;
  end_date: string;
  status: RentalStatus;
  total_value_brl: number;
  discount_brl: number;
  delivery_fee_brl: number;
  notes?: string;
  created_at: string;
  rental_items?: RentalItem[];
  payments?: Payment[];
}

export interface RentalItem {
  id: string;
  rental_id: string;
  tent_id: string;
  tent?: Tent;
  quantity: number;
  daily_rate_brl: number;
  total_item_brl: number;
}

export interface Payment {
  id: string;
  rental_id: string;
  due_date: string;
  paid_date?: string;
  amount_brl: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
}
