"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { usePipeline, useUpdatePipeline } from "@/hooks/usePipelines";
import { useToast } from "@/components/ui/Toast";

function tryParseJson(value: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export default function EditPipelinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: pipeline, isLoading } = usePipeline(id);
  const { data: connections } = useConnections();
  const updatePipeline = useUpdatePipeline();
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceConnectionId, setSourceConnectionId] = useState("");
  const [extractionConfig, setExtractionConfig] = useState("{}");
  const [transformConfig, setTransformConfig] = useState("[]");
  const [loadConfig, setLoadConfig] = useState("{}");
  const [schedule, setSchedule] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (pipeline && !initialized) {
      setName(pipeline.name);
      setDescription(pipeline.description || "");
      setSourceConnectionId(pipeline.source_connection_id);
      setExtractionConfig(JSON.stringify(pipeline.extraction_config || {}, null, 2));
      setTransformConfig(JSON.stringify(pipeline.transform_config || [], null, 2));
      setLoadConfig(JSON.stringify(pipeline.load_config, null, 2));
      setSchedule(pipeline.schedule || "");
      setIsActive(pipeline.is_active);
      setInitialized(true);
    }
  }, [pipeline, initialized]);

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!pipeline) return <div className="text-gray-500">Not found</div>;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!sourceConnectionId) newErrors.source = "Source connection is required";
    const extResult = tryParseJson(extractionConfig);
    if (!extResult.ok) newErrors.extraction = `Invalid JSON: ${extResult.error}`;
    const transResult = tryParseJson(transformConfig);
    if (!transResult.ok) newErrors.transform = `Invalid JSON: ${transResult.error}`;
    const loadResult = tryParseJson(loadConfig);
    if (!loadResult.ok) newErrors.load = `Invalid JSON: ${loadResult.error}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updatePipeline.mutateAsync({
        id,
        data: {
          name,
          description: description || undefined,
          source_connection_id: sourceConnectionId,
          extraction_config: JSON.parse(extractionConfig),
          transform_config: JSON.parse(transformConfig),
          load_config: JSON.parse(loadConfig),
          schedule: schedule || undefined,
          is_active: isActive,
        },
      });
      toast.success(`Pipeline "${name}" updated`);
      router.push(`/pipelines/${id}`);
    } catch {
      toast.error("Failed to update pipeline");
    }
  };

  const fieldClass = (field: string) =>
    `mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
      errors[field]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }`;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Edit Pipeline</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            className={fieldClass("name")}
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
          <label className="block text-sm font-medium text-gray-700">Source Connection</label>
          <select
            value={sourceConnectionId}
            onChange={(e) => { setSourceConnectionId(e.target.value); setErrors((p) => ({ ...p, source: "" })); }}
            className={fieldClass("source")}
          >
            <option value="">Select a connection...</option>
            {connections?.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({conn.connector_type})
              </option>
            ))}
          </select>
          {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Extraction Config (JSON)</label>
          <textarea
            value={extractionConfig}
            onChange={(e) => { setExtractionConfig(e.target.value); setErrors((p) => ({ ...p, extraction: "" })); }}
            rows={3}
            className={`${fieldClass("extraction")} font-mono text-sm`}
          />
          {errors.extraction && <p className="mt-1 text-xs text-red-600">{errors.extraction}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Transform Config (JSON array)</label>
          <textarea
            value={transformConfig}
            onChange={(e) => { setTransformConfig(e.target.value); setErrors((p) => ({ ...p, transform: "" })); }}
            rows={3}
            className={`${fieldClass("transform")} font-mono text-sm`}
          />
          {errors.transform && <p className="mt-1 text-xs text-red-600">{errors.transform}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Load Config (JSON)</label>
          <textarea
            value={loadConfig}
            onChange={(e) => { setLoadConfig(e.target.value); setErrors((p) => ({ ...p, load: "" })); }}
            rows={3}
            className={`${fieldClass("load")} font-mono text-sm`}
          />
          {errors.load && <p className="mt-1 text-xs text-red-600">{errors.load}</p>}
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
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updatePipeline.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updatePipeline.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
