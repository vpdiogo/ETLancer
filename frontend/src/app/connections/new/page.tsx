"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileSpreadsheet, FileText, Globe } from "lucide-react";
import { useCreateConnection } from "@/hooks/useConnections";
import { useToast } from "@/components/ui/Toast";
import { tryParseJson } from "@/lib/utils";

const connectorTypes = [
  {
    id: "rest_api",
    name: "REST API",
    description: "Connect to any REST API endpoint",
    icon: Globe,
  },
  {
    id: "csv",
    name: "CSV",
    description: "Import data from CSV files or URLs",
    icon: FileText,
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    description: "Connect to Google Sheets spreadsheets",
    icon: FileSpreadsheet,
  },
];

export default function NewConnectionPage() {
  const router = useRouter();
  const createConnection = useCreateConnection();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState("{}");
  const [credentials, setCredentials] = useState("{}");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      await createConnection.mutateAsync({
        name,
        connector_type: selectedType,
        description: description || undefined,
        config: JSON.parse(config),
        credentials: Object.keys(parsedCreds).length > 0 ? parsedCreds : undefined,
      });
      toast.success(`Connection "${name}" created`);
      router.push("/connections");
    } catch {
      toast.error("Failed to create connection. Check your input.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">New Connection</h1>

      {step === 1 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">
            Select connector type
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {connectorTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setStep(2);
                }}
                className={`flex flex-col items-center rounded-lg border-2 p-6 text-center transition-colors hover:border-blue-500 ${
                  selectedType === type.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <type.icon className="h-8 w-8 text-blue-600" />
                <h3 className="mt-2 font-medium text-gray-900">{type.name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Configure connection
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="My API Connection"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
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
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Config (JSON)
            </label>
            <textarea
              value={config}
              onChange={(e) => { setConfig(e.target.value); setErrors((p) => ({ ...p, config: "" })); }}
              rows={4}
              className={`mt-1 block w-full rounded-md border px-3 py-2 font-mono text-sm shadow-sm focus:outline-none focus:ring-1 ${
                errors.config
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder='{"base_url": "https://api.example.com"}'
            />
            {errors.config && <p className="mt-1 text-xs text-red-600">{errors.config}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credentials (JSON)
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
              placeholder='{"api_key": "your-key"}'
            />
            {errors.credentials && <p className="mt-1 text-xs text-red-600">{errors.credentials}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name || createConnection.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createConnection.isPending ? "Creating..." : "Create Connection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
