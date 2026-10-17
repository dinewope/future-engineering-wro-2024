/** Rubric returned by the sentence grader (CLAUDE.md §5.2). Implemented in M3. */
export interface SentenceGrade {
  meaningCorrect: boolean;
  grammarOk: boolean;
  collocationNatural: boolean;
  contextStrength: 0 | 1 | 2 | 3;
  swapTestPassed: boolean;
  overall: "redo" | "almost" | "solid" | "excellent";
  feedback: string;
  upgradedVersion: string;
}
