import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Film,
  Heart,
  Loader2,
  Play,
  ThumbsDown,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ExternalBlob } from "../backend";
import StarRating from "../components/drama/StarRating";
import { useDeleteDramaEntry, useGetDramaEntry } from "../hooks/useQueries";

interface DramaDetailPageProps {
  id: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export default function DramaDetailPage({
  id,
  onBack,
  onEdit,
}: DramaDetailPageProps) {
  const { data: drama, isLoading, error } = useGetDramaEntry(id);
  const deleteDrama = useDeleteDramaEntry();

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteDrama.mutateAsync(id);
      toast.success("Drama eliminado de tu galería");
      onBack();
    } catch {
      toast.error("Error al eliminar el drama. Intenta de nuevo.");
    }
  };

  if (isLoading) {
    return <DetailSkeleton onBack={onBack} />;
  }

  if (error || !drama) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Film className="w-8 h-8 text-destructive/60" />
        </div>
        <p className="text-foreground font-semibold">Drama no encontrado</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a la galería
        </Button>
      </div>
    );
  }

  const rating = Number(drama.rating);
  const mediaFiles = drama.mediaFiles || [];
  const currentMedia = mediaFiles[currentMediaIndex] as
    | ExternalBlob
    | undefined;
  const currentUrl = currentMedia?.getDirectURL() || null;
  const isCurrentVideo = currentUrl ? isVideoUrl(currentUrl) : false;

  const goToPrev = () =>
    setCurrentMediaIndex((i) => (i > 0 ? i - 1 : mediaFiles.length - 1));
  const goToNext = () =>
    setCurrentMediaIndex((i) => (i < mediaFiles.length - 1 ? i + 1 : 0));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Galería</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(id)}
              className="border-border hover:bg-secondary flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Editar</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
                  disabled={deleteDrama.isPending}
                >
                  {deleteDrama.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:block">Eliminar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-popover border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display text-foreground">
                    ¿Eliminar este drama?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Se eliminará permanentemente{" "}
                    <strong className="text-foreground">"{drama.title}"</strong>{" "}
                    de tu galería incluyendo todas las fotos y videos. Esta
                    acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border hover:bg-secondary">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-8">
          {/* Title & rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              {drama.title}
            </h1>
            <div className="flex items-center gap-3">
              <StarRating value={rating} readonly size="lg" />
              <span className="text-muted-foreground text-sm">
                {rating}/5 estrella{rating !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>

          {/* Media viewer */}
          {mediaFiles.length > 0 && (
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Main viewer */}
              <button
                type="button"
                className="relative rounded-2xl overflow-hidden bg-secondary aspect-video cursor-pointer group w-full"
                onClick={() => setLightboxOpen(true)}
                aria-label="Ver en pantalla completa"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {isCurrentVideo ? (
                      <video
                        src={currentUrl || undefined}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      >
                        <track kind="captions" />
                      </video>
                    ) : currentUrl ? (
                      <img
                        src={currentUrl}
                        alt={drama.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {mediaFiles.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                  </>
                )}

                {/* Media count */}
                {mediaFiles.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-background/70 border border-border text-xs text-foreground">
                    {currentMediaIndex + 1} / {mediaFiles.length}
                  </div>
                )}
              </button>

              {/* Thumbnail strip */}
              {mediaFiles.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mediaFiles.map((blob, i) => {
                    const url = (blob as ExternalBlob).getDirectURL();
                    const isVid = isVideoUrl(url);
                    return (
                      <button
                        type="button"
                        key={url || `media-${i}`}
                        onClick={() => setCurrentMediaIndex(i)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          i === currentMediaIndex
                            ? "border-primary"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        {isVid ? (
                          <div className="w-full h-full bg-secondary/80 flex items-center justify-center">
                            <Play
                              className="w-4 h-4 text-foreground"
                              fill="currentColor"
                            />
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* No media placeholder */}
          {mediaFiles.length === 0 && (
            <motion.div
              className="rounded-2xl bg-secondary/30 border border-border/50 p-12 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Film className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Sin fotos ni videos
              </p>
            </motion.div>
          )}

          {/* Notes section */}
          {(drama.liked || drama.disliked) && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {drama.liked && (
                <div className="rounded-2xl bg-primary/8 border border-primary/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Heart
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                      />
                    </div>
                    <h2 className="font-semibold text-sm text-foreground">
                      Lo que me gustó
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {drama.liked}
                  </p>
                </div>
              )}

              {drama.disliked && (
                <div className="rounded-2xl bg-secondary/50 border border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-sm text-foreground">
                      Lo que no me gustó
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {drama.disliked}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Metadata */}
          <motion.div
            className="text-xs text-muted-foreground/60 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Agregado el{" "}
            {new Date(Number(drama.createdAt) / 1_000_000).toLocaleDateString(
              "es-ES",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </motion.div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && currentUrl && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center"
              onClick={() => setLightboxOpen(false)}
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            <div
              className="max-w-5xl w-full max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="presentation"
            >
              {isCurrentVideo ? (
                <video
                  src={currentUrl}
                  controls
                  className="w-full max-h-[90vh] rounded-2xl"
                  autoPlay
                >
                  <track kind="captions" />
                </video>
              ) : (
                <img
                  src={currentUrl}
                  alt={drama.title}
                  className="w-full max-h-[90vh] object-contain rounded-2xl"
                />
              )}

              {mediaFiles.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Siguiente"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 h-16 flex items-center px-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Galería
        </Button>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <Skeleton className="h-12 w-2/3 bg-card" />
        <Skeleton className="h-6 w-40 bg-card" />
        <Skeleton className="h-64 rounded-2xl bg-card" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-2xl bg-card" />
          <Skeleton className="h-40 rounded-2xl bg-card" />
        </div>
      </div>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|avi|mkv|m4v)/i.test(url);
}
