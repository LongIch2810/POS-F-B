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
};
