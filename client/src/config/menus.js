// Every menu in the app, keyed by role (SRS Table 8, KAN-82). Add a page here and it appears in the right menus.
// This only shapes the UI: the server checks the role on every request (FR-ACC-04).
//
// Public header (Layout.jsx): VISITOR and CUSTOMER.
// Staff side menu (StaffLayout.jsx): AGENT gets the front desk; ADMINISTRATOR gets the front desk plus administration.

export const publicMenus = {
  VISITOR: [{ to: '/search', label: 'Explore trips' }],
  CUSTOMER: [
    { to: '/search', label: 'Explore trips' },
    { to: '/my-bookings', label: 'My bookings' },
    { to: '/profile', label: 'Profile' },
  ],
};

// icon: a key of staffIcons in components/StaffLayout.jsx
const frontDesk = {
  title: 'Front desk',
  items: [
    { to: '/agent/customers', label: 'Customers', icon: 'people', ticket: 'M7 Customers (KAN-12)' },
    { to: '/agent/bookings', label: 'Bookings', icon: 'ticket', ticket: 'M4 Booking (KAN-9)' },
    { to: '/agent/bookings/new', label: 'New booking', icon: 'plus', ticket: 'FR-BKG-07 (KAN-41)' },
    { to: '/agent/payments', label: 'Payments', icon: 'card', ticket: 'M5 Payment (KAN-10)' },
    { to: '/agent/reviews', label: 'Reviews', icon: 'star', ticket: 'M9 Reviews (KAN-14)' },
  ],
};

const administration = {
  title: 'Administration',
  items: [
    { to: '/admin/catalog', label: 'Catalog', icon: 'globe', ticket: 'M2 Catalog (KAN-7)' },
    { to: '/admin/promotions', label: 'Promotions', icon: 'tag', ticket: 'FR-CAT-04 (KAN-29)' },
    { to: '/admin/staff', label: 'Staff', icon: 'badge', ticket: 'FR-ACC-06 (KAN-25)' },
    { to: '/admin/cancellation-policy', label: 'Cancellation rules', icon: 'scale', ticket: 'FR-ADM-04 (KAN-67)' },
    { to: '/admin/reports', label: 'Reports', icon: 'chart', ticket: 'M10 Reports (KAN-15)' },
    { to: '/admin/audit', label: 'Audit log', icon: 'list', ticket: 'FR-ADM-02 (KAN-66)' },
    { to: '/admin/settings', label: 'Settings', icon: 'cog', ticket: 'M11 Admin (KAN-16)' },
  ],
};

export const staffMenus = {
  AGENT: [frontDesk],
  ADMINISTRATOR: [frontDesk, administration],
};

// Where each role lands after login and when clicking its name.
export const roleHome = { CUSTOMER: '/my-bookings', AGENT: '/agent', ADMINISTRATOR: '/admin' };

export const roleLabel = { CUSTOMER: 'Customer', AGENT: 'Travel agent', ADMINISTRATOR: 'Administrator' };

// Every staff page, flattened, for routes and the dashboard tiles.
export const staffPages = [...frontDesk.items, ...administration.items];
