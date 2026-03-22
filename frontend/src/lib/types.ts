export interface Connection {
  id: string;
  name: string;
  connector_type: string;
  config: Record<string, unknown>;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectionCreate {
  name: string;
  connector_type: string;
  config: Record<string, unknown>;
  credentials?: Record<string, unknown> | null;
  description?: string;
  is_active?: boolean;
}

export interface ConnectionUpdate {
  name?: string;
  connector_type?: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown> | null;
  description?: string;
  is_active?: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string | null;
  source_connection_id: string;
  extraction_config?: Record<string, unknown> | null;
  transform_config?: Record<string, unknown>[] | null;
  load_config: Record<string, unknown>;
  schedule?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineCreate {
  name: string;
  description?: string;
  source_connection_id: string;
  extraction_config?: Record<string, unknown> | null;
  transform_config?: Record<string, unknown>[] | null;
  load_config: Record<string, unknown>;
  schedule?: string;
  is_active?: boolean;
}

export interface PipelineUpdate {
  name?: string;
  description?: string;
  source_connection_id?: string;
  extraction_config?: Record<string, unknown> | null;
  transform_config?: Record<string, unknown>[] | null;
  load_config?: Record<string, unknown>;
  schedule?: string;
  is_active?: boolean;
}

export interface PipelineRun {
  id: string;
  pipeline_id: string;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  rows_extracted: number;
  rows_loaded: number;
  error_message?: string | null;
  prefect_flow_run_id?: string | null;
  created_at: string;
}

export interface ConnectionTestResult {
  status: string;
  message: string;
}
