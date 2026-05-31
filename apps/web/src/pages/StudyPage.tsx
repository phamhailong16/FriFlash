import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";
import { SwipeableCard } from "@/components/study/SwipeableCard";
import { SettingsPanel } from "@/components/study/SettingsPanel";
import { SessionSummary } from "@/components/study/SessionSummary";
import { useStudyWords } from "@/hooks/useStudy";
import { useDecks } from "@/hooks/useDecks";
import { useStudySessionStore } from "@/store/studySessionStore";
import { useSettingsStore } from "@/store/settingsStore";
import { studyApi } from "@/lib/study";
import { getMessage } from "@/lib/messages";

export function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const settings = useSettingsStore();

  const { data: deckData } = useDecks({ page: 1, size: 50 });
  const deck = deckData?.items.find((d) => d.id === deckId);

  const { data: words, isLoading, isError } = useStudyWords(deckId!);

  const { cards, currentIndex, results, isComplete, startSession, submitResult } =
    useStudySessionStore();

  const [sessionStarted, setSessionStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Start session when words load
  useEffect(() => {
    if (words && words.length > 0 && !sessionStarted) {
      startSession(deckId!, words, settings.random_order);
      setSessionStarted(true);
    }
  }, [words, sessionStarted, deckId, settings.random_order, startSession]);

  // Fire-and-forget session save when complete
  useEffect(() => {
    if (isComplete && results.length > 0) {
      const knownCount = results.filter((r) => r.result === "known").length;
      studyApi
        .saveSession(deckId!, {
          total_cards: results.length,
          known_count: knownCount,
          unknown_count: results.length - knownCount,
        })
        .catch(() => {});
    }
  }, [isComplete, deckId, results]);

  function handleResult(result: "known" | "unknown") {
    const currentWord = cards[currentIndex];
    if (currentWord) {
      studyApi.evaluate(deckId!, currentWord.id, result).catch(() => {});
    }
    submitResult(result);
  }

  function handleRestart() {
    if (words && words.length > 0) {
      startSession(deckId!, words, settings.random_order);
    }
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFAF6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#C0392B] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <div className="min-h-screen bg-[#FDFAF6] flex flex-col items-center justify-center px-5 text-center">
        <p className="text-gray-600 mb-4">{getMessage("ERR-NET")}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-[#C0392B] text-white rounded-xl text-sm font-semibold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // --- Empty deck ---
  if (words && words.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFAF6] flex flex-col items-center justify-center px-5 text-center">
        <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 56 }} className="mb-4">
          无
        </span>
        <p className="text-gray-600 mb-6">{getMessage("ERR-S003")}</p>
        <button
          onClick={() => navigate(`/decks/${deckId}/words`)}
          className="px-5 py-2.5 bg-[#C0392B] text-white rounded-xl text-sm font-semibold"
        >
          Thêm từ vựng
        </button>
      </div>
    );
  }

  // --- Session complete ---
  if (isComplete) {
    return (
      <SessionSummary
        results={results}
        deckName={deck?.name ?? "Bộ thẻ"}
        onRestart={handleRestart}
        onBack={() => navigate(`/decks/${deckId}/words`)}
      />
    );
  }

  // --- Study in progress ---
  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-[#FDFAF6] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(`/decks/${deckId}/words`)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Bộ thẻ
        </button>
        <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">
          {deck?.name ?? "Học"}
        </p>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Card area */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <SwipeableCard
          key={currentCard.id}
          word={currentCard}
          settings={settings}
          cardNumber={currentIndex + 1}
          totalCards={cards.length}
          onResult={handleResult}
        />
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
