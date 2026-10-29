// Product & Recipe Service Layer (API Ready)

import { mockStorage } from '../../mock/mockStorage';
import { MockEngine } from '../../mock/mockEngine';
import {
  Category,
  Product,
  Size,
  ProductSize,
  Topping,
  CategoryTopping,
  Ingredient,
  ProductSizeIngredient,
  ToppingIngredient,
  PromotionCode,
} from '../../types/entities';

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

  createCategory(name: string, sortOrder?: number): Promise<Category> {
    return Promise.resolve(MockEngine.createCategory(name, sortOrder));
  },

  updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category> {
    return Promise.resolve(MockEngine.updateCategory(categoryId, updates));
  },

  toggleCategoryActive(categoryId: string): Promise<Category> {
    return Promise.resolve(MockEngine.toggleCategoryActive(categoryId));
  },

  createProduct(categoryId: string, name: string, description?: string): Promise<Product> {
    return Promise.resolve(MockEngine.createProduct(categoryId, name, description));
  },

  updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    return Promise.resolve(MockEngine.updateProduct(productId, updates));
  },

  toggleProductActive(productId: string): Promise<Product> {
    return Promise.resolve(MockEngine.toggleProductActive(productId));
  },

  updateProductSizePrice(productSizeId: string, price: bigint): Promise<ProductSize> {
    return Promise.resolve(MockEngine.updateProductSizePrice(productSizeId, price));
  },

  getToppings(storeId: string): Topping[] {
    return mockStorage.getState().toppings.filter((t) => t.store_id === storeId);
  },

  createTopping(name: string, price: bigint): Promise<Topping> {
    return Promise.resolve(MockEngine.createTopping(name, price));
  },

  updateTopping(toppingId: string, updates: Partial<Topping>): Promise<Topping> {
    return Promise.resolve(MockEngine.updateTopping(toppingId, updates));
  },

  toggleToppingActive(toppingId: string): Promise<Topping> {
    return Promise.resolve(MockEngine.toggleToppingActive(toppingId));
  },

  getCategoryToppings(): CategoryTopping[] {
    return mockStorage.getState().categoryToppings;
  },

  linkToppingToCategory(categoryId: string, toppingId: string): Promise<void> {
    MockEngine.linkToppingToCategory(categoryId, toppingId);
    return Promise.resolve();
  },

  unlinkToppingFromCategory(categoryId: string, toppingId: string): Promise<void> {
    MockEngine.unlinkToppingFromCategory(categoryId, toppingId);
    return Promise.resolve();
  },

  getToppingRecipes(toppingId: string): (ToppingIngredient & { ingredientName: string; unit: string })[] {
    const state = mockStorage.getState();
    const recipes = state.toppingRecipes.filter((r) => r.topping_id === toppingId);
    return recipes.map((r) => {
      const ing = state.ingredients.find((i) => i.id === r.ingredient_id)!;
      return {
        ...r,
        ingredientName: ing ? ing.name : 'Chưa rõ',
        unit: ing ? ing.unit : '',
      };
    });
  },

  saveToppingRecipe(toppingId: string, ingredients: { ingredient_id: string; quantity: number }[]): Promise<void> {
    MockEngine.saveToppingRecipe(toppingId, ingredients);
    return Promise.resolve();
  },

  saveProductSizeRecipe(productSizeId: string, ingredients: { ingredient_id: string; quantity: number }[]): Promise<void> {
    MockEngine.saveProductSizeRecipe(productSizeId, ingredients);
    return Promise.resolve();
  },

  getPromotions(storeId: string): PromotionCode[] {
    return mockStorage.getState().promotions.filter((p) => p.store_id === storeId);
  },

  createPromotion(promo: Omit<PromotionCode, 'id' | 'used_count'>): Promise<PromotionCode> {
    return Promise.resolve(MockEngine.createPromotion(promo));
  },

  updatePromotion(promoId: string, updates: Partial<PromotionCode>): Promise<PromotionCode> {
    return Promise.resolve(MockEngine.updatePromotion(promoId, updates));
  },

  togglePromotionActive(promoId: string): Promise<PromotionCode> {
    return Promise.resolve(MockEngine.togglePromotionActive(promoId));
  },

  getSizes(storeId: string): Size[] {
    return mockStorage.getState().sizes.filter((s) => s.store_id === storeId);
  },
};
