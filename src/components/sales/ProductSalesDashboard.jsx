import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar } from "lucide-react";
import ProductInvoiceModal from "./ProductInvoiceModal";

export default function ProductSalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [productSales, setProductSales] = useState([]);
  const [filteredProductSales, setFilteredProductSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthlyProductSales, setMonthlyProductSales] = useState([]);
  const [totalBusiness, setTotalBusiness] = useState({
    totalSales: 0,
    totalRevenue: 0,
    unpaidSales: 0,
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0], // Jan 1 of current year
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  // Add this function to handle clicking on a product name
  const handleProductClick = (productName) => {
    setSelectedProductForModal(productName);
    setModalOpen(true);
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  useEffect(() => {
    fetchProductSales();
  }, [dateRange]);

  // Filter products when search term or product sales change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProductSales(productSales);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = productSales.filter(product => 
        product.productName.toLowerCase().includes(lowercaseSearchTerm)
      );
      setFilteredProductSales(filtered);
    }
  }, [searchTerm, productSales]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchProductSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URI}/api/reports/product-sales`,
        {
          params: dateRange,
        }
      );

      if (response.data.success) {
        const { productSales, monthlyProductSales, totalBusiness } =
          response.data.data;

        // Sort products by total sales (descending)
        const sortedProducts = [...productSales].sort(
          (a, b) => b.totalSales - a.totalSales
        );
        setProductSales(sortedProducts);
        setFilteredProductSales(sortedProducts);

        // Process monthly data
        const processedMonthlyData = processMonthlyData(monthlyProductSales);
        setMonthlyProductSales(processedMonthlyData);

        setTotalBusiness(totalBusiness);
      }
    } catch (error) {
      console.error("Failed to fetch product sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (monthlyData) => {
    // Group data by month for chart display
    const monthGroups = monthlyData.reduce((acc, item) => {
      if (!acc[item.month]) {
        acc[item.month] = { month: item.month, total: 0 };
      }

      // Add product-specific data
      acc[item.month][item.productName] = item.sales;

      // Update monthly total
      acc[item.month].total += item.sales;

      return acc;
    }, {});

    // Convert to array and sort by month
    return Object.values(monthGroups).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  // Calculate totals based on filtered products
  const calculateFilteredTotals = () => {
    return {
      totalQuantity: filteredProductSales.reduce(
        (sum, product) => sum + product.totalQuantity, 0
      ),
      totalSales: filteredProductSales.reduce(
        (sum, product) => sum + product.totalSales, 0
      ),
      totalRevenue: filteredProductSales.reduce(
        (sum, product) => sum + product.totalRevenue, 0
      ),
      unpaidSales: filteredProductSales.reduce(
        (sum, product) => sum + product.unpaidSales, 0
      )
    };
  };

  const filteredTotals = calculateFilteredTotals();

 if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

return (
  <div className="bg-background text-foreground rounded-lg shadow p-6 card-shadow">
    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-4 md:mb-0">
        Product Sales Dashboard
      </h2>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-muted-foreground" />
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="border border-input rounded px-2 py-1 text-sm bg-background"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="border border-input rounded px-2 py-1 text-sm bg-background"
          />
        </div>
      </div>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Business</p>
        <h3 className="text-2xl font-bold text-foreground">
          {formatCurrency(totalBusiness.totalSales)}
        </h3>
        <p className="text-muted-foreground text-sm">All time sales value</p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/30">
        <p className="text-green-600 dark:text-green-400 text-sm font-medium">
          Collected Revenue
        </p>
        <h3 className="text-2xl font-bold text-foreground">
          {formatCurrency(totalBusiness.totalRevenue)}
        </h3>
        <p className="text-muted-foreground text-sm">From paid invoices</p>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-900/30">
        <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
          Pending Collection
        </p>
        <h3 className="text-2xl font-bold text-foreground">
          {formatCurrency(totalBusiness.unpaidSales)}
        </h3>
        <p className="text-muted-foreground text-sm">From unpaid invoices</p>
      </div>
    </div>

    {/* Product Table with Search */}
    <div className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Product Performance Table
        </h3>
        <div className="mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border border-input rounded-md w-full md:w-64 bg-background text-foreground"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-card border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="py-2 px-4 border border-border text-left text-foreground">Product Name</th>
              <th className="py-2 px-4 border border-border text-right text-foreground">Quantity Sold</th>
              <th className="py-2 px-4 border border-border text-right text-foreground">Total Sales</th>
              <th className="py-2 px-4 border border-border text-right text-foreground">
                Collected Revenue
              </th>
              <th className="py-2 px-4 border border-border text-right text-foreground">Unpaid Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductSales.map((product, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-muted/50" : "bg-card"}
              >
                <td
                  className="py-2 px-4 border border-border text-primary hover:text-primary/80 cursor-pointer"
                  onClick={() => handleProductClick(product.productName)}
                >
                  {product.productName}
                </td>
                <td className="py-2 px-4 border border-border text-right text-foreground">
                  {product.totalQuantity}
                </td>
                <td className="py-2 px-4 border border-border text-right text-foreground">
                  {formatCurrency(product.totalSales)}
                </td>
                <td className="py-2 px-4 border border-border text-right text-foreground">
                  {formatCurrency(product.totalRevenue)}
                </td>
                <td className="py-2 px-4 border border-border text-right text-foreground">
                  {formatCurrency(product.unpaidSales)}
                </td>
              </tr>
            ))}
            {filteredProductSales.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-muted-foreground">
                  No products found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
              <td className="py-2 px-4 border border-border text-foreground">
                {searchTerm ? `Filtered Total (${filteredProductSales.length} products)` : 'Total'}
              </td>
              <td className="py-2 px-4 border border-border text-right text-foreground">
                {filteredTotals.totalQuantity}
              </td>
              <td className="py-2 px-4 border border-border text-right text-foreground">
                {formatCurrency(filteredTotals.totalSales)}
              </td>
              <td className="py-2 px-4 border border-border text-right text-foreground">
                {formatCurrency(filteredTotals.totalRevenue)}
              </td>
              <td className="py-2 px-4 border border-border text-right text-foreground">
                {formatCurrency(filteredTotals.unpaidSales)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <ProductInvoiceModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      productName={selectedProductForModal}
      dateRange={dateRange}
    />
  </div>
);
}