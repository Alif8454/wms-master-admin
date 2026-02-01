
export type Category = 'Electronics' | 'Furniture' | 'Office Supplies' | 'Apparel' | 'Food & Beverage';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: Category;
  quantity: number;
  price: number;
  location: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}
