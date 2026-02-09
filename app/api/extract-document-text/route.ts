import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const type = file.type.toLowerCase();
    const name = (file.name || "").toLowerCase();

    if (type === "text/plain" || name.endsWith(".txt")) {
      const text = await file.text();
      return NextResponse.json({ text });
    }

    if (type !== "application/pdf" && !name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must be PDF or text (.txt)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    const result = await parser.getText();
    await parser.destroy();
    return NextResponse.json({ text: result.text });
  } catch (err) {
    console.error("extract-document-text error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract text" },
      { status: 500 }
    );
  }
}
