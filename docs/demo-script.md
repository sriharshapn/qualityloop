# QualityLoop Demonstration & Presentation Script

## 3-Minute Live Hackathon Pitch & Video Walkthrough

### Part 1: Problem & Introduction (0:00 - 0:30)
- **Presenter:** "Manufacturing plants produce thousands of precision components daily. But when defects recur—like surface scratches on aluminium housings—quality engineers are forced to reinvent the wheel. Previous investigations, root causes, and corrective action trials get buried in static spreadsheets.
- **Visual:** Open QualityLoop Dashboard showing Total Incidents, Recurring Defects, and Retained Experiences.
- **Key Message:** *"QualityLoop is an AI quality investigation agent with persistent memory powered by Hindsight. It ensures that every defect teaches and every experience improves future decisions."*

---

### Part 2: Scenario 1 – Before Learning (0:30 - 1:10)
- **Action:** Navigate to **Learning Demo** and click **"1. Initial Incident (QL-001)"**.
- **Presenter:** "Here is Incident QL-001: Aluminium housings from Batch 001 with surface scratches after packaging.
  Notice the Hindsight recall output: zero historical experiences exist in memory.
  Because the agent has no prior experience, it generates broad, generic hypotheses—advising exploratory line inspections across CNC milling, washing, and packaging. It does not fabricate facts or guess blindly."

---

### Part 3: Scenario 2 – The Learning Step (1:10 - 1:50)
- **Action:** Click **"2. Engineer Verifies & Retains"** (or view QL-001 in the Investigation Workspace).
- **Presenter:** "Our QC engineer investigates physically. They discover the verified root cause: *rough manual handling during packaging without protective separators*.
  They apply a corrective action: *introducing protective corrugated foam separators between components*.
  After inspecting 200 subsequent units, the outcome is verified as **Successful** (zero defects).
  Watch the bottom memory stream: QualityLoop immediately triggers a **Hindsight RETAIN** operation, storing this verified engineering outcome into the `qualityloop` memory bank."

---

### Part 4: Scenario 3 – After Learning (1:50 - 2:30)
- **Action:** Click **"3. New Similar Defect (QL-009)"**.
- **Presenter:** "Days later, a new batch (Batch 009) arrives with similar scratches.
  Watch how the agent responds now!
  QualityLoop runs a **Hindsight RECALL** query. It instantly retrieves the verified QL-001 experience.
  Look at the right panel:
  Instead of generic suggestions, the agent immediately recommends:
  1. *Auditing compliance with the protective foam separators established in QL-001.*
  2. *Checking operator adherence to the revised packaging handling SOP.*
  Notice that the recommendation is explicitly flagged as **'Informed by Learned Experience'**, and the agent still checks upstream boundary conditions to ensure no new variables were introduced."

---

### Part 5: Scenario 4 – Hindsight Reflect & Architecture (2:30 - 3:00)
- **Action:** Scroll down and click **"Run Hindsight Reflect"**.
- **Presenter:** "Beyond single-incident recall, Hindsight's **reflect** capability synthesizes multi-incident patterns across the entire production history to detect systemic supplier or packaging vulnerabilities.
  QualityLoop transforms manufacturing quality control from reactive firefighting to self-improving operational intelligence."
