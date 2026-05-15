const AR_MODELS = [
  {
    id: "anubis",
    name: "Anubis",
    title: "Anubis - God of Afterlife",
    subtitle: "Guardian of the necropolis and guide through the underworld.",
    asset: require("../../assets/models/anubis.glb"),
    accent: "#D4AF37",
  },
  {
    id: "statue",
    name: "Statue",
    title: "Desert Statue",
    subtitle: "A calm stone figure suited for souvenir-style AR photos.",
    asset: require("../../assets/models/Statue.glb"),
    iosAsset: require("../../assets/models/statue.usdz"),
    hostedQuickLookPath: "/quick-look?modelId=statue&mode=direct",
    accent: "#C89B5C",
  },
  {
    id: "portrait",
    name: "Portrait",
    title: "Portrait Study",
    subtitle: "A human-faced model that works well as a neutral AR preview.",
    asset: require("../../assets/models/face_rigged_male_09.glb"),
    accent: "#8B7B6C",
  },
];

export const getArModelById = (modelId) => {
  if (!modelId) {
    return AR_MODELS[0];
  }

  return AR_MODELS.find((model) => model.id === modelId) || AR_MODELS[0];
};

export const getSuggestedArModel = (artifactTitle = "") => {
  const title = String(artifactTitle).toLowerCase();

  if (title.includes("anubis")) {
    return getArModelById("anubis");
  }

  if (title.includes("statue")) {
    return getArModelById("statue");
  }

  if (
    title.includes("portrait") ||
    title.includes("face") ||
    title.includes("head")
  ) {
    return getArModelById("portrait");
  }

  return AR_MODELS[0];
};

export default AR_MODELS;
