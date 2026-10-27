// Inventory Service Layer (API Ready)

import { MockEngine } from '../mock/mockEngine';
import { mockStorage } from '../mock/mockStorage';
import { Ingredient, BranchIngredientStock, StockMovement } from '../types/entities';

export interface IngredientStockItem {
  ingredient: Ingredient;
  stock: BranchIngredientStock;
}

export const inventoryService = {
  getStocksByBranch(branchId?: string): IngredientStockItem[] {
    const state = mockStorage.getState();
    const targetBranch = branchId || MockEngine.getEffectiveBranchId();
    if (!targetBranch) return [];

    const branchStocks = state.branchStocks.filter((bs) => bs.branch_id === targetBranch);

    return branchStocks.map((stock) => {
      const ingredient = state.ingredients.find((i) => i.id === stock.ingredient_id)!;
      return { ingredient, stock };
    });
  },

  getStockMovements(branchId?: string): StockMovement[] {
    const state = mockStorage.getState();
    const targetBranch = branchId || MockEngine.getEffectiveBranchId();
    let movements = state.stockMovements;
    if (targetBranch) {
      movements = movements.filter((m) => m.branch_id === targetBranch);
    }
    return movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getIngredientCatalog(storeId?: string): Ingredient[] {
    const state = mockStorage.getState();
    const targetStore = storeId || MockEngine.getCurrentUser().store_id;
    return state.ingredients.filter((i) => i.store_id === targetStore);
  },

  createIngredient(name: string, unit: string): Promise<Ingredient> {
    return Promise.resolve(MockEngine.createIngredient(name, unit));
  },

  updateIngredient(ingredientId: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    return Promise.resolve(MockEngine.updateIngredient(ingredientId, updates));
  },

  toggleIngredientActive(ingredientId: string): Promise<Ingredient> {
    return Promise.resolve(MockEngine.toggleIngredientActive(ingredientId));
  },

  // BR-49: Kiểm tra món nào chưa có công thức định lượng để hiển thị cảnh báo
  getProductsLackingRecipe(storeId?: string): { productName: string; sizeName: string }[] {
    const state = mockStorage.getState();
    const targetStore = storeId || MockEngine.getCurrentUser().store_id;
    const storeCategories = state.categories.filter((c) => c.store_id === targetStore).map((c) => c.id);
    const storeProducts = state.products.filter((p) => storeCategories.includes(p.category_id) && p.is_active);

    const lackingList: { productName: string; sizeName: string }[] = [];
    storeProducts.forEach((prod) => {
      const pSizes = state.productSizes.filter((ps) => ps.product_id === prod.id);
      pSizes.forEach((ps) => {
        const hasRecipe = state.recipes.some((r) => r.product_size_id === ps.id);
        if (!hasRecipe) {
          const sizeObj = state.sizes.find((s) => s.id === ps.size_id);
          lackingList.push({
            productName: prod.name,
            sizeName: sizeObj?.name || 'Tiêu chuẩn',
          });
        }
      });
    });

    return lackingList;
  },
};
