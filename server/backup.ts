
import { Client } from '@replit/object-storage';
import { storage } from './storage';

export class BackupService {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async createBackup(): Promise<string> {
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
          orders: await storage.getOrders(1000), // آخر 1000 طلب
          inventoryTransactions: await storage.getInventoryTransactions(),
          notifications: await storage.getNotifications()
        }
      };

      // حفظ البيانات في Object Storage
      await this.client.uploadFromText(
        backupFileName,
        JSON.stringify(backupData, null, 2)
      );

      return backupFileName;
    } catch (error) {
      console.error('خطأ في إنشاء الباك أب:', error);
      throw new Error('فشل في إنشاء الباك أب');
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      const objects = await this.client.list();
      return objects
        .filter(obj => obj.key.startsWith('backup-') && obj.key.endsWith('.json'))
        .map(obj => obj.key)
        .sort()
        .reverse(); // الأحدث أولاً
    } catch (error) {
      console.error('خطأ في جلب قائمة الباك أب:', error);
      throw new Error('فشل في جلب قائمة الباك أب');
    }
  }

  async restoreBackup(backupFileName: string): Promise<void> {
    try {
      // جلب ملف الباك أب
      const backupContent = await this.client.downloadAsText(backupFileName);
      const backupData = JSON.parse(backupContent);

      console.log(`بدء استعادة الباك أب: ${backupFileName}`);

      // استعادة المطعم
      if (backupData.data.restaurant) {
        const existingRestaurant = await storage.getRestaurant();
        if (existingRestaurant) {
          await storage.updateRestaurant(existingRestaurant.id, backupData.data.restaurant);
        } else {
          await storage.createRestaurant(backupData.data.restaurant);
        }
      }

      // استعادة الفئات
      if (backupData.data.categories) {
        for (const category of backupData.data.categories) {
          try {
            const { id, createdAt, updatedAt, ...categoryData } = category;
            await storage.createCategory(categoryData);
          } catch (error) {
            console.log(`تخطي الفئة الموجودة: ${category.name}`);
          }
        }
      }

      // استعادة المنتجات
      if (backupData.data.products) {
        for (const product of backupData.data.products) {
          try {
            const { id, createdAt, updatedAt, ...productData } = product;
            await storage.createProduct(productData);
          } catch (error) {
            console.log(`تخطي المنتج الموجود: ${product.name}`);
          }
        }
      }

      console.log('تم استعادة الباك أب بنجاح');
    } catch (error) {
      console.error('خطأ في استعادة الباك أب:', error);
      throw new Error('فشل في استعادة الباك أب');
    }
  }

  async deleteBackup(backupFileName: string): Promise<void> {
    try {
      await this.client.delete(backupFileName);
    } catch (error) {
      console.error('خطأ في حذف الباك أب:', error);
      throw new Error('فشل في حذف الباك أب');
    }
  }

  async downloadBackup(backupFileName: string): Promise<string> {
    try {
      return await this.client.downloadAsText(backupFileName);
    } catch (error) {
      console.error('خطأ في تحميل الباك أب:', error);
      throw new Error('فشل في تحميل الباك أب');
    }
  }

  async scheduleAutoBackup(): Promise<void> {
    // إنشاء باك أب تلقائي كل 24 ساعة
    setInterval(async () => {
      try {
        const backupFileName = await this.createBackup();
        console.log(`تم إنشاء باك أب تلقائي: ${backupFileName}`);
        
        // الاحتفاظ بآخر 7 نسخ فقط
        const backups = await this.listBackups();
        if (backups.length > 7) {
          for (let i = 7; i < backups.length; i++) {
            await this.deleteBackup(backups[i]);
          }
        }
      } catch (error) {
        console.error('خطأ في الباك أب التلقائي:', error);
      }
    }, 24 * 60 * 60 * 1000); // كل 24 ساعة
  }
}

export const backupService = new BackupService();
