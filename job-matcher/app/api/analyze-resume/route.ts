import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    let resumeText = "";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (file.name.endsWith(".pdf")) {
        // Dynamic import to avoid SSR issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfModule = (await import("pdf-parse")) as any;
        const pdfParse = pdfModule.default ?? pdfModule;
        const parsed = await pdfParse(buffer);
        resumeText = parsed.text;
      } else {
        resumeText = buffer.toString("utf-8");
      }
    } else if (text) {
      resumeText = text;
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "No resume content provided" }, { status: 400 });
    }

    const profile = await analyzeResume(resumeText);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("analyze-resume error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
