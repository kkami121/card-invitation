import { InvitationTheme, OccasionKey } from "@/lib/types";

export const THEMES: Record<OccasionKey, InvitationTheme> = {
  valentine: {
    key: "valentine",
    label: "발렌타인 데이",
    title: "Happy Valentine's Day!",
    emojis: ["❤", "🍫", "💕", "🍫", "💖"],
    titleClassName: "font-script",
    accent: "#c04b75",
  },
  christmas: {
    key: "christmas",
    label: "크리스마스",
    title: "Merry Christmas!",
    emojis: ["🎄", "🎁", "❄", "🦌", "☃"],
    titleClassName: "font-script",
    accent: "#2f7a4d",
  },
  birthday: {
    key: "birthday",
    label: "생일",
    title: "Happy Birthday!",
    emojis: ["🎉", "🎂", "🎈", "✨", "🎁"],
    titleClassName: "font-script",
    accent: "#875231",
  },
  pepero: {
    key: "pepero",
    label: "빼빼로 데이",
    title: "Happy Pepero Day!",
    emojis: ["🍫", "🎀", "🍪", "🤎", "🍫"],
    titleClassName: "font-script",
    accent: "#6f3f2e",
  },
  "lunar-new-year": {
    key: "lunar-new-year",
    label: "설날",
    title: "Happy Lunar New Year!",
    emojis: ["🧧", "🐉", "🎊", "🌅", "🍊"],
    titleClassName: "font-script",
    accent: "#9f4a1f",
  },
  chuseok: {
    key: "chuseok",
    label: "추석",
    title: "Happy Chuseok!",
    emojis: ["🌕", "🌾", "🍂", "🥮", "🏮"],
    titleClassName: "font-script",
    accent: "#8f6a2a",
  },
};

export const DEFAULT_THEME_KEY: OccasionKey = "valentine";

export const defaultImageDataUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420' viewBox='0 0 420 420'%3E%3Crect width='420' height='420' fill='%23f4eee3'/%3E%3Ccircle cx='210' cy='170' r='82' fill='%23b9b0a0'/%3E%3Crect x='110' y='260' width='200' height='80' rx='18' fill='%23e1d8c9'/%3E%3Ctext x='210' y='320' text-anchor='middle' font-size='26' fill='%236e6458' font-family='Arial'%3EYour Photo%3C/text%3E%3C/svg%3E";
