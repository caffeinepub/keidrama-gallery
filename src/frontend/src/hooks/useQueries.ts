import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DramaEntry, ExternalBlob, UserProfile } from "../backend";
import { useActor } from "./useActor";

// ── Drama queries ──────────────────────────────────────────────────────────────

export function useGetDramaEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<DramaEntry[]>({
    queryKey: ["dramaEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDramaEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDramaEntry(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DramaEntry>({
    queryKey: ["dramaEntry", id],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDramaEntry(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export interface CreateDramaInput {
  title: string;
  rating: number;
  liked: string;
  disliked: string;
  mediaFiles: ExternalBlob[];
}

export function useCreateDramaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDramaInput) => {
      if (!actor) throw new Error("No actor available");
      return actor.createDramaEntry(
        input.title,
        BigInt(input.rating),
        input.liked,
        input.disliked,
        input.mediaFiles,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dramaEntries"] });
    },
  });
}

export interface UpdateDramaInput {
  id: string;
  title: string;
  rating: number;
  liked: string;
  disliked: string;
  mediaFiles: ExternalBlob[];
}

export function useUpdateDramaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateDramaInput) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateDramaEntry(
        input.id,
        input.title,
        BigInt(input.rating),
        input.liked,
        input.disliked,
        input.mediaFiles,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dramaEntries"] });
      queryClient.invalidateQueries({ queryKey: ["dramaEntry", variables.id] });
    },
  });
}

export function useDeleteDramaEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor available");
      return actor.deleteDramaEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dramaEntries"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
