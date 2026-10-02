import React, { useState } from 'react';
import ShopperDashboard from './components/shopper/ShopperDashboard';
import BuyerMobileView from './components/buyer/BuyerMobileView';
import { initialKloters, initialOrders, initialShoppers } from './data/mockData';
import { Smartphone, Monitor, Columns, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('split'); // 'mobile', 'cms', 'split'
  const [kloters, setKloters] = useState(initialKloters);
  const [orders, setOrders] = useState(initialOrders);
  const [shoppers, setShoppers] = useState(initialShoppers);
  const [activeKloterId, setActiveKloterId] = useState(initialKloters[0].id);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Controller Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20">
            J
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Jastip Multi-Platform System
              <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                PRD Aligned
              </span>
            </h1>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'mobile' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Buyer Mobile (Epic 2)</span>
          </button>

          <button
            onClick={() => setViewMode('cms')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'cms' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Shopper Web CMS (Epic 3)</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'split' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View (Live Sync)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Order State Machine Active</span>
        </div>
      </header>

      {/* Main Viewport */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'cms' && (
          <div className="h-full overflow-y-auto bg-slate-50">
            <ShopperDashboard 
              orders={orders}
              setOrders={setOrders}
              kloters={kloters}
              setKloters={setKloters}
              activeKloterId={activeKloterId}
              setActiveKloterId={setActiveKloterId}
            />
          </div>
        )}

        {viewMode === 'mobile' && (
          <div className="h-full overflow-y-auto bg-slate-900 py-8 flex items-center justify-center">
            <BuyerMobileView 
              kloters={kloters}
              orders={orders}
              setOrders={setOrders}
              shoppers={shoppers}
              setShoppers={setShoppers}
              activeKloterId={activeKloterId}
              setActiveKloterId={setActiveKloterId}
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left: Mobile App Simulator */}
            <div className="lg:col-span-5 bg-slate-950 p-6 flex flex-col items-center justify-center overflow-y-auto border-r border-slate-800 custom-scrollbar">
              <div className="mb-3 text-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Platform Pembeli (Mobile)</span>
                <p className="text-[11px] text-slate-400">Pesan dari katalog/custom, QRIS, & pantau status</p>
              </div>
              <BuyerMobileView 
                kloters={kloters}
                orders={orders}
                setOrders={setOrders}
                shoppers={shoppers}
                setShoppers={setShoppers}
                activeKloterId={activeKloterId}
                setActiveKloterId={setActiveKloterId}
              />
            </div>

            {/* Right: Shopper Web CMS Dashboard */}
            <div className="lg:col-span-7 bg-slate-50 overflow-y-auto custom-scrollbar flex flex-col">
              <ShopperDashboard 
                orders={orders}
                setOrders={setOrders}
                kloters={kloters}
                setKloters={setKloters}
                activeKloterId={activeKloterId}
                setActiveKloterId={setActiveKloterId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
