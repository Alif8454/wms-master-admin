
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

  // Persistence (Simulated)
  useEffect(() => {
    const saved = localStorage.getItem('warehouse_items');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('warehouse_items', JSON.stringify(items));
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
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: item.quantity === 0 ? 'Out of Stock' : item.quantity! < 10 ? 'Low Stock' : 'In Stock'
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
    if (window.confirm('Are you sure you want to delete this item?')) {
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
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 hidden md:flex flex-col fixed h-full shadow-xl z-20 transition-all duration-300 ease-in-out`}
      >
        {/* Hamburger Above Logo */}
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start px-6'}`}>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            aria-label="Toggle Sidebar"
          >
            <Icons.Menu />
          </button>
        </div>

        {/* Logo Section */}
        <div className={`px-6 pb-6 pt-2 flex items-center space-x-3 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="min-w-[40px] w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <Icons.Inventory />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              WMS Master
            </span>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-2 px-3 space-y-2 overflow-hidden">
          <a href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20`}>
            <div className="min-w-[20px]"><Icons.Dashboard /></div>
            {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">Dashboard</span>}
          </a>
          <a href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 text-slate-400`}>
            <div className="min-w-[20px]"><Icons.Inventory /></div>
            {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">Inventory</span>}
          </a>
          
          <div className={`pt-4 pb-2 ${isSidebarCollapsed ? 'text-center' : 'px-4'} uppercase text-[10px] font-semibold text-slate-500 tracking-widest`}>
            {isSidebarCollapsed ? '•' : 'Master Data'}
          </div>
          
          <a href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 text-slate-400`}>
            <div className="min-w-[20px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7"/></svg>
            </div>
            {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">Categories</span>}
          </a>
          <a href="#" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200 text-slate-400`}>
            <div className="min-w-[20px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">Locations</span>}
          </a>
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t border-slate-800 transition-all ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 p-2 bg-slate-800/50 rounded-lg'} overflow-hidden`}>
            <img src="https://picsum.photos/40/40" alt="Admin" className="min-w-[40px] w-10 h-10 rounded-full ring-2 ring-blue-600" />
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">Warehouse Admin</p>
                <p className="text-xs text-slate-500 truncate">Master Control</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-4 md:p-8 transition-all duration-300 ease-in-out bg-gray-50`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm md:text-base">Track your inventory levels and system status in real-time.</p>
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
          <StatsCard 
            label="Total Items" 
            value={stats.totalItems} 
            icon={<div className="text-blue-600"><Icons.Inventory /></div>} 
            color="bg-blue-50"
          />
          <StatsCard 
            label="Inventory Value" 
            value={`$${stats.totalValue.toLocaleString()}`} 
            icon={<div className="text-emerald-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>} 
            color="bg-emerald-50"
          />
          <StatsCard 
            label="Low Stock" 
            value={stats.lowStockCount} 
            icon={<div className="text-amber-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m9.05 14.82 2.95-2.95"/></svg></div>} 
            color="bg-amber-50"
          />
          <StatsCard 
            label="Out of Stock" 
            value={stats.outOfStockCount} 
            icon={<div className="text-rose-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>} 
            color="bg-rose-50"
          />
        </section>

        {/* Inventory List Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icons.Search />
                </div>
                {/* Search Input Color fix: bg-white */}
                <input
                  type="text"
                  placeholder="Search SKU or item name..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Category Select Color fix: bg-white */}
              <select
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
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
            <div className="text-sm text-gray-500 font-medium bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
              <span className="text-gray-900 font-bold">{filteredItems.length}</span> items found
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.length > 0 ? filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                        item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                        item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                        'bg-rose-50 text-rose-700 ring-rose-600/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Icons.Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 rounded-2xl mb-4 text-gray-400">
                          <Icons.Search />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No items match your search</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Try refining your search terms or changing filters to find what you're looking for.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> of <span className="font-bold text-gray-900">{items.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700 shadow-sm" disabled>Previous</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700 shadow-sm" disabled>Next</button>
            </div>
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
