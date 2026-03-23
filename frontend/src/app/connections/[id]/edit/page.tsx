"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnection, useUpdateConnection } from "@/hooks/useConnections";
import { useToast } from "@/components/ui/Toast";
import { tryParseJson } from "@/lib/utils";

export default function EditConnectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: connection, isLoading } = useConnection(id);
  const updateConnection = useUpdateConnection();
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState("{}");
  const [credentials, setCredentials] = useState("{}");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (connection && !initialized) {
      setName(connection.name);
      setDescription(connection.description || "");
      setConfig(JSON.stringify(connection.config, null, 2));
      setIsActive(connection.is_active);
      setInitialized(true);
    }
  }, [connection, initialized]);

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!connection) return <div className="text-gray-500">Not found</div>;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    const configResult = tryParseJson(config);
    if (!configResult.ok) newErrors.config = `Invalid JSON: ${configResult.error}`;
    const credsResult = tryParseJson(credentials);
    if (!credsResult.ok) newErrors.credentials = `Invalid JSON: ${credsResult.error}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const parsedCreds = JSON.parse(credentials);
      const data: Record<string, unknown> = {
        name,
        description: description || undefined,
        config: JSON.parse(config),
        is_active: isActive,
      };
      if (Object.keys(parsedCreds).length > 0) {
        data.credentials = parsedCreds;
      }
      await updateConnection.mutateAsync({ id, data });
      toast.success(`Connection "${name}" updated`);
      router.push(`/connections/${id}`);
    } catch {
      toast.error("Failed to update connection");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Edit Connection</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Config (JSON)</label>
          <textarea
            value={config}
            onChange={(e) => { setConfig(e.target.value); setErrors((p) => ({ ...p, config: "" })); }}
            rows={4}
            className={`mt-1 block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.config
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.config && <p className="mt-1 text-xs text-red-600">{errors.config}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Credentials (JSON) — leave empty to keep current
          </label>
          <textarea
            value={credentials}
            onChange={(e) => { setCredentials(e.target.value); setErrors((p) => ({ ...p, credentials: "" })); }}
            rows={3}
            className={`mt-1 block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.credentials
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
            placeholder="Leave as {} to keep current credentials"
          />
          {errors.credentials && <p className="mt-1 text-xs text-red-600">{errors.credentials}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || updateConnection.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateConnection.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
