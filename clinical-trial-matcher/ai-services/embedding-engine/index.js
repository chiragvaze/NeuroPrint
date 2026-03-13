export function buildEmbeddingRequest(texts = []) {
  return {
    model: "embed-english-v3.0",
    inputType: "search_document",
    texts
  };
}
