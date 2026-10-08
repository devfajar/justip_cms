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
  CheckCircle2,
  Truck, 
  Package, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  MapPin,
  X,
  ShieldCheck,
  Bell,
  Sliders,
  DollarSign,
  Luggage,
  Sparkles,
  ExternalLink,
  Phone,
  MessageSquare,
  LogOut
} from 'lucide-react';

export default function ShopperDashboard({ 
  orders, 
  setOrders, 
  kloters, 
  setKloters, 
  activeKloterId, 
  setActiveKloterId,
  shoppers,
  setShoppers,
  currentUser,
  onLogout,
  backendOnline
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'batches', 'catalog', 'reports', 'kyc'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [notificationToast, setNotificationToast] = useState(null);

  // Form state for Create Batch
  const [batchForm, setBatchForm] = useState({
    title: '',
    destination: 'Tokyo, Japan',
    flag: '🇯🇵',
    startDate: '',
    endDate: '',
    orderDeadline: '',
    quotaMax: 25,
    rules: "1. Maksimal berat barang titipan per pesanan 2 kg\n2. Dilarang cairan >100ml dalam bagasi kabin\n3. Wajib menyertakan foto & catatan jelas untuk custom request\n4. Pembayaran DP 50% atau Lunas via QRIS otomatis"
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
  const [trackingInput, setTrackingInput] = useState('');

  const currentKloter = kloters.find(k => k.id === activeKloterId) || kloters[0];
  const kloterOrders = orders.filter(o => o.kloterId === currentKloter?.id);

  // Statistics calculation
  const totalOrders = kloterOrders.length;
  const totalGMV = kloterOrders.reduce((sum, o) => sum + (o.status !== 'PENDING' ? o.total : 0), 0);
  const totalShopperFee = kloterOrders.reduce((sum, o) => sum + (o.status !== 'PENDING' ? o.serviceFee : 0), 0);
  const quotaPct = currentKloter ? Math.round((currentKloter.quotaUsed / currentKloter.quotaMax) * 100) : 0;
  const pendingOrders = kloterOrders.filter(o => o.status === 'PAID').length; // Waiting to be purchased
  const purchasedOrders = kloterOrders.filter(o => o.status === 'PURCHASED').length;
  const shippedOrders = kloterOrders.filter(o => o.status === 'SHIPPED').length;

  // Filter orders
  const filteredOrders = kloterOrders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const showToast = (message) => {
    setNotificationToast(message);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Update order state (Order State Machine: PENDING -> PAID -> PURCHASED -> SHIPPED)
  const handleUpdateStatus = (orderId, newStatus, customTracking = '') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const timeNow = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const noteMap = {
          PAID: "Pembayaran diverifikasi otomatis via QRIS Webhook",
          PURCHASED: "Barang berhasil dibeli Shopper di store negara tujuan",
          SHIPPED: `Barang telah dikirim melalui kurir ekspedisi ${customTracking || 'JP-EXP-001'}`
        };
        const updated = {
          ...o,
          status: newStatus,
          trackingNo: customTracking || o.trackingNo,
          history: [
            ...o.history,
            { status: newStatus, time: timeNow, note: noteMap[newStatus] || `Status updated to ${newStatus}` }
          ]
        };
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return o;
    }));

    showToast(`✓ Status pesanan ${orderId} berhasil diubah ke ${newStatus}`);
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
            { status: newStatus, time: timeNow, note: `Bulk status update ke ${newStatus} oleh Shopper` }
          ]
        };
      }
      return o;
    }));

    showToast(`✓ ${selectedOrderIds.length} pesanan berhasil diperbarui massal ke status ${newStatus}`);
    setSelectedOrderIds([]);
  };

  // Export CSV generator
  const handleExportCSV = () => {
    const headers = ["Order ID", "Kloter", "Pembeli", "Kontak WhatsApp", "Tipe", "Total (IDR)", "Fee Shopper (IDR)", "Status", "No Resi", "Tanggal Pesan"];
    const rows = kloterOrders.map(o => [
      o.id,
      `"${o.kloterTitle}"`,
      `"${o.buyerName}"`,
      `"${o.buyerPhone}"`,
      o.type,
      o.total,
      o.serviceFee,
      o.status,
      `"${o.trackingNo || '-'}"`,
      o.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Jastip_${currentKloter.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`✓ Laporan CSV untuk kloter ${currentKloter.id} berhasil diunduh!`);
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
      quotaMax: Number(batchForm.quotaMax) || 25,
      quotaUsed: 0,
      currencyRate: 110,
      rules: batchForm.rules.split("\n").filter(Boolean),
      status: "OPEN",
      catalog: []
    };

    setKloters([newKloter, ...kloters]);
    setActiveKloterId(newKloter.id);
    setActiveTab('orders');
    showToast(`🚀 Kloter ${newKloter.title} berhasil dipublikasikan! Event Pub-Sub broadcast dikirim ke 840 subscriber.`);
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
      fee: Number(catalogForm.fee) || 30000,
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
    showToast(`✓ Produk "${newItem.name}" ditambahkan ke katalog bawaan kloter.`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Menunggu Bayar</span>;
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Lunas (Paid)</span>;
      case 'PURCHASED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Sudah Dibeli</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Dikirim (Shipped)</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2">
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/30">
            J
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight leading-tight">Justip CMS</h1>
            <p className="text-xs text-slate-400">Platform Penyedia Jasa</p>
          </div>
        </div>

        {/* Shopper Identity Card (KYC Verified) */}
        <div className="p-4 mx-3 my-4 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt={currentUser?.name || "Shopper"} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} title={backendOnline ? "BE Online" : "BE Standby"}></span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate flex items-center gap-1">
                {currentUser?.name || "Sarah Wijaya"}
                {currentUser?.kyc_verified !== false && (
                  <span className="text-emerald-400 text-xs" title="Shopper Terverifikasi KYC">✓</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">
                  {currentUser?.role || "SHOPPER"}
                </span>
                <span>•</span>
                <span className="truncate">{currentUser?.email || "sarah@justip.local"}</span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Keluar / Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ringkasan & Analitik</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Kelola Pesanan</span>
            </div>
            {pendingOrders > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-slate-900">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'batches' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kloter Jastip (Batches)</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'catalog' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Manajemen Katalog</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan & Ekspor CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'kyc' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi KYC & Rekening</span>
          </button>
        </nav>

        {/* PRD Epic Footnote */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            PRD Epic 3: Shopper CMS Web
          </div>
          <p className="text-[11px] text-slate-500">Sistem manajemen pesanan jastip, kuota otomatis, dan pelaporan terpadu.</p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Kloter Operasional:</span>
            <select
              value={activeKloterId}
              onChange={(e) => setActiveKloterId(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {kloters.map(k => (
                <option key={k.id} value={k.id}>
                  {k.flag} {k.title} ({k.destination})
                </option>
              ))}
            </select>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              ● Status: {currentKloter?.status || 'OPEN'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${backendOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>Backend: {backendOnline ? 'Terhubung (API v1)' : 'Standby / Offline'}</span>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buka Kloter Baru</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pesanan</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalOrders}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Kloter {currentKloter?.id}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total GMV Omset</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">Rp {(totalGMV / 1000).toLocaleString('id-ID')}k</p>
                    <p className="text-xs text-slate-500 mt-1">Terverifikasi QRIS</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Bersih Shopper</p>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-1">Rp {(totalShopperFee / 1000).toLocaleString('id-ID')}k</p>
                    <p className="text-xs text-slate-500 mt-1">Margin pendapatan jastip</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Keterisian Kuota</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{currentKloter?.quotaUsed} / {currentKloter?.quotaMax}</p>
                    <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(quotaPct, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Luggage className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* State Machine Status Overview Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">State Machine Pipeline (Kloter: {currentKloter?.title})</h3>
                    <p className="text-xs text-slate-500">Transisi status pesanan sesuai Epic 1 & 3: Pending ➔ Paid ➔ Purchased ➔ Shipped</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>Buka Tabel Pesanan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-amber-800">1. Pending (Belum Bayar)</span>
                      <span className="font-bold text-sm text-amber-900">{kloterOrders.filter(o => o.status === 'PENDING').length}</span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">QRIS diterbitkan, menunggu pembayaran</p>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-emerald-800">2. Paid (Perlu Belanja)</span>
                      <span className="font-bold text-sm text-emerald-900">{pendingOrders}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1">Lunas via Webhook, siap dibelikan di store</p>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-blue-800">3. Purchased (Sudah Dibeli)</span>
                      <span className="font-bold text-sm text-blue-900">{purchasedOrders}</span>
                    </div>
                    <p className="text-[11px] text-blue-700 mt-1">Barang telah dibeli Shopper di Jepang/Thai</p>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-purple-800">4. Shipped (Dalam Kirim)</span>
                      <span className="font-bold text-sm text-purple-900">{shippedOrders}</span>
                    </div>
                    <p className="text-[11px] text-purple-700 mt-1">Dikirim ke pembeli + nomor resi</p>
                  </div>
                </div>
              </div>

              {/* Trip Rules & Deadline info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Jadwal Kloter Aktif</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Destinasi:</span>
                      <span className="font-semibold text-slate-800">{currentKloter?.destination} {currentKloter?.flag}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Periode Perjalanan:</span>
                      <span className="font-semibold text-slate-800">{currentKloter?.startDate} s/d {currentKloter?.endDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Batas Tutup Order:</span>
                      <span className="font-semibold text-rose-600">{currentKloter?.orderDeadline}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Aturan Kloter Terpublikasi</span>
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                    {currentKloter?.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT (EPIC 3 CORE) */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Filter and Bulk Action Bar */}
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[320px]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari ID Pesanan, Nama Pembeli, atau Produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 'ALL', label: 'Semua' },
                      { id: 'PENDING', label: 'Pending' },
                      { id: 'PAID', label: 'Paid' },
                      { id: 'PURCHASED', label: 'Purchased' },
                      { id: 'SHIPPED', label: 'Shipped' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setStatusFilter(st.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          statusFilter === st.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs">
                    <span className="font-bold text-emerald-800">{selectedOrderIds.length} pesanan dipilih:</span>
                    <button
                      onClick={() => handleBulkUpdateStatus('PURCHASED')}
                      className="px-3 py-1 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      Tandai Dibeli (Purchased)
                    </button>
                    <button
                      onClick={() => handleBulkUpdateStatus('SHIPPED')}
                      className="px-3 py-1 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                    >
                      Tandai Dikirim (Shipped)
                    </button>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
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
                      <th className="p-4">Pembeli & Kontak</th>
                      <th className="p-4">Tipe & Rincian Barang</th>
                      <th className="p-4">Total & Fee Jastip</th>
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
                            <td className="p-4 font-mono font-bold text-slate-800">
                              {order.id}
                              <div className="text-[10px] text-slate-400 font-normal">{order.createdAt}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{order.buyerName}</div>
                              <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{order.buyerPhone}</span>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  order.type.includes('CUSTOM') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {order.type}
                                </span>
                                <span className="font-semibold text-slate-800 truncate">
                                  {order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                                </span>
                              </div>
                              {order.customNotes && (
                                <p className="text-[11px] text-slate-500 italic truncate mt-1">
                                  "{order.customNotes}"
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800">Rp {order.total.toLocaleString('id-ID')}</div>
                              <div className="text-emerald-600 font-semibold text-[11px]">Fee Shopper: Rp {order.serviceFee.toLocaleString('id-ID')}</div>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              {/* State Transition Actions */}
                              {order.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'PAID')}
                                  title="Verifikasi QRIS Webhook"
                                  className="px-2.5 py-1 text-[11px] bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
                                >
                                  Verifikasi Lunas
                                </button>
                              )}
                              {order.status === 'PAID' && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'PURCHASED')}
                                  title="Tandai Sudah Dibelikan di Toko"
                                  className="px-2.5 py-1 text-[11px] bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                                >
                                  Tandai Dibeli
                                </button>
                              )}
                              {order.status === 'PURCHASED' && (
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setTrackingInput(order.trackingNo || '');
                                  }}
                                  title="Masukkan Resi & Kirim"
                                  className="px-2.5 py-1 text-[11px] bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
                                >
                                  Kirim Resi
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1 text-[11px] bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
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

          {/* TAB 3: KLOTER JASTIP & FORM BUKA KLOTER */}
          {activeTab === 'batches' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Buka Kloter Baru */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-lg font-bold text-slate-800">Buka Kloter Jastip Baru (Create Batch)</h2>
                  <p className="text-xs text-slate-500">Kloter yang Anda buka akan memicu event notifikasi otomatis ke seluruh pembeli yang mengikuti akun Anda.</p>
                </div>

                <form onSubmit={handleCreateBatch} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kloter</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kloter Tokyo Autumn Special 🍁"
                        value={batchForm.title}
                        onChange={(e) => setBatchForm({ ...batchForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Negara / Kota Tujuan</label>
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Tokyo, Japan">Tokyo, Japan 🇯🇵</option>
                        <option value="Bangkok, Thailand">Bangkok, Thailand 🇹🇭</option>
                        <option value="Seoul, South Korea">Seoul, South Korea 🇰🇷</option>
                        <option value="Singapore">Singapore 🇸🇬</option>
                        <option value="Paris, France">Paris, France 🇫🇷</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Berangkat</label>
                      <input
                        type="date"
                        required
                        value={batchForm.startDate}
                        onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kepulangan</label>
                      <input
                        type="date"
                        required
                        value={batchForm.endDate}
                        onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Maksimal Kuota (Slot)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={batchForm.quotaMax}
                        onChange={(e) => setBatchForm({ ...batchForm, quotaMax: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Aturan Kloter & Ketentuan Jastip</label>
                    <textarea
                      rows={4}
                      value={batchForm.rules}
                      onChange={(e) => setBatchForm({ ...batchForm, rules: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Aturan berat bagasi, batas ukuran item, jadwal belanja..."
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Pisahkan per baris.</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publikasikan Kloter & Kirim Broadcast Notifikasi</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List Kloter Aktif & Selesai */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Daftar Kloter Jastip Anda</h3>
                {kloters.map(k => (
                  <div key={k.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-500">{k.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {k.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{k.flag} {k.title}</h4>
                    <p className="text-xs text-slate-500">{k.destination} • {k.startDate} s/d {k.endDate}</p>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Kapasitas Slot:</span>
                        <span className="font-bold text-slate-800">{k.quotaUsed} / {k.quotaMax} slot terisi</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((k.quotaUsed / k.quotaMax) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setActiveKloterId(k.id);
                          setActiveTab('orders');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg transition"
                      >
                        Pilih Kloter Ini ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CATALOG MANAGEMENT */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Katalog Produk Bawaan: {currentKloter?.title}</h2>
                  <p className="text-xs text-slate-500">Barang bawaan yang dapat langsung dibeli oleh pembeli dari beranda tanpa formulir custom.</p>
                </div>
                <button
                  onClick={() => setShowCatalogModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Produk Katalog</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentKloter?.catalog?.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 shadow-sm">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Harga Barang:</div>
                          <div className="font-bold text-emerald-600 text-sm">Rp {item.price.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Fee Shopper:</div>
                          <div className="font-bold text-slate-800 text-sm">+ Rp {item.fee.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS & EXPORT CSV (EPIC 1 & 3) */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Laporan Keuangan & Rekapitulasi Pesanan</h2>
                  <p className="text-xs text-slate-500">Merekapitulasi seluruh pesanan masuk, nominal belanja, dan fee shopper dalam format CSV/Excel.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Laporan CSV/Excel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Pesanan Tercatat</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">{kloterOrders.length} Pesanan</div>
                  <p className="text-[11px] text-slate-400 mt-1">Kloter {currentKloter?.id}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Akumulasi Fee Shopper</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    Rp {totalShopperFee.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Keuntungan bersih jasa</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Otomatisasi Pembayaran</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">100% QRIS</div>
                  <p className="text-[11px] text-emerald-600 mt-1">Tanpa cek mutasi manual</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KYC & SHOPEER PROFILE VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-3xl space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">Status Verifikasi KYC Shopper</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      TERVERIFIKASI ✓
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Sesuai PRD Nice-to-Have: Validasi KTP & Rekening untuk meningkatkan kepercayaan pembeli.</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Nama Lengkap Sesuai KTP:</span>
                    <span className="font-bold text-slate-800">Sarah Wijaya</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">NIK Terverifikasi:</span>
                    <span className="font-mono font-bold text-slate-800">3174**********0002</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Nomor Rekening Penerima:</span>
                    <span className="font-bold text-slate-800">BCA - 8820192841 (a/n Sarah Wijaya)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Midtrans/Xendit QRIS Merchant ID:</span>
                    <span className="font-mono text-emerald-600 font-bold">MID-QRIS-JASTIP-9901</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">Detail Pesanan {selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">Dibuat pada {selectedOrder.createdAt}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pembeli</span>
                <span className="font-bold text-slate-800">{selectedOrder.buyerName} ({selectedOrder.buyerPhone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Saat Ini</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Items List */}
              <div className="py-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Rincian Barang</span>
                <div className="mt-2 space-y-1.5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">{it.name} (x{it.qty})</span>
                      <span className="font-bold text-slate-800">Rp {(it.price * it.qty).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.customNotes && (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
                  <span className="font-bold">Catatan Pembeli:</span> {selectedOrder.customNotes}
                </div>
              )}

              {selectedOrder.customImageUrl && (
                <div className="mt-2">
                  <span className="text-slate-500 font-bold block mb-1">Foto Referensi Custom Request:</span>
                  <img src={selectedOrder.customImageUrl} alt="Custom" className="w-28 h-28 object-cover rounded-xl border shadow-sm" />
                </div>
              )}

              {/* Shipping Tracking Input */}
              {selectedOrder.status === 'PURCHASED' && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <label className="block font-bold text-purple-900">Input Nomor Resi Pengiriman:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. JNE-BKK-990184"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-purple-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'SHIPPED', trackingInput || 'EXP-AUTO-991');
                      }}
                      className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                    >
                      Kirim Barang
                    </button>
                  </div>
                </div>
              )}

              {/* State Transition Actions */}
              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <span className="text-slate-500 font-semibold">Tindakan Cepat:</span>
                <div className="flex gap-2">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'PAID')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                    >
                      Verifikasi Lunas
                    </button>
                  )}
                  {selectedOrder.status === 'PAID' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'PURCHASED')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                    >
                      Tandai Sudah Dibeli
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-800">Tambah Barang ke Katalog Kloter</h3>
              <button onClick={() => setShowCatalogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCatalogItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royce Chocolate Bitter"
                  value={catalogForm.name}
                  onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Beli Toko (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="150000"
                    value={catalogForm.price}
                    onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee Jastip (IDR)</label>
                  <input
                    type="number"
                    required
                    placeholder="30000"
                    value={catalogForm.fee}
                    onChange={(e) => setCatalogForm({ ...catalogForm, fee: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={catalogForm.category}
                  onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="Snack">Snack & Makanan</option>
                  <option value="Skincare">Skincare & Kosmetik</option>
                  <option value="Fashion">Fashion & Aksesoris</option>
                  <option value="Gadget">Elektronik & Gadget</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar Produk</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={catalogForm.image}
                  onChange={(e) => setCatalogForm({ ...catalogForm, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md"
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
