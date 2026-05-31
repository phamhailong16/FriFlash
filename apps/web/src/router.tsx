import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";
import { DecksPage } from "@/pages/DecksPage";
import { StatsPage } from "@/pages/StatsPage";
import { WordsPage } from "@/pages/WordsPage";
import { StudyPage } from "@/pages/StudyPage";
import { SharedDeckPage } from "@/pages/SharedDeckPage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/share/:token",
    element: <SharedDeckPage />,
  },
  {
    path: "decks/:deckId/study",
    element: (
      <ProtectedRoute>
        <StudyPage />
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
      { path: "decks", element: <DecksPage /> },
      { path: "decks/:deckId/words", element: <WordsPage /> },
      { path: "stats", element: <StatsPage /> },
    ],
  },
]);
