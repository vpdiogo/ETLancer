import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PipelineRun } from "@/lib/types";

export function useRuns(pipelineId?: string, status?: string) {
  return useQuery<PipelineRun[]>({
    queryKey: ["runs", pipelineId, status],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (pipelineId) params.pipeline_id = pipelineId;
      if (status) params.status = status;
      const { data } = await api.get("/runs/", { params });
      return data;
    },
    refetchInterval: (query) => {
      const runs = query.state.data;
      if (!runs) return 5000;
      const hasActive = runs.some(
        (r) => r.status === "pending" || r.status === "running",
      );
      return hasActive ? 5000 : false;
    },
  });
}

export function useRun(id: string) {
  return useQuery<PipelineRun>({
    queryKey: ["runs", id],
    queryFn: async () => {
      const { data } = await api.get(`/runs/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const run = query.state.data;
      if (run && (run.status === "completed" || run.status === "failed")) {
        return false;
      }
      return 3000;
    },
  });
}
