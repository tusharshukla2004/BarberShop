/**
 * Quality gate to prevent thin, doorway, or low-value local landing pages
 */

const MIN_WORD_COUNT = 150;
const MIN_INTRO_WORDS = 25;

/**
 * Counts words in a string
 * @param {string} str
 * @returns {number}
 */
export function countWords(str) {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Validates an area landing page for thin content
 *
 * @param {Object} area
 * @param {Object} [service] - Optional combination service
 * @returns {{
 *   passed: boolean,
 *   wordCount: number,
 *   reasons: string[]
 * }}
 */
export function validateAreaQuality(area, service = null) {
  const reasons = [];

  if (!area) {
    return { passed: false, wordCount: 0, reasons: ['Area data is missing'] };
  }

  // 1. Unique Intro Check
  const introWords = countWords(area.description?.en || area.description);
  if (introWords < MIN_INTRO_WORDS) {
    reasons.push(`Introductory description is too short (${introWords} words; minimum ${MIN_INTRO_WORDS} words required for a unique local intro).`);
  }

  // 2. Directions Check
  const directionsWords = countWords(area.directions?.en || area.directions);
  if (directionsWords < 15) {
    reasons.push('How to reach / directions from this area is missing or too brief (minimum 15 words).');
  }

  // 3. Area-relevant FAQ Check
  const faqs = Array.isArray(area.faqs) ? area.faqs : [];
  if (faqs.length === 0) {
    reasons.push('At least one area-specific FAQ is required (e.g., parking, transit, or appointment advice).');
  }

  // 4. Total Word Count Check
  let totalWords = introWords + directionsWords;

  // Add words from FAQs
  faqs.forEach((faq) => {
    totalWords += countWords(faq.question?.en || faq.question);
    totalWords += countWords(faq.answer?.en || faq.answer);
  });

  // Add words from service if combination page
  if (service) {
    totalWords += countWords(service.description?.en || service.description);
  }

  const requiredWordCount = service ? 150 : 100;
  if (totalWords < requiredWordCount) {
    reasons.push(`Total content volume is too thin (${totalWords} words; minimum ${requiredWordCount} words required).`);
  }

  // 5. Landmarks Check
  const landmarks = Array.isArray(area.landmarks) ? area.landmarks : [];
  if (landmarks.length === 0) {
    reasons.push('At least one local landmark must be specified to ground the page geographically.');
  }

  return {
    passed: reasons.length === 0,
    wordCount: totalWords,
    reasons,
  };
}
