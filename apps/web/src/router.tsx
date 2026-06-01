import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";

const DecksPage = lazy(() => import("@/pages/DecksPage").then(m => ({ default: m.DecksPage })));
const StatsPage = lazy(() => import("@/pages/StatsPage").then(m => ({ default: m.StatsPage })));
const WordsPage = lazy(() => import("@/pages/WordsPage").then(m => ({ default: m.WordsPage })));
const StudyPage = lazy(() => import("@/pages/StudyPage").then(m => ({ default: m.StudyPage })));
const SharedDeckPage = lazy(() => import("@/pages/SharedDeckPage").then(m => ({ default: m.SharedDeckPage })));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/share/:token",
    element: <Lazy><SharedDeckPage /></Lazy>,
  },
  {
    path: "decks/:deckId/study",
    element: (
      <ProtectedRoute>
        <Lazy><StudyPage /></Lazy>
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/decks" replace /> },
      { path: "decks", element: <Lazy><DecksPage /></Lazy> },
      { path: "decks/:deckId/words", element: <Lazy><WordsPage /></Lazy> },
      { path: "stats", element: <Lazy><StatsPage /></Lazy> },
    ],
  },
]);
