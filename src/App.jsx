import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Context Providers
import { CustomerProvider } from "./contexts/customerContext";
import { AuthProvider } from "./contexts/authContext";
import { ProductProvider } from "./contexts/productContext";
import { QuotationProvider } from "./contexts/quotationContext";
import { TransactionProvider } from "./contexts/transactionContext";

// Components
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import CreateBill from "./pages/InvoiceHistory";
import ProductSalesDashboard from "./components/sales/ProductSalesDashboard";
import Quotations from "./pages/Quotations";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import UsersList from "./components/User/UsersList";
import { PettyCashProvider } from "./contexts/PettyCashContext";
import PettyCashManager from "./pages/PettyCashManager";
import { InvoiceProvider } from "./contexts/invoiceContext.jsx";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <PettyCashProvider>
        <CustomerProvider>
          <ProductProvider>
            <QuotationProvider>
              <InvoiceProvider>
                <TransactionProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Inventory />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customers"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Customers />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/quotation"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Quotations />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/create-bill"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <CreateBill />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/product-sales"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <ProductSalesDashboard />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/transactions"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Transactions />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/petty-cash"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <PettyCashManager />
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              < UsersList/>
                            </Layout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Other protected routes */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </TransactionProvider>
              </InvoiceProvider>
            </QuotationProvider>
          </ProductProvider>
        </CustomerProvider>
   </PettyCashProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
