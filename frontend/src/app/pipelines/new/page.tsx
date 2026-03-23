"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { useCreatePipeline } from "@/hooks/usePipelines";
import { useToast } from "@/components/ui/Toast";
import { tryParseJson } from "@/lib/utils";
import InfoTooltip from "@/components/ui/InfoTooltip";

export default function NewPipelinePage() {
  const router = useRouter();
  const { data: connections } = useConnections();
  const createPipeline = useCreatePipeline();
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceConnectionId, setSourceConnectionId] = useState("");
  const [extractionConfig, setExtractionConfig] = useState("{}");
  const [transformConfig, setTransformConfig] = useState("[]");
  const [loadConfig, setLoadConfig] = useState(
    '{"target_table": "my_data", "if_exists": "replace"}'
  );
  const [schedule, setSchedule] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      await createPipeline.mutateAsync({
        name,
        description: description || undefined,
        source_connection_id: sourceConnectionId,
        extraction_config: JSON.parse(extractionConfig),
        transform_config: JSON.parse(transformConfig),
        load_config: JSON.parse(loadConfig),
        schedule: schedule || undefined,
      });
      toast.success(`Pipeline "${name}" created`);
      router.push("/pipelines");
    } catch {
      toast.error("Failed to create pipeline. Check your input.");
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
      <h1 className="text-2xl font-bold text-gray-900">New Pipeline</h1>

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
          <label className="flex items-center text-sm font-medium text-gray-700">
            Extraction Config (JSON)
            <InfoTooltip title="Extraction Config">
              <p>Defines what to extract from the source.</p>
              <p className="mt-1 font-semibold">REST API example:</p>
              <pre className="mt-1 rounded bg-gray-100 p-2 font-mono">{'{"endpoint": "/users", "method": "GET"}'}</pre>
              <p className="mt-1 font-semibold">With pagination:</p>
              <pre className="mt-1 rounded bg-gray-100 p-2 font-mono">{'{"endpoint": "/items", "pagination": {"type": "offset", "page_size": 100}}'}</pre>
              <p className="mt-1 font-semibold">CSV example:</p>
              <pre className="mt-1 rounded bg-gray-100 p-2 font-mono">{'{"delimiter": ",", "has_header": true}'}</pre>
            </InfoTooltip>
          </label>
          <textarea
            value={extractionConfig}
            onChange={(e) => { setExtractionConfig(e.target.value); setErrors((p) => ({ ...p, extraction: "" })); }}
            rows={3}
            className={`${fieldClass("extraction")} font-mono text-sm`}
          />
          {errors.extraction && <p className="mt-1 text-xs text-red-600">{errors.extraction}</p>}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Transform Config (JSON array)
            <InfoTooltip title="Transform Config">
              <p>A list of transform steps applied in order.</p>
              <p className="mt-1 font-semibold">Available types:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                <li><strong>rename</strong> — rename columns</li>
                <li><strong>filter</strong> — filter rows (eq, ne, gt, gte, lt, lte, contains)</li>
                <li><strong>cast</strong> — change column type (str, int, float, bool)</li>
                <li><strong>drop</strong> — remove columns</li>
              </ul>
              <p className="mt-1 font-semibold">Example:</p>
              <pre className="mt-1 rounded bg-gray-100 p-2 font-mono">{'[{"type": "drop", "columns": ["temp"]}, {"type": "filter", "column": "age", "operator": "gt", "value": 18}]'}</pre>
            </InfoTooltip>
          </label>
          <textarea
            value={transformConfig}
            onChange={(e) => { setTransformConfig(e.target.value); setErrors((p) => ({ ...p, transform: "" })); }}
            rows={3}
            className={`${fieldClass("transform")} font-mono text-sm`}
          />
          {errors.transform && <p className="mt-1 text-xs text-red-600">{errors.transform}</p>}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Load Config (JSON)
            <InfoTooltip title="Load Config">
              <p>Defines where to save data in PostgreSQL.</p>
              <p className="mt-1 font-semibold">Fields:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                <li><strong>target_table</strong> — table name (required)</li>
                <li><strong>if_exists</strong> — &quot;replace&quot;, &quot;append&quot;, or &quot;fail&quot;</li>
                <li><strong>schema</strong> — database schema (default: &quot;public&quot;)</li>
              </ul>
              <pre className="mt-1 rounded bg-gray-100 p-2 font-mono">{'{"target_table": "users", "if_exists": "replace"}'}</pre>
            </InfoTooltip>
          </label>
          <textarea
            value={loadConfig}
            onChange={(e) => { setLoadConfig(e.target.value); setErrors((p) => ({ ...p, load: "" })); }}
            rows={3}
            className={`${fieldClass("load")} font-mono text-sm`}
          />
          {errors.load && <p className="mt-1 text-xs text-red-600">{errors.load}</p>}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            Schedule (cron expression, optional)
            <InfoTooltip title="Cron Schedule">
              <p>Standard cron expression for automatic runs.</p>
              <p className="mt-1 font-semibold">Examples:</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                <li><code>0 */6 * * *</code> — every 6 hours</li>
                <li><code>0 9 * * 1-5</code> — weekdays at 9am</li>
                <li><code>0 0 * * *</code> — daily at midnight</li>
                <li><code>*/30 * * * *</code> — every 30 minutes</li>
              </ul>
              <p className="mt-1">Leave empty for manual-only runs.</p>
            </InfoTooltip>
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
