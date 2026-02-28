import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Heart, LogOut, Plus, Search, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DramaEntry } from "../backend";
import StarRating from "../components/drama/StarRating";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetDramaEntries,
} from "../hooks/useQueries";

interface GalleryPageProps {
  onAddDrama: () => void;
  onViewDrama: (id: string) => void;
}

export default function GalleryPage({
  onAddDrama,
  onViewDrama,
}: GalleryPageProps) {
  const { clear, identity } = useInternetIdentity();
  const { data: dramas, isLoading } = useGetDramaEntries();
  const { data: profile } = useGetCallerUserProfile();
  const [search, setSearch] = useState("");

  const filteredDramas = useMemo(() => {
    if (!dramas) return [];
    if (!search.trim()) return dramas;
    const q = search.toLowerCase();
    return dramas.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.liked.toLowerCase().includes(q),
    );
  }, [dramas, search]);

  const principalStr = identity?.getPrincipal().toString();
  const shortPrincipal = principalStr
    ? `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Film className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground hidden sm:block">
              KeiDrama
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar drama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input/40 border-border h-9 text-sm"
            />
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {profile?.name || shortPrincipal}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-popover border-border"
            >
              <DropdownMenuItem
                onClick={clear}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Mi Galería
          </h1>
          <p className="text-muted-foreground mt-1">
            {dramas
              ? `${dramas.length} drama${dramas.length !== 1 ? "s" : ""} en tu colección`
              : "Cargando tu colección..."}
          </p>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
              <Skeleton key={k} className="h-72 rounded-2xl bg-card" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredDramas.length === 0 && (
          <EmptyState onAdd={onAddDrama} hasSearch={!!search} />
        )}

        {/* Drama grid */}
        {!isLoading && filteredDramas.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {filteredDramas.map((drama, i) => (
                <motion.div
                  key={drama.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <DramaCard
                    drama={drama}
                    onClick={() => onViewDrama(drama.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Floating add button */}
      <motion.div
        className="fixed bottom-8 right-6 sm:right-8 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={onAddDrama}
          size="lg"
          className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-glow-lg p-0"
          aria-label="Agregar drama"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 mt-16 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Construido con{" "}
          <Heart className="w-3 h-3 inline text-primary" fill="currentColor" />{" "}
          usando{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ── Drama Card ─────────────────────────────────────────────────────────────────

interface DramaCardProps {
  drama: DramaEntry;
  onClick: () => void;
}

function DramaCard({ drama, onClick }: DramaCardProps) {
  const coverUrl =
    drama.mediaFiles.length > 0 ? drama.mediaFiles[0].getDirectURL() : null;
  const rating = Number(drama.rating);

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden bg-card border border-border card-glow transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cover image */}
      <div className="relative h-48 bg-secondary overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={drama.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Film className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground">Sin portada</p>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
          <span className="text-star text-xs">★</span>
          <span className="text-xs font-semibold text-foreground">
            {rating}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-base text-foreground line-clamp-2 leading-tight mb-2">
          {drama.title}
        </h3>

        <StarRating value={rating} readonly size="sm" />

        {drama.liked && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            <span className="text-primary/70">♥ </span>
            {drama.liked}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({
  onAdd,
  hasSearch,
}: { onAdd: () => void; hasSearch: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Film className="w-12 h-12 text-primary/50" />
      </motion.div>

      {hasSearch ? (
        <>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Sin resultados
          </h2>
          <p className="text-muted-foreground max-w-sm">
            No encontramos dramas que coincidan con tu búsqueda.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Tu galería está vacía
          </h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            Agrega tu primer K-drama y comienza a construir tu colección
            personal.
          </p>
          <Button
            onClick={onAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar mi primer drama
          </Button>
        </>
      )}
    </motion.div>
  );
}
