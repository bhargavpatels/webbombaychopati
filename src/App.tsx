import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/user/UserProvider";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import PersonalDetails from "./pages/settings/PersonalDetails";
import ChangePassword from "./pages/settings/ChangePassword";
import Addresses from "./pages/settings/Addresses";
import AddAddress from "./pages/settings/AddAddress";
import EditAddress from "./pages/settings/EditAddress";
import DeleteAccount from "./pages/settings/DeleteAccount";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ScrollToTop from '@/components/ScrollToTop';
import Sitemap from "./pages/Sitemap";

// Configure React Query client with reasonable defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-history" element={<OrderHistory />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Profile & Settings Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings/personal-details" element={<PersonalDetails />} />
                <Route path="/settings/change-password" element={<ChangePassword />} />
                <Route path="/settings/addresses" element={<Addresses />} />
                <Route path="/settings/addresses/add" element={<AddAddress />} />
                <Route path="/settings/addresses/edit/:addressId" element={<EditAddress />} />
                <Route path="/settings/delete-account" element={<DeleteAccount />} />
                
                {/* Legal Routes */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/sitemap" element={<Sitemap />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

