"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useConnection,
  useDeleteConnection,
  useTestConnection,
} from "@/hooks/useConnections";

export default function ConnectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: connection, isLoading } = useConnection(id);
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!connection) return <div className="text-gray-500">Not found</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{connection.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const result = await testConnection.mutateAsync(id);
              alert(`Test: ${result.status} - ${result.message}`);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {testConnection.isPending ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={async () => {
              await deleteConnection.mutateAsync(id);
              router.push("/connections");
            }}
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
    </div>
  );
}
