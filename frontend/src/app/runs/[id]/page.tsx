"use client";

import { useParams } from "next/navigation";
import { useRun } from "@/hooks/useRuns";
import StatusBadge from "@/components/ui/StatusBadge";

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: run, isLoading } = useRun(id);

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!run) return <div className="text-gray-500">Not found</div>;

  const duration =
    run.started_at && run.completed_at
      ? Math.round(
          (new Date(run.completed_at).getTime() -
            new Date(run.started_at).getTime()) /
            1000
        )
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Run Detail</h1>
        <StatusBadge status={run.status} />
      </div>

      <div className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Run ID</h3>
            <p className="mt-1 font-mono text-sm text-gray-900">{run.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pipeline ID</h3>
            <p className="mt-1 font-mono text-sm text-gray-900">
              {run.pipeline_id}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Rows Extracted
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {run.rows_extracted}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Rows Loaded</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {run.rows_loaded}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Started</h3>
            <p className="mt-1 text-sm text-gray-900">
              {run.started_at
                ? new Date(run.started_at).toLocaleString()
                : "-"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="mt-1 text-sm text-gray-900">
              {run.completed_at
                ? new Date(run.completed_at).toLocaleString()
                : "-"}
            </p>
          </div>
          {duration !== null && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="mt-1 text-sm text-gray-900">{duration}s</p>
            </div>
          )}
        </div>

        {run.error_message && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-red-600">Error</h3>
            <pre className="mt-1 overflow-auto rounded bg-red-50 p-3 text-sm text-red-800">
              {run.error_message}
            </pre>
          </div>
        )}

        {run.prefect_flow_run_id && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">
              Prefect Flow Run ID
            </h3>
            <p className="mt-1 font-mono text-sm text-gray-900">
              {run.prefect_flow_run_id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
