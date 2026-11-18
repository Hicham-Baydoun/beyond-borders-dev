// Staff tables scroll inside their own box on small screens, so the page never scrolls sideways (KAN-84).
// columns: [{ key, header, align?: 'right', render?: (row) => node }]
import { cx } from './cx.js';

export default function Table({ columns, rows, rowKey = 'id', caption, empty = 'Nothing to show yet.', className }) {
  return (
    <div className={cx('overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card', className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cx(
                  'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  c.align === 'right' && 'text-right',
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]} className="hover:bg-slate-50/70">
                {columns.map((c) => (
                  <td key={c.key} className={cx('whitespace-nowrap px-4 py-3', c.align === 'right' && 'text-right')}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
