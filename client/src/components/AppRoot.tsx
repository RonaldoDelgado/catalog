'use client';

import { useState, useEffect } from 'react';
import { useApiContext } from '@/context/ApiContext';
import AdminLogin from '@/components/auth/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';
import ProductCatalog from '@/components/catalog/ProductCatalog';

export default function AppRoot() {
  const { isAuthenticated } = useApiContext();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Reset showAdminLogin when user becomes authenticated or when they log out
  useEffect(() => {
    if (isAuthenticated) {
      setShowAdminLogin(false);
    }
  }, [isAuthenticated]);

  if (showAdminLogin && !isAuthenticated) {
    return <AdminLogin />;
  }

  if (isAuthenticated) {
    return <AdminPanel />;
  }

  return <ProductCatalog onAdminClick={() => setShowAdminLogin(true)} />;
}
