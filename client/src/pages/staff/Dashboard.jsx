// Staff overview for agents and administrators. Tiles come from config/menus.js, so new pages appear here too.
// Each module replaces its tile's "being built" note when it ships; live figures arrive with M10 Reports.
import { Link } from 'react-router-dom';
import { roleLabel, staffMenus } from '../../config/menus.js';
import { useAuth } from '../../lib/auth.jsx';
import { StaffIcon } from '../../components/StaffLayout.jsx';

const greeting = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');

export default function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const groups = staffMenus[user.role] ?? [];
  const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-12">
      <header>
        <p className="eyebrow text-accent-700">{today}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">
          {greeting(now.getHours())}, <em>{user.name.split(' ')[0]}</em>.
        </h1>
        <p className="mt-3 text-primary-600">You are signed in as {roleLabel[user.role].toLowerCase()}. Here is everything you can open.</p>
      </header>

      {groups.map((g) => (
        <section key={g.title} aria-labelledby={`g-${g.title}`}>
          <h2 id={`g-${g.title}`} className="eyebrow font-sans text-primary-500">{g.title}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.items.map((item) => (
              <Link key={item.to} to={item.to} className="group flex gap-4 border border-primary-900/10 bg-surface p-5 transition-colors hover:border-accent-600/40 hover:bg-paper">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-900/15 text-accent-700 transition-colors group-hover:border-accent-600">
                  <StaffIcon name={item.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-xl text-primary-900">{item.label}</span>
                  <span className="mt-1 block text-xs text-primary-500">Being built in {item.ticket}</span>
                </span>
                <span aria-hidden="true" className="ml-auto self-center text-primary-400 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
