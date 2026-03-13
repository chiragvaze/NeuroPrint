import OpenAI from "openai";
import { CohereClient } from "cohere-ai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

export async function parseEligibilityCriteria(patientRecord) {
  if (!process.env.OPENAI_API_KEY || !process.env.COHERE_API_KEY) {
    return {
      summary: "API keys are not configured. Returning scaffold response.",
      embeddingModel: "none"
    };
  }

  const prompt = `Summarize key clinical eligibility signals from this anonymized record: ${JSON.stringify(patientRecord)}`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt
  });

  const summary = completion.output_text || "No summary generated.";

  await cohere.embed({
    texts: [summary],
    model: "embed-english-v3.0",
    inputType: "search_document"
  });

  return {
    summary,
    embeddingModel: "embed-english-v3.0"
  };
}
