import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  Film,
  Image,
  Loader2,
  Play,
  Save,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { DramaEntry } from "../backend";
import StarRating from "../components/drama/StarRating";
import {
  useCreateDramaEntry,
  useGetDramaEntry,
  useUpdateDramaEntry,
} from "../hooks/useQueries";

interface DramaFormPageProps {
  mode: "add" | "edit";
  dramaId?: string;
  onBack: () => void;
  onSaved: () => void;
}

interface MediaItem {
  id: string;
  type: "existing" | "new";
  blob?: ExternalBlob; // existing
  file?: File; // new
  previewUrl?: string;
  uploadProgress?: number;
  isVideo?: boolean;
}

export default function DramaFormPage({
  mode,
  dramaId,
  onBack,
  onSaved,
}: DramaFormPageProps) {
  const { data: existingDrama, isLoading: loadingDrama } = useGetDramaEntry(
    dramaId || "",
  );

  if (mode === "edit" && loadingDrama) {
    return <FormSkeleton onBack={onBack} />;
  }

  return (
    <DramaFormContent
      mode={mode}
      existingDrama={existingDrama}
      onBack={onBack}
      onSaved={onSaved}
    />
  );
}

// ── Inner form (has all the state) ────────────────────────────────────────────

function DramaFormContent({
  mode,
  existingDrama,
  onBack,
  onSaved,
}: {
  mode: "add" | "edit";
  existingDrama?: DramaEntry;
  onBack: () => void;
  onSaved: () => void;
}) {
  const createDrama = useCreateDramaEntry();
  const updateDrama = useUpdateDramaEntry();

  const [title, setTitle] = useState(existingDrama?.title || "");
  const [rating, setRating] = useState(
    existingDrama ? Number(existingDrama.rating) : 0,
  );
  const [liked, setLiked] = useState(existingDrama?.liked || "");
  const [disliked, setDisliked] = useState(existingDrama?.disliked || "");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    if (!existingDrama) return [];
    return existingDrama.mediaFiles.map((blob, i) => ({
      id: `existing-${i}`,
      type: "existing",
      blob,
      previewUrl: blob.getDirectURL(),
      isVideo: isVideoUrl(blob.getDirectURL()),
    }));
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [globalUploadProgress, setGlobalUploadProgress] = useState<
    number | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "El título es obligatorio";
    if (rating < 1 || rating > 5)
      errs.rating = "Selecciona una calificación (1-5 estrellas)";
    return errs;
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newItems: MediaItem[] = files.map((file) => ({
        id: `new-${Date.now()}-${Math.random()}`,
        type: "new",
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith("video/"),
        uploadProgress: 0,
      }));
      setMediaItems((prev) => [...prev, ...newItems]);
      // Reset input
      e.target.value = "";
    },
    [],
  );

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.previewUrl && item.type === "new") {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de guardar");
      return;
    }

    setIsSaving(true);
    setGlobalUploadProgress(0);

    try {
      // Upload new files
      const newItems = mediaItems.filter((m) => m.type === "new" && m.file);
      const uploadedBlobs: ExternalBlob[] = [];

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        if (!item.file) continue;

        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setMediaItems((prev) =>
            prev.map((m) =>
              m.id === item.id ? { ...m, uploadProgress: pct } : m,
            ),
          );
          const overall = ((i + pct / 100) / newItems.length) * 100;
          setGlobalUploadProgress(Math.round(overall));
        });
        uploadedBlobs.push(blob);
      }

      // Combine existing + newly uploaded
      const existingBlobs = mediaItems
        .filter((m) => m.type === "existing" && m.blob)
        .map((m) => m.blob!);

      const allBlobs = [...existingBlobs, ...uploadedBlobs];

      if (mode === "add") {
        await createDrama.mutateAsync({
          title: title.trim(),
          rating,
          liked: liked.trim(),
          disliked: disliked.trim(),
          mediaFiles: allBlobs,
        });
        toast.success("¡Drama agregado a tu galería! 🎬");
      } else if (existingDrama?.id) {
        await updateDrama.mutateAsync({
          id: existingDrama.id,
          title: title.trim(),
          rating,
          liked: liked.trim(),
          disliked: disliked.trim(),
          mediaFiles: allBlobs,
        });
        toast.success("Drama actualizado correctamente ✨");
      }

      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
      setGlobalUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Volver</span>
          </Button>
          <div className="flex-1 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-primary" />
            </div>
            <h1 className="font-display text-lg font-semibold text-foreground">
              {mode === "add" ? "Agregar drama" : "Editar drama"}
            </h1>
          </div>
        </div>
      </motion.header>

      {/* Global upload progress */}
      <AnimatePresence>
        {globalUploadProgress !== null && (
          <motion.div
            className="fixed top-16 left-0 right-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Progress
              value={globalUploadProgress}
              className="h-1 rounded-none bg-secondary"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Title */}
          <motion.section
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-foreground"
              >
                Título del drama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Crash Landing on You, Goblin, My Love From the Star..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                }}
                className="bg-input/40 border-border h-12 text-base"
                autoFocus
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>
          </motion.section>

          {/* Rating */}
          <motion.section
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-semibold text-foreground">
                Calificación <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col gap-2">
                <StarRating
                  value={rating}
                  onChange={(v) => {
                    setRating(v);
                    if (errors.rating) setErrors((p) => ({ ...p, rating: "" }));
                  }}
                  size="lg"
                />
                <p className="text-xs text-muted-foreground">
                  {rating === 0
                    ? "Selecciona una calificación"
                    : rating === 1
                      ? "1 estrella — No me gustó"
                      : rating === 2
                        ? "2 estrellas — Estuvo regular"
                        : rating === 3
                          ? "3 estrellas — Estuvo bien"
                          : rating === 4
                            ? "4 estrellas — Me encantó"
                            : "5 estrellas — ¡Obra maestra!"}
                </p>
              </div>
              {errors.rating && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.rating}
                </p>
              )}
            </div>
          </motion.section>

          {/* Media upload */}
          <motion.section
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="text-sm font-semibold text-foreground">
              Fotos y videos
            </Label>

            {/* Upload zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-8 flex flex-col items-center gap-3 transition-all duration-200 bg-secondary/20 hover:bg-primary/5 w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-primary/70" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">
                  Subir fotos y videos
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPG, PNG, GIF, MP4, MOV — Sin límite de tamaño
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Seleccionar archivos"
              />
            </button>

            {/* Media previews */}
            <AnimatePresence>
              {mediaItems.length > 0 && (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  {mediaItems.map((item) => (
                    <MediaPreview
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveMedia}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Liked */}
          <motion.section
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="liked"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="text-primary">♥</span>
                Lo que me gustó
              </Label>
              <Textarea
                id="liked"
                placeholder="¿Qué fue lo que más amaste de este drama? Los personajes, la historia, la música..."
                value={liked}
                onChange={(e) => setLiked(e.target.value)}
                className="bg-input/40 border-border min-h-28 text-sm resize-none"
                rows={4}
              />
            </div>
          </motion.section>

          {/* Disliked */}
          <motion.section
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="disliked"
                className="text-sm font-semibold text-foreground flex items-center gap-2"
              >
                <span className="text-muted-foreground">✗</span>
                Lo que no me gustó
              </Label>
              <Textarea
                id="disliked"
                placeholder="¿Algo que no te convenció? El final, ciertos giros de trama, personajes..."
                value={disliked}
                onChange={(e) => setDisliked(e.target.value)}
                className="bg-input/40 border-border min-h-28 text-sm resize-none"
                rows={4}
              />
            </div>
          </motion.section>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 pt-2 pb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl shadow-glow sm:max-w-xs"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {mode === "add" ? "Agregar a mi galería" : "Guardar cambios"}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSaving}
              className="flex-1 sm:max-w-xs border-border hover:bg-secondary text-foreground h-12 rounded-xl"
            >
              Cancelar
            </Button>
          </motion.div>
        </form>
      </main>
    </div>
  );
}

// ── Media preview card ─────────────────────────────────────────────────────────

function MediaPreview({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      className="relative group rounded-xl overflow-hidden bg-secondary aspect-square"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {item.isVideo ? (
        <div className="w-full h-full flex items-center justify-center bg-secondary/80">
          <video
            src={item.previewUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          >
            <track kind="captions" />
          </video>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-background/70 flex items-center justify-center">
              <Play
                className="w-5 h-5 text-foreground ml-0.5"
                fill="currentColor"
              />
            </div>
          </div>
        </div>
      ) : item.previewUrl ? (
        <img
          src={item.previewUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Image className="w-8 h-8 text-muted-foreground/40" />
        </div>
      )}

      {/* Upload progress overlay */}
      {item.uploadProgress !== undefined && item.uploadProgress < 100 && (
        <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-1">
          <div className="text-xs font-medium text-foreground">
            {item.uploadProgress}%
          </div>
          <div className="w-3/4">
            <Progress value={item.uploadProgress} className="h-1" />
          </div>
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:border-destructive hover:text-destructive-foreground"
        aria-label="Eliminar archivo"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function FormSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg h-16 flex items-center px-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        {(["title", "rating", "liked", "disliked"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-card rounded animate-pulse" />
            <div className="h-12 bg-card rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|avi|mkv|m4v)/i.test(url);
}
