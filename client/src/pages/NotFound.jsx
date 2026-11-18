import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
      <p className="text-6xl font-extrabold text-primary-200">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page went off the map</h1>
      <p className="mt-2 text-slate-600">The link may be old or mistyped. Check the address, or start again from the home page.</p>
      <div className="mt-6 flex gap-3">
        <Button to="/">Go home</Button>
        <Button to="/search" variant="secondary">Explore trips</Button>
      </div>
    </div>
  );
}
