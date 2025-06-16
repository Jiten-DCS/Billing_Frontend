import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Package,
  FileText,
  History,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  Quote,
  Shell,
  ExpandIcon,
  User2Icon,
  HandCoins
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/authContext";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate, isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "light");
    }
  };

  const navItems = [
    { name: "Products", path: "/dashboard", icon: Package },
    { name: "Customers", path: "/customers", icon: User },
    { name: "Quotation", path: "/quotation", icon: Quote },
    { name: "Create Estimate", path: "/create-bill", icon: FileText },
    { name: "Sales", path: "/product-sales", icon: Shell },
    { name: "Transactions", path: "/transactions", icon: History },
    { name: "PettyCash", path: "/petty-cash", icon: HandCoins },
    { name: "Users", path: "/users", icon: User2Icon },
  ];

  const sidebarWidth = isSidebarOpen ? "w-64" : "w-0 lg:w-20";

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 lg:static h-screen z-50 bg-card border-r border-border transition-all duration-300 ${sidebarWidth} flex flex-col`}
      >
        <div className="p-2 border-b border-border flex items-center justify-between">
          {isSidebarOpen ? (
            <img
              src="logo.jpeg"
              alt="logo"
              className="h-12 w-40 rounded-sm transition-opacity duration-300 ease-in-out opacity-100"
            />
          ) : (
            <img
              src="favicon.jpeg"
              alt="logo"
              className="h-10 mb-2 w-40 rounded-sm transition-opacity duration-300 ease-in-out opacity-100"
            />
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md hover:bg-secondary lg:flex hidden items-center justify-center"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center py-2 px-3 text-sm rounded-md transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2 px-3 rounded-md hover:bg-secondary transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-between px-4">
          {/* <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md hover:bg-secondary lg:hidden"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button> */}

          <div className="flex items-center space-x-4 ml-auto">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
                {isSidebarOpen && (
                  <span className="font-medium">
                    {user.name || "Admin User"}
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
