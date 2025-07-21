import {
  users,
  categories,
  products,
  favorites,
  cartItems,
  orders,
  sellerApplications,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Favorite,
  type InsertFavorite,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type SellerApplication,
  type InsertSellerApplication,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getRecommendedProducts(limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Favorites operations
  getUserFavorites(userId: string): Promise<Product[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: number): Promise<void>;
  isProductFavorited(userId: string, productId: number): Promise<boolean>;
  
  // Cart operations
  getUserCart(userId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  getUserOrders(userId: string): Promise<Order[]>;
  getSellerOrders(sellerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Seller application operations
  getSellerApplications(): Promise<SellerApplication[]>;
  createSellerApplication(application: InsertSellerApplication): Promise<SellerApplication>;
  updateSellerApplicationStatus(id: number, status: string): Promise<SellerApplication>;
  getUserSellerApplication(userId: string): Promise<SellerApplication | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(categoryId?: number): Promise<Product[]> {
    if (categoryId) {
      return await db.select().from(products)
        .where(and(eq(products.isApproved, true), eq(products.categoryId, categoryId)))
        .orderBy(desc(products.createdAt));
    }
    return await db.select().from(products)
      .where(eq(products.isApproved, true))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isApproved, true)))
      .orderBy(desc(products.createdAt));
  }

  async getRecommendedProducts(limit = 4): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isApproved, true))
      .orderBy(desc(products.favoriteCount))
      .limit(limit);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Favorites operations
  async getUserFavorites(userId: string): Promise<Product[]> {
    const userFavorites = await db
      .select({ product: products })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId));
    
    return userFavorites.map(f => f.product);
  }

  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    
    // Update favorite count
    const count = await db.select({ count: favorites.id }).from(favorites).where(eq(favorites.productId, favorite.productId));
    await db
      .update(products)
      .set({ favoriteCount: count.length })
      .where(eq(products.id, favorite.productId));
    
    return newFavorite;
  }

  async removeFromFavorites(userId: string, productId: number): Promise<void> {
    await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
    
    // Update favorite count
    const count = await db.select({ count: favorites.id }).from(favorites).where(eq(favorites.productId, productId));
    await db
      .update(products)
      .set({ favoriteCount: count.length })
      .where(eq(products.id, productId));
  }

  async isProductFavorited(userId: string, productId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
    return !!favorite;
  }

  // Cart operations
  async getUserCart(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, cartItem.userId), eq(cartItems.productId, cartItem.productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
    return newCartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.sellerId, sellerId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Seller application operations
  async getSellerApplications(): Promise<SellerApplication[]> {
    return await db.select().from(sellerApplications).orderBy(desc(sellerApplications.createdAt));
  }

  async createSellerApplication(application: InsertSellerApplication): Promise<SellerApplication> {
    const [newApplication] = await db.insert(sellerApplications).values(application).returning();
    return newApplication;
  }

  async updateSellerApplicationStatus(id: number, status: string): Promise<SellerApplication> {
    const [updatedApplication] = await db
      .update(sellerApplications)
      .set({ status })
      .where(eq(sellerApplications.id, id))
      .returning();
    return updatedApplication;
  }

  async getUserSellerApplication(userId: string): Promise<SellerApplication | undefined> {
    const [application] = await db
      .select()
      .from(sellerApplications)
      .where(eq(sellerApplications.userId, userId))
      .orderBy(desc(sellerApplications.createdAt));
    return application;
  }
}

export const storage = new DatabaseStorage();
