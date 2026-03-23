import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Pipeline, PipelineCreate, PipelineUpdate } from "@/lib/types";

export function usePipelines() {
  return useQuery<Pipeline[]>({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data } = await api.get("/pipelines/");
      return data;
    },
  });
}

export function usePipeline(id: string) {
  return useQuery<Pipeline>({
    queryKey: ["pipelines", id],
    queryFn: async () => {
      const { data } = await api.get(`/pipelines/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PipelineCreate) => {
      const { data } = await api.post("/pipelines/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PipelineUpdate }) => {
      const { data: result } = await api.put(`/pipelines/${id}`, data);
      return result;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines", id] });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pipelines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
}

export function useTriggerRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pipelineId: string) => {
      const { data } = await api.post(`/pipelines/${pipelineId}/run`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
    },
  });
}
