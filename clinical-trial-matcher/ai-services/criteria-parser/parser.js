const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

function extractJsonCandidate(text = "") {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
}

export function validateParsedEligibilityStructure(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("AI response must be a JSON object.");
  }

  const { ageRange, requiredConditions, excludedConditions } = payload;

  const isValidAgeRange =
    Array.isArray(ageRange) &&
    ageRange.length === 2 &&
    Number.isFinite(Number(ageRange[0])) &&
    Number.isFinite(Number(ageRange[1])) &&
    Number(ageRange[0]) <= Number(ageRange[1]);

  if (!isValidAgeRange) {
    throw new Error("ageRange must be [minAge, maxAge] with valid numbers.");
  }

  if (!Array.isArray(requiredConditions) || requiredConditions.some((value) => typeof value !== "string")) {
    throw new Error("requiredConditions must be an array of strings.");
  }

  if (!Array.isArray(excludedConditions) || excludedConditions.some((value) => typeof value !== "string")) {
    throw new Error("excludedConditions must be an array of strings.");
  }

  return {
    ageRange: [Number(ageRange[0]), Number(ageRange[1])],
    requiredConditions: requiredConditions.map((item) => item.trim()).filter(Boolean),
    excludedConditions: excludedConditions.map((item) => item.trim()).filter(Boolean)
  };
}

export async function parseEligibilityText(criteriaText) {
  if (!criteriaText || !String(criteriaText).trim()) {
    throw new Error("criteriaText is required.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract structured eligibility rules from clinical trial criteria text. Return only JSON with keys: ageRange (number[2]), requiredConditions (string[]), excludedConditions (string[])."
        },
        {
          role: "user",
          content: `Criteria text: ${criteriaText}`
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI API request failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const candidate = extractJsonCandidate(content);
  const parsed = JSON.parse(candidate);
  return validateParsedEligibilityStructure(parsed);
}
