import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { Word, StudySettings } from "@/types/api";

interface Props {
  word: Word;
  settings: StudySettings;
  cardNumber: number;
  totalCards: number;
  onResult: (result: "known" | "unknown") => void;
}

export function SwipeableCard({ word, settings, cardNumber, totalCards, onResult }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    const utt = new SpeechSynthesisUtterance(word.hanzi);
    utt.lang = "zh-CN";
    utt.rate = 0.85;
    const zhVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("zh"));
    if (zhVoice) utt.voice = zhVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }, [word.hanzi]);

  useEffect(() => {
    if (isFlipped && settings.auto_pronounce) speak();
  }, [isFlipped, settings.auto_pronounce, speak]);

  const knownOpacity = useTransform(x, [0, 100], [0, 1]);
  const unknownOpacity = useTransform(x, [-100, 0], [1, 0]);

  const v = word.variant_groups;

  const showHanziFront = settings.show_hanzi === "both" || settings.show_hanzi === "front";
  const showHanziBack = settings.show_hanzi === "both" || settings.show_hanzi === "back";
  const showPinyinFront = settings.show_pinyin === "both";
  const showPinyinBack = settings.show_pinyin === "both" || settings.show_pinyin === "back";
  const showMeaningFront = settings.show_meaning === "both";
  const showMeaningBack = settings.show_meaning === "both" || settings.show_meaning === "back";

  async function commitResult(result: "known" | "unknown") {
    if (isAnimating) return;
    setIsAnimating(true);
    const target = result === "known" ? 600 : -600;
    await animate(x, target, { duration: 0.28, ease: "easeIn" });
    onResult(result);
  }

  async function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (isAnimating) return;
    const { offset, velocity } = info;
    if (offset.x > 80 || velocity.x > 400) {
      await commitResult("known");
    } else if (offset.x < -80 || velocity.x < -400) {
      await commitResult("unknown");
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  const cardBase =
    "absolute inset-0 bg-white rounded-2xl border border-[#E8E0D5] shadow-lg p-8 flex flex-col items-center justify-center overflow-y-auto";

  return (
    <div className="flex flex-col items-center w-full">
      {/* Progress */}
      <p className="text-sm text-gray-400 mb-5 tabular-nums">
        {cardNumber} / {totalCards}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-1 bg-gray-200 rounded-full mb-6">
        <div
          className="h-1 bg-[#F39C12] rounded-full transition-all duration-300"
          style={{ width: `${((cardNumber - 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Drag wrapper */}
      <motion.div
        style={{ x }}
        drag={isFlipped && !isAnimating ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        data-testid="flashcard"
        className="relative w-full max-w-sm cursor-pointer"
        onClick={!isFlipped && !isAnimating ? () => setIsFlipped(true) : undefined}
      >
        {/* Known overlay */}
        <motion.div
          style={{ opacity: knownOpacity }}
          className="absolute inset-0 h-[340px] z-20 bg-[#27AE60]/90 rounded-2xl flex items-center justify-center pointer-events-none"
        >
          <span className="text-white text-2xl font-bold tracking-wide">✓ Đã biết</span>
        </motion.div>

        {/* Unknown overlay */}
        <motion.div
          style={{ opacity: unknownOpacity }}
          className="absolute inset-0 h-[340px] z-20 bg-[#E74C3C]/90 rounded-2xl flex items-center justify-center pointer-events-none"
        >
          <span className="text-white text-2xl font-bold tracking-wide">✗ Chưa biết</span>
        </motion.div>

        {/* 3D flip container */}
        <div style={{ perspective: "1200px" }}>
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative h-[340px]"
          >
            {/* Front face */}
            <div style={{ backfaceVisibility: "hidden" }} className={cardBase}>
              {showHanziFront && (
                <span
                  style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 72, lineHeight: 1 }}
                  className="text-gray-900"
                >
                  {word.hanzi}
                </span>
              )}
              {showPinyinFront && v[0]?.pinyin && (
                <span className="text-xl text-[#C0392B] mt-3">{v[0].pinyin}</span>
              )}
              {showMeaningFront && v[0]?.meaning && (
                <span className="text-base text-gray-600 mt-2 text-center">{v[0].meaning}</span>
              )}
              <p className="text-xs text-gray-400 mt-8">Nhấn để lật thẻ</p>
            </div>

            {/* Back face */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className={cardBase}
            >
              {/* Speaker button */}
              <button
                onClick={(e) => { e.stopPropagation(); speak(); }}
                className="absolute top-3 right-3 p-2 rounded-lg text-gray-400 hover:text-[#C0392B] hover:bg-gray-100 transition-colors"
                aria-label="Phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {showHanziBack && (
                <span
                  style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 52, lineHeight: 1 }}
                  className="text-gray-900 mb-1"
                >
                  {word.hanzi}
                </span>
              )}

              <div className="w-full space-y-3 mt-3">
                {v.map((vg, i) => (
                  <div
                    key={vg.id}
                    className={`text-center ${i > 0 ? "pt-3 border-t border-[#E8E0D5]" : ""}`}
                  >
                    {showPinyinBack && vg.pinyin && (
                      <p className="text-lg text-[#C0392B] font-medium">{vg.pinyin}</p>
                    )}
                    {vg.han_viet && (
                      <p className="text-sm text-gray-500 italic">{vg.han_viet}</p>
                    )}
                    {showMeaningBack && vg.meaning && (
                      <p className="text-base text-gray-700 mt-1">{vg.meaning}</p>
                    )}
                    {vg.part_of_speech && (
                      <span className="inline-block text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-1">
                        {vg.part_of_speech}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {word.note && (
                <p className="text-xs text-gray-400 mt-3 italic text-center">📝 {word.note}</p>
              )}

              <p className="text-xs text-gray-400 mt-4">Vuốt hoặc nhấn nút bên dưới</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Action buttons — visible after flip */}
      <motion.div
        initial={false}
        animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 8 }}
        transition={{ duration: 0.2 }}
        className="flex gap-4 mt-6 w-full max-w-sm"
      >
        <button
          onClick={() => commitResult("unknown")}
          disabled={!isFlipped || isAnimating}
          className="flex-1 py-3.5 rounded-xl border-2 border-[#E74C3C] text-[#E74C3C] font-semibold text-sm hover:bg-red-50 active:scale-95 transition-all disabled:opacity-0"
        >
          Chưa biết
        </button>
        <button
          onClick={() => commitResult("known")}
          disabled={!isFlipped || isAnimating}
          className="flex-1 py-3.5 rounded-xl bg-[#27AE60] text-white font-semibold text-sm hover:bg-[#229954] active:scale-95 transition-all disabled:opacity-0"
        >
          Đã biết ✓
        </button>
      </motion.div>
    </div>
  );
}
