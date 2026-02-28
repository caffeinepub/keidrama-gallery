import { Button } from "@/components/ui/button";
import { Film, Heart, Image, Play, Star } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function WelcomePage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Hero background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(/assets/generated/kdrama-hero.dim_1200x800.jpg)",
        }}
      />
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.22 355), transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-10 w-96 h-96 rounded-full opacity-8"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.18 280), transparent 70%)",
        }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.12, 0.06] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="px-6 py-6 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Film className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              KeiDrama
            </span>
          </div>
        </motion.header>

        {/* Hero section */}
        <main className="flex-1 flex flex-col md:flex-row items-center px-6 md:px-16 lg:px-24 py-12 gap-12 max-w-7xl mx-auto w-full">
          {/* Left: text content */}
          <div className="flex-1 flex flex-col gap-8 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/25 mb-6">
                <Heart
                  className="w-3.5 h-3.5 text-primary"
                  fill="currentColor"
                />
                <span className="text-xs font-medium text-primary tracking-wide">
                  Tu galería personal de K-dramas
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-foreground">Tu mundo</span>
                <br />
                <span className="text-gradient">K-Drama</span>
                <br />
                <span className="text-foreground">en un lugar</span>
              </h1>
            </motion.div>

            <motion.p
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Crea tu galería personal de K-dramas. Sube fotos y videos,
              califica cada historia y guarda lo que amaste y lo que no. Todo
              tuyo, todo privado.
            </motion.p>

            {/* Features */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              {[
                {
                  icon: Image,
                  label: "Fotos y Videos",
                  desc: "Sube tus momentos favoritos",
                },
                {
                  icon: Star,
                  label: "Calificaciones",
                  desc: "Del 1 al 5 estrellas",
                },
                {
                  icon: Heart,
                  label: "Notas personales",
                  desc: "Lo que amaste y lo que no",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex flex-col gap-2 p-4 rounded-xl bg-card/40 border border-border/60 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 h-auto rounded-xl shadow-glow group"
              >
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Conectando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Crear mi galería
                  </span>
                )}
              </Button>
              <p className="text-xs text-muted-foreground pt-3">
                Inicia sesión de forma segura con Internet Identity
              </p>
            </motion.div>
          </div>

          {/* Right: visual panel */}
          <motion.div
            className="hidden md:flex flex-col gap-4 w-80"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Mock drama cards */}
            {[
              {
                title: "Crash Landing on You",
                rating: 5,
                color: "from-rose-900/60 to-purple-900/60",
              },
              {
                title: "My Love From the Star",
                rating: 4,
                color: "from-purple-900/60 to-indigo-900/60",
              },
              {
                title: "Goblin",
                rating: 5,
                color: "from-indigo-900/60 to-rose-900/60",
              },
            ].map((drama, i) => (
              <motion.div
                key={drama.title}
                className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${drama.color} border border-border/40 backdrop-blur-md`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                whileHover={{ x: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Play
                      className="w-5 h-5 text-primary"
                      fill="currentColor"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {drama.title}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={`star-${si + 1}`}
                          className={`w-3 h-3 ${si < drama.rating ? "text-star fill-star" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 px-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Construido con{" "}
            <Heart
              className="w-3 h-3 inline text-primary"
              fill="currentColor"
            />{" "}
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
    </div>
  );
}
