"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { SearchStatus } from "@/lib/types";

export default function ProgressBar({ status }: { status: SearchStatus }) {
  if (status.stage === "idle") return null;

  const isError = status.stage === "error";
  const isDone = status.stage === "done";

  const [bg, border, textColor] = isError
    ? ["bg-red-50", "border-red-200", "text-red-700"]
    : isDone
    ? ["bg-emerald-50", "border-emerald-200", "text-emerald-700"]
    : ["bg-blue-50", "border-blue-200", "text-blue-700"];

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${bg} ${border}`}>
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
      ) : isDone ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      ) : (
        <span className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${textColor}`}>{status.message}</p>
        {!isError && !isDone && (
          <div className="mt-1.5 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        )}
      </div>

      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
        {status.progress}%
      </span>
    </div>
  );
}
