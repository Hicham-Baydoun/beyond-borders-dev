// Photo credits. The Creative Commons licences of our photos require naming the author, the licence and the source.
import { photos } from '../data/photos.js';

export default function Credits() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-accent-700">Thank you</p>
      <h1 className="mt-4 text-4xl sm:text-6xl">Photo credits</h1>
      <p className="mt-5 max-w-xl text-primary-600">
        The destination photos on this site come from Wikimedia Commons. They are used under the Creative Commons licences
        below and were only resized.
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {Object.entries(photos).map(([key, p]) => (
          <li key={key} className="border border-primary-900/10 bg-surface p-3">
            <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" className="aspect-[3/2] w-full object-cover" />
            <div className="px-1 pb-1 pt-4 text-sm">
              <p className="font-display text-xl text-primary-900">{p.subject}</p>
              <p className="mt-1 text-primary-600">Photo by {p.author}</p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] font-medium uppercase tracking-[0.18em]">
                <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="text-accent-700 hover:underline">{p.license}</a>
                <a href={p.source} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">Source on Wikimedia Commons</a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
