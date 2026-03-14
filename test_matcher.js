import fs from 'fs';
import { evaluateEligibilityWithScore } from './clinical-trial-matcher/server/services/ruleEngine.js';
import { rankTrialsForPatient } from './clinical-trial-matcher/server/services/rankingEngine.js';

const patient1 = { age: 28, conditions: ["migraine"], location: "delhi" };
const trial1 = { minAge: 25, maxAge: 55, condition: "Type 2 Diabetes", location: "Mumbai", exclusionCriteria: "" };

const patient2 = { age: 45, conditions: ["type 2 diabetes"], location: "nagpur" };
const trial2 = { trialId: "T2", minAge: 25, maxAge: 55, condition: "Type 2 Diabetes", location: "nagpur", exclusionCriteria: "" };

const patient3 = { patientId: "P3", age: 45, conditions: ["obesity"], location: "nagpur" };

async function run() {
  const ranked1 = await rankTrialsForPatient({ patient: patient1, trials: [trial2] });
  const ranked3 = await rankTrialsForPatient({ patient: patient3, trials: [trial2] });

  fs.writeFileSync('./out2.json', JSON.stringify({ranked1, ranked3}, null, 2));
}
run();
