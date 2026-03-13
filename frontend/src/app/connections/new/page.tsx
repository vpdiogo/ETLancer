"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileSpreadsheet, FileText, Globe } from "lucide-react";
import { useCreateConnection } from "@/hooks/useConnections";

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
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState("{}");
  const [credentials, setCredentials] = useState("{}");

  const handleSubmit = async () => {
    try {
      await createConnection.mutateAsync({
        name,
        connector_type: selectedType,
        description: description || undefined,
        config: JSON.parse(config),
        credentials: JSON.parse(credentials) || undefined,
      });
      router.push("/connections");
    } catch {
      alert("Error creating connection. Check your input.");
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
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="My API Connection"
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
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Config (JSON)
            </label>
            <textarea
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder='{"base_url": "https://api.example.com"}'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credentials (JSON)
            </label>
            <textarea
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder='{"api_key": "your-key"}'
            />
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
