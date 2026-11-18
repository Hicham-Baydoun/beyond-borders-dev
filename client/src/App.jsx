// Route map of the three areas in SRS Table 8. Pages not built yet show ComingSoon with their module epic.
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireRole from './components/RequireRole.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import DevUi from './pages/DevUi.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';

const Soon = (title, ticket) => <ComingSoon title={title} ticket={ticket} />;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Customer pages: visitors and customers */}
        <Route index element={<Home />} />
        <Route path="search" element={Soon('Explore trips', 'M3 Search (KAN-8)')} />
        <Route path="packages/:id" element={Soon('Package details', 'M2 Catalog (KAN-7)')} />
        <Route path="login" element={Soon('Log in', 'M1 Accounts (KAN-6)')} />
        <Route path="register" element={Soon('Create account', 'M1 Accounts (KAN-6)')} />
        <Route element={<RequireRole roles={['CUSTOMER']} />}>
          <Route path="my-bookings" element={Soon('My bookings', 'M4 Booking (KAN-9)')} />
        </Route>

        {/* Agent pages */}
        <Route path="agent" element={<RequireRole roles={['AGENT']} />}>
          <Route index element={Soon('Agent dashboard', 'UI-02 (KAN-82)')} />
          <Route path="customers" element={Soon('Customers', 'M7 Customers (KAN-12)')} />
        </Route>

        {/* Admin pages */}
        <Route path="admin" element={<RequireRole roles={['ADMINISTRATOR']} />}>
          <Route index element={Soon('Admin dashboard', 'UI-02 (KAN-82)')} />
          <Route path="catalog" element={Soon('Catalog and prices', 'M2 Catalog (KAN-7)')} />
          <Route path="staff" element={Soon('Staff accounts', 'M11 Admin (KAN-16)')} />
          <Route path="reports" element={Soon('Reports', 'M10 Reports (KAN-15)')} />
          <Route path="audit" element={Soon('Audit log', 'M11 Admin (KAN-16)')} />
        </Route>

        {/* Component gallery for reviewers, development builds only */}
        {import.meta.env.DEV && <Route path="dev/ui" element={<DevUi />} />}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
