// /dev/ui: every shared component on one page so reviewers can check them (KAN-81).
// Only routed in development builds (see App.jsx).
import { useState } from 'react';
import {
  Alert, Badge, BookingStatusBadge, Button, Card, ConfirmDialog, DatePicker, EmptyState,
  Input, Price, Select, Spinner, Table, Textarea, useToast,
} from '../components/ui';

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const swatches = ['primary', 'accent'];
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
// Tailwind needs to see full class names, so list them instead of building strings.
const swatchClass = {
  primary: ['bg-primary-50', 'bg-primary-100', 'bg-primary-200', 'bg-primary-300', 'bg-primary-400', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700', 'bg-primary-800', 'bg-primary-900'],
  accent: ['bg-accent-50', 'bg-accent-100', 'bg-accent-200', 'bg-accent-300', 'bg-accent-400', 'bg-accent-500', 'bg-accent-600', 'bg-accent-700', 'bg-accent-800', 'bg-accent-900'],
};

const bookings = [
  { id: 'BB-1042', customer: 'Rana Khoury', trip: 'Paris and Normandy', status: 'CONFIRMED', total: 2900 },
  { id: 'BB-1043', customer: 'Sample Customer', trip: 'Dubai Getaway', status: 'PENDING', total: 1440 },
  { id: 'BB-1044', customer: 'Sample Customer', trip: 'Istanbul City Break', status: 'CANCELLED', total: 650 },
];

export default function DevUi() {
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fakeCancel = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirmOpen(false);
      toast.success('Booking cancelled', 'A refund of $1,440 is on its way.');
    }, 900);
  };

  return (
    <div className="space-y-12">
      <header>
        <Badge tone="accent">Dev only</Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">UI kit</h1>
        <p className="mt-1 text-slate-600">
          Import from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">src/components/ui</code>. Check new components here at 360 px too.
        </p>
      </header>

      <Section title="Colors">
        {swatches.map((name) => (
          <div key={name}>
            <p className="mb-2 text-sm font-medium capitalize">{name}</p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {shades.map((s, i) => (
                <div key={s} className="space-y-1">
                  <div className={`h-12 rounded-lg ring-1 ring-black/5 ${swatchClass[name][i]}`} />
                  <p className="text-xs text-slate-500">{s}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Form fields">
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" placeholder="Rana Khoury" required />
            <Input label="Email" type="email" placeholder="you@example.com" hint="We send your booking confirmation here." />
            <Input label="Passport number" defaultValue="12" error="Passport number must be 6 to 9 letters or digits." />
            <DatePicker label="Date of birth" />
            <Select
              label="Nationality"
              placeholder="Choose a country"
              options={[{ value: 'LB', label: 'Lebanon' }, { value: 'FR', label: 'France' }, { value: 'TR', label: 'Turkey' }]}
            />
            <Input label="Disabled" disabled defaultValue="Read only" />
            <Textarea label="Special requests" className="sm:col-span-2" placeholder="Dietary needs, accessibility..." />
          </div>
        </Card>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {['PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'COMPLETED'].map((s) => (
            <BookingStatusBadge key={s} status={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="accent">Accent</Badge>
        </div>
      </Section>

      <Section title="Price">
        <div className="flex flex-wrap items-baseline gap-6">
          <Price amount={650} suffix="per person" className="text-2xl" />
          <Price amount="1450.00" />
          <Price amount={1234.5} />
        </div>
      </Section>

      <Section title="Alerts">
        <div className="grid gap-3">
          <Alert title="Your seats are held for 15 minutes">Finish payment before the hold expires.</Alert>
          <Alert tone="success" title="Payment received">Your confirmation email is on its way.</Alert>
          <Alert tone="warning" title="Only 2 places left">Book soon to keep this departure.</Alert>
          <Alert tone="danger" title="These places are no longer available" action={<Button size="sm" variant="secondary">Pick another date</Button>}>
            Someone booked them while you were filling the form.
          </Alert>
        </div>
      </Section>

      <Section title="Table">
        <Table
          caption="Recent bookings"
          rows={bookings}
          columns={[
            { key: 'id', header: 'Booking' },
            { key: 'customer', header: 'Customer' },
            { key: 'trip', header: 'Trip' },
            { key: 'status', header: 'Status', render: (r) => <BookingStatusBadge status={r.status} /> },
            { key: 'total', header: 'Total', align: 'right', render: (r) => <Price amount={r.total} /> },
          ]}
        />
      </Section>

      <Section title="Modal, toast and loading">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>Cancel booking</Button>
          <Button variant="secondary" onClick={() => toast.success('Saved', 'Your changes are stored.')}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast.error('Could not save', 'Check your connection and try again.')}>Error toast</Button>
          <Spinner className="text-primary-700" />
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={fakeCancel}
          loading={loading}
          danger
          title="Cancel this booking?"
          confirmLabel="Yes, cancel booking"
        >
          The cancellation rules give a refund of <Price amount={1440} />. This cannot be undone.
        </ConfirmDialog>
      </Section>

      <Section title="Empty state">
        <EmptyState icon="🗺️" title="No bookings yet" action={<Button to="/search">Find a trip</Button>}>
          When you book a trip it shows up here.
        </EmptyState>
      </Section>
    </div>
  );
}
