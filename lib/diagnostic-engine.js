function normalize(value) {
  return String(value || '').toLocaleLowerCase('tr-TR')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('ı', 'i')
    .replace(/[’']/g, '').replace(/[^a-z0-9çğıöşü+.-]+/gi, ' ').trim();
}

function tokenize(value) {
  return normalize(value).split(/\s+/).filter((token) => token.length >= 2);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = old;
    }
  }
  return previous[b.length];
}

function phraseNegated(text, phrase) {
  const index = text.indexOf(phrase);
  if (index < 0) return false;
  const around = text.slice(Math.max(0, index - 14), index + phrase.length + 14);
  return /\b(yok|degil|olmadi|olmuyor|bulunmuyor|no|not|without)\b/.test(around);
}

function bestPhraseEvidence(text, issue) {
  const phrases = [
    ...(issue.symptoms?.tr || []), ...(issue.symptoms?.en || []),
    ...(issue.aliases || []), ...(issue.typoVariants || [])
  ].map(normalize).filter(Boolean);
  let exact = 0;
  let overlap = 0;
  let fuzzy = 0;
  const inputTokens = tokenize(text);
  const tokenSet = new Set(inputTokens);
  for (const phrase of phrases) {
    if (text.includes(phrase) && !phraseNegated(text, phrase)) exact = Math.max(exact, phrase.split(' ').length > 1 ? 26 : 12);
    const phraseTokens = tokenize(phrase);
    if (phraseTokens.length) {
      const matched = phraseTokens.filter((token) => tokenSet.has(token)).length;
      overlap = Math.max(overlap, (matched / phraseTokens.length) * 16);
      if (!matched) {
        const close = phraseTokens.some((target) => target.length >= 5 && inputTokens.some((token) => Math.abs(token.length - target.length) <= 1 && levenshtein(token, target) <= 1));
        if (close) fuzzy = Math.max(fuzzy, 5);
      }
    }
  }
  return { exact, overlap, fuzzy };
}

function scoreIssue(issue, input, feedback = {}) {
  const problem = normalize(input.problem);
  const brandModel = normalize(input.brandModel);
  const combined = `${problem} ${brandModel}`.trim();
  const evidence = { deviceType: 0, subType: 0, exactCode: 0, brand: 0, model: 0, phrase: 0, tokens: 0, typo: 0, feedback: 0, answer: 0, negative: 0 };

  if (issue.deviceType === input.deviceType) evidence.deviceType = 8;
  if (input.subType && issue.subType === input.subType) evidence.subType = 24;
  else if (normalize(issue.subType).split('-').some((part) => part.length > 3 && combined.includes(part))) evidence.subType = 8;

  if ((issue.errorCodes || []).some((code) => normalize(problem).includes(normalize(code)))) evidence.exactCode = 60;
  if ((issue.brandPatterns || []).some((brand) => combined.includes(normalize(brand)))) evidence.brand = 16;
  if ((issue.modelPatterns || []).some((model) => combined.includes(normalize(model)))) evidence.model = 18;

  const phrase = bestPhraseEvidence(problem, issue);
  evidence.phrase = phrase.exact;
  evidence.tokens = phrase.overlap;
  evidence.typo = phrase.fuzzy;
  evidence.negative = (issue.negativeSignals || []).some((signal) => problem.includes(normalize(signal))) ? -20 : 0;

  for (const answer of input.answers || []) {
    if (answer.optionId === `issue:${issue.id}`) evidence.answer += 70;
    if (answer.optionId?.startsWith('none:') && answer.optionId.slice(5).split(',').includes(issue.id)) evidence.answer -= 100;
  }
  const issueFeedback = feedback[issue.id];
  if (issueFeedback?.total >= 2) evidence.feedback = Math.min(7, (issueFeedback.fixed / issueFeedback.total) * 7);

  const score = Object.values(evidence).reduce((sum, value) => sum + value, 0);
  return { issue, score: Math.round(score * 100) / 100, evidence };
}

function rankCandidates(catalog, input, feedback = {}) {
  const candidates = catalog.issues.filter((issue) => issue.safety !== 'emergency'
    && issue.deviceType === input.deviceType
    && (!input.subType || issue.subType === input.subType));
  return candidates.map((issue) => scoreIssue(issue, input, feedback))
    .sort((a, b) => b.score - a.score || a.issue.id.localeCompare(b.issue.id, 'en'));
}

function findEmergency(catalog, problem) {
  const text = normalize(problem);
  return catalog.issues.find((issue) => issue.safety === 'emergency' && (issue.aliases || []).some((phrase) => {
    const normalizedPhrase = normalize(phrase);
    return text.includes(normalizedPhrase) && !phraseNegated(text, normalizedPhrase);
  }));
}

function confidenceFor(top, second) {
  if (!top) return 0;
  if (top.evidence.exactCode) return 99;
  const margin = top.score - (second?.score || 0);
  return Math.max(42, Math.min(98, Math.round(35 + top.score * 0.72 + Math.max(0, margin) * 1.4)));
}

function selectFallback(catalog, input) {
  if (input.subType) {
    const exact = catalog.fallbacks.find((item) => item.deviceType === input.deviceType && item.subType === input.subType);
    if (exact) return exact;
  }
  return catalog.fallbacks.find((item) => item.deviceType === input.deviceType) || catalog.fallbacks[0];
}

function diagnose(catalog, input, feedback = {}) {
  const emergency = findEmergency(catalog, input.problem);
  if (emergency) return { type: 'solution', emergency: true, confidence: 100, issue: emergency, solutionIndex: 0, candidates: [emergency.id] };

  const ranked = rankCandidates(catalog, input, feedback);
  const top = ranked[0];
  const second = ranked[1];
  const answered = (input.answers || []).length;
  const selectedByAnswer = top?.evidence.answer >= 70;
  const decisive = top && (top.evidence.exactCode > 0 || selectedByAnswer || (top.score >= 46 && top.score - (second?.score || 0) >= 5));

  if (decisive) {
    return {
      type: 'solution',
      emergency: false,
      confidence: confidenceFor(top, second),
      issue: top.issue,
      solutionIndex: 0,
      candidates: ranked.slice(0, 3).map((item) => item.issue.id),
      evidence: top.evidence
    };
  }

  if (answered < 3 && ranked.length) {
    const options = ranked.slice(0, 3).map((item) => ({ id: `issue:${item.issue.id}`, label: item.issue.title }));
    const shownIds = ranked.slice(0, 3).map((item) => item.issue.id);
    options.push({ id: `none:${shownIds.join(',')}`, label: 'Hiçbiri / emin değilim' });
    return {
      type: 'question',
      question: {
        id: `candidate-choice-${answered + 1}`,
        text: answered === 0 ? 'Sorunun hangisine daha yakın?' : 'Bu seçeneklerden biri sorunu daha iyi anlatıyor mu?',
        options
      },
      candidates: shownIds,
      questionNumber: answered + 1,
      maxQuestions: 3
    };
  }

  const fallback = selectFallback(catalog, input);
  return { type: 'fallback', confidence: Math.min(54, confidenceFor(top, second)), fallback, candidates: ranked.slice(0, 3).map((item) => item.issue.id) };
}

module.exports = { normalize, tokenize, levenshtein, scoreIssue, rankCandidates, findEmergency, diagnose };
