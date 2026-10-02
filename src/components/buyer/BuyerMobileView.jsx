import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  BellRing, 
  MapPin, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Upload, 
  QrCode, 
  Copy, 
  Check, 
  ChevronRight, 
  Truck, 
  Package, 
  User, 
  Heart,
  Share2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function BuyerMobileView({ 
  kloters, 
  orders, 
  setOrders, 
  shoppers, 
  setShoppers,
  activeKloterId,
  setActiveKloterId 
}) {
  // Navigation inside mobile app
  const [currentScreen, setCurrentScreen] = useState('timeline'); // 'timeline', 'detail', 'checkout', 'qris', 'tracking'
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'subs', 'orders', 'profile'
  
  // Selected Kloter & Order state
  const [selectedKloter, setSelectedKloter] = useState(kloters[0]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cart / Order builder state
  const [cartItems, setCartItems] = useState({}); // { [catId]: qty }
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRequest, setCustomRequest] = useState({
    name: '',
    estimatedPrice: '',
    notes: '',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80'
  });

  // Buyer info
  const [buyerName, setBuyerName] = useState('Dimas Pratama');
  const [buyerPhone, setBuyerPhone] = useState('081234567890');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  // Active active QRIS payment countdown timer
  const [countdown, setCountdown] = useState(895); // 14 mins 55s
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [notificationToast, setNotificationToast] = useState(null);

  useEffect(() => {
    let timer;
    if (currentScreen === 'qris' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [currentScreen, countdown]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle Subscribe Shopper
  const handleToggleSubscribe = (shopperId, shopperName) => {
    setShoppers(prev => prev.map(s => {
      if (s.id === shopperId) {
        const nextState = !s.isSubscribed;
        setNotificationToast(
          nextState 
            ? `🔔 Berlangganan: Anda akan menerima notifikasi instan saat ${shopperName} membuka kloter baru!`
            : `🔕 Berhenti berlangganan dari ${shopperName}`
        );
        setTimeout(() => setNotificationToast(null), 3500);
        return {
          ...s,
          isSubscribed: nextState,
          subscribersCount: nextState ? s.subscribersCount + 1 : s.subscribersCount - 1
        };
      }
      return s;
    }));
  };

  // Cart quantity controls
  const handleUpdateQty = (catId, delta) => {
    setCartItems(prev => {
      const current = prev[catId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[catId];
        return copy;
      }
      return { ...prev, [catId]: next };
    });
  };

  // Calculate checkout totals
  const currentCatalog = selectedKloter?.catalog || [];
  const selectedCatalogList = Object.entries(cartItems).map(([id, qty]) => {
    const item = currentCatalog.find(c => c.id === id);
    return { ...item, qty };
  }).filter(Boolean);

  const catalogSubtotal = selectedCatalogList.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const catalogFee = selectedCatalogList.reduce((sum, item) => sum + (item.fee * item.qty), 0);

  const customSubtotal = isCustomMode && customRequest.estimatedPrice ? Number(customRequest.estimatedPrice) : 0;
  const customFee = isCustomMode && customRequest.estimatedPrice ? Math.round(Number(customRequest.estimatedPrice) * 0.15) : 0;

  const subtotal = catalogSubtotal + customSubtotal;
  const totalServiceFee = catalogFee + customFee;
  const appFee = subtotal > 0 ? 5000 : 0;
  const grandTotal = subtotal + totalServiceFee + appFee;

  // Create order & proceed to QRIS
  const handleProceedToQRIS = () => {
    if (subtotal === 0) {
      alert("Silakan pilih minimal 1 barang dari katalog atau isi formulir Custom Request.");
      return;
    }

    const orderItems = [];
    selectedCatalogList.forEach(item => {
      orderItems.push({
        name: item.name,
        qty: item.qty,
        price: item.price,
        fee: item.fee
      });
    });

    if (isCustomMode && customRequest.name) {
      orderItems.push({
        name: `[Custom] ${customRequest.name}`,
        qty: 1,
        price: Number(customRequest.estimatedPrice),
        fee: customFee
      });
    }

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      kloterId: selectedKloter.id,
      kloterTitle: selectedKloter.title,
      shopperName: selectedKloter.shopperName,
      buyerName: buyerName || "Dimas Pratama",
      buyerPhone: buyerPhone || "081234567890",
      type: isCustomMode && selectedCatalogList.length === 0 ? "CUSTOM" : (isCustomMode ? "CATALOG+CUSTOM" : "CATALOG"),
      items: orderItems,
      customNotes: isCustomMode ? customRequest.notes : "",
      customImageUrl: isCustomMode ? customRequest.imageUrl : "",
      subtotal,
      serviceFee: totalServiceFee,
      appFee,
      total: grandTotal,
      paymentMethod: "QRIS",
      status: "PENDING",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      history: [
        { 
          status: "PENDING", 
          time: new Date().toISOString().replace('T', ' ').substring(0, 16), 
          note: "Pesanan dibuat, QRIS aktif menunggu pembayaran" 
        }
      ],
      trackingNo: ""
    };

    setOrders([newOrder, ...orders]);
    setSelectedOrder(newOrder);
    setCountdown(895);
    setCurrentScreen('qris');
  };

  // Simulate QRIS Payment Success Webhook
  const handleSimulatePaymentWebhook = () => {
    if (!selectedOrder) return;
    const timeNow = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const updated = {
      ...selectedOrder,
      status: "PAID",
      history: [
        ...selectedOrder.history,
        { status: "PAID", time: timeNow, note: "Pembayaran terverifikasi otomatis via QRIS Webhook Gateway" }
      ]
    };

    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
    setSelectedOrder(updated);
    setCurrentScreen('tracking');
  };

  const currentShopperObj = shoppers.find(s => s.name === selectedKloter?.shopperName) || shoppers[0];

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-[720px] h-full shadow-2xl rounded-3xl overflow-hidden flex flex-col border border-slate-300 relative">
      {/* Toast Notification for Subscribe Engine */}
      {notificationToast && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900/95 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span>{notificationToast}</span>
        </div>
      )}

      {/* SCREEN 1: TIMELINE / BERANDA (EPIC 2) */}
      {currentScreen === 'timeline' && activeTab === 'home' && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-20">
          {/* Header & Search */}
          <div className="bg-emerald-600 text-white p-5 rounded-b-3xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-100 font-medium uppercase tracking-wider">Jastip App Buyer</span>
                <h2 className="text-xl font-bold tracking-tight">Eksplor Open Jastip ✈️</h2>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                DP
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang, traveler, kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl focus:outline-none shadow-inner placeholder-slate-400"
              />
            </div>

            {/* Country Pill Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: 'Semua Kota' },
                { id: 'Tokyo', label: '🇯🇵 Tokyo' },
                { id: 'Bangkok', label: '🇹🇭 Bangkok' },
                { id: 'Seoul', label: '🇰🇷 Seoul' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c.id)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                    selectedCountry === c.id ? 'bg-white text-emerald-800 shadow-sm' : 'bg-emerald-700/60 text-white hover:bg-emerald-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Kloter List */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Kloter Aktif Hari Ini</h3>
              <span className="text-xs text-emerald-600 font-medium">Auto-Update</span>
            </div>

            {kloters
              .filter(k => selectedCountry === 'ALL' || k.destination.includes(selectedCountry))
              .filter(k => k.title.toLowerCase().includes(searchQuery.toLowerCase()) || k.shopperName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(kloter => {
                const shopper = shoppers.find(s => s.name === kloter.shopperName) || {
                  isSubscribed: false,
                  verified: true,
                  rating: 4.9
                };
                const quotaRemaining = kloter.quotaMax - kloter.quotaUsed;
                const quotaPercent = Math.round((kloter.quotaUsed / kloter.quotaMax) * 100);

                return (
                  <div key={kloter.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3">
                    {/* Shopper info & Subscribe Bell */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={kloter.shopperAvatar} 
                          alt={kloter.shopperName} 
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-sm text-slate-800">{kloter.shopperName}</span>
                            {shopper.verified && (
                              <span className="text-emerald-600 text-xs" title="Verified Shopper">✓</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>⭐ {shopper.rating || 4.9}</span>
                            <span>•</span>
                            <span>{shopper.subscribersCount || 840} Pengikut</span>
                          </div>
                        </div>
                      </div>

                      {/* Subscribe Button (Epic 2) */}
                      <button
                        onClick={() => handleToggleSubscribe(shopper.id || 'shp-01', kloter.shopperName)}
                        title={shopper.isSubscribed ? "Berhenti Berlangganan" : "Langganan Notifikasi Kloter"}
                        className={`p-2 rounded-xl border transition flex items-center gap-1.5 ${
                          shopper.isSubscribed 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {shopper.isSubscribed ? <BellRing className="w-4 h-4 fill-emerald-600" /> : <Bell className="w-4 h-4" />}
                        <span className="text-xs font-semibold">{shopper.isSubscribed ? "Subscribed" : "Subscribe"}</span>
                      </button>
                    </div>

                    {/* Kloter Title & Destination */}
                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-snug">{kloter.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {kloter.destination}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {kloter.startDate} s/d {kloter.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Quota Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Sisa Kuota Titipan:</span>
                        <span className="font-bold text-emerald-600">{quotaRemaining} dari {kloter.quotaMax} slot</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${quotaPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Catalog Previews */}
                    <div className="pt-1">
                      <span className="text-xs font-semibold text-slate-500">Katalog Populer:</span>
                      <div className="grid grid-cols-3 gap-2 mt-1.5">
                        {kloter.catalog.slice(0, 3).map(c => (
                          <div key={c.id} className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                            <img src={c.image} alt={c.name} className="w-full h-14 object-cover rounded-lg mb-1" />
                            <p className="text-[11px] font-semibold text-slate-800 truncate">{c.name}</p>
                            <p className="text-[10px] text-emerald-600 font-bold">Rp {(c.price / 1000).toLocaleString('id-ID')}k</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setSelectedKloter(kloter);
                        setCurrentScreen('detail');
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Titip Sekarang</span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SCREEN 2: KLOTER DETAIL & CHECKOUT ENGINE (EPIC 2) */}
      {currentScreen === 'detail' && selectedKloter && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-24">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
            <button 
              onClick={() => setCurrentScreen('timeline')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-base text-slate-800 leading-tight">Detail Kloter & Titip</h3>
              <p className="text-xs text-slate-500">{selectedKloter.destination} {selectedKloter.flag}</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Shopper & Rules Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Aturan & Ketentuan Kloter</span>
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Handcarry</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                {selectedKloter.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Mode Switcher: Katalog vs Custom Request */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  !isCustomMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                Pilih dari Katalog
              </button>
              <button
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                  isCustomMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Custom Request</span>
              </button>
            </div>

            {/* KATALOG MODE */}
            {!isCustomMode ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Daftar Barang Bawaan Shopper</span>
                {selectedKloter.catalog.map(cat => {
                  const qty = cartItems[cat.id] || 0;
                  return (
                    <div key={cat.id} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <img src={cat.image} alt={cat.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{cat.name}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-xs font-bold text-emerald-600">Rp {cat.price.toLocaleString('id-ID')}</span>
                            <span className="text-[10px] text-slate-400">+ fee Rp {cat.fee.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Qty Counter */}
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateQty(cat.id, -1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => handleUpdateQty(cat.id, 1)}
                            className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* CUSTOM REQUEST MODE */
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Buat Permintaan Khusus (Custom Request)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Unggah foto dan spesifikasi barang yang ingin dititipkan ke Shopper. Shopper akan mencarikan barang sesuai catatan Anda.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Barang Titipan</label>
                  <input
                    type="text"
                    placeholder="e.g. Matcha Ceremony Grade - Marukyu Koyamaen"
                    value={customRequest.name}
                    onChange={(e) => setCustomRequest({ ...customRequest, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estimasi Harga (IDR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 320000"
                    value={customRequest.estimatedPrice}
                    onChange={(e) => setCustomRequest({ ...customRequest, estimatedPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Fee jasa shopper jastip estimasi: 15%</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Khusus & Detail Toko</label>
                  <textarea
                    rows={2}
                    placeholder="Warna, ukuran kemasan, toko spesifik di Jepang/Thailand..."
                    value={customRequest.notes}
                    onChange={(e) => setCustomRequest({ ...customRequest, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preview Foto Barang</label>
                  <div className="flex items-center gap-3">
                    <img 
                      src={customRequest.imageUrl} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-xl object-cover border"
                    />
                    <span className="text-[11px] text-emerald-600 font-medium">Foto referensi siap diupload</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Contact Form */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700">Data Kontak Pembeli</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="px-2.5 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="tel"
                  placeholder="No. WhatsApp"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="px-2.5 py-1.5 border rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Barang:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Fee Jasa Shopper:</span>
                <span>Rp {totalServiceFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Platform Aplikasi:</span>
                <span>Rp {appFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Pembayaran:</span>
                <span className="text-emerald-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[11px] text-slate-400">Total Tagihan:</p>
              <p className="font-bold text-base text-emerald-600">Rp {grandTotal.toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={handleProceedToQRIS}
              disabled={subtotal === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>Bayar via QRIS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: PEMBAYARAN QRIS (EPIC 1 & 2) */}
      {currentScreen === 'qris' && selectedOrder && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-5 space-y-5 bg-slate-50">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentScreen('detail')}
              className="p-1 text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm text-slate-800">Pembayaran QRIS Jastip</h3>
            <div className="w-5"></div>
          </div>

          {/* QRIS Card Container */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
            {/* QRIS Official Logo Header */}
            <div className="flex items-center justify-center gap-2">
              <span className="font-black text-xl tracking-tighter text-slate-900">QRIS</span>
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">GPN</span>
            </div>

            {/* QR Code SVG Display */}
            <div className="relative mx-auto w-52 h-52 bg-white border-2 border-slate-900 rounded-2xl p-3 flex flex-col items-center justify-center shadow-inner">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-sm ${
                      (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 
                        ? 'bg-slate-900' 
                        : (i % 5 === 0 ? 'bg-emerald-600' : 'bg-transparent')
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-[10px] text-slate-900 shadow">
                  QRIS
                </span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>Selesaikan dalam: {formatTimer(countdown)}</span>
              </div>
              <p className="text-[11px] text-slate-400">Scan melalui GoPay, OVO, Dana, BCA, Mandiri, atau Livin'</p>
            </div>

            {/* Total Amount */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">Total Nominal Pembayaran:</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                Rp {selectedOrder.total.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Order Reference */}
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl text-xs">
              <span className="text-slate-500 font-mono">{selectedOrder.id}</span>
              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(selectedOrder.id);
                  setCopiedInvoice(true);
                  setTimeout(() => setCopiedInvoice(false), 2000);
                }}
                className="text-emerald-600 font-semibold flex items-center gap-1"
              >
                {copiedInvoice ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInvoice ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Webhook Simulation Trigger */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-center">
            <span className="text-xs font-bold text-emerald-800">Simulasi Webhook Payment Gateway</span>
            <p className="text-[11px] text-emerald-600">
              Di backend sungguhan, callback webhook dari Midtrans/Xendit/QRIS akan langsung memicu event update order menjadi <b>PAID</b>.
            </p>
            <button
              onClick={handleSimulatePaymentWebhook}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulasikan Pembayaran Sukses (Webhook)</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: ORDER TRACKING (EPIC 1 & 2 REAL-TIME STATE MACHINE) */}
      {currentScreen === 'tracking' && selectedOrder && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-5 space-y-4 bg-slate-50 pb-20">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                setActiveTab('orders');
                setCurrentScreen('timeline');
              }}
              className="p-1 text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-sm text-slate-800">Pelacakan Pesanan Real-Time</h3>
            <div className="w-5"></div>
          </div>

          {/* Trip Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                  {selectedOrder.id}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedOrder.kloterTitle}</h4>
                <p className="text-xs text-slate-500">Shopper: {selectedOrder.shopperName}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-xs text-slate-800">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                <p className="text-[10px] text-slate-400">{selectedOrder.items.length} Barang</p>
              </div>
            </div>
          </div>

          {/* State Machine Stepper */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Status Perjalanan Titipan</h5>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Step 1: Pesanan Dibuat */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">1. Pesanan Dibuat</p>
                  <p className="text-[11px] text-slate-500">Order berhasil di-submit ke sistem Jastip</p>
                  <span className="text-[10px] text-slate-400">{selectedOrder.createdAt}</span>
                </div>
              </div>

              {/* Step 2: Pembayaran QRIS */}
              <div className="relative">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  selectedOrder.status !== 'PENDING' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {selectedOrder.status !== 'PENDING' ? '✓' : '•'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">2. Pembayaran Terverifikasi (QRIS)</p>
                  <p className="text-[11px] text-slate-500">
                    {selectedOrder.status !== 'PENDING' 
                      ? 'Lunas otomatis melalui QRIS Webhook' 
                      : 'Menunggu pembayaran pembeli'}
                  </p>
                </div>
              </div>

              {/* Step 3: Barang Dibelanjakan (Purchased) */}
              <div className="relative">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  selectedOrder.status === 'PURCHASED' || selectedOrder.status === 'SHIPPED' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {selectedOrder.status === 'PURCHASED' || selectedOrder.status === 'SHIPPED' ? '✓' : '3'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">3. Barang Dibelanjakan (Purchased)</p>
                  <p className="text-[11px] text-slate-500">
                    {selectedOrder.status === 'PURCHASED' || selectedOrder.status === 'SHIPPED'
                      ? 'Shopper sudah membeli barang di store negara tujuan!'
                      : 'Menunggu jadwal belanja Shopper di negara tujuan'}
                  </p>
                </div>
              </div>

              {/* Step 4: Dikirim ke Pembeli (Shipped) */}
              <div className="relative">
                <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  selectedOrder.status === 'SHIPPED' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {selectedOrder.status === 'SHIPPED' ? '✓' : '4'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">4. Dalam Pengiriman (Shipped)</p>
                  <p className="text-[11px] text-slate-500">
                    {selectedOrder.status === 'SHIPPED'
                      ? `Dikirim via ekspedisi domestik. Resi: ${selectedOrder.trackingNo || 'JP-JKT-102938'}`
                      : 'Barang akan dikirim setelah kepulangan Shopper'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered items breakdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2">
            <span className="font-bold text-slate-700">Rincian Barang</span>
            <div className="space-y-1">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100 last:border-none">
                  <span>{item.name} (x{item.qty})</span>
                  <span className="font-semibold">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN: MY ORDERS TAB */}
      {activeTab === 'orders' && currentScreen === 'timeline' && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 space-y-4 pb-20">
          <h3 className="font-bold text-base text-slate-800">Daftar Titipan Saya</h3>
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => {
                setSelectedOrder(order);
                setCurrentScreen('tracking');
              }}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 cursor-pointer transition space-y-2"
            >
              <div className="flex justify-between text-xs">
                <span className="font-mono text-slate-500 font-bold">{order.id}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'PURCHASED' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="font-bold text-xs text-slate-800">{order.kloterTitle}</p>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-400">{order.items.length} Item</span>
                <span className="font-bold text-emerald-600">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCREEN: SUBSCRIPTIONS TAB */}
      {activeTab === 'subs' && currentScreen === 'timeline' && (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-4 space-y-4 pb-20">
          <div>
            <h3 className="font-bold text-base text-slate-800">Shopper yang Diikuti</h3>
            <p className="text-xs text-slate-500">Anda akan otomatis mendapatkan notifikasi instan saat mereka membuka kloter baru.</p>
          </div>

          <div className="space-y-3">
            {shoppers.map(sh => (
              <div key={sh.id} className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={sh.avatar} alt={sh.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{sh.name}</h4>
                    <p className="text-[11px] text-slate-400">{sh.bio}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{sh.subscribersCount} subscribers</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSubscribe(sh.id, sh.name)}
                  className={`p-2 rounded-xl text-xs font-bold transition ${
                    sh.isSubscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {sh.isSubscribed ? <BellRing className="w-4 h-4 fill-emerald-600" /> : <Bell className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM TAB BAR (MOBILE) */}
      <nav className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 z-30">
        <button
          onClick={() => {
            setActiveTab('home');
            setCurrentScreen('timeline');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'home' && currentScreen === 'timeline' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-bold">Timeline</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('subs');
            setCurrentScreen('timeline');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'subs' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-bold">Langganan</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            setCurrentScreen('timeline');
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'orders' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-bold">Pesanan</span>
        </button>

        <button
          onClick={() => {
            alert("Akun Pembeli: Dimas Pratama (081234567890)");
          }}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>
    </div>
  );
}
