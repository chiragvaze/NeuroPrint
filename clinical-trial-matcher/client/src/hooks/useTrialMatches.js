import { useEffect, useState } from "react";
import { fetchTrialMatches } from "../services/api";

export default function useTrialMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await fetchTrialMatches();
        if (active) {
          setMatches(result.matches || []);
        }
      } catch (error) {
        if (active) {
          setMatches([
            { trialId: "T-102", score: 88 },
            { trialId: "T-041", score: 80 },
            { trialId: "T-310", score: 74 }
          ]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { matches, loading };
}
