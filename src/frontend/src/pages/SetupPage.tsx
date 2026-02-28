import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function SetupPage() {
  const [name, setName] = useState("");
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("¡Galería creada! Bienvenido a KeiDrama 🎬");
    } catch {
      toast.error("Error al crear el perfil. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, oklch(0.65 0.22 355 / 0.06), transparent)",
        }}
      />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="rounded-2xl bg-card border border-border p-8 shadow-cinematic">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Film className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">
                ¡Bienvenido a KeiDrama!
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Cuéntanos cómo te llamamos para personalizar tu galería
              </p>
            </div>
          </div>

          {/* Permission notice */}
          <div className="bg-accent/30 border border-accent/40 rounded-xl p-4 mb-6 flex gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Permiso de galería
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Al continuar, crearás tu galería personal privada donde podrás
                subir fotos y videos de tus K-dramas favoritos.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Tu nombre
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: Min-ji, Carlos, Ashley..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input/50 border-border focus:border-primary h-11 text-base"
                autoFocus
                autoComplete="given-name"
              />
            </div>

            <Button
              type="submit"
              disabled={saveProfile.isPending || !name.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-glow"
            >
              {saveProfile.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creando galería...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Crear mi galería
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Tu galería es completamente privada y solo tú puedes acceder a ella.
        </p>
      </motion.div>
    </div>
  );
}
