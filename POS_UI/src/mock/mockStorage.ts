// POS-F&B In-Memory State Container with LocalStorage & Listeners

import {
  Store,
  Branch,
  DiningTable,
  Category,
  Product,
  Size,
  ProductSize,
  Topping,
  CategoryTopping,
  Ingredient,
  ProductSizeIngredient,
  ToppingIngredient,
  BranchIngredientStock,
  StockMovement,
  WorkShift,
  CashReconciliation,
  ShiftExpense,
  Invoice,
  PromotionCode,
} from '../types/entities';
import { User, PermissionCode } from '../types/auth';
import {
  INITIAL_STORES,
  INITIAL_BRANCHES,
  INITIAL_TABLES,
  INITIAL_CATEGORIES,
  INITIAL_SIZES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_SIZES,
  INITIAL_TOPPINGS,
  INITIAL_CATEGORY_TOPPINGS,
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_TOPPING_RECIPES,
  INITIAL_BRANCH_STOCKS,
  INITIAL_USERS,
  INITIAL_WORK_SHIFTS,
  INITIAL_CASH_RECONCILIATIONS,
  INITIAL_SHIFT_EXPENSES,
  INITIAL_PROMOTIONS,
  INITIAL_INVOICES,
  INITIAL_STOCK_MOVEMENTS,
  DEFAULT_ROLE_PERMISSIONS,
} from './seedData';

export interface MockState {
  stores: Store[];
  branches: Branch[];
  tables: DiningTable[];
  categories: Category[];
  sizes: Size[];
  products: Product[];
  productSizes: ProductSize[];
  toppings: Topping[];
  categoryToppings: CategoryTopping[];
  ingredients: Ingredient[];
  recipes: ProductSizeIngredient[];
  toppingRecipes: ToppingIngredient[];
  branchStocks: BranchIngredientStock[];
  stockMovements: StockMovement[];
  users: User[];
  workShifts: WorkShift[];
  cashReconciliations: CashReconciliation[];
  shiftExpenses: ShiftExpense[];
  promotions: PromotionCode[];
  invoices: Invoice[];
  rolePermissions: Record<string, PermissionCode[]>;
  currentUserId: string;
  selectedBranchId: string; // Chi nhánh đang được chọn (cho OWNER hoặc cố định cho Staff)
  isOfflineSimulated: boolean; // Giả lập mất mạng
}

const STORAGE_KEY = 'pos_fb_mock_v1';

// Custom JSON serializer for bigint
function serialize(obj: unknown): string {
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'bigint') {
      return { __bigint: value.toString() };
    }
    return value;
  });
}

function deserialize<T>(jsonStr: string): T {
  return JSON.parse(jsonStr, (_, value) => {
    if (value && typeof value === 'object' && '__bigint' in value) {
      return BigInt(value.__bigint);
    }
    return value;
  });
}

function getInitialState(): MockState {
  return {
    stores: [...INITIAL_STORES],
    branches: [...INITIAL_BRANCHES],
    tables: [...INITIAL_TABLES],
    categories: [...INITIAL_CATEGORIES],
    sizes: [...INITIAL_SIZES],
    products: [...INITIAL_PRODUCTS],
    productSizes: [...INITIAL_PRODUCT_SIZES],
    toppings: [...INITIAL_TOPPINGS],
    categoryToppings: [...INITIAL_CATEGORY_TOPPINGS],
    ingredients: [...INITIAL_INGREDIENTS],
    recipes: [...INITIAL_RECIPES],
    toppingRecipes: [...INITIAL_TOPPING_RECIPES],
    branchStocks: [...INITIAL_BRANCH_STOCKS],
    stockMovements: [...INITIAL_STOCK_MOVEMENTS],
    users: [...INITIAL_USERS],
    workShifts: [...INITIAL_WORK_SHIFTS],
    cashReconciliations: [...INITIAL_CASH_RECONCILIATIONS],
    shiftExpenses: [...INITIAL_SHIFT_EXPENSES],
    promotions: [...INITIAL_PROMOTIONS],
    invoices: [...INITIAL_INVOICES],
    rolePermissions: { ...DEFAULT_ROLE_PERMISSIONS },
    currentUserId: 'user-cashier-nl', // Mặc định Thu ngân Nam Lý có ca đang mở
    selectedBranchId: 'branch-nl',
    isOfflineSimulated: false,
  };
}

class MockStorage {
  private state: MockState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): MockState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return deserialize<MockState>(saved);
      }
    } catch (e) {
      console.warn('Lỗi khi nạp mock state từ localStorage:', e);
    }
    return getInitialState();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, serialize(this.state));
    } catch (e) {
      console.warn('Lỗi khi lưu mock state:', e);
    }
  }

  public getState(): MockState {
    return this.state;
  }

  public setState(updater: (prev: MockState) => Partial<MockState>) {
    const nextUpdates = updater(this.state);
    this.state = {
      ...this.state,
      ...nextUpdates,
    };
    this.saveToStorage();
    this.notify();
  }

  public resetToSeed() {
    this.state = getInitialState();
    this.saveToStorage();
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const mockStorage = new MockStorage();
