import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, DashboardStats, Category } from './types';
import { INITIAL_ITEMS, Icons } from './constants';
import { StatsCard } from './components/StatsCard';
import { ItemModal } from './components/ItemModal';

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Persistence dengan Error Handling
  useEffect(() => {
    try {
      const saved = localStorage.getItem('warehouse_items');
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setItems(parsedData);
        }
      }
    } catch (error) {
      console.error("Failed to load items from storage:", error);
      // Fallback ke INITIAL_ITEMS sudah dilakukan di useState
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('warehouse_items', JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save items:", error);
    }
  }, [items]);

  // Derived Stats
  const stats: DashboardStats = useMemo(() => {
    return {
      totalItems: items.length,
      totalValue: items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
      lowStockCount: items.filter(i => i.quantity > 0 && i.quantity < 10).length,
      outOfStockCount: items.filter(i => i.quantity === 0).length,
    };
  }, [items]);

  // CRUD Operations
  const handleAddItem = (item: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      ...item as InventoryItem,
      id: Math.random().toString(36).substring(2, 11),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: item.quantity === 0 ? 'Out of Stock' : (item.quantity || 0) < 10 ? 'Low Stock' : 'In Stock'
    };
    setItems([newItem, ...items]);
  };

  const handleUpdateItem = (updatedItem: Partial<InventoryItem>) => {
    setItems(items.map(item => {
      if (item.id === updatedItem.id) {
        const quantity = updatedItem.quantity ?? item.quantity;
        return {
          ...item,
          ...updatedItem,
          lastUpdated: new Date().toISOString().split('T')[0],
          status: quantity === 0 ? 'Out of Stock' : quantity < 10 ? 'Low Stock' : 'In Stock'
        } as InventoryItem;
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    const confirmDelete = window.confirm('DAPATKAN VERSI FULL: Anda yakin ingin menghapus?');
    if (confirmDelete) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredItems = items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const skuMatch = item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || skuMatch;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 hidden md:flex flex-col fixed h-full shadow-xl z-20 transition-all duration-300 ease-in-out`}
      >
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start px-6'}`}>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <Icons.Menu />
          </button>
        </div>

        <div className={`px-6 pb-6 pt-2 flex items-center space-x-3 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="min-w-[40px] w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <Icons.Inventory />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap">
              WMS Master
            </span>
          )}
        </div>
        
        <nav className="flex-1 mt-2 px-3 space-y-2 overflow-hidden">
          <a href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20`}>
            <div className="min-w-[20px]"><Icons.Dashboard /></div>
            {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </a>
          <a href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 text-slate-400`}>
            <div className="min-w-[20px]"><Icons.Inventory /></div>
            {!isSidebarCollapsed && <span className="font-medium">Inventory</span>}
          </a>
        </nav>

        <div className={`p-4 border-t border-slate-800 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 p-2 bg-slate-800/50 rounded-lg'} overflow-hidden`}>
            <img src="https://picsum.photos/40/40" alt="Admin" className="min-w-[40px] w-10 h-10 rounded-full ring-2 ring-blue-600" />
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">@alifdev</p>
                <p className="text-xs text-slate-500 truncate">Developer Mode</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-4 md:p-8 transition-all duration-300 ease-in-out bg-gray-50`}>
        {/* Banner */}
        <div className="mb-6 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-800 text-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span><strong>DEMO PREVIEW:</strong> Template Dashboard untuk Toko Online / Gudang.</span>
          </div>
          <button className="text-xs font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 px-3 py-1 rounded-lg transition-colors">
            INFO FULL VERSION
          </button>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back, @alifdev. Manage your items efficiently.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Icons.Plus />
            <span>Add New Item</span>
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard label="Total Items" value={stats.totalItems} icon={<div className="text-blue-600"><Icons.Inventory /></div>} color="bg-blue-50" />
          <StatsCard label="Value" value={`$${stats.totalValue.toLocaleString()}`} icon={<div className="text-emerald-600"><Icons.Dashboard /></div>} color="bg-emerald-50" />
          <StatsCard label="Low Stock" value={stats.lowStockCount} icon={<div className="text-amber-600"><Icons.Menu /></div>} color="bg-amber-50" />
          <StatsCard label="Out of Stock" value={stats.outOfStockCount} icon={<div className="text-rose-600"><Icons.Close /></div>} color="bg-rose-50" />
        </section>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Search item..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Apparel">Apparel</option>
                <option value="Food & Beverage">Food & Beverage</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.length > 0 ? filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEditModal(item)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Icons.Edit /></button>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"><Icons.Delete /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No items found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        initialItem={editingItem}
      />
    </div>
  );
};

export default App;