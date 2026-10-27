// POS-F&B Domain Entities per DESIGN_DB_POS_SYSTEM.md & PRODUCT_OVERVIEW.md

export type StoreStatus = 'ACTIVE' | 'SUSPENDED';

export interface Store {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status: StoreStatus;
  suspended_reason?: string;
  suspended_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  store_id: string;
  name: string;
  code: string; // ví dụ "NL", "DH"
  initial_cash: bigint; // Quỹ tiền ban đầu của két
  is_active: boolean;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface DiningTable {
  id: string;
  branch_id: string;
  name: string;
  area: string; // Tầng 1, Sân vườn, v.v.
  seat_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  is_active: boolean;
  description?: string;
}

export interface Size {
  id: string;
  store_id: string;
  name: string; // S, M, L...
  sort_order: number;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size_id: string;
  price: bigint; // Đơn giá hiện tại (VND)
}

export interface Topping {
  id: string;
  store_id: string;
  name: string;
  price: bigint;
  is_active: boolean;
}

export interface CategoryTopping {
  category_id: string;
  topping_id: string;
}

export interface Ingredient {
  id: string;
  store_id: string;
  name: string;
  unit: string; // g, ml, quả, cái...
  is_active: boolean;
}

export interface ProductSizeIngredient {
  product_size_id: string;
  ingredient_id: string;
  quantity: number; // Lượng dùng cho 1 ly món size này
}

export interface ToppingIngredient {
  topping_id: string;
  ingredient_id: string;
  quantity: number; // Lượng dùng cho 1 phần topping
}

export interface BranchIngredientStock {
  branch_id: string;
  ingredient_id: string;
  current_stock: number; // Tồn thực tế (có thể âm nếu bán vượt tồn)
  min_stock: number; // Ngưỡng tối thiểu
}

export type StockMovementType = 'SALE' | 'SALE_REVERSAL' | 'IMPORT';

export interface StockMovement {
  id: string;
  branch_id: string;
  ingredient_id: string;
  movement_type: StockMovementType;
  quantity: number; // Số lượng xuất (âm) hoặc nhập/hoàn (dương)
  balance_after: number; // Tồn sau giao dịch
  invoice_id?: string;
  note?: string;
  created_at: string;
}

export type ShiftType = 'CASHIER' | 'STAFF';
export type ShiftStatus = 'OPEN' | 'CLOSED';
export type ReconcileStatus = 'PENDING' | 'MATCHED' | 'SHORTAGE' | 'OVERAGE';

export interface WorkShift {
  id: string;
  store_id: string;
  branch_id: string;
  user_id: string;
  shift_type: ShiftType;
  status: ShiftStatus;
  started_at: string;
  ended_at?: string;
  closed_by?: string;
  close_reason?: string;
  force_closed_by?: string;
}

export interface CashReconciliation {
  id: string;
  work_shift_id: string;
  opening_cash: bigint; // Tiền đầu ca (chỉ đọc)
  cash_sales_amount: bigint; // Doanh thu tiền mặt từ đơn PAID
  expense_amount: bigint; // Khoản chi từ két
  expected_cash: bigint; // Tiền hệ thống tính phải có trong két
  counted_cash: bigint; // Tiền thu ngân đếm thực tế
  difference: bigint; // counted_cash - expected_cash
  status: ReconcileStatus;
  note?: string;
  created_at: string;
}

export interface ShiftExpense {
  id: string;
  work_shift_id: string;
  amount: bigint;
  reason: string;
  paid_from_drawer: boolean;
  created_at: string;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY';
export type InvoiceStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface InvoiceItemTopping {
  id: string;
  invoice_item_id: string;
  topping_id: string;
  topping_name_snapshot: string;
  unit_price_snapshot: bigint;
  quantity: number;
  line_total: bigint;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_size_id: string;
  product_name_snapshot: string;
  size_name_snapshot: string;
  unit_price_snapshot: bigint;
  quantity: number;
  toppings: InvoiceItemTopping[];
  line_total: bigint; // (unit_price + sum(topping_price * topping_qty)) * quantity
  notes?: string;
}

export type DiscountType = 'PERCENT' | 'FIXED';

export interface PromotionCode {
  id: string;
  store_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: bigint; // % hoặc số tiền VND
  max_discount_amount: bigint;
  min_order_amount: bigint;
  start_at: string;
  end_at: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

export interface InvoicePromotionCode {
  invoice_id: string;
  promotion_code_id: string;
  code_snapshot: string;
  discount_amount: bigint;
}

export type PaymentMethod = 'CASH' | 'TRANSFER';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: bigint; // Số tiền tính cho hóa đơn
  method: PaymentMethod;
  tendered_amount: bigint; // Tiền khách đưa (tiền mặt)
  change_amount: bigint; // Tiền thối (tiền mặt)
  transaction_ref?: string; // Mã giao dịch chuyển khoản
  idempotency_key: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  store_id: string;
  branch_id: string;
  work_shift_id: string;
  dining_table_id?: string; // null nếu là TAKEAWAY
  order_type: OrderType;
  user_id: string;
  invoice_code: string; // ví dụ "NL-20261027-0001"
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: bigint;
  discount_amount: bigint;
  total_amount: bigint;
  applied_promotion?: InvoicePromotionCode;
  payments: Payment[];
  cancel_reason?: string;
  cancelled_by?: string;
  created_at: string;
  paid_at?: string;
  cancelled_at?: string;
}
