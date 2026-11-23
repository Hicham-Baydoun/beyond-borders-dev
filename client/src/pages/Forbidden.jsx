// 403: shown when a signed-in user opens a page their role cannot use (FR-ACC-04, TC-ACC-04-02).
// The server refuses the data anyway; this page just explains it and offers a way back.
import { roleHome, roleLabel } from '../config/menus.js';
import { useAuth } from '../lib/auth.jsx';
import { Button } from '../components/ui';

export default function Forbidden() {
  const { user } = useAuth();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <p className="font-display text-8xl text-primary-200">403</p>
      <h1 className="mt-4 text-3xl sm:text-4xl">This area isn&apos;t on your itinerary</h1>
      <p className="mt-4 text-primary-600">
        You are signed in as {user ? <strong className="font-medium">{roleLabel[user.role]}</strong> : 'a visitor'}, and this page
        belongs to another role. If you think you should have access, ask an administrator.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to={user ? roleHome[user.role] : '/'}>Back to my area</Button>
        <Button to="/" variant="secondary">Home page</Button>
      </div>
    </div>
  );
}
