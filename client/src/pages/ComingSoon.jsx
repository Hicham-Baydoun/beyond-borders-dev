// Stand-in for pages whose module is not built yet. Each route names the Jira ticket that will replace it.
import { Button, EmptyState } from '../components/ui';

export default function ComingSoon({ title, ticket }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <EmptyState
        icon="🛠️"
        title="This page is being built"
        action={<Button to="/" variant="secondary">Back to home</Button>}
      >
        {ticket ? `It is tracked in Jira as ${ticket}.` : 'Check back soon.'}
      </EmptyState>
    </div>
  );
}
