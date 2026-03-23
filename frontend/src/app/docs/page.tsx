"use client";

import { BookOpen, Database, GitBranch, Play, Plug } from "lucide-react";

const sections = [
  {
    id: "connections",
    title: "Connections",
    icon: Plug,
    color: "text-blue-600",
    bg: "bg-blue-50",
    content: [
      {
        subtitle: "REST API",
        config: `{ "base_url": "https://api.example.com" }`,
        credentials: `{
  "api_key": "your-key",
  "header_name": "Authorization",
  "header_prefix": "Bearer "
}`,
        notes: "header_name defaults to 'Authorization' and header_prefix to 'Bearer '. Leave credentials as {} for public APIs.",
      },
      {
        subtitle: "CSV",
        config: `// From URL:
{ "source_type": "url", "source_url": "https://data.example.com/file.csv" }

// From file:
{ "source_type": "file", "file_path": "/data/sales.csv" }`,
        notes: "File paths are restricted to /data and /tmp directories for security.",
      },
      {
        subtitle: "Google Sheets",
        config: `{ "spreadsheet_id": "1BxiMVs0XRA5..." }`,
        credentials: `{ "service_account_json": { ... } }`,
        notes: "The spreadsheet_id is the long string in the Google Sheets URL. Credentials must be a full service account key.",
      },
    ],
  },
  {
    id: "extraction",
    title: "Extraction Config",
    icon: Database,
    color: "text-green-600",
    bg: "bg-green-50",
    content: [
      {
        subtitle: "REST API extraction",
        config: `{
  "endpoint": "/users",
  "method": "GET",
  "params": { "status": "active" }
}`,
        notes: "The endpoint is appended to the connection's base_url. Method defaults to GET.",
      },
      {
        subtitle: "Pagination (automatic)",
        config: `{
  "endpoint": "/items",
  "pagination": {
    "type": "offset",
    "page_size": 100,
    "limit_param": "limit",
    "offset_param": "offset"
  }
}`,
        notes: "Pages are fetched automatically until the API returns fewer items than page_size.",
      },
      {
        subtitle: "CSV extraction",
        config: `{
  "delimiter": ",",
  "encoding": "utf-8",
  "has_header": true
}`,
        notes: "All fields are optional. Defaults: comma delimiter, utf-8, first row as header.",
      },
      {
        subtitle: "Google Sheets extraction",
        config: `{ "worksheet": "Sheet1" }`,
        notes: "Leave empty to use the first sheet. All records are extracted.",
      },
    ],
  },
  {
    id: "transforms",
    title: "Transform Config",
    icon: GitBranch,
    color: "text-purple-600",
    bg: "bg-purple-50",
    content: [
      {
        subtitle: "rename — Rename columns",
        config: `{ "type": "rename", "mapping": { "old_name": "new_name" } }`,
      },
      {
        subtitle: "filter — Filter rows",
        config: `{ "type": "filter", "column": "age", "operator": "gt", "value": 18 }`,
        notes: "Operators: eq, ne, gt, gte, lt, lte, contains",
      },
      {
        subtitle: "cast — Change column type",
        config: `{ "type": "cast", "column": "price", "to": "float" }`,
        notes: "Common types: str, int, float, bool, datetime64",
      },
      {
        subtitle: "drop — Remove columns",
        config: `{ "type": "drop", "columns": ["temp_col", "internal_id"] }`,
      },
      {
        subtitle: "Chaining example",
        config: `[
  { "type": "filter", "column": "status", "operator": "eq", "value": "active" },
  { "type": "rename", "mapping": { "user_name": "name" } },
  { "type": "drop", "columns": ["metadata"] },
  { "type": "cast", "column": "created_at", "to": "datetime64" }
]`,
        notes: "Steps run in order. Each step transforms the output of the previous one.",
      },
    ],
  },
  {
    id: "load",
    title: "Load Config",
    icon: Database,
    color: "text-orange-600",
    bg: "bg-orange-50",
    content: [
      {
        subtitle: "Configuration",
        config: `{
  "target_table": "my_data",
  "if_exists": "replace",
  "schema": "public"
}`,
        notes: 'target_table is required. if_exists options: "replace" (drop and recreate), "append" (add rows), "fail" (error if exists). Schema defaults to "public".',
      },
    ],
  },
  {
    id: "execution",
    title: "Execution Flow",
    icon: Play,
    color: "text-red-600",
    bg: "bg-red-50",
    content: [
      {
        subtitle: "What happens when you click Run Now",
        config: `1. A PipelineRun record is created (status: pending)
2. A Prefect flow is dispatched asynchronously
3. EXTRACT: Data is fetched from the source (with 2 automatic retries)
4. TRANSFORM: Each transform step is applied sequentially
5. LOAD: Data is written to PostgreSQL
6. Run status is updated to "completed" or "failed"`,
        notes: "The extract task has 2 automatic retries with a 30-second delay. If all retries fail, the run is marked as failed with the error message.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
          <p className="mt-1 text-sm text-gray-500">
            How to configure connections, pipelines, and transforms
          </p>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-10">
        {sections.map((section) => (
          <div key={section.id} id={section.id}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`rounded-lg ${section.bg} p-2`}>
                <section.icon className={`h-5 w-5 ${section.color}`} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">{item.subtitle}</h3>
                  <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs font-mono text-gray-800 whitespace-pre-wrap">
                    {item.config}
                  </pre>
                  {"credentials" in item && item.credentials && (
                    <>
                      <p className="mt-2 text-xs font-medium text-gray-500">Credentials:</p>
                      <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs font-mono text-gray-800 whitespace-pre-wrap">
                        {item.credentials}
                      </pre>
                    </>
                  )}
                  {"notes" in item && item.notes && (
                    <p className="mt-2 text-xs text-gray-500">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
