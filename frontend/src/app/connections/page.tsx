"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, FileSpreadsheet, FileText, Plus, Trash2 } from "lucide-react";
import { useConnections, useDeleteConnection } from "@/hooks/useConnections";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const connectorIcons: Record<string, React.ElementType> = {
  rest_api: Globe,
  csv: FileText,
  google_sheets: FileSpreadsheet,
};

const connectorLabels: Record<string, string> = {
  rest_api: "REST API",
  csv: "CSV",
  google_sheets: "Google Sheets",
};

export default function ConnectionsPage() {
  const { data: connections, isLoading } = useConnections();
  const deleteConnection = useDeleteConnection();
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConnection.mutateAsync(deleteTarget.id);
      toast.success(`Connection "${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete connection");
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your data source connections
          </p>
        </div>
        <Link
          href="/connections/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Connection
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections?.map((conn) => {
            const Icon = connectorIcons[conn.connector_type] || Globe;
            return (
              <div
                key={conn.id}
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{conn.name}</h3>
                      <p className="text-sm text-gray-500">
                        {connectorLabels[conn.connector_type] ||
                          conn.connector_type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteTarget({ id: conn.id, name: conn.name })}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {conn.description && (
                  <p className="mt-3 text-sm text-gray-500">
                    {conn.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${conn.is_active ? "text-green-600" : "text-gray-400"}`}
                  >
                    {conn.is_active ? "Active" : "Inactive"}
                  </span>
                  <Link
                    href={`/connections/${conn.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View details
                  </Link>
                </div>
              </div>
            );
          })}
          {connections?.length === 0 && (
            <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <Plug className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No connections
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first data source connection.
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete connection"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Plug(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </svg>
  );
}
