// Product & Recipe Service Layer (API Ready)

import { mockStorage } from '../mock/mockStorage';
import {
  Category,
  Product,
  Size,
  ProductSize,
  Topping,
  CategoryTopping,
  Ingredient,
  ProductSizeIngredient,
} from '../types/entities';

export interface ProductDetailItem {
  product: Product;
  category: Category;
  sizes: (ProductSize & { sizeName: string; hasRecipe: boolean })[];
}

export const productService = {
  getProductsWithDetails(storeId: string): ProductDetailItem[] {
    const state = mockStorage.getState();
    const categories = state.categories.filter((c) => c.store_id === storeId);
    const products = state.products.filter((p) => {
      const cat = categories.find((c) => c.id === p.category_id);
      return !!cat;
    });

    return products.map((product) => {
      const category = categories.find((c) => c.id === product.category_id)!;
      const prodSizes = state.productSizes.filter((ps) => ps.product_id === product.id);

      const enrichedSizes = prodSizes.map((ps) => {
        const sizeObj = state.sizes.find((s) => s.id === ps.size_id);
        const hasRecipe = state.recipes.some((r) => r.product_size_id === ps.id);
        return {
          ...ps,
          sizeName: sizeObj?.name || '',
          hasRecipe,
        };
      });

      return {
        product,
        category,
        sizes: enrichedSizes,
      };
    });
  },

  getAllIngredients(storeId: string): Ingredient[] {
    return mockStorage.getState().ingredients.filter((i) => i.store_id === storeId);
  },

  getRecipesForProductSize(productSizeId: string): (ProductSizeIngredient & { ingredientName: string; unit: string })[] {
    const state = mockStorage.getState();
    const recipes = state.recipes.filter((r) => r.product_size_id === productSizeId);
    return recipes.map((r) => {
      const ing = state.ingredients.find((i) => i.id === r.ingredient_id)!;
      return {
        ...r,
        ingredientName: ing.name,
        unit: ing.unit,
      };
    });
  },

  saveRecipe(productSizeId: string, ingredientId: string, quantity: number): Promise<void> {
    mockStorage.setState((prev) => {
      const filtered = prev.recipes.filter(
        (r) => !(r.product_size_id === productSizeId && r.ingredient_id === ingredientId)
      );
      if (quantity > 0) {
        filtered.push({ product_size_id: productSizeId, ingredient_id: ingredientId, quantity });
      }
      return { recipes: filtered };
    });
    return Promise.resolve();
  },

  getCategories(storeId: string): Category[] {
    return mockStorage.getState().categories.filter((c) => c.store_id === storeId);
  },

  getToppings(storeId: string): Topping[] {
    return mockStorage.getState().toppings.filter((t) => t.store_id === storeId);
  },

  getCategoryToppings(): CategoryTopping[] {
    return mockStorage.getState().categoryToppings;
  },

  getSizes(storeId: string): Size[] {
    return mockStorage.getState().sizes.filter((s) => s.store_id === storeId);
  },
};
