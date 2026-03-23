# ETLancer Pipeline Guide

ETLancer pipelines follow the classic **Extract → Transform → Load** pattern. This guide explains each stage and how to configure them.

## Overview

```
Connection (data source config)
     │
     ▼
Pipeline
     ├── Extract  →  fetch data from the source
     ├── Transform →  clean, filter, reshape
     └── Load      →  write to PostgreSQL
```

---

## 1. Connection

A connection defines **how to access** a data source. It is reusable — multiple pipelines can share the same connection.

### REST API

| Field | Description | Example |
|-------|-------------|---------|
| `base_url` | Base URL of the API | `https://api.example.com` |

**Credentials** (optional):

| Field | Description | Default |
|-------|-------------|---------|
| `api_key` | API key value | — |
| `header_name` | Header name for the key | `Authorization` |
| `header_prefix` | Prefix before the key | `Bearer ` |

### CSV

| Field | Description | Example |
|-------|-------------|---------|
| `source_type` | `"file"` or `"url"` | `"url"` |
| `file_path` | Local file path (if `source_type: "file"`) | `/data/sales.csv` |
| `source_url` | URL to fetch CSV (if `source_type: "url"`) | `https://data.example.com/export.csv` |

### Google Sheets

| Field | Description | Example |
|-------|-------------|---------|
| `spreadsheet_id` | Google Sheets ID (from the URL) | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms` |

**Credentials** (required):

| Field | Description |
|-------|-------------|
| `service_account_json` | Full service account key as a JSON object |

---

## 2. Extraction Config

Defines **what to extract** from the connection.

### REST API extraction

| Field | Description | Default |
|-------|-------------|---------|
| `endpoint` | API path appended to `base_url` | `""` |
| `method` | HTTP method | `"GET"` |
| `params` | Query parameters as key-value pairs | `{}` |
| `pagination` | Pagination config (see below) | `null` |

**Pagination** (offset-based):

```json
{
  "pagination": {
    "type": "offset",
    "page_size": 100,
    "limit_param": "limit",
    "offset_param": "offset"
  }
}
```

The extractor will fetch pages automatically until it receives fewer items than `page_size`.

### CSV extraction

| Field | Description | Default |
|-------|-------------|---------|
| `delimiter` | Column separator | `","` |
| `encoding` | File encoding | `"utf-8"` |
| `has_header` | Whether the first row is a header | `true` |

### Google Sheets extraction

| Field | Description | Default |
|-------|-------------|---------|
| `worksheet` | Worksheet name | First sheet |
| `range` | Cell range (e.g., `"A1:Z1000"`) | All data |

---

## 3. Transform Config

A **list of steps** applied sequentially to the extracted data. Each step transforms the output of the previous one.

### Available transforms

#### `rename` — Rename columns

```json
{"type": "rename", "mapping": {"old_name": "new_name", "col_b": "column_b"}}
```

#### `filter` — Filter rows

```json
{"type": "filter", "column": "age", "operator": "gt", "value": 18}
```

Available operators:

| Operator | Meaning | Example |
|----------|---------|---------|
| `eq` | Equals | `"value": "active"` |
| `ne` | Not equals | `"value": "inactive"` |
| `gt` | Greater than | `"value": 100` |
| `gte` | Greater than or equal | `"value": 0` |
| `lt` | Less than | `"value": 50` |
| `lte` | Less than or equal | `"value": 999` |
| `contains` | String contains | `"value": "gmail"` |

#### `cast` — Change column type

```json
{"type": "cast", "column": "price", "to": "float"}
```

Common types: `"str"`, `"int"`, `"float"`, `"bool"`, `"datetime64"`.

#### `drop` — Remove columns

```json
{"type": "drop", "columns": ["temp_col", "internal_id"]}
```

### Chaining transforms

Steps run in order. Example:

```json
[
  {"type": "filter", "column": "status", "operator": "eq", "value": "active"},
  {"type": "rename", "mapping": {"user_name": "name"}},
  {"type": "drop", "columns": ["metadata", "internal_flags"]},
  {"type": "cast", "column": "created_at", "to": "datetime64"}
]
```

This filters active rows → renames a column → drops unnecessary columns → converts a date string to datetime.

---

## 4. Load Config

Defines **where to save** the transformed data in PostgreSQL.

| Field | Description | Default |
|-------|-------------|---------|
| `target_table` | Name of the destination table | *(required)* |
| `if_exists` | What to do if the table already exists | `"replace"` |
| `schema` | Database schema | `"public"` |

**`if_exists` options:**

| Value | Behavior |
|-------|----------|
| `"replace"` | Drop and recreate the table with new data |
| `"append"` | Add new rows to the existing table |
| `"fail"` | Raise an error if the table already exists |

---

## 5. Execution Flow

When you click **"Run Now"**, here is what happens:

```
1. POST /api/v1/pipelines/{id}/run
   └── Creates a PipelineRun record (status: "pending")
   └── Dispatches a Prefect flow asynchronously

2. Prefect flow starts
   └── Marks run as "running"
   └── Records the Prefect Flow Run ID

3. EXTRACT task (with 2 automatic retries)
   └── Connects to the data source
   └── Fetches data into a pandas DataFrame

4. TRANSFORM task
   └── Applies each transform step sequentially

5. LOAD task
   └── Writes the DataFrame to PostgreSQL via df.to_sql()

6. Updates run status
   └── "completed" with row counts, or "failed" with error message
```

---

## Examples

### Import users from a REST API

**Connection config:**
```json
{"base_url": "https://jsonplaceholder.typicode.com"}
```

**Extraction config:**
```json
{"endpoint": "/users"}
```

**Transform config:**
```json
[{"type": "drop", "columns": ["address", "company"]}]
```

**Load config:**
```json
{"target_table": "users", "if_exists": "replace"}
```

### Import and filter CSV data

**Connection config:**
```json
{"source_type": "url", "source_url": "https://data.example.com/sales.csv"}
```

**Extraction config:**
```json
{"delimiter": ",", "encoding": "utf-8"}
```

**Transform config:**
```json
[
  {"type": "filter", "column": "amount", "operator": "gt", "value": 0},
  {"type": "cast", "column": "amount", "to": "float"},
  {"type": "rename", "mapping": {"tx_date": "transaction_date"}}
]
```

**Load config:**
```json
{"target_table": "sales_data", "if_exists": "append"}
```
