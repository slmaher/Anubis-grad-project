const SKETCHFAB_EMBED = (modelId) =>
  `https://sketchfab.com/models/${modelId}/embed`;

const MODEL_URLS = {
  mask: SKETCHFAB_EMBED("ff2de7e95c7648ca960b8902a7c7e748"),
  khafre: SKETCHFAB_EMBED("071b25978c054c73bd179f89c33a5ffe"),
  ramesses: SKETCHFAB_EMBED("42cc89bb3fd840d7b0356bd536379a92"),
  anubis: SKETCHFAB_EMBED("3960cebd332346dc8eb275b2c8288101"),
  throne: SKETCHFAB_EMBED("69161661a69140c9a818af8052e8c7db"),
  canopic: SKETCHFAB_EMBED("d67f1d336e34459497ba980dc5953f39"),
  sarcophagus: SKETCHFAB_EMBED("6c235c8f6e4148b1a4f467fbd64b8c7c"),
  sekhmet: SKETCHFAB_EMBED("ec3713c4fc63498d933e6403b0180109"),
  amenhotep: SKETCHFAB_EMBED("83d37490763d42e9bc12c4f2064b47e8"),
  nefertiti: SKETCHFAB_EMBED("ce5b14926e494558ab584375a8d63ca7"),
};

const normalizeTitle = (title) =>
  String(title || "")
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const matchesKeyword = (normalizedTitle, keyword) => {
  if (keyword.includes(" ")) {
    return normalizedTitle.includes(keyword);
  }

  const pattern = new RegExp(
    `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
  );
  return pattern.test(normalizedTitle);
};

const ARTIFACT_MODEL_RULES = [
  { keywords: ["canopic"], url: MODEL_URLS.canopic },
  { keywords: ["golden throne", "throne"], url: MODEL_URLS.throne },
  { keywords: ["sarcophagus"], url: MODEL_URLS.sarcophagus },
  {
    keywords: ["mask of tutankhamun", "funerary mask", "golden mask", "mask"],
    url: MODEL_URLS.mask,
  },
  { keywords: ["anubis"], url: MODEL_URLS.anubis },
  { keywords: ["nefertiti"], url: MODEL_URLS.nefertiti },
  { keywords: ["sekhmet"], url: MODEL_URLS.sekhmet },
  { keywords: ["khafre"], url: MODEL_URLS.khafre },
  { keywords: ["amenhotep", "tiye"], url: MODEL_URLS.amenhotep },
  { keywords: ["ramses", "ramesses"], url: MODEL_URLS.ramesses },
  { keywords: ["tutankhamun", "king tut"], url: MODEL_URLS.mask },
];

const artifactModels = {
  "Mask of Tutankhamun": MODEL_URLS.mask,
  Tutankhamun: MODEL_URLS.mask,
  "Tutankhamun Mask": MODEL_URLS.mask,
  "King Tut": MODEL_URLS.mask,

  "Statue of Khafre Enthroned": MODEL_URLS.khafre,
  Khafre: MODEL_URLS.khafre,

  "Statue of Ramses II": MODEL_URLS.ramesses,
  "Ramesses II": MODEL_URLS.ramesses,
  Ramses: MODEL_URLS.ramesses,

  "Anubis Shrine (Jackal Statue)": MODEL_URLS.anubis,
  Anubis: MODEL_URLS.anubis,

  "Tutankhamun's Golden Throne": MODEL_URLS.throne,
  "Tutankhamun Throne": MODEL_URLS.throne,

  "Canopic Jars of Tutankhamun": MODEL_URLS.canopic,

  "Tutankhamun's Sarcophagus": MODEL_URLS.sarcophagus,
  "Tutankhamun Sarcophagus": MODEL_URLS.sarcophagus,

  "Statue of Sekhmet": MODEL_URLS.sekhmet,

  "Amenhotep III & Tiye": MODEL_URLS.amenhotep,

  "Bust of Nefertiti": MODEL_URLS.nefertiti,
  Nefertiti: MODEL_URLS.nefertiti,
  "Queen Nefertiti": MODEL_URLS.nefertiti,
};

export const resolveArtifactModelUrl = (artifactTitle) => {
  if (!artifactTitle) return null;

  const normalized = normalizeTitle(artifactTitle);

  for (const [key, url] of Object.entries(artifactModels)) {
    if (normalizeTitle(key) === normalized) {
      return url;
    }
  }

  for (const rule of ARTIFACT_MODEL_RULES) {
    if (
      rule.keywords.some((keyword) => matchesKeyword(normalized, keyword))
    ) {
      return rule.url;
    }
  }

  let bestMatch = null;
  let bestKeyLength = 0;

  for (const [key, url] of Object.entries(artifactModels)) {
    const normalizedKey = normalizeTitle(key);
    const matches =
      normalized.includes(normalizedKey) ||
      normalizedKey.includes(normalized);

    if (matches && normalizedKey.length > bestKeyLength) {
      bestMatch = url;
      bestKeyLength = normalizedKey.length;
    }
  }

  return bestMatch;
};

export default artifactModels;
