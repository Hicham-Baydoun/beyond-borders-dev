// Landing page. Editorial travel design built from real travel objects:
// an airplane window, a boarding pass (search), a departures board (catalog) and a flight path (how booking works).
// The search form only builds the /search URL; M3 (search module) reads these query params.
import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/Logo.jsx';
import { Button, cx } from '../components/ui';
import { formatPrice } from '../components/ui/Price.jsx';

// Seed departures (SRS Table 33). Replace with an API call once M2/M3 expose them.
const departures = [
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', date: '2027-04-15', days: 4, price: 720, places: 10 },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', date: '2027-06-12', days: 5, price: 650, places: 20 },
  { code: 'AYT', city: 'Antalya', country: 'Turkey', date: '2027-07-03', days: 7, price: 890, places: 30 },
  { code: 'CDG', city: 'Paris', country: 'France', date: '2027-09-10', days: 8, price: 1450, places: 12 },
];

const principles = [
  { n: 'I', title: 'One honest price', text: 'Flights, hotel and transfers in a single price per person. What you see on the board is what you pay.' },
  { n: 'II', title: 'Your places, held', text: 'Choose a departure and we hold your places while you finish paying, so nobody books them from under you.' },
  { n: 'III', title: 'People, not a call centre', text: 'Our agents in Beirut book, change and look after your trip with you, before you leave and while you are away.' },
];

const route = [
  { label: 'Find', title: 'Pick a departure', text: 'Search by destination, month, budget and group size.' },
  { label: 'Board', title: 'Add your travelers', text: 'Enter passport details once. They are stored encrypted.' },
  { label: 'Fly', title: 'Pay and go', text: 'Your confirmation, invoice and itinerary arrive by email.' },
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const shortDate = (iso) => `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

/* ---------- Hero: the airplane window ---------- */
function WindowView() {
  const id = useId().replace(/:/g, '');
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[14rem] sm:max-w-[18rem] lg:max-w-[22rem]" aria-hidden="true">
      {/* Cabin wall and bezel */}
      <div className="absolute inset-0 rounded-[48%/38%] bg-paper-dark shadow-[inset_0_2px_0_rgba(255,255,255,.7),0_30px_60px_-30px_rgba(17,22,31,.55)]" />
      <div className="absolute inset-[7%] rounded-[46%/36%] bg-[#d9cfbb] shadow-[inset_0_6px_14px_rgba(17,22,31,.35)]" />
      <svg viewBox="0 0 300 400" className="absolute inset-[11%] h-[78%] w-[78%] overflow-hidden rounded-[44%/34%]">
        <defs>
          <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#11161f" />
            <stop offset=".45" stopColor="#343e54" />
            <stop offset=".72" stopColor="#a6783a" />
            <stop offset=".86" stopColor="#ddc387" />
            <stop offset="1" stopColor="#f5eedc" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" fill={`url(#sky${id})`} />
        {[...Array(14)].map((_, i) => (
          <circle key={i} cx={(i * 67) % 290 + 5} cy={(i * 41) % 130 + 10} r={i % 3 ? 0.8 : 1.3} fill="#f6f1e7" opacity={0.7} />
        ))}
        <circle cx="200" cy="292" r="26" fill="#f5eedc" opacity=".95" />
        <path d="M0 300c40-10 70-4 110 2s90 10 190-6v104H0Z" fill="#ece4d3" opacity=".55" />
        <path d="M0 330c50-12 110-6 160 2s100 6 140-4v72H0Z" fill="#f6f1e7" opacity=".8" />
        {/* Wing */}
        <path d="M300 300 150 372l6 10 144-40Z" fill="#1b2230" />
        <path d="M300 342 156 382h144Z" fill="#11161f" />
        {/* Window shade, half pulled down */}
        <rect width="300" height="46" fill="#ece4d3" />
        <rect y="40" width="300" height="6" fill="#d9cfbb" />
      </svg>
    </div>
  );
}

/* ---------- Boarding-pass search ---------- */
function Barcode() {
  const bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2];
  let x = 0;
  return (
    <svg viewBox="0 0 80 28" className="h-7 w-24" aria-hidden="true">
      {bars.map((w, i) => {
        const r = i % 2 === 0 ? <rect key={i} x={x} width={w} height="28" fill="currentColor" /> : null;
        x += w + 0.6;
        return r;
      })}
    </svg>
  );
}

function BoardingPass() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: '', month: '', travelers: '2' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Object.entries(form).filter(([, v]) => v));
    navigate(`/search?${params}`);
  };

  const label = 'block text-[0.6rem] font-medium uppercase tracking-[0.28em] text-primary-500';
  const input = 'mt-1.5 block w-full border-0 bg-transparent p-0 font-display text-xl text-primary-900 placeholder:text-primary-300 focus:outline-none focus:ring-0';

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search trips"
      className="relative grid bg-[#fbf8f1] text-primary-900 shadow-[0_24px_50px_-28px_rgba(17,22,31,.6)] md:grid-cols-[1fr_0_14rem]"
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-accent-700">Boarding pass</p>
          <LogoMark className="h-7 w-7 text-primary-900" />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
          <div>
            <span className={label}>From</span>
            <p className="mt-1.5 font-display text-3xl leading-none sm:text-4xl">BEY</p>
            <p className="mt-1 text-xs text-primary-500">Beirut</p>
          </div>
          <div className="flex items-end gap-4">
            <svg viewBox="0 0 64 16" className="mb-5 hidden h-4 w-16 shrink-0 text-accent-600 sm:block" aria-hidden="true">
              <path d="M0 8h54" stroke="currentColor" strokeDasharray="3 3" />
              <path d="M54 3l8 5-8 5z" fill="currentColor" />
            </svg>
            <div className="min-w-0 flex-1 border-b border-primary-900/20 pb-2">
              <label htmlFor="bp-dest" className={label}>To</label>
              <input id="bp-dest" className={input} placeholder="Anywhere you dream of" value={form.destination} onChange={set('destination')} />
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <div className="border-b border-primary-900/20 pb-2">
            <label htmlFor="bp-month" className={label}>Month</label>
            <input id="bp-month" type="month" className={cx(input, 'text-lg')} value={form.month} onChange={set('month')} />
          </div>
          <div className="border-b border-primary-900/20 pb-2">
            <label htmlFor="bp-pax" className={label}>Passengers</label>
            <select id="bp-pax" className={cx(input, 'text-lg')} value={form.travelers} onChange={set('travelers')}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'traveler' : 'travelers'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Perforation: notches and a dashed tear line */}
      <div aria-hidden="true" className="relative h-0 border-t border-dashed border-primary-900/25 md:h-auto md:w-0 md:border-l md:border-t-0">
        {/* Notches take the colour of what is behind the pass: paper above the fold line, ink below it */}
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-primary-950 md:bg-paper" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-primary-950 md:-bottom-3 md:-left-3 md:right-auto md:top-auto" />
      </div>

      {/* Stub */}
      <div className="flex flex-col justify-between gap-5 p-5 sm:p-7">
        <div>
          <span className={label}>Gate</span>
          <p className="mt-1.5 font-display text-3xl leading-none">B2B</p>
        </div>
        <Button type="submit" size="lg" className="w-full">Find my trip</Button>
        <Barcode />
      </div>
    </form>
  );
}

/* ---------- Departures board ---------- */
function DeparturesBoard() {
  return (
    <section className="bg-primary-950 text-paper" aria-labelledby="board-title">
      <div className="container-page py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent-300">№ 01 · Departures</p>
            <h2 id="board-title" className="mt-4 text-4xl text-paper sm:text-6xl">
              Now <em className="text-accent-300">boarding</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-primary-300">Every package leaves from Beirut with flights, hotel and transfers included.</p>
        </div>

        <div className="mt-12 border-t border-paper/20" role="table" aria-label="Upcoming departures">
          <div role="row" className="hidden grid-cols-[6rem_1fr_6rem_6rem_8rem_2rem] gap-4 py-3 text-[0.6rem] uppercase tracking-[0.28em] text-primary-400 md:grid">
            <span role="columnheader">Date</span>
            <span role="columnheader">Destination</span>
            <span role="columnheader">Stay</span>
            <span role="columnheader">Group</span>
            <span role="columnheader" className="text-right">From</span>
            <span role="columnheader"><span className="sr-only">Open</span></span>
          </div>
          {departures.map((d) => (
            <Link
              role="row"
              key={d.code}
              to={`/search?destination=${encodeURIComponent(d.city)}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-t border-paper/15 py-5 transition-colors hover:bg-paper/[0.04] md:grid-cols-[6rem_1fr_6rem_6rem_8rem_2rem] md:py-6"
            >
              <span role="cell" className="col-start-1 row-start-1 font-mono text-sm tracking-widest text-accent-300 md:col-start-auto md:row-start-auto md:text-base">{shortDate(d.date)}</span>
              <span role="cell" className="col-span-2 row-start-2 flex items-baseline gap-3 md:col-span-1 md:row-start-auto">
                <span className="font-display text-3xl transition-transform duration-300 group-hover:translate-x-1 sm:text-4xl">{d.city}</span>
                <span className="font-mono text-xs tracking-widest text-primary-400">{d.code}</span>
                <span className="hidden text-xs text-primary-400 lg:inline">· {d.country}</span>
              </span>
              <span role="cell" className="hidden text-sm text-primary-200 md:block">{d.days} days</span>
              <span role="cell" className="hidden text-sm text-primary-200 md:block">{d.places} places</span>
              <span role="cell" className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
                <span className="font-display text-2xl">{formatPrice(d.price)}</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-primary-400">per person</span>
              </span>
              <span role="cell" aria-hidden="true" className="hidden text-accent-300 transition-transform group-hover:translate-x-1 md:block">→</span>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Button to="/search" variant="accent">See every departure</Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Flight path ---------- */
function FlightPath() {
  return (
    <section className="container-page py-20 sm:py-28" aria-labelledby="route-title">
      <p className="eyebrow text-accent-700">№ 03 · How booking works</p>
      <h2 id="route-title" className="mt-4 max-w-xl text-4xl sm:text-5xl">
        Three stops from <em>here</em> to <em>there</em>
      </h2>

      <div className="relative mt-14">
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-28 w-full text-accent-600 md:block" aria-hidden="true">
          <path d="M40 100 C 260 -20, 420 -10, 500 60 S 760 140, 960 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative grid gap-10 border-l border-dashed border-accent-600/50 pl-8 md:grid-cols-3 md:border-0 md:pl-0 md:pt-36">
          {route.map((s, i) => (
            <li key={s.label} className="relative">
              <span className="absolute -left-[2.45rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-accent-600 bg-paper md:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-600" />
              </span>
              <p className="font-mono text-xs tracking-[0.3em] text-accent-700">0{i + 1} — {s.label.toUpperCase()}</p>
              <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-primary-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Passport stamp seal ---------- */
function Seal({ className }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={cx('relative', className)} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-full w-full animate-[spin_40s_linear_infinite] text-accent-700">
        <defs>
          <path id={`c${id}`} d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
        <text className="fill-current text-[13px] uppercase tracking-[0.32em]" style={{ fontFamily: 'Jost, sans-serif' }}>
          <textPath href={`#c${id}`}>Beyond Borders · Departures from Beirut · Est. 2027 ·</textPath>
        </text>
      </svg>
      <LogoMark className="absolute inset-0 m-auto h-[38%] w-[38%] text-primary-900" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="container-page grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pb-24">
          <div>
            <p className="eyebrow text-accent-700">Season 2027 · Packages from Beirut</p>
            <h1 id="hero-title" className="mt-6 text-[3.1rem] leading-[0.95] sm:text-7xl lg:text-[5.4rem] xl:text-[6rem]">
              <span className="whitespace-nowrap">Where dreams</span>
              <br />
              <span className="whitespace-nowrap">travel <em className="text-accent-700">further</em>.</span>
            </h1>
            <div className="mt-8 flex max-w-lg gap-5">
              <span className="mt-2.5 h-px w-12 shrink-0 bg-primary-900/40" aria-hidden="true" />
              <p className="text-lg leading-relaxed text-primary-700">
                Complete travel packages to the places you keep thinking about. One price, real people, no surprises.
              </p>
            </div>
          </div>
          <WindowView />
        </div>

        {/* The boarding pass sits on a dark band that runs into the departures board */}
        <div className="bg-gradient-to-b from-transparent from-50% to-primary-950 to-50%">
          <div className="container-page">
            <BoardingPass />
          </div>
        </div>
      </section>

      <DeparturesBoard />

      {/* Principles */}
      <section className="container-page py-20 sm:py-28" aria-labelledby="ways-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow text-accent-700">№ 02 · The Beyond Borders way</p>
            <h2 id="ways-title" className="mt-4 text-4xl sm:text-5xl">
              Travel, <em>without</em> the paperwork
            </h2>
          </div>
          <div className="divide-y divide-primary-900/15 border-y border-primary-900/15">
            {principles.map((p) => (
              <div key={p.n} className="grid grid-cols-[3.5rem_1fr] gap-4 py-7 sm:grid-cols-[5rem_1fr_1.4fr] sm:items-baseline">
                <span className="font-display text-4xl text-accent-700">{p.n}.</span>
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="col-start-2 text-sm leading-relaxed text-primary-600 sm:col-start-3">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page"><div className="rule" /></div>

      <FlightPath />

      {/* Closing */}
      <section className="border-t border-primary-900/15 bg-paper-dark" aria-labelledby="cta-title">
        <div className="container-page grid items-center gap-10 py-20 sm:py-24 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-accent-700">Your passport is ready</p>
            <h2 id="cta-title" className="mt-4 max-w-2xl text-4xl sm:text-6xl">
              Are <em>you</em>?
            </h2>
            <p className="mt-5 max-w-md text-primary-700">
              Create a free account to save your travelers and follow every booking in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/register" size="lg">Create account</Button>
              <Button to="/search" variant="secondary" size="lg">Browse trips</Button>
            </div>
          </div>
          <Seal className="mx-auto h-44 w-44 sm:h-56 sm:w-56" />
        </div>
      </section>
    </>
  );
}
