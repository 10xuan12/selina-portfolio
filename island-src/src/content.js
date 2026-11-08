import zhData from "./portfolio.json" with { type: "json" };
import enData from "./portfolio.en.json" with { type: "json" };
import { normalizePortfolio } from "./schema.js";
import { lang, L } from "./i18n.js";
export const {profile, categories} = normalizePortfolio(lang === "en" ? enData : zhData);
export const themes = {
  home: {
    name: L("台中・家", "Home"),
    english: "HOME · TAICHUNG",
    caption: L("從台中出發，走向世界。", "Starting from Taichung, heading anywhere."),
    accent: "#6b1e23",
    water: "#a3c2c2",
    background: "#f4eee6",
  },
  forest: {
    name: L("史瓦帝尼", "Eswatini"),
    english: "ESWATINI",
    caption: L("紅土路一路開進樹林裡。", "Red-dirt roads into the trees."),
    accent: "#3f7761",
    water: "#54bdc5",
    background: "#d5eef0",
  },
  ocean: {
    name: L("峴港", "Da Nang"),
    english: "DA NANG",
    caption: L("椰子樹、沙灘，還有海。", "Palm trees, sand and the sea."),
    accent: "#527ea4",
    water: "#5a9fc5",
    background: "#dce7f6",
  },
};
