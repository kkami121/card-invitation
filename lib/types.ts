export type OccasionKey =
  | "promise"
  | "weekend-date"
  | "birthday"
  | "childrens-day"
  | "samgyeopsal-day"
  | "white-day"
  | "valentine"
  | "christmas"
  | "pepero"
  | "lunar-new-year"
  | "chuseok";

export type InvitationTheme = {
  key: OccasionKey;
  label: string;
  title: string;
  emojis: string[];
  titleClassName: string;
  accent: string;
  defaultImageUrl: string;
};

export type InvitationDraft = {
  themeKey: OccasionKey;
  emojis: string;
  title: string;
  date: string;
  time: string;
  place: string;
  imageUrl: string;
};

export type InvitationState = {
  draft: InvitationDraft;
  accepted: boolean;
  noAttempts: number;
};
