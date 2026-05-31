import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, showBack, right, className }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-border",
        className
      )}
    >
      <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
