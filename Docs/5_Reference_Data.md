# Reference and Sample Data

Testing artifacts evaluate system algorithms in isolation. Dummy inputs allow simulation of standard clinical schemas.

## 1. Patients Sample Data (CSV)
_Local Pathway: `/test-data/patients/patients-upload.csv`_

Datasets encapsulate generalized fields mapped during API ingest limits:

**Schema Definitions & Format:**
```csv
patientId,age,gender,conditions,medications,location
PAT-2001,45,Male,"Type 2 Diabetes,Hypertension","Metformin,Lisinopril",Nagpur
PAT-2002,50,Female,"Dyslipidemia","Atorvastatin,Ezetimibe",Thane
PAT-2003,55,Male,"Obesity,Type 2 Diabetes","Metformin,GLP-1 Agonist",Pune
PAT-2004,48,Female,"Hypertension","ACE Inhibitor,Amlodipine",Nashik
```

**Guardrail Limits:**
If the datasets incorporated columns relating to personally identifiable details—such as Phone Numbers or detailed SSN IDs—the Node.js upload parser controller executes sanitation rejections on the fly to protect HIPAA/Data integrity compliance.

## 2. Trials Import Data (JSON)
_Local Pathway: `/test-data/trials/trials-import.json`_

Clinical trials are staged as massive JSON array ingestions. Fields encompass:
- Distinct standard textual clauses unparsed (for testing OpenAI).
- Ranges spanning `minAge` / `maxAge`.
- Target conditions generally formatted as text literals.

## 3. Runtime Algorithm Outputs
The root workspace utilizes test scripts (`test_matcher.js`) generating artifact JSON outputs (`out.json`, `out2.json`). These logs reflect direct Node execution of the Matcher Engines using strictly manual hardcoded constant parameters offloading Express logic.
