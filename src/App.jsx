import React, { useState, useEffect, useCallback } from 'react';
import ShopperDashboard from './components/shopper/ShopperDashboard';
import ShopperLogin from './components/auth/ShopperLogin';
import { initialKloters, initialOrders, initialShoppers } from './data/mockData';
import { authStorage, authApi, kloterApi, orderApi, healthApi } from './api/client';

export default function App() {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [token, setToken] = useState(() => authStorage.getToken());
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [kloters, setKloters] = useState(initialKloters);
  const [orders, setOrders] = useState(initialOrders);
  const [shoppers, setShoppers] = useState(initialShoppers);
  const [activeKloterId, setActiveKloterId] = useState(initialKloters[0].id);

  // Health check to detect if Go backend server (:8080) is online
  const checkBackendHealth = useCallback(async () => {
    const isHealthy = await healthApi.check();
    setBackendOnline(isHealthy);
    return isHealthy;
  }, []);

  // Sync / Verify Token on app mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const isHealthy = await checkBackendHealth();

      const savedToken = authStorage.getToken();
      if (savedToken && isHealthy) {
        // Verify token with backend /api/v1/auth/me
        const res = await authApi.getMe();
        if (res.success && res.data) {
          if (isMounted) {
            setUser(res.data);
            authStorage.setUser(res.data);
          }
        } else {
          // Token invalid or expired
          authStorage.clearAll();
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setLoadingInitial(false);
      }
    }

    initAuth();

    // Health check ping every 10 seconds
    const interval = setInterval(checkBackendHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkBackendHealth]);

  // Handle successful login from ShopperLogin component
  const handleLoginSuccess = (userData, authToken) => {
    authStorage.setToken(authToken);
    authStorage.setUser(userData);
    setUser(userData);
    setToken(authToken);
  };

  // Handle logout
  const handleLogout = () => {
    authStorage.clearAll();
    setUser(null);
    setToken(null);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30 animate-pulse mb-4">
          J
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">Memuat Justip Shopper CMS...</div>
      </div>
    );
  }

  // If not authenticated or no token, render login screen
  if (!user || !token) {
    return (
      <ShopperLogin 
        onLoginSuccess={handleLoginSuccess}
        backendOnline={backendOnline}
      />
    );
  }

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
        currentUser={user}
        onLogout={handleLogout}
        backendOnline={backendOnline}
      />
    </div>
  );
}
