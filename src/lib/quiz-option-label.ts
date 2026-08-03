/** Resolve per-question answer label, falling back to generic scale.* */
export function answerOptionLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  questionId: string,
  value: 1 | 2 | 3 | 4 | 5 | number | string,
): string {
  const key = `questions.${questionId}.options.${value}`;
  const label = t(key);
  if (label !== key) return label;
  return t(`scale.${value}`);
}
