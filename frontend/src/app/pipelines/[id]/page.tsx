"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { usePipeline, useTriggerRun } from "@/hooks/usePipelines";
import { useRuns } from "@/hooks/useRuns";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";

export default function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pipeline, isLoading } = usePipeline(id);
  const { data: runs } = useRuns(id);
  const triggerRun = useTriggerRun();
  const toast = useToast();

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!pipeline) return <div className="text-gray-500">Not found</div>;

  const handleRun = async () => {
    try {
      await triggerRun.mutateAsync(pipeline.id);
      toast.success(`Pipeline "${pipeline.name}" started`);
    } catch {
      toast.error("Failed to start pipeline");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pipeline.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pipeline.description || "No description"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/pipelines/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleRun}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {triggerRun.isPending ? "Starting..." : "Run Now"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">Schedule</h3>
          <p className="mt-1 text-gray-900">
            {pipeline.schedule || "Manual only"}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="mt-1">
            <span
              className={`text-sm font-medium ${pipeline.is_active ? "text-green-600" : "text-gray-400"}`}
            >
              {pipeline.is_active ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-4 shadow">
        <h3 className="text-sm font-medium text-gray-500">Load Target</h3>
        <pre className="mt-1 overflow-auto rounded bg-gray-50 p-2 text-sm">
          {JSON.stringify(pipeline.load_config, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Run History</h2>
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
              {(!runs || runs.length === 0) ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No runs yet
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id}>
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
