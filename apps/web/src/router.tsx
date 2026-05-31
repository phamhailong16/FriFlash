import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/pages/AuthPage";
import { DecksPage } from "@/pages/DecksPage";
import { StatsPage } from "@/pages/StatsPage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
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
      { path: "stats", element: <StatsPage /> },
    ],
  },
]);
