import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public & Auth Pages
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import AboutPricingContact from './pages/AboutPricingContact';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages (Admin & Staff)
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Orders from './pages/Orders';

// Protected Pages (Customer)
import CustomerPortal from './pages/CustomerPortal';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/about" element={<AboutPricingContact mode="about" />} />
          <Route path="/pricing" element={<AboutPricingContact mode="pricing" />} />
          <Route path="/contact" element={<AboutPricingContact mode="contact" />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />

          {/* Protected Customer Portal Routes */}
          <Route
            path="/portal/customer"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Layout>
                  <CustomerPortal />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Layout>
                  <Cart />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Layout>
                  <Checkout />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Layout>
                  <Wishlist />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Staff & Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Global Orders Route (Admin, Staff, Customer) */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Staff', 'Customer']}>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route 
            path="*" 
            element={
              <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-450 font-bold gap-3">
                <span className="text-2xl text-slate-300">404 - Resource Not Found</span>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs text-brand-400"
                >
                  Return to safety
                </button>
              </div>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
