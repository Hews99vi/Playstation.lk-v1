const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? "gemini-2.5-flash";

export type RepairDiagnosis = {
  likelyCause: string;
  severity: "low" | "medium" | "high" | "unknown";
  quickChecks: string[];
  technicianNotes: string[];
  estimatedRepairType: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function parseDiagnosis(text: string): RepairDiagnosis {
  try {
    const parsed = JSON.parse(text) as Partial<RepairDiagnosis>;

    return {
      likelyCause: parsed.likelyCause?.trim() || "Unable to identify a likely cause from the details provided.",
      severity: parsed.severity ?? "unknown",
      quickChecks: Array.isArray(parsed.quickChecks) ? parsed.quickChecks.filter(Boolean).slice(0, 4) : [],
      technicianNotes: Array.isArray(parsed.technicianNotes)
        ? parsed.technicianNotes.filter(Boolean).slice(0, 4)
        : [],
      estimatedRepairType: parsed.estimatedRepairType?.trim() || "Inspection required",
    };
  } catch {
    return {
      likelyCause: text.trim() || "Unable to identify a likely cause from the details provided.",
      severity: "unknown",
      quickChecks: [],
      technicianNotes: ["Review the customer's description manually before quoting."],
      estimatedRepairType: "Inspection required",
    };
  }
}

export async function diagnoseRepairIssue(device: string, issue: string): Promise<RepairDiagnosis> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini is not configured. Add VITE_GEMINI_API_KEY to your .env file.");
  }

  const prompt = [
    "You are assisting PlayStation.lk repair technicians with an initial customer-facing repair triage.",
    "Do not claim certainty. Do not provide dangerous electrical repair instructions.",
    "Return only JSON with these fields:",
    "likelyCause: string",
    "severity: one of low, medium, high, unknown",
    "quickChecks: string[] of simple safe checks a customer can try before visiting",
    "technicianNotes: string[] of useful intake notes for the technician",
    "estimatedRepairType: string",
    "",
    `Device type: ${device || "Not selected"}`,
    `Customer issue: ${issue}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || "Gemini diagnosis request failed.");
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!text) {
    throw new Error("Gemini did not return a diagnosis. Please try again.");
  }

  return parseDiagnosis(text);
}
