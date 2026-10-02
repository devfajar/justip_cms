import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  Truck, 
  Package, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  MapPin,
  X
} from 'lucide-react';

export default function ShopperDashboard({ 
  orders, 
  setOrders, 
  kloters, 
  setKloters, 
  activeKloterId, 
  setActiveKloterId 
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'create-batch', 'catalog', 'reports'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Form state for Create Batch
  const [batchForm, setBatchForm] = useState({
    title: '',
    destination: 'Tokyo, Japan',
    flag: '🇯🇵',
    startDate: '',
    endDate: '',
    orderDeadline: '',
    quotaMax: 25,
    rules: "1. Berat max 2kg per pesanan\n2. Dilarang cairan >100ml\n3. Wajib DP/Lunas QRIS"
  });

  // Form state for Add Catalog Item
  const [catalogForm, setCatalogForm] = useState({
    name: '',
    category: 'Snack',
    price: '',
    fee: '',
    image: '',
    description: ''
  });
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  const currentKloter = kloters.find(k => k.id === activeKloterId) || kloters[0];
  const kloterOrders = orders.filter(o => o.kloterId === currentKloter?.id);

  // Statistics calculation
  const totalOrders = kloterOrders.length;
  const totalRevenue = kloterOrders.reduce((sum, o) => sum + (o.status !== 'PENDING' ? o.total : 0), 0);
  const quotaPct = currentKloter ? Math.round((currentKloter.quotaUsed / currentKloter.quotaMax) * 100) : 0;
  const pendingOrders = kloterOrders.filter(o => o.status === 'PAID').length; // Waiting to be purchased

  // Filter orders
  const filteredOrders = kloterOrders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Update order state (Order State Machine: PENDING -> PAID -> PURCHASED -> SHIPPED)
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const timeNow = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const noteMap = {
          PAID: "Pembayaran diverifikasi via Webhook",
          PURCHASED: "Barang berhasil dibeli Shopper di negara tujuan",
          SHIPPED: "Barang telah dikemas dan diserahkan ke jasa ekspedisi pengiriman"
        };
        return {
          ...o,
          status: newStatus,
          history: [
            ...o.history,
            { status: newStatus, time: timeNow, note: noteMap[newStatus] || `Status updated to ${newStatus}` }
          ]
        };
      }
      return o;
    }));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Bulk status update
  const handleBulkUpdateStatus = (newStatus) => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev => prev.map(o => {
      if (selectedOrderIds.includes(o.id)) {
        const timeNow = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...o,
          status: newStatus,
          history: [
            ...o.history,
            { status: newStatus, time: timeNow, note: `Bulk status update ke ${newStatus}` }
          ]
        };
      }
      return o;
    }));
    setSelectedOrderIds([]);
  };

  // Export CSV generator
  const handleExportCSV = () => {
    const headers = ["Order ID", "Kloter", "Pembeli", "Tipe", "Total (IDR)", "Status", "Tanggal Pesan"];
    const rows = kloterOrders.map(o => [
      o.id,
      `"${o.kloterTitle}"`,
      `"${o.buyerName}"`,
      o.type,
      o.total,
      o.status,
      o.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Jastip_${currentKloter.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Batch Submit
  const handleCreateBatch = (e) => {
    e.preventDefault();
    const newKloter = {
      id: `KLT-BATCH-${Date.now().toString().slice(-4)}`,
      title: batchForm.title || `Kloter Baru ke ${batchForm.destination}`,
      shopperId: "shp-01",
      shopperName: "Sarah Wijaya",
      shopperAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      destination: batchForm.destination,
      flag: batchForm.flag,
      startDate: batchForm.startDate || "2026-11-01",
      endDate: batchForm.endDate || "2026-11-06",
      orderDeadline: batchForm.orderDeadline || "2026-10-31 23:59",
      quotaMax: Number(batchForm.quotaMax) || 20,
      quotaUsed: 0,
      currencyRate: 110,
      rules: batchForm.rules.split("\n").filter(Boolean),
      status: "OPEN",
      catalog: []
    };
    setKloters([newKloter, ...kloters]);
    setActiveKloterId(newKloter.id);
    setActiveTab('orders');
  };

  // Add Catalog Item
  const handleAddCatalogItem = (e) => {
    e.preventDefault();
    if (!catalogForm.name || !catalogForm.price) return;
    const newItem = {
      id: `cat-${Date.now()}`,
      name: catalogForm.name,
      category: catalogForm.category,
      price: Number(catalogForm.price),
      fee: Number(catalogForm.fee) || 25000,
      image: catalogForm.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80",
      description: catalogForm.description || "Barang jastip pilihan"
    };

    setKloters(prev => prev.map(k => {
      if (k.id === currentKloter.id) {
        return {
          ...k,
          catalog: [...k.catalog, newItem]
        };
      }
      return k;
    }));

    setCatalogForm({ name: '', category: 'Snack', price: '', fee: '', image: '', description: '' });
    setShowCatalogModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Menunggu Pembayaran</span>;
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Lunas (Paid)</span>;
      case 'PURCHASED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Dibeli (Purchased)</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Dikirim (Shipped)</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
            J
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight">Justip Shopper</h1>
            <p className="text-xs text-slate-400">Web CMS & Dashboard</p>
          </div>
        </div>

        {/* Shopper Identity Card */}
        <div className="p-4 mx-3 my-4 bg-slate-800/70 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
            alt="Sarah Wijaya" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate flex items-center gap-1">
              Sarah Wijaya <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <p className="text-xs text-slate-400">840 Pengikut / Subscribed</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'orders' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Kelola Pesanan (Orders)</span>
          </button>

          <button
            onClick={() => setActiveTab('create-batch')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'create-batch' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Buka Kloter Baru (Batch)</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'catalog' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manajemen Katalog</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'reports' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan & Export CSV</span>
          </button>
        </nav>

        {/* Epic Architecture Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            PRD Epic 3: Shopper Platform
          </div>
          <p className="text-[11px] text-slate-500">State Machine, Bulk Actions, Quota, & CSV Export engine</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">Kloter Aktif:</span>
            <select
              value={activeKloterId}
              onChange={(e) => setActiveKloterId(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {kloters.map(k => (
                <option key={k.id} value={k.id}>
                  {k.flag} {k.title} ({k.destination})
                </option>
              ))}
            </select>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
              {currentKloter?.status || 'OPEN'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('create-batch')}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buka Kloter</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Pesanan</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{totalOrders}</p>
                <p className="text-xs text-emerald-600 mt-1">Kloter {currentKloter?.id}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Omset Terkumpul</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">Rp {(totalRevenue / 1000).toLocaleString('id-ID')}k</p>
                <p className="text-xs text-slate-500 mt-1">Pembayaran terverifikasi</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Kuota Terpakai</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{currentKloter?.quotaUsed} / {currentKloter?.quotaMax}</p>
                <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(quotaPct, 100)}%` }}></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Menunggu Belanja</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{pendingOrders}</p>
                <p className="text-xs text-amber-600 mt-1">Status: Paid (Lunas)</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* TAB 1: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Filter and Action Bar */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari ID Pesanan, Nama Pembeli, atau Produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    {['ALL', 'PENDING', 'PAID', 'PURCHASED', 'SHIPPED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                          statusFilter === st ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st === 'ALL' ? 'Semua' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs">
                    <span className="font-semibold text-emerald-800">{selectedOrderIds.length} dipilih:</span>
                    <button
                      onClick={() => handleBulkUpdateStatus('PURCHASED')}
                      className="px-2.5 py-1 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
                    >
                      Tandai Dibeli (Purchased)
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus('SHIPPED')}
                      className="px-2.5 py-1 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition"
                    >
                      Tandai Dikirim (Shipped)
                    </button>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds(filteredOrders.map(o => o.id));
                            } else {
                              setSelectedOrderIds([]);
                            }
                          }}
                          checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="p-4">ID Pesanan</th>
                      <th className="p-4">Pembeli</th>
                      <th className="p-4">Tipe & Item</th>
                      <th className="p-4">Total Pembayaran</th>
                      <th className="p-4">Status Pesanan</th>
                      <th className="p-4 text-right">Ubah Status / Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Tidak ada pesanan ditemukan sesuai kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isSelected = selectedOrderIds.includes(order.id);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrderIds([...selectedOrderIds, order.id]);
                                  } else {
                                    setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="p-4 font-mono font-medium text-slate-800 text-xs">
                              {order.id}
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800">{order.buyerName}</div>
                              <div className="text-xs text-slate-400">{order.buyerPhone}</div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  order.type === 'CUSTOM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {order.type}
                                </span>
                                <span className="font-medium text-slate-800 truncate">
                                  {order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                                </span>
                              </div>
                              {order.customNotes && (
                                <p className="text-xs text-slate-400 italic truncate mt-0.5">
                                  "{order.customNotes}"
                                </p>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-slate-800">
                              Rp {order.total.toLocaleString('id-ID')}
                              <div className="text-[11px] text-slate-400 font-normal">Metode: {order.paymentMethod}</div>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {/* State Transition Action Buttons */}
                              {order.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'PAID')}
                                  title="Verifikasi QRIS Webhook"
                                  className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition"
                                >
                                  Verifikasi Bayar
                                </button>
                              )}
                              {order.status === 'PAID' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'PURCHASED')}
                                  title="Tandai Sudah Dibelikan di Toko"
                                  className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                                >
                                  Tandai Dibeli
                                </button>
                              )}
                              {order.status === 'PURCHASED' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                  title="Kirim ke Alamat Pembeli"
                                  className="px-2.5 py-1 text-xs bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition"
                                >
                                  Kirim Barang
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded font-medium hover:bg-slate-200 transition"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE BATCH (MANAJEMEN JASTIP) */}
          {activeTab === 'create-batch' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm max-w-3xl">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">Form Buka Kloter Jastip Baru</h2>
                <p className="text-sm text-slate-500">Kloter yang Anda buka akan otomatis dipublikasikan ke Timeline Pembeli dan memicu notifikasi Subscriber.</p>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Kloter</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kloter Tokyo Autumn Special 🍁"
                      value={batchForm.title}
                      onChange={(e) => setBatchForm({ ...batchForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kota & Negara Tujuan</label>
                    <div className="flex gap-2">
                      <select
                        value={batchForm.destination}
                        onChange={(e) => {
                          const flagMap = {
                            "Tokyo, Japan": "🇯🇵",
                            "Bangkok, Thailand": "🇹🇭",
                            "Seoul, South Korea": "🇰🇷",
                            "Singapore": "🇸🇬",
                            "Paris, France": "🇫🇷"
                          };
                          setBatchForm({
                            ...batchForm,
                            destination: e.target.value,
                            flag: flagMap[e.target.value] || "✈️"
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Tokyo, Japan">Tokyo, Japan 🇯🇵</option>
                        <option value="Bangkok, Thailand">Bangkok, Thailand 🇹🇭</option>
                        <option value="Seoul, South Korea">Seoul, South Korea 🇰🇷</option>
                        <option value="Singapore">Singapore 🇸🇬</option>
                        <option value="Paris, France">Paris, France 🇫🇷</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Berangkat</label>
                    <input
                      type="date"
                      required
                      value={batchForm.startDate}
                      onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Kepulangan</label>
                    <input
                      type="date"
                      required
                      value={batchForm.endDate}
                      onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Maksimal Kuota (Slot)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={batchForm.quotaMax}
                      onChange={(e) => setBatchForm({ ...batchForm, quotaMax: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Aturan Kloter & Ketentuan Jastip</label>
                  <textarea
                    rows={4}
                    value={batchForm.rules}
                    onChange={(e) => setBatchForm({ ...batchForm, rules: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Tuliskan aturan berat, jenis barang yang dilarang, dan estimasi pengiriman..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Satu aturan per baris.</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-md transition"
                  >
                    Publikasikan Kloter & Kirim Notifikasi Push
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CATALOG MANAGEMENT */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Katalog Barang Bawaan Kloter: {currentKloter?.title}</h2>
                  <p className="text-sm text-slate-500">Daftar item rekomendasi yang bisa langsung dipesan oleh Buyer tanpa perlu repot custom request.</p>
                </div>
                <button
                  onClick={() => setShowCatalogModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Katalog</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentKloter?.catalog?.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-slate-800 shadow-sm">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Harga Barang:</div>
                          <div className="font-bold text-emerald-600">Rp {item.price.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Jasa Titip:</div>
                          <div className="font-semibold text-slate-700">+ Rp {item.fee.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS & EXPORT */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Rekapitulasi & Laporan Pesanan Jastip</h2>
                  <p className="text-sm text-slate-500">Sesuai PRD Epic 1 & 3: Rekapitulasi pesanan dalam bentuk CSV/Excel tanpa perlu manual input spreadsheet.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File Rekap (CSV/Excel)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">Total Transaksi</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">{kloterOrders.length} Pesanan</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">Akumulasi Fee Jastip</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    Rp {kloterOrders.reduce((sum, o) => sum + o.serviceFee, 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500">Status Pembayaran Otomatis</span>
                  <div className="text-xl font-bold text-slate-800 mt-1">100% QRIS Webhook</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Order Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Detail Pesanan {selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">Dibuat pada {selectedOrder.createdAt}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pembeli</span>
                <span className="font-semibold text-slate-800">{selectedOrder.buyerName} ({selectedOrder.buyerPhone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Saat Ini</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Items List */}
              <div className="py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Daftar Barang Titipan</span>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-50 p-2.5 rounded-lg">
                      <span className="font-medium text-slate-700">{it.name} (x{it.qty})</span>
                      <span className="font-semibold text-slate-800">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.customNotes && (
                <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
                  <span className="font-semibold">Catatan Pembeli:</span> {selectedOrder.customNotes}
                </div>
              )}

              {selectedOrder.customImageUrl && (
                <div className="mt-2">
                  <span className="text-xs text-slate-500">Foto Referensi Custom Request:</span>
                  <img src={selectedOrder.customImageUrl} alt="Custom" className="w-24 h-24 object-cover rounded-lg mt-1 border" />
                </div>
              )}

              {/* State Machine Transition Controls inside modal */}
              <div className="pt-4 border-t flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Update Tahap:</span>
                <div className="flex gap-2">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'PAID')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold"
                    >
                      Konfirmasi Lunas
                    </button>
                  )}
                  {selectedOrder.status === 'PAID' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'PURCHASED')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
                    >
                      Tandai Sudah Dibeli
                    </button>
                  )}
                  {selectedOrder.status === 'PURCHASED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold"
                    >
                      Tandai Sudah Dikirim
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Catalog Item */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-800">Tambah Barang Katalog Kloter</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCatalogItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royce Chocolate Bitter"
                  value={catalogForm.name}
                  onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Beli (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="150000"
                    value={catalogForm.price}
                    onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jasa Jastip (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={catalogForm.fee}
                    onChange={(e) => setCatalogForm({ ...catalogForm, fee: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                <select
                  value={catalogForm.category}
                  onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Snack">Snack & Makanan</option>
                  <option value="Skincare">Skincare & Kosmetik</option>
                  <option value="Fashion">Fashion & Aksesoris</option>
                  <option value="Gadget">Elektronik & Gadget</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">URL Gambar Produk</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={catalogForm.image}
                  onChange={(e) => setCatalogForm({ ...catalogForm, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                >
                  Simpan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
