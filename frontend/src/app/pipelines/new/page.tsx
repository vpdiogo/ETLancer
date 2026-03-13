"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { useCreatePipeline } from "@/hooks/usePipelines";

export default function NewPipelinePage() {
  const router = useRouter();
  const { data: connections } = useConnections();
  const createPipeline = useCreatePipeline();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceConnectionId, setSourceConnectionId] = useState("");
  const [extractionConfig, setExtractionConfig] = useState("{}");
  const [transformConfig, setTransformConfig] = useState("[]");
  const [loadConfig, setLoadConfig] = useState(
    '{"target_table": "my_data", "if_exists": "replace"}'
  );
  const [schedule, setSchedule] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPipeline.mutateAsync({
        name,
        description: description || undefined,
        source_connection_id: sourceConnectionId,
        extraction_config: JSON.parse(extractionConfig),
        transform_config: JSON.parse(transformConfig),
        load_config: JSON.parse(loadConfig),
        schedule: schedule || undefined,
      });
      router.push("/pipelines");
    } catch {
      alert("Error creating pipeline. Check your input.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">New Pipeline</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source Connection
          </label>
          <select
            required
            value={sourceConnectionId}
            onChange={(e) => setSourceConnectionId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a connection...</option>
            {connections?.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({conn.connector_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Extraction Config (JSON)
          </label>
          <textarea
            value={extractionConfig}
            onChange={(e) => setExtractionConfig(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Transform Config (JSON array)
          </label>
          <textarea
            value={transformConfig}
            onChange={(e) => setTransformConfig(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Load Config (JSON)
          </label>
          <textarea
            value={loadConfig}
            onChange={(e) => setLoadConfig(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Schedule (cron expression, optional)
          </label>
          <input
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="0 */6 * * *"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPipeline.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createPipeline.isPending ? "Creating..." : "Create Pipeline"}
          </button>
        </div>
      </form>
    </div>
  );
}
