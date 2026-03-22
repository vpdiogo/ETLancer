"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { useDeletePipeline, usePipelines, useTriggerRun } from "@/hooks/usePipelines";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function PipelinesPage() {
  const { data: pipelines, isLoading } = usePipelines();
  const deletePipeline = useDeletePipeline();
  const triggerRun = useTriggerRun();
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePipeline.mutateAsync(deleteTarget.id);
      toast.success(`Pipeline "${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete pipeline");
    }
    setDeleteTarget(null);
  };

  const handleRun = async (pipelineId: string, name: string) => {
    try {
      await triggerRun.mutateAsync(pipelineId);
      toast.success(`Pipeline "${name}" started`);
    } catch {
      toast.error("Failed to start pipeline");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your ETL pipelines
          </p>
        </div>
        <Link
          href="/pipelines/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Pipeline
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pipelines?.map((pipeline) => (
            <div
              key={pipeline.id}
              className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2">
                    <GitBranch className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {pipeline.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {pipeline.schedule || "Manual"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget({ id: pipeline.id, name: pipeline.name })}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {pipeline.description && (
                <p className="mt-3 text-sm text-gray-500">
                  {pipeline.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleRun(pipeline.id, pipeline.name)}
                  className="rounded bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                >
                  Run Now
                </button>
                <Link
                  href={`/pipelines/${pipeline.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
          {pipelines?.length === 0 && (
            <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No pipelines
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first ETL pipeline.
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete pipeline"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
