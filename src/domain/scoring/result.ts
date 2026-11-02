import { combinedScore, mean, overallScore, round2 } from "./aggregate";
import { categorize } from "./category";
import { dimensionScore } from "./item";
import type {
  AnswerDef,
  AssessmentResultValue,
  ComputeResultInput,
  CrossCheckValue,
  DimensionDef,
  DimensionResultValue,
  QuestionDef,
  Scale,
  ScoredItem,
} from "./types";

export const SCORING_VERSION = "likert-v1";

type RespondentScores = Map<string, number | null>;

function likertValueOf(answer: AnswerDef | undefined): number | null {
  if (!answer || answer.isNotApplicable) return null;
  return answer.likertValue;
}

/** Skor tiap faktor untuk satu responden. Hanya butir LIKERT yang berfaktor yang diskor. */
function scoreRespondent(
  questions: readonly QuestionDef[],
  answers: readonly AnswerDef[],
  dims: readonly DimensionDef[],
  scale: Scale,
): RespondentScores {
  const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  const scores: RespondentScores = new Map();

  for (const dim of dims) {
    const items: ScoredItem[] = [];
    for (const question of questions) {
      if (question.type !== "LIKERT" || question.dimensionId !== dim.id || !question.polarity) {
        continue;
      }
      items.push({
        value: likertValueOf(answerByQuestion.get(question.id)),
        polarity: question.polarity,
        weight: question.weight,
      });
    }
    // Faktor tanpa butir di instrumen ini tidak masuk perhitungan sama sekali.
    if (items.length > 0) scores.set(dim.id, dimensionScore(items, scale));
  }
  return scores;
}

function respondentOverall(scores: RespondentScores, dims: readonly DimensionDef[]): number | null {
  return overallScore(
    dims.flatMap((dim) =>
      scores.has(dim.id) ? [{ score: scores.get(dim.id) ?? null, weight: dim.weight }] : [],
    ),
  );
}

function crossChecks(input: ComputeResultInput, showEmployee: boolean): CrossCheckValue[] {
  const ownerByKey = new Map<string, number | null>();
  const ownerAnswers = new Map(input.ownerAnswers.map((answer) => [answer.questionId, answer]));
  for (const question of input.ownerQuestions) {
    if (question.pairKey)
      ownerByKey.set(question.pairKey, likertValueOf(ownerAnswers.get(question.id)));
  }

  const results: CrossCheckValue[] = [];
  for (const question of input.employeeQuestions) {
    const pairKey = question.pairKey;
    if (!pairKey || !ownerByKey.has(pairKey)) continue;

    const values = input.employeeAnswers.flatMap((answers) => {
      const value = likertValueOf(answers.find((answer) => answer.questionId === question.id));
      return value === null ? [] : [value];
    });
    const employeeMean = showEmployee ? mean(values) : null;
    results.push({
      pairKey,
      ownerValue: ownerByKey.get(pairKey) ?? null,
      employeeMean: employeeMean === null ? null : round2(employeeMean),
    });
  }
  return results;
}

/**
 * Menghitung snapshot hasil satu periode. Skor karyawan dihitung per responden
 * lalu dirata-ratakan, supaya yang menjawab lebih banyak butir tidak lebih berpengaruh.
 * Data karyawan hanya dipakai jika responden ≥ minEmployeeResponses (anonimitas).
 */
export function computeAssessmentResult(input: ComputeResultInput): AssessmentResultValue {
  const { dimensions, scale } = input;
  const employeeRespondents = input.employeeAnswers.length;
  const showEmployee = employeeRespondents >= input.minEmployeeResponses;

  const ownerScores = scoreRespondent(input.ownerQuestions, input.ownerAnswers, dimensions, scale);
  const ownerOverall = respondentOverall(ownerScores, dimensions);
  if (ownerOverall === null) throw new RangeError("Owner tidak punya butir terskor");

  const employeeScores = showEmployee
    ? input.employeeAnswers.map((answers) =>
        scoreRespondent(input.employeeQuestions, answers, dimensions, scale),
      )
    : [];
  const employeeOverall = showEmployee
    ? mean(
        employeeScores.flatMap((scores) => {
          const overall = respondentOverall(scores, dimensions);
          return overall === null ? [] : [overall];
        }),
      )
    : null;

  const dimensionResults: DimensionResultValue[] = dimensions.map((dim) => {
    const owner = ownerScores.get(dim.id) ?? null;
    const employee = showEmployee
      ? mean(employeeScores.flatMap((scores) => scores.get(dim.id) ?? []))
      : null;
    const ownerRounded = owner === null ? null : round2(owner);
    const employeeRounded = employee === null ? null : round2(employee);
    const gap =
      dim.isShared && ownerRounded !== null && employeeRounded !== null
        ? round2(ownerRounded - employeeRounded)
        : null;
    return { dimensionId: dim.id, ownerScore: ownerRounded, employeeScore: employeeRounded, gap };
  });

  const owner = round2(ownerOverall);
  const employee = employeeOverall === null ? null : round2(employeeOverall);
  const combined = round2(combinedScore(owner, employee, input.ownerWeight));

  return {
    ownerScore: owner,
    employeeScore: employee,
    employeeRespondents,
    combinedScore: combined,
    category: categorize(combined),
    dimensions: dimensionResults,
    crossChecks: crossChecks(input, showEmployee),
  };
}
