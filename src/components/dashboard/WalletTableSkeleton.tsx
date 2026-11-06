/**
 * @fileoverview Sleek Loading Skeleton for the Smart Wallets Ledger Table.
 * Provides instant visual feedback during network round-trips and indexer syncs.
 */

export function WalletTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          <td className="py-4">
            <div className="h-4 w-6 rounded bg-white/[0.05]" />
          </td>
          <td>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-white/[0.05]" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
                <div className="h-2.5 w-16 rounded bg-white/[0.03]" />
              </div>
            </div>
          </td>
          <td>
            <div className="h-6 w-14 rounded-md bg-white/[0.05]" />
          </td>
          <td>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded bg-white/[0.05]" />
              <div className="h-1 w-10 rounded-full bg-white/[0.05]" />
            </div>
          </td>
          <td>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-white/[0.05]" />
              <div className="h-3 w-10 rounded bg-white/[0.05]" />
            </div>
          </td>
          <td className="text-right">
            <div className="ml-auto h-7 w-16 rounded-lg bg-white/[0.05]" />
          </td>
        </tr>
      ))}
    </>
  );
}

