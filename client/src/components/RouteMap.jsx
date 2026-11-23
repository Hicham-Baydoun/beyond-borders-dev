// Route chart from Beirut, drawn like an airline route map: graticule, sea names and flight arcs.
// Arcs draw themselves when the chart scrolls into view; small planes fly them on a loop.
// Hover, focus or tap a city to light its route and show its postcard. Reduced motion: no flying planes.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal.js';
import { cx, formatPrice } from './ui';

// Chart bounds (degrees) and size (SVG units). Simple equirectangular projection.
const W = 1000;
const H = 560;
const LON = [-5, 60];
const LAT = [20, 52];
const px = (lon, lat) => [((lon - LON[0]) / (LON[1] - LON[0])) * W, ((LAT[1] - lat) / (LAT[1] - LAT[0])) * H];

const HOME = { code: 'BEY', city: 'Beirut', lon: 35.5, lat: 33.9 };

const SEAS = [
  { name: 'Mediterranean Sea', lon: 17, lat: 35.2 },
  { name: 'Black Sea', lon: 34, lat: 43.3 },
  { name: 'Red Sea', lon: 38.6, lat: 22.4 },
  { name: 'Arabian Gulf', lon: 48.8, lat: 28.8 },
  { name: 'Bay of Biscay', lon: 0.5, lat: 46.6 },
];

// Curved route: a quadratic arc bowed to the side, like great-circle lines on airline maps.
function arc(from, to) {
  const [x1, y1] = px(from.lon, from.lat);
  const [x2, y2] = px(to.lon, to.lat);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const bow = Math.min(120, len * 0.28);
  const nx = -dy / len;
  const ny = dx / len;
  const sign = ny > 0 ? -1 : 1; // always bow upwards
  return { d: `M${x1} ${y1} Q${mx + nx * bow * sign} ${my + ny * bow * sign} ${x2} ${y2}`, x2, y2, len };
}

export default function RouteMap({ destinations }) {
  const [ref, visible] = useReveal({ threshold: 0.25 });
  const [active, setActive] = useState(destinations[0].code);
  const [motion, setMotion] = useState(false);
  useEffect(() => setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  const routes = useMemo(() => destinations.map((d) => ({ ...d, ...arc(HOME, d) })), [destinations]);
  const [hx, hy] = px(HOME.lon, HOME.lat);
  const current = routes.find((r) => r.code === active) ?? routes[0];

  return (
    <div ref={ref} className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="relative overflow-x-auto border border-primary-900/15 bg-surface/60">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[42rem]" role="img" aria-label="Route map: flights from Beirut to Istanbul, Antalya, Paris and Dubai">
          {/* Graticule */}
          <g className="text-primary-900" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1">
            {Array.from({ length: 14 }, (_, i) => LON[0] + i * 5).map((lon) => {
              const [x] = px(lon, 0);
              return <line key={`v${lon}`} x1={x} y1="0" x2={x} y2={H} />;
            })}
            {Array.from({ length: 7 }, (_, i) => LAT[0] + i * 5).map((lat) => {
              const [, y] = px(0, lat);
              return <line key={`h${lat}`} x1="0" y1={y} x2={W} y2={y} />;
            })}
          </g>
          <g className="fill-primary-400 font-sans" fontSize="10" letterSpacing="2">
            {[0, 10, 20, 30, 40, 50].map((lon) => (
              <text key={lon} x={px(lon, 0)[0] + 4} y={H - 8}>{lon}°E</text>
            ))}
            {[25, 35, 45].map((lat) => (
              <text key={lat} x="6" y={px(0, lat)[1] - 5}>{lat}°N</text>
            ))}
          </g>
          <g className="fill-primary-400 font-display" fontSize="17" fontStyle="italic">
            {SEAS.map((s) => {
              const [x, y] = px(s.lon, s.lat);
              return <text key={s.name} x={x} y={y} textAnchor="middle">{s.name}</text>;
            })}
          </g>

          {/* Compass rose */}
          <g transform={`translate(${W - 70} 70)`} className="text-primary-900" stroke="currentColor" fill="none" strokeOpacity="0.35">
            <circle r="26" />
            <path d="M0 -36 L5 0 L0 36 L-5 0 Z" fill="currentColor" fillOpacity="0.25" />
            <text y="-42" textAnchor="middle" fontSize="11" className="fill-primary-500 font-sans" stroke="none">N</text>
          </g>

          {/* Routes */}
          {routes.map((r, i) => {
            const on = r.code === active;
            return (
              <g key={r.code}>
                <path
                  id={`route-${r.code}`}
                  d={r.d}
                  fill="none"
                  className={cx('transition-[stroke-opacity,stroke-width] duration-300', on ? 'stroke-accent-600' : 'stroke-accent-600/45')}
                  strokeWidth={on ? 2.2 : 1.3}
                  strokeDasharray={r.len * 1.3}
                  strokeDashoffset={visible ? 0 : r.len * 1.3}
                  style={{ transition: `stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1) ${i * 0.25}s` }}
                />
                {motion && visible && (
                  <circle r={on ? 4 : 3} className="fill-accent-600">
                    <animateMotion dur={`${5 + i * 1.3}s`} begin={`${1.6 + i * 0.25}s`} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#route-${r.code}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Destinations */}
          {routes.map((r) => {
            const on = r.code === active;
            return (
              <g
                key={`pin-${r.code}`}
                tabIndex={0}
                role="button"
                aria-label={`${r.city}, ${r.days} days from ${formatPrice(r.price)}`}
                aria-pressed={on}
                onMouseEnter={() => setActive(r.code)}
                onFocus={() => setActive(r.code)}
                onClick={() => setActive(r.code)}
                className="cursor-pointer outline-none"
              >
                <circle cx={r.x2} cy={r.y2} r="18" fill="transparent" />
                <circle cx={r.x2} cy={r.y2} r={on ? 7 : 5} className={cx('transition-all duration-300', on ? 'fill-accent-600' : 'fill-surface stroke-accent-600')} strokeWidth="2" />
                {on && <circle cx={r.x2} cy={r.y2} r="14" fill="none" className="stroke-accent-600/40" strokeWidth="1" />}
                <text x={r.x2} y={r.y2 - 16} textAnchor="middle" className={cx('font-display transition-colors', on ? 'fill-primary-900' : 'fill-primary-600')} fontSize="20">
                  {r.city}
                </text>
                <text x={r.x2} y={r.y2 + 26} textAnchor="middle" className="fill-primary-400 font-sans" fontSize="10" letterSpacing="2">
                  {r.code}
                </text>
              </g>
            );
          })}

          {/* Home: Beirut */}
          <g>
            <circle cx={hx} cy={hy} r="22" className="fill-primary-900/5 stroke-primary-900/30" />
            <circle cx={hx} cy={hy} r="6" className="fill-primary-900" />
            <text x={hx + 14} y={hy + 30} className="fill-primary-900 font-display" fontSize="22">Beirut</text>
            <text x={hx + 14} y={hy + 46} className="fill-accent-700 font-sans" fontSize="10" letterSpacing="2">BEY · HOME</text>
          </g>
        </svg>
      </div>

      {/* Postcard for the active route */}
      <Link
        to={`/search?destination=${encodeURIComponent(current.city)}`}
        className="group block rotate-[1.2deg] border border-primary-900/10 bg-surface p-3 shadow-pop transition-transform duration-300 hover:rotate-0"
        aria-live="polite"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-dark">
          {routes.map((r) => (
            <img
              key={r.code}
              src={r.photo.src}
              alt={r.code === current.code ? r.photo.alt : ''}
              width={r.photo.width}
              height={r.photo.height}
              loading="lazy"
              decoding="async"
              className={cx('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', r.code === current.code ? 'opacity-100' : 'opacity-0')}
            />
          ))}
          <span className="absolute right-2 top-2 border border-paper/70 px-2 py-1 font-mono text-[0.6rem] tracking-[0.2em] text-paper backdrop-blur-sm">
            BEY → {current.code}
          </span>
        </div>
        <div className="px-2 pb-2 pt-4">
          <p className="eyebrow text-accent-700">{current.country}</p>
          <p className="mt-1 font-display text-3xl text-primary-900">{current.city}</p>
          <div className="mt-3 flex items-end justify-between text-sm text-primary-600">
            <span>{current.days} days · from {current.dateLabel}</span>
            <span className="font-display text-2xl text-primary-900">{formatPrice(current.price)}</span>
          </div>
          <p className="mt-4 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-primary-500 transition-colors group-hover:text-accent-700">
            See this trip →
          </p>
        </div>
      </Link>
    </div>
  );
}
