// Route map of the three areas in SRS Table 8. Pages not built yet show ComingSoon with their Jira ticket.
// Staff pages come from config/menus.js, so a menu entry and its route are added in one place.
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireRole from './components/RequireRole.jsx';
import StaffLayout from './components/StaffLayout.jsx';
import { staffPages } from './config/menus.js';
import ComingSoon from './pages/ComingSoon.jsx';
import Credits from './pages/Credits.jsx';
import DevUi from './pages/DevUi.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Confirm from './pages/auth/Confirm.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Dashboard from './pages/staff/Dashboard.jsx';

const Soon = (title, ticket) => <ComingSoon title={title} ticket={ticket} />;
const route = (item) => <Route key={item.to} path={item.to.slice(1)} element={Soon(item.label, item.ticket)} />;

export default function App() {
  return (
    <Routes>
      {/* Public site: visitors and customers */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={Soon('Explore trips', 'M3 Search (KAN-8)')} />
        <Route path="packages/:id" element={Soon('Package details', 'M2 Catalog (KAN-7)')} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="confirm" element={<Confirm />} />
        <Route path="credits" element={<Credits />} />
        <Route element={<RequireRole roles={['CUSTOMER']} />}>
          <Route path="my-bookings" element={Soon('My bookings', 'M4 Booking (KAN-9)')} />
          <Route path="profile" element={Soon('Profile', 'M1 Accounts (KAN-6)')} />
        </Route>

        {/* Component gallery for reviewers, development builds only */}
        {import.meta.env.DEV && <Route path="dev/ui" element={<DevUi />} />}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Staff area: agents get the front desk; administrators also get administration */}
      <Route element={<RequireRole roles={['AGENT', 'ADMINISTRATOR']} standalone />}>
        <Route element={<StaffLayout />}>
          <Route path="agent" element={<Dashboard />} />
          {staffPages.filter((p) => p.to.startsWith('/agent/')).map(route)}
          <Route element={<RequireRole roles={['ADMINISTRATOR']} />}>
            <Route path="admin" element={<Dashboard />} />
            {staffPages.filter((p) => p.to.startsWith('/admin/')).map(route)}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
