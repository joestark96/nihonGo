/**
 * Normalize phonetics for Japanese TTS engines
 * (prevents morphological misreadings like 'はは' -> 'wawa', 'はたち' -> 'watachi', or standalone 'こ' -> 'karako').
 */
export function normalizeJapanesePhonetics(input: string): string {
  const trimmed = input.trim();
  if (trimmed === 'こ') return 'コ';
  return input
    .replace(/(^|[^ぁ-んァ-ン一-龥])はは(?=([^ぁ-んァ-ン一-龥]|$))/g, '$1母')
    .replace(/(^|[^ぁ-んァ-ン一-龥])はは(は|が|を|に|へ|と|も|の|で|や|から|まで)/g, '$1母$2')
    .replace(/(^|[^ぁ-んァ-ン一-龥])はたち(?=([^ぁ-んァ-ン一-龥]|$|です|だ|に|の|で|から|まで|を|が|は|も))/g, '$1二十歳$2');
}

/**
 * Split complex sentences, dialogues, and reading passages into natural spoken clauses.
 */
export function splitIntoSpeechChunks(text: string, maxLen: number = 80): string[] {
  const clean = text
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/（.*?）/g, '')
    .trim();
  if (!clean) return [];

  const hasDialogueBreak = /[。？！]\s*[ー—－]\s*|[？?]\s*\S|\n+/.test(clean);
  if (clean.length <= maxLen && !hasDialogueBreak) return [clean];

  const rawParts = clean.split(/([。！？\n]+(?:\s*[ー—－]\s*)?)/);
  const sentences: string[] = [];
  let temp = '';

  for (let i = 0; i < rawParts.length; i++) {
    temp += rawParts[i];
    if (i % 2 === 1 || i === rawParts.length - 1) {
      const cleanedSentence = temp.replace(/\s*[ー—－]+\s*$/, '').trim();
      if (cleanedSentence) {
        sentences.push(cleanedSentence);
      }
      temp = '';
    }
  }

  const finalChunks: string[] = [];
  for (const s of sentences) {
    if (s.length <= maxLen) {
      finalChunks.push(s);
    } else {
      const subParts = s.split(/([、，,]+)/);
      let subTemp = '';
      for (let j = 0; j < subParts.length; j++) {
        subTemp += subParts[j];
        if (j % 2 === 1 || j === subParts.length - 1) {
          if (subTemp.trim()) finalChunks.push(subTemp.trim());
          subTemp = '';
        }
      }
      if (subTemp.trim()) finalChunks.push(subTemp.trim());
    }
  }

  return finalChunks.length > 0 ? finalChunks : [clean];
}
