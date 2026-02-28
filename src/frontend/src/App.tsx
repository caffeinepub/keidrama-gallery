import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import DramaDetailPage from "./pages/DramaDetailPage";
import DramaFormPage from "./pages/DramaFormPage";
import GalleryPage from "./pages/GalleryPage";
import SetupPage from "./pages/SetupPage";
import WelcomePage from "./pages/WelcomePage";

export type AppPage =
  | { name: "gallery" }
  | { name: "drama-detail"; id: string }
  | { name: "add-drama" }
  | { name: "edit-drama"; id: string };

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [page, setPage] = useState<AppPage>({ name: "gallery" });

  const isLoggedIn = !!identity;

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();

  // While initializing auth, show a loading screen
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Not logged in — show welcome/auth gate
  if (!isLoggedIn) {
    return (
      <>
        <WelcomePage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Logged in but profile loading
  if (profileLoading) {
    return <LoadingScreen />;
  }

  // Logged in but no profile — show setup
  if (userProfile === null || userProfile === undefined) {
    return (
      <>
        <SetupPage />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Fully authenticated and onboarded
  return (
    <>
      {page.name === "gallery" && (
        <GalleryPage
          onAddDrama={() => setPage({ name: "add-drama" })}
          onViewDrama={(id) => setPage({ name: "drama-detail", id })}
        />
      )}
      {page.name === "drama-detail" && (
        <DramaDetailPage
          id={page.id}
          onBack={() => setPage({ name: "gallery" })}
          onEdit={(id) => setPage({ name: "edit-drama", id })}
        />
      )}
      {page.name === "add-drama" && (
        <DramaFormPage
          mode="add"
          onBack={() => setPage({ name: "gallery" })}
          onSaved={() => setPage({ name: "gallery" })}
        />
      )}
      {page.name === "edit-drama" && (
        <DramaFormPage
          mode="edit"
          dramaId={page.id}
          onBack={() => setPage({ name: "drama-detail", id: page.id })}
          onSaved={() => setPage({ name: "drama-detail", id: page.id })}
        />
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
        </div>
        <p className="text-muted-foreground font-body text-sm tracking-widest uppercase">
          Cargando...
        </p>
      </div>
    </div>
  );
}
