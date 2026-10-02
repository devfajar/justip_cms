import React, { useState } from 'react';
import ShopperDashboard from './components/shopper/ShopperDashboard';
import { initialKloters, initialOrders, initialShoppers } from './data/mockData';

export default function App() {
  const [kloters, setKloters] = useState(initialKloters);
  const [orders, setOrders] = useState(initialOrders);
  const [shoppers, setShoppers] = useState(initialShoppers);
  const [activeKloterId, setActiveKloterId] = useState(initialKloters[0].id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <ShopperDashboard 
        orders={orders}
        setOrders={setOrders}
        kloters={kloters}
        setKloters={setKloters}
        activeKloterId={activeKloterId}
        setActiveKloterId={setActiveKloterId}
        shoppers={shoppers}
        setShoppers={setShoppers}
      />
    </div>
  );
}
