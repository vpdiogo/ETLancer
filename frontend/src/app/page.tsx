"use client";

import { Database, GitBranch, Play, Plug } from "lucide-react";
import { useConnections } from "@/hooks/useConnections";
import { usePipelines } from "@/hooks/usePipelines";
import { useRuns } from "@/hooks/useRuns";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Dashboard() {
  const { data: connections } = useConnections();
  const { data: pipelines } = usePipelines();
  const { data: runs } = useRuns();

  const stats = [
    {
      name: "Connections",
      value: connections?.length ?? 0,
      icon: Plug,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Pipelines",
      value: pipelines?.length ?? 0,
      icon: GitBranch,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      name: "Total Runs",
      value: runs?.length ?? 0,
      icon: Play,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Failed Runs",
      value: runs?.filter((r) => r.status === "failed").length ?? 0,
      icon: Database,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const recentRuns = runs?.slice(0, 10) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your ETL pipelines
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow"
          >
            <div className="flex items-center">
              <div className={`rounded-md ${stat.bg} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Runs</h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
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
                  Rows
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Started
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentRuns.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No runs yet
                  </td>
                </tr>
              ) : (
                recentRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900">
                      {run.id.slice(0, 8)}...
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {run.rows_extracted} / {run.rows_loaded}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {run.started_at
                        ? new Date(run.started_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
