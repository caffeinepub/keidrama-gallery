import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface DramaEntry {
    id: string;
    title: string;
    owner: Principal;
    createdAt: Time;
    liked: string;
    rating: bigint;
    disliked: string;
    mediaFiles: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDramaEntry(title: string, rating: bigint, liked: string, disliked: string, mediaFiles: Array<ExternalBlob>): Promise<string>;
    deleteDramaEntry(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDramaEntries(): Promise<Array<DramaEntry>>;
    getDramaEntry(id: string): Promise<DramaEntry>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDramaEntry(id: string, title: string, rating: bigint, liked: string, disliked: string, mediaFiles: Array<ExternalBlob>): Promise<void>;
}
