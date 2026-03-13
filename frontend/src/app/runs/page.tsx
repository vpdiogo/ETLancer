"use client";

import Link from "next/link";
import { useRuns } from "@/hooks/useRuns";
import StatusBadge from "@/components/ui/StatusBadge";

export default function RunsPage() {
  const { data: runs, isLoading } = useRuns();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Pipeline Runs</h1>
      <p className="mt-1 text-sm text-gray-500">
        View all pipeline execution history
      </p>

      {isLoading ? (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Run ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Extracted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Loaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(!runs || runs.length === 0) ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No runs yet. Trigger a pipeline to see runs here.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        href={`/runs/${run.id}`}
                        className="font-mono text-blue-600 hover:text-blue-700"
                      >
                        {run.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {run.rows_extracted}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {run.rows_loaded}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {run.started_at
                        ? new Date(run.started_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {run.completed_at
                        ? new Date(run.completed_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
