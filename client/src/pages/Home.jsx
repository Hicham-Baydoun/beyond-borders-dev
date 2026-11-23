// Landing page. Editorial travel design built from real travel objects:
// an airplane window, a boarding pass (search), a departures board (catalog) and a flight path (how booking works).
// The search form only builds the /search URL; M3 (search module) reads these query params.
import { useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/Logo.jsx';
import FlapText from '../components/FlapText.jsx';
import RouteMap from '../components/RouteMap.jsx';
import useReveal from '../hooks/useReveal.js';
import { photos, windowViews } from '../data/photos.js';
import { Button, DateCalendar, cx } from '../components/ui';
import { formatPrice } from '../components/ui/Price.jsx';

// Seed departures (SRS Table 33). Replace with an API call once M2/M3 expose them.
const departures = [
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', date: '2027-04-15', days: 4, price: 720, places: 10, lon: 55.3, lat: 25.2, photo: photos.dubai },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', date: '2027-06-12', days: 5, price: 650, places: 20, lon: 29.0, lat: 41.0, photo: photos.istanbul },
  { code: 'AYT', city: 'Antalya', country: 'Turkey', date: '2027-07-03', days: 7, price: 890, places: 30, lon: 30.7, lat: 36.9, photo: photos.antalya },
  { code: 'CDG', city: 'Paris', country: 'France', date: '2027-09-10', days: 8, price: 1450, places: 12, lon: 2.35, lat: 48.86, photo: photos.paris },
].map((d) => ({
  ...d,
  dateLabel: new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
}));

const DEPARTURE_DATES = departures.map((d) => d.date);

const principles = [
  { n: 'I', title: 'One honest price', text: 'Flights, hotel and transfers in a single price per person. What you see on the board is what you pay.' },
  { n: 'II', title: 'Your places, held', text: 'Choose a departure and we hold your places while you finish paying, so nobody books them from under you.' },
  { n: 'III', title: 'People, not a call centre', text: 'Our agents in Beirut book, change and look after your trip with you, before you leave and while you are away.' },
];

const route = [
  { label: 'Find', title: 'Pick a departure', text: 'Search by destination, date, budget and group size.' },
  { label: 'Board', title: 'Add your travelers', text: 'Enter passport details once. They are stored encrypted.' },
  { label: 'Fly', title: 'Pay and go', text: 'Your confirmation, invoice and itinerary arrive by email.' },
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const shortDate = (iso) => `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

/* ---------- Hero: the airplane window, cycling through real destination views ---------- */
function WindowView() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % windowViews.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <figure className="relative mx-auto w-full max-w-[15rem] [container-type:inline-size] sm:max-w-[19rem] lg:max-w-[23rem]">
      <div className="relative aspect-[3/4]" aria-hidden="true">
        {/* Cabin wall and bezel */}
        {/* Concentric layers: each corner radius is the outer radius minus the gap (in container width units),
            so the photo's edge runs exactly parallel to the frame all the way round. */}
        <div className="absolute inset-0 rounded-[42cqw] bg-paper-dark p-[7cqw] shadow-[0_30px_60px_-30px_rgb(var(--shadow)/.55)]">
          <div className="h-full w-full rounded-[35cqw] bg-bezel p-[3.5cqw] shadow-[inset_0_6px_14px_rgb(var(--shadow)/.35)]">
        <div className="relative h-full w-full overflow-hidden rounded-[31.5cqw] bg-night ring-1 ring-inset ring-black/20">
          {windowViews.map((v, n) => (
            <img
              key={v.city}
              src={v.photo.src}
              alt=""
              width={v.photo.width}
              height={v.photo.height}
              decoding="async"
              fetchpriority={n === 0 ? 'high' : 'low'}
              className={cx(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]',
                n === i ? 'animate-kenburns opacity-100' : 'opacity-0',
              )}
            />
          ))}
          {/* Drifting clouds and glass glare */}
          <span className="absolute -left-1/2 top-[18%] h-16 w-[140%] animate-drift rounded-full bg-white/25 blur-2xl" />
          <span className="absolute -left-1/2 top-[62%] h-10 w-[120%] animate-drift-slow rounded-full bg-white/20 blur-xl" />
          <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
        </div>
          </div>
        </div>
      </div>
    </figure>
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
  const [form, setForm] = useState({ destination: '', date: '', travelers: '2' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Object.entries(form).filter(([, v]) => v));
    navigate(`/search?${params}`);
  };

  const label = 'block text-[0.6rem] font-medium uppercase tracking-[0.28em] text-primary-500';
  const input = 'mt-1.5 block w-full border-0 bg-transparent p-0 font-display text-xl text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-0';

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search trips"
      className="relative grid bg-surface text-primary-900 shadow-pop md:grid-cols-[1fr_0_14rem]"
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
            <label htmlFor="bp-date" className={label}>Departure date</label>
            <DateCalendar
              id="bp-date"
              value={form.date}
              onChange={(date) => setForm((f) => ({ ...f, date }))}
              marked={DEPARTURE_DATES}
              buttonClassName="mt-1.5 font-display text-lg text-primary-900"
            />
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
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-night md:bg-paper" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-night md:-bottom-3 md:-left-3 md:right-auto md:top-auto" />
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

/* ---------- Departures board, with a postcard preview of the hovered row ---------- */
function DeparturesBoard() {
  const [ref, visible] = useReveal();
  const [active, setActive] = useState(departures[0].code);
  const current = departures.find((d) => d.code === active);
  return (
    <section className="on-night bg-night text-paper" aria-labelledby="board-title">
      <div ref={ref} className="container-page py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent-300">№ 01 · Departures</p>
            <h2 id="board-title" className="mt-4 text-4xl text-paper sm:text-6xl">
              Now <em className="text-accent-300">boarding</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-primary-300">Every package leaves from Beirut with flights, hotel and transfers included.</p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_26rem]">
          <div className="border-t border-paper/20">
            <div aria-hidden="true" className="hidden grid-cols-[7.5rem_1fr_5.5rem_6rem_7.5rem] gap-4 py-3 pl-3 text-[0.6rem] uppercase tracking-[0.28em] text-primary-400 md:grid">
              <span>Date</span>
              <span>Destination</span>
              <span>Stay</span>
              <span>Group</span>
              <span className="text-right">From</span>
            </div>
            {departures.map((d, n) => (
              <Link
                key={d.code}
                aria-label={`${d.city}, ${d.country}: ${d.days} days from ${formatPrice(d.price)} per person, departs ${d.dateLabel}`}
                to={`/search?destination=${encodeURIComponent(d.city)}`}
                onMouseEnter={() => setActive(d.code)}
                onFocus={() => setActive(d.code)}
                className={cx(
                  'group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-t border-paper/15 py-5 transition-colors md:grid-cols-[7.5rem_1fr_5.5rem_6rem_7.5rem] md:py-6 md:pl-3',
                  d.code === active ? 'bg-paper/[0.05]' : 'hover:bg-paper/[0.03]',
                )}
              >
                <span className={cx('absolute inset-y-0 left-0 w-0.5 bg-accent-300 transition-opacity', d.code === active ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                <img src={d.photo.src} alt="" width={d.photo.width} height={d.photo.height} loading="lazy" className="row-span-2 h-14 w-14 object-cover md:hidden" />
                <span className="font-mono text-sm tracking-widest text-accent-300 md:text-base">
                  <FlapText text={shortDate(d.date)} play={visible} delay={n * 180} />
                </span>
                <span className="col-start-2 flex items-baseline gap-3 md:col-start-auto">
                  <span className="font-display text-3xl transition-transform duration-300 group-hover:translate-x-1 sm:text-4xl">{d.city}</span>
                  <FlapText text={d.code} play={visible} delay={n * 180 + 300} className="hidden font-mono text-xs tracking-widest text-primary-400 sm:inline" />
                </span>
                <span className="hidden text-sm text-primary-200 md:block">{d.days} days</span>
                <span className="hidden text-sm text-primary-200 md:block">{d.places} places</span>
                <span className="col-start-3 row-span-2 row-start-1 text-right md:col-start-auto md:row-span-1 md:row-start-auto md:pr-3">
                  <span className="font-display text-2xl">{formatPrice(d.price)}</span>
                  <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-primary-400">per person</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Postcard preview of the hovered departure */}
          <figure className="relative hidden lg:block" aria-hidden="true">
            <div className="sticky top-28 rotate-[-1.5deg] bg-paper p-3 pb-16 shadow-pop">
              <div className="relative aspect-[4/5] overflow-hidden bg-paper-dark">
                {departures.map((d) => (
                  <img
                    key={d.code}
                    src={d.photo.src}
                    alt=""
                    width={d.photo.width}
                    height={d.photo.height}
                    loading="lazy"
                    className={cx('absolute inset-0 h-full w-full object-cover transition-all duration-700', d.code === active ? 'scale-100 opacity-100' : 'scale-105 opacity-0')}
                  />
                ))}
              </div>
              <figcaption className="absolute bottom-5 left-5 right-5 flex items-baseline justify-between gap-3 text-primary-900">
                <span className="font-display text-2xl italic">Greetings from {current.city}</span>
                <span className="shrink-0 font-mono text-[0.6rem] tracking-[0.2em] text-primary-500">BEY → {current.code}</span>
              </figcaption>
              <div className="absolute -right-10 -top-10">
                <Seal className="h-28 w-28" />
              </div>
            </div>
          </figure>
        </div>
        <div className="mt-10">
          <Button to="/search" variant="accent">See every departure</Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Route chart ---------- */
function WhereWeFly() {
  return (
    <section className="container-page py-20 sm:py-28" aria-labelledby="map-title">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-accent-700">№ 02 · Where we fly</p>
          <h2 id="map-title" className="mt-4 text-4xl sm:text-6xl">
            Every route starts <em className="text-accent-700">at home</em>
          </h2>
        </div>
        <p className="max-w-xs text-sm text-primary-600">Hover a city to see its route, its next departure and the price from Beirut.</p>
      </div>
      <div className="mt-12">
        <RouteMap destinations={departures} />
      </div>
    </section>
  );
}

/* ---------- Flight path ---------- */
function FlightPath() {
  const [ref, visible] = useReveal();
  const [motion, setMotion] = useState(false);
  useEffect(() => setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  return (
    <section ref={ref} className="container-page py-20 sm:py-28" aria-labelledby="route-title">
      <p className="eyebrow text-accent-700">№ 04 · How booking works</p>
      <h2 id="route-title" className="mt-4 max-w-xl text-4xl sm:text-5xl">
        Three stops from <em>here</em> to <em>there</em>
      </h2>

      <div className="relative mt-14">
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-28 w-full text-accent-600 md:block" aria-hidden="true">
          <path id="booking-path" d="M40 100 C 260 -20, 420 -10, 500 60 S 760 140, 960 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {motion && visible && (
            <circle r="5" fill="currentColor">
              <animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .25 1">
                <mpath href="#booking-path" />
              </animateMotion>
            </circle>
          )}
        </svg>
        <ol className="relative grid gap-10 border-l border-dashed border-accent-600/50 pl-8 md:grid-cols-3 md:border-0 md:pl-0 md:pt-36">
          {route.map((s, i) => (
            <li key={s.label} className={cx('reveal relative', visible && 'is-visible')} style={{ transitionDelay: `${i * 150}ms` }}>
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
      <section className="relative" aria-labelledby="hero-title">
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
        <div className="bg-gradient-to-b from-transparent from-50% to-night to-50%">
          <div className="container-page">
            <BoardingPass />
          </div>
        </div>
      </section>

      <DeparturesBoard />

      <WhereWeFly />

      <div className="container-page"><div className="rule" /></div>

      {/* Principles */}
      <section className="container-page py-20 sm:py-28" aria-labelledby="ways-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow text-accent-700">№ 03 · The Beyond Borders way</p>
            <h2 id="ways-title" className="mt-4 text-4xl sm:text-5xl">
              Travel, <em>without</em> the paperwork
            </h2>
          </div>
          <div className="divide-y divide-primary-900/15 border-y border-primary-900/15">
            {principles.map((p) => (
              <div key={p.n} className="grid grid-cols-[3.5rem_1fr] gap-4 py-7 transition-colors hover:bg-primary-900/[0.03] sm:grid-cols-[5rem_1fr_1.4fr] sm:items-baseline">
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

      {/* Closing: Beirut, where every trip starts */}
      <section className="on-night relative isolate overflow-hidden bg-night text-paper" aria-labelledby="cta-title">
        <img
          src={photos.beirut.src}
          alt={photos.beirut.alt}
          width={photos.beirut.width}
          height={photos.beirut.height}
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[30%_60%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/80 to-night/10" aria-hidden="true" />
        <div className="container-page grid items-center gap-10 py-24 sm:py-32 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-accent-300">Pigeon Rocks, Beirut · Your passport is ready</p>
            <h2 id="cta-title" className="mt-4 max-w-2xl text-5xl text-paper sm:text-7xl">
              Are <em className="text-accent-300">you</em>?
            </h2>
            <p className="mt-5 max-w-md text-primary-200">
              Every trip starts here, on the Corniche. Create a free account to save your travelers and follow every booking in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/register" variant="accent" size="lg">Create account</Button>
              <Button to="/search" size="lg" className="bg-transparent ring-1 ring-inset ring-paper/50 hover:bg-paper hover:text-primary-900">Browse trips</Button>
            </div>
          </div>
          <div className="mx-auto rounded-full bg-paper/90 p-2 backdrop-blur">
            <Seal className="h-40 w-40 sm:h-52 sm:w-52" />
          </div>
        </div>
      </section>
    </>
  );
}
