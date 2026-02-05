export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  minimum_stock: number;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  quantity: number;
  type: 'receive' | 'issue' | 'transfer';
  status: string;
  created_at: string;
}
