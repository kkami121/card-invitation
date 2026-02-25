export type OccasionKey =
  | "valentine"
  | "christmas"
  | "birthday"
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
};

export type InvitationDraft = {
  themeKey: OccasionKey;
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
