import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Connection, ConnectionCreate, ConnectionUpdate } from "@/lib/types";

export function useConnections() {
  return useQuery<Connection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data } = await api.get("/connections/");
      return data;
    },
  });
}

export function useConnection(id: string) {
  return useQuery<Connection>({
    queryKey: ["connections", id],
    queryFn: async () => {
      const { data } = await api.get(`/connections/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConnectionCreate) => {
      const { data } = await api.post("/connections/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ConnectionUpdate }) => {
      const { data: result } = await api.put(`/connections/${id}`, data);
      return result;
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connections", id] });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/connections/${id}/test`);
      return data;
    },
  });
}
