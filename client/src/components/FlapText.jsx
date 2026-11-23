// Split-flap text, like an airport departures board: letters spin, then settle one by one.
// Starts when `play` becomes true. Screen readers get the final text straight away.
import { useEffect, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

export default function FlapText({ text, play, delay = 0, className }) {
  const [shown, setShown] = useState(text.replace(/[^ ]/g, ' '));

  useEffect(() => {
    if (!play) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text);
      return undefined;
    }
    let frame = 0;
    let timer;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        frame += 1;
        const settled = Math.floor(frame / 3);
        setShown(text.split('').map((c, i) => (c === ' ' || i < settled ? c : rand())).join(''));
        if (settled >= text.length) clearInterval(timer);
      }, 45);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [play, text, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex gap-[2px]">
        {shown.split('').map((c, i) => (
          <span key={i} className={c === ' ' ? 'w-[0.35em]' : 'inline-block min-w-[1.05em] rounded-[2px] bg-white/[0.06] px-[0.12em] text-center'}>
            {c === ' ' ? '' : c}
          </span>
        ))}
      </span>
    </span>
  );
}
