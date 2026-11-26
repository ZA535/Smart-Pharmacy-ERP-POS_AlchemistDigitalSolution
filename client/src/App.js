import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { InventoryPage } from "./pages/InventoryPage";
import { AiBillPage } from "./pages/AiBillPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { AlertsPage } from "./pages/AlertsPage";
import { SupplierReturnsPage } from "./pages/SupplierReturnsPage";
import { PosPage } from "./pages/PosPage";
import { CustomerReturnsPage } from "./pages/CustomerReturnsPage";
import { StockLookupPage } from "./pages/StockLookupPage";

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/pos" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <AdminRoute>
                  <CategoriesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <AdminRoute>
                  <InventoryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/ai-bill"
              element={
                <AdminRoute>
                  <AiBillPage />
                </AdminRoute>
              }
            />
            <Route
              path="/purchase-orders"
              element={
                <AdminRoute>
                  <PurchaseOrdersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <AdminRoute>
                  <AlertsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/supplier-returns"
              element={
                <AdminRoute>
                  <SupplierReturnsPage />
                </AdminRoute>
              }
            />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/customer-returns" element={<CustomerReturnsPage />} />
            <Route path="/stock-lookup" element={<StockLookupPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
