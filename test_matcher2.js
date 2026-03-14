import fs from 'fs';
import { evaluateEligibilityWithScore } from './clinical-trial-matcher/server/services/ruleEngine.js';
import { rankTrialsForPatient } from './clinical-trial-matcher/server/services/rankingEngine.js';

const patientPerfect = { patientId: "P_Perf", age: 45, conditions: ["type 2 diabetes", "hypertension"], location: "nagpur" };
const trialPerfect = { trialId: "T_Perf", minAge: 25, maxAge: 55, condition: "Type 2 Diabetes", location: "nagpur", exclusionCriteria: "" };

async function run() {
  const ranked = await rankTrialsForPatient({ patient: patientPerfect, trials: [trialPerfect] });

  fs.writeFileSync('./out3.json', JSON.stringify({ranked}, null, 2));
}
run();
