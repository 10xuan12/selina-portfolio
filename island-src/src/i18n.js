// Page language comes from <html lang>: "/" is English, "/zh/" is Traditional Chinese.
// Outside a browser (unit tests) it falls back to Chinese.
export const lang =
  typeof document !== "undefined" && !(document.documentElement?.lang || "zh").toLowerCase().startsWith("zh") ? "en" : "zh";
export const L = (zh, en) => (lang === "en" ? en : zh);
