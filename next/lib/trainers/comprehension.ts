export type TargetLanguageLevel = "low" | "medium" | "high"
export type SupportedTrainerLanguage = "en" | "ja" | "es" | "fr"

export interface ComprehensionRound {
  text: string
  keyPoints: string[]
  targetLanguage: SupportedTrainerLanguage
  targetLanguageLevel: TargetLanguageLevel
}

export interface ComprehensionEvaluation {
  valid: boolean
  score: number
  matchedPoints: string[]
  missingPoints: string[]
  explanation: string
}

const COMPREHENSION_BANK: Record<
  SupportedTrainerLanguage,
  Record<TargetLanguageLevel, Array<{ text: string; keyPoints: string[] }>>
> = {
  en: {
    low: [
      {
        text: "Mia wakes up at seven, eats toast, and walks to school with her brother.",
        keyPoints: ["wakes up at seven", "eats toast", "walks to school", "with her brother"],
      },
      {
        text: "A man buys apples at the market and cooks a pie for dinner.",
        keyPoints: ["buys apples", "at the market", "cooks a pie", "for dinner"],
      },
    ],
    medium: [
      {
        text: "After missing the first bus, Lena borrowed a bike, arrived late to class, and apologized to the teacher.",
        keyPoints: ["missed the first bus", "borrowed a bike", "arrived late", "apologized to the teacher"],
      },
      {
        text: "The team changed their plan because of heavy rain and moved the event to a nearby gym.",
        keyPoints: ["changed their plan", "heavy rain", "moved the event", "nearby gym"],
      },
    ],
    high: [
      {
        text: "Although the product launch was delayed by supply issues, the company used the extra time to improve reliability and reduce customer complaints after release.",
        keyPoints: ["launch was delayed", "supply issues", "improve reliability", "reduce customer complaints"],
      },
      {
        text: "The researcher revised her hypothesis after reviewing contradictory data, then designed a smaller follow-up study to isolate the main variable.",
        keyPoints: ["revised her hypothesis", "contradictory data", "follow-up study", "isolate the main variable"],
      },
    ],
  },
  ja: {
    low: [
      {
        text: "けんさんは あさ しちじに おきて、パンを たべて、いもうとと がっこうへ いきました。",
        keyPoints: ["しちじに おきて", "パンを たべて", "いもうとと", "がっこうへ いきました"],
      },
      {
        text: "ゆうこさんは みせで りんごを かって、ばんごはんに パイを つくりました。",
        keyPoints: ["みせで りんごを かって", "ばんごはんに", "パイを つくりました"],
      },
    ],
    medium: [
      {
        text: "あめが ふっていたので、イベントは こうえんから ちかくの たいいくかんに うつされました。",
        keyPoints: ["あめが ふっていた", "イベントは うつされました", "こうえんから", "たいいくかんに"],
      },
      {
        text: "かなさんは バスに のりおくれたので、じてんしゃを かりて じゅぎょうに おくれて つきました。",
        keyPoints: ["バスに のりおくれた", "じてんしゃを かりて", "じゅぎょうに おくれて"],
      },
    ],
    high: [
      {
        text: "しゅっかの もんだいで はつばいは おくれましたが、その あいだに ひんしつを かいぜんし、クレームを へらしました。",
        keyPoints: ["はつばいは おくれました", "しゅっかの もんだい", "ひんしつを かいぜん", "クレームを へらしました"],
      },
      {
        text: "けんきゅうしゃは むじゅんする データを みて かせつを なおし、しゅような よういんを しらべる ついか じっけんを けいかくしました。",
        keyPoints: ["かせつを なおし", "むじゅんする データ", "ついか じっけん", "しゅような よういん"],
      },
    ],
  },
  es: {
    low: [
      {
        text: "Marta se levanta a las siete, come pan y camina a la escuela con su hermano.",
        keyPoints: ["se levanta a las siete", "come pan", "camina a la escuela", "con su hermano"],
      },
      {
        text: "Un hombre compra manzanas en el mercado y prepara un pastel para la cena.",
        keyPoints: ["compra manzanas", "en el mercado", "prepara un pastel", "para la cena"],
      },
    ],
    medium: [
      {
        text: "Como perdió el primer autobús, Ana tomó una bicicleta prestada y llegó tarde a clase.",
        keyPoints: ["perdió el primer autobús", "tomó una bicicleta", "llegó tarde a clase"],
      },
      {
        text: "El equipo cambió el plan por la lluvia fuerte y movió el evento a un gimnasio cercano.",
        keyPoints: ["cambió el plan", "lluvia fuerte", "movió el evento", "gimnasio cercano"],
      },
    ],
    high: [
      {
        text: "Aunque el lanzamiento se retrasó por problemas de suministro, la empresa mejoró la fiabilidad del producto antes de publicarlo.",
        keyPoints: ["lanzamiento se retrasó", "problemas de suministro", "mejoró la fiabilidad", "antes de publicarlo"],
      },
      {
        text: "La investigadora revisó su hipótesis después de datos contradictorios y diseñó un estudio de seguimiento más pequeño.",
        keyPoints: ["revisó su hipótesis", "datos contradictorios", "estudio de seguimiento"],
      },
    ],
  },
  fr: {
    low: [
      {
        text: "Mia se réveille à sept heures, mange du pain et va à l'école avec son frère.",
        keyPoints: ["se réveille à sept heures", "mange du pain", "va à l'école", "avec son frère"],
      },
      {
        text: "Un homme achète des pommes au marché et prépare une tarte pour le dîner.",
        keyPoints: ["achète des pommes", "au marché", "prépare une tarte", "pour le dîner"],
      },
    ],
    medium: [
      {
        text: "Après avoir raté le premier bus, Léna a emprunté un vélo et est arrivée en retard au cours.",
        keyPoints: ["raté le premier bus", "emprunté un vélo", "arrivée en retard"],
      },
      {
        text: "L'équipe a changé son plan à cause de la pluie et a déplacé l'événement dans un gymnase proche.",
        keyPoints: ["changé son plan", "à cause de la pluie", "déplacé l'événement", "gymnase proche"],
      },
    ],
    high: [
      {
        text: "Bien que le lancement ait été retardé par des problèmes logistiques, l'entreprise a profité du délai pour améliorer la fiabilité du produit.",
        keyPoints: ["lancement retardé", "problèmes logistiques", "améliorer la fiabilité du produit"],
      },
      {
        text: "La chercheuse a modifié son hypothèse après des données contradictoires et a conçu une étude de suivi plus ciblée.",
        keyPoints: ["modifié son hypothèse", "données contradictoires", "étude de suivi plus ciblée"],
      },
    ],
  },
}

function normalizeText(input: string): string {
  return input
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function includesKeyPoint(summary: string, keyPoint: string): boolean {
  const normalizedSummary = normalizeText(summary)
  const normalizedKeyPoint = normalizeText(keyPoint)

  if (normalizedSummary.includes(normalizedKeyPoint)) {
    return true
  }

  const keyTokens = normalizedKeyPoint.split(" ").filter((token) => token.length > 2)
  if (keyTokens.length === 0) {
    return normalizedSummary.includes(normalizedKeyPoint)
  }

  const matchedTokens = keyTokens.filter((token) =>
    normalizedSummary.includes(token)
  ).length

  return matchedTokens / keyTokens.length >= 0.7
}

export function resolveSupportedLanguage(value: unknown): SupportedTrainerLanguage {
  if (value === "ja" || value === "es" || value === "fr" || value === "en") {
    return value
  }
  return "en"
}

export function resolveTargetLanguageLevel(value: unknown): TargetLanguageLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value
  }
  return "high"
}

export function generateComprehensionRound({
  targetLanguage,
  targetLanguageLevel,
}: {
  targetLanguage: SupportedTrainerLanguage
  targetLanguageLevel: TargetLanguageLevel
}): ComprehensionRound {
  const buckets = COMPREHENSION_BANK[targetLanguage] ?? COMPREHENSION_BANK.en
  const items = buckets[targetLanguageLevel] ?? buckets.high
  const selected = items[Math.floor(Math.random() * items.length)] ?? items[0]

  return {
    text: selected.text,
    keyPoints: selected.keyPoints,
    targetLanguage,
    targetLanguageLevel,
  }
}

export function evaluateComprehension({
  keyPoints,
  userInput,
}: {
  keyPoints: string[]
  userInput: string
}): ComprehensionEvaluation {
  const matchedPoints = keyPoints.filter((point) =>
    includesKeyPoint(userInput, point)
  )
  const missingPoints = keyPoints.filter((point) => !matchedPoints.includes(point))
  const score = keyPoints.length === 0 ? 0 : matchedPoints.length / keyPoints.length
  const valid = score >= 0.5

  let explanation = ""
  if (valid) {
    explanation = `Good summary. You captured ${matchedPoints.length}/${keyPoints.length} key points.`
  } else if (matchedPoints.length > 0) {
    explanation = `Partial summary. You captured ${matchedPoints.length}/${keyPoints.length} key points and missed: ${missingPoints.join(", ")}.`
  } else {
    explanation = "Your summary missed the main points. Replay the audio and focus on who, what, and outcome."
  }

  return {
    valid,
    score,
    matchedPoints,
    missingPoints,
    explanation,
  }
}
