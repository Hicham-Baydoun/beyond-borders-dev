// Landing page: the public face of Beyond Borders.
// The search form only builds the /search URL; M3 (search module) reads these query params.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';

// Destinations that exist in the seed data (Table 33). Replace with an API call once M2 exposes them.
const destinations = [
  { name: 'Istanbul', country: 'Turkey', tagline: 'Bazaars, mosques and Bosphorus sunsets', gradient: 'from-accent-400 via-accent-500 to-primary-800' },
  { name: 'Antalya', country: 'Turkey', tagline: 'Turquoise coast and old-town lanes', gradient: 'from-primary-300 via-primary-500 to-primary-900' },
  { name: 'Paris', country: 'France', tagline: 'Boulevards, museums and Normandy shores', gradient: 'from-slate-400 via-primary-700 to-slate-900' },
  { name: 'Dubai', country: 'United Arab Emirates', tagline: 'Desert dunes and skyline nights', gradient: 'from-amber-300 via-accent-500 to-accent-800' },
];

const features = [
  { icon: '🧳', title: 'Packages that just work', text: 'Flights, hotel and activities bundled into one clear price per person.' },
  { icon: '🔒', title: 'Your place is held', text: 'Pick a departure and we hold your seats while you finish payment.' },
  { icon: '💬', title: 'Real agents', text: 'Our travel agents can book, change and look after your trip with you.' },
];

const steps = [
  { n: '1', title: 'Find a trip', text: 'Search by destination, dates, budget and group size.' },
  { n: '2', title: 'Add your travelers', text: 'Enter passport details once. They are stored encrypted.' },
  { n: '3', title: 'Pay and go', text: 'Get your confirmation and documents by email.' },
];

function HeroSearch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: '', month: '', travelers: '2' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Object.entries(form).filter(([, v]) => v));
    navigate(`/search?${params}`);
  };

  const label = 'block text-xs font-semibold uppercase tracking-wide text-slate-500';
  const input = 'mt-1 block w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0';

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search trips"
      className="grid gap-px overflow-hidden rounded-2xl bg-slate-200 shadow-2xl ring-1 ring-black/5 sm:grid-cols-[1.4fr_1fr_0.8fr_auto]"
    >
      <div className="bg-white px-5 py-3.5 focus-within:bg-primary-50/40">
        <label htmlFor="hero-dest" className={label}>Where to?</label>
        <input id="hero-dest" className={input} placeholder="City or country" value={form.destination} onChange={set('destination')} />
      </div>
      <div className="bg-white px-5 py-3.5 focus-within:bg-primary-50/40">
        <label htmlFor="hero-month" className={label}>When?</label>
        <input id="hero-month" type="month" className={input} value={form.month} onChange={set('month')} />
      </div>
      <div className="bg-white px-5 py-3.5 focus-within:bg-primary-50/40">
        <label htmlFor="hero-travelers" className={label}>Travelers</label>
        <select id="hero-travelers" className={input} value={form.travelers} onChange={set('travelers')}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'traveler' : 'travelers'}</option>
          ))}
        </select>
      </div>
      <div className="bg-white p-2">
        <Button type="submit" variant="accent" size="lg" className="h-full w-full">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.63 3.64a.75.75 0 1 0 1.06-1.06l-3.63-3.64A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
          </svg>
          Search
        </Button>
      </div>
    </form>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-950">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary-600/40 blur-3xl" />
          <div className="absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full bg-accent-500/30 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none" viewBox="0 0 800 400">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M-50 ${330 - i * 40} C 200 ${230 - i * 40}, 500 ${400 - i * 40}, 850 ${250 - i * 40}`} fill="none" stroke="white" strokeWidth="1.5" />
            ))}
          </svg>
        </div>
        <div className="container-page relative pb-20 pt-16 sm:pb-28 sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-100 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden="true" />
            Departures open for 2027
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] text-white sm:text-6xl">
            Where dreams <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">travel further</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-primary-100/80 sm:text-lg">
            Complete travel packages to the places you keep thinking about. One price, real support, no surprises.
          </p>
          <div className="mt-10 max-w-4xl">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="dest-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-accent-700">Popular right now</p>
            <h2 id="dest-title" className="mt-2 text-2xl sm:text-3xl">Where people are going</h2>
          </div>
          <Link to="/search" className="text-sm font-semibold text-primary-700 hover:text-primary-900">
            See all trips <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => (
            <Link
              key={d.name}
              to={`/search?destination=${encodeURIComponent(d.name)}`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-card"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${d.gradient} transition-transform duration-500 group-hover:scale-105`} aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/75">{d.country}</p>
                <h3 className="mt-1 text-2xl font-bold text-white">{d.name}</h3>
                <p className="mt-1 text-sm text-white/85">{d.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="border-y border-slate-200/70 bg-white" aria-labelledby="why-title">
        <div className="container-page py-16 sm:py-20">
          <h2 id="why-title" className="text-center text-2xl sm:text-3xl">Travel without the hassle</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="text-center">
                <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-2xl">{f.icon}</span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl sm:text-3xl">How booking works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500 font-bold text-white">{s.n}</span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 px-6 py-12 text-center sm:px-12">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/30 blur-3xl" />
          <h2 className="relative text-2xl text-white sm:text-3xl">Ready when you are</h2>
          <p className="relative mx-auto mt-2 max-w-md text-primary-100/80">
            Create a free account to save travelers and track your bookings in one place.
          </p>
          <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/register" variant="accent" size="lg">Create account</Button>
            <Button to="/search" variant="secondary" size="lg">Browse trips</Button>
          </div>
        </div>
      </section>
    </>
  );
}
