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

export type AcceptModeKey = "accept1" | "accept2" | "accept3" | "accept4";

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
  acceptMode: AcceptModeKey;
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
