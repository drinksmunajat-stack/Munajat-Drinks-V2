import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Redirect } from 'wouter';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Public & Auth Pages
import VoiceKasirPage from './pages/VoiceKasirPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin & Operations Pages
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import Users from './pages/Users';
import DatabaseToppings from './pages/DatabaseToppings';
import DatabaseIceLevels from './pages/DatabaseIceLevels';
import DatabaseOrderCodes from './pages/DatabaseOrderCodes';
import DatabaseCabang from './pages/DatabaseCabang';
import AIApiConfig from './pages/AIApiConfig';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

// Helper component to wrap Admin pages inside Layout
function AdminPage({ component: Component }: { component: React.ComponentType }) {
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function MainRouter() {
  return (
    <Switch>
      {/* 1. Halaman Kasir Voice (Landing Page Utama / Pertama kali diakses publik) */}
      <Route path="/" component={() => <VoiceKasirPage standalone={true} />} />
      <Route path="/kasir-voice" component={() => <VoiceKasirPage standalone={true} />} />
      <Route path="/voice-kasir" component={() => <VoiceKasirPage standalone={true} />} />

      {/* 2. Halaman Login & Register */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* 3. Dashboard Admin */}
      <Route path="/admin">
        {() => <AdminPage component={Dashboard} />}
      </Route>
      <Route path="/admin/dashboard">
        {() => <AdminPage component={Dashboard} />}
      </Route>

      {/* 4. Analytics */}
      <Route path="/admin/analytics">
        {() => <AdminPage component={Analytics} />}
      </Route>
      <Route path="/analytics">
        {() => <AdminPage component={Analytics} />}
      </Route>

      {/* 5. Products */}
      <Route path="/admin/products">
        {() => <AdminPage component={Products} />}
      </Route>
      <Route path="/products">
        {() => <AdminPage component={Products} />}
      </Route>

      {/* 6. Database Submenu: Users */}
      <Route path="/admin/database/users">
        {() => <AdminPage component={Users} />}
      </Route>
      <Route path="/admin/users">
        {() => <AdminPage component={Users} />}
      </Route>
      <Route path="/database/users">
        {() => <AdminPage component={Users} />}
      </Route>
      <Route path="/users">
        {() => <AdminPage component={Users} />}
      </Route>

      {/* 7. Database Submenu: Toppings */}
      <Route path="/admin/database/toppings">
        {() => <AdminPage component={DatabaseToppings} />}
      </Route>
      <Route path="/database/toppings">
        {() => <AdminPage component={DatabaseToppings} />}
      </Route>
      <Route path="/toppings">
        {() => <AdminPage component={DatabaseToppings} />}
      </Route>

      {/* 8. Database Submenu: Ice Levels */}
      <Route path="/admin/database/ice-levels">
        {() => <AdminPage component={DatabaseIceLevels} />}
      </Route>
      <Route path="/admin/database/ice-level">
        {() => <AdminPage component={DatabaseIceLevels} />}
      </Route>
      <Route path="/database/ice-levels">
        {() => <AdminPage component={DatabaseIceLevels} />}
      </Route>
      <Route path="/ice-levels">
        {() => <AdminPage component={DatabaseIceLevels} />}
      </Route>

      {/* 9. Database Submenu: Kode Order */}
      <Route path="/admin/database/order-codes">
        {() => <AdminPage component={DatabaseOrderCodes} />}
      </Route>
      <Route path="/admin/database/order-code">
        {() => <AdminPage component={DatabaseOrderCodes} />}
      </Route>
      <Route path="/database/order-codes">
        {() => <AdminPage component={DatabaseOrderCodes} />}
      </Route>
      <Route path="/order-codes">
        {() => <AdminPage component={DatabaseOrderCodes} />}
      </Route>

      {/* 10. Database Submenu: Cabang */}
      <Route path="/admin/database/cabang">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/admin/database/cabangs">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/admin/cabang">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/admin/cabangs">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/database/cabang">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/database/cabangs">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/cabang">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>
      <Route path="/cabangs">
        {() => <AdminPage component={DatabaseCabang} />}
      </Route>

      {/* 11. Ubah API AI */}
      <Route path="/admin/ai-api">
        {() => <AdminPage component={AIApiConfig} />}
      </Route>
      <Route path="/ai-api">
        {() => <AdminPage component={AIApiConfig} />}
      </Route>
      <Route path="/admin/ai">
        {() => <AdminPage component={AIApiConfig} />}
      </Route>
      <Route path="/ai">
        {() => <AdminPage component={AIApiConfig} />}
      </Route>

      {/* 12. Reports */}
      <Route path="/admin/reports">
        {() => <AdminPage component={Reports} />}
      </Route>
      <Route path="/reports">
        {() => <AdminPage component={Reports} />}
      </Route>

      {/* 13. Settings */}
      <Route path="/admin/settings">
        {() => <AdminPage component={Settings} />}
      </Route>
      <Route path="/settings">
        {() => <AdminPage component={Settings} />}
      </Route>

      {/* Fallback 404 */}
      <Route>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b1329",
          color: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          padding: "20px"
        }}>
          <h1 style={{ fontSize: "64px", fontWeight: 800, margin: 0, color: "#10b981" }}>404</h1>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "10px 0 20px 0", color: "#94a3b8" }}>Page Not Found</h2>
          <a
            href="/admin"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px"
            }}
          >
            Back to Admin Dashboard
          </a>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MainRouter />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
