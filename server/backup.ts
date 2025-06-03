
import { storage } from './storage';

export class BackupService {
  private isAvailable = false;

  constructor() {
    // Don't initialize anything on startup
  }

  private async checkAvailability(): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Backup service unavailable - Object Storage not configured. Please contact support for backup functionality.');
    }
  }

  async createBackup(): Promise<string> {
    await this.checkAvailability();
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.json`;

      // جمع جميع البيانات
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
          restaurant: await storage.getRestaurant(),
          categories: await storage.getCategories(),
          products: await storage.getProducts(),
          orders: await storage.getOrders(1000),
          inventoryTransactions: await storage.getInventoryTransactions(),
          notifications: await storage.getNotifications()
        }
      };

      // For now, return the backup data as downloadable content
      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('خطأ في إنشاء الباك أب:', error);
      throw new Error('فشل في إنشاء الباك أب');
    }
  }

  async listBackups(): Promise<string[]> {
    await this.checkAvailability();
    return [];
  }

  async restoreBackup(backupFileName: string): Promise<void> {
    await this.checkAvailability();
    throw new Error('Restore functionality requires Object Storage configuration');
  }

  async deleteBackup(backupFileName: string): Promise<void> {
    await this.checkAvailability();
    throw new Error('Delete functionality requires Object Storage configuration');
  }

  async downloadBackup(backupFileName: string): Promise<string> {
    await this.checkAvailability();
    throw new Error('Download functionality requires Object Storage configuration');
  }

  async scheduleAutoBackup(): Promise<void> {
    // Don't schedule automatic backups if storage is not available
    console.log('Auto backup disabled - Object Storage not configured');
  }
}

export const backupService = new BackupService();
