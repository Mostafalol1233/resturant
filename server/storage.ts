import {
  users,
  products,
  categories,
  orders,
  orderItems,
  inventoryTransactions,
  notifications,
  restaurants,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type InventoryTransaction,
  type InsertInventoryTransaction,
  type Notification,
  type InsertNotification,
  type Restaurant,
  type InsertRestaurant,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gte, lte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Restaurant operations
  getRestaurant(): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  updateProductStock(id: number, quantity: number): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Order operations
  getOrders(limit?: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]>;
  getOrderById(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined>;
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  deleteOrder(id: number): Promise<void>;

  // Inventory operations
  getInventoryTransactions(productId?: number): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;

  // Notification operations
  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;

  // Analytics operations
  getDailyStats(date?: Date): Promise<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  }>;
  getTopProducts(limit?: number, startDate?: Date, endDate?: Date): Promise<{
    product: Product;
    soldQuantity: number;
    revenue: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Restaurant operations
  async getRestaurant(): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).limit(1);
    return restaurant;
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  async updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant> {
    const [updatedRestaurant] = await db
      .update(restaurants)
      .set({ ...restaurant, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return updatedRestaurant;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.name));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(asc(products.name));
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          eq(products.trackInventory, true),
          sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
        )
      );
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

  async updateProductStock(id: number, quantity: number): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ 
        stockQuantity: sql`${products.stockQuantity} + ${quantity}`,
        updatedAt: new Date() 
      })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  // Order operations
  async getOrders(limit = 50): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] })[]> {
    const ordersWithItems = await db.query.orders.findMany({
      limit,
      orderBy: [desc(orders.createdAt)],
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
    return ordersWithItems;
  }

  async getOrderById(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product })[] }) | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
    });
    return order;
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate)))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id,
      }));
      
      await tx.insert(orderItems).values(orderItemsWithOrderId);
      
      // Update product stock for items that track inventory
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (product && product.trackInventory) {
          await tx
            .update(products)
            .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
            .where(eq(products.id, item.productId));
          
          // Create inventory transaction
          await tx.insert(inventoryTransactions).values({
            productId: item.productId,
            type: "sale",
            quantity: -item.quantity,
            unitCost: item.unitPrice,
            totalCost: item.totalPrice,
            reference: `Order #${newOrder.orderNumber}`,
            createdBy: order.createdBy,
          });
        }
      }
      
      return newOrder;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));
      await tx.delete(orders).where(eq(orders.id, id));
    });
  }

  // Inventory operations
  async getInventoryTransactions(productId?: number): Promise<InventoryTransaction[]> {
    const query = db.select().from(inventoryTransactions);
    
    if (productId) {
      return await query.where(eq(inventoryTransactions.productId, productId)).orderBy(desc(inventoryTransactions.createdAt));
    }
    
    return await query.orderBy(desc(inventoryTransactions.createdAt)).limit(100);
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
    
    // Update product stock
    if (transaction.productId) {
      await this.updateProductStock(transaction.productId, transaction.quantity);
    }
    
    return newTransaction;
  }

  // Notification operations
  async getNotifications(userId?: string): Promise<Notification[]> {
    const query = db.select().from(notifications);
    
    if (userId) {
      return await query.where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    }
    
    return await query.orderBy(desc(notifications.createdAt)).limit(50);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Analytics operations
  async getDailyStats(date = new Date()): Promise<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        totalOrders: count(orders.id),
        averageOrderValue: sql<number>`COALESCE(AVG(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfDay),
          lte(orders.createdAt, endOfDay),
          eq(orders.paymentStatus, "paid")
        )
      );

    return stats[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
  }

  async getTopProducts(limit = 5, startDate?: Date, endDate?: Date): Promise<{
    product: Product;
    soldQuantity: number;
    revenue: number;
  }[]> {
    let dateFilter = sql`1=1`;
    
    if (startDate && endDate) {
      dateFilter = and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate));
    } else if (startDate) {
      const today = new Date(startDate);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter = and(gte(orders.createdAt, today), lte(orders.createdAt, tomorrow));
    }

    const topProducts = await db
      .select({
        product: products,
        soldQuantity: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`SUM(${orderItems.totalPrice})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(dateFilter)
      .groupBy(products.id)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(limit);

    return topProducts;
  }
}

export const storage = new DatabaseStorage();
