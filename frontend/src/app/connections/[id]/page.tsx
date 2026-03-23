"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  useConnection,
  useDeleteConnection,
  useTestConnection,
} from "@/hooks/useConnections";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ConnectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: connection, isLoading } = useConnection(id);
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();
  const toast = useToast();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!connection) return <div className="text-gray-500">Not found</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{connection.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/connections/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={async () => {
              try {
                const result = await testConnection.mutateAsync(id);
                if (result.status === "ok") {
                  toast.success(result.message);
                } else {
                  toast.error(result.message);
                }
              } catch {
                toast.error("Failed to test connection");
              }
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {testConnection.isPending ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Type</h3>
          <p className="mt-1 text-gray-900">{connection.connector_type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-gray-900">
            {connection.description || "No description"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="mt-1">
            <span
              className={`text-sm font-medium ${connection.is_active ? "text-green-600" : "text-gray-400"}`}
            >
              {connection.is_active ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Config</h3>
          <pre className="mt-1 overflow-auto rounded bg-gray-50 p-3 text-sm">
            {JSON.stringify(connection.config, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created</h3>
          <p className="mt-1 text-gray-900">
            {new Date(connection.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete connection"
        message={`Are you sure you want to delete "${connection.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          try {
            await deleteConnection.mutateAsync(id);
            toast.success(`Connection "${connection.name}" deleted`);
            router.push("/connections");
          } catch {
            toast.error("Failed to delete connection");
          }
          setShowDelete(false);
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
