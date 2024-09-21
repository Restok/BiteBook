import { Entry } from "./entry";
import { Journal } from "./journal";

export type RootStackParamList = {
  Main: undefined;
  Home: { journalId?: string };
  CreateJournal: undefined;
  ExpandBitebook: undefined;
  Login: undefined;
  Onboarding: undefined;
  ExpandedPost: { index: number };
  JournalCreated: { journal: Journal };
  FoodAnalysis: { entryData: Entry; index: number };
  Leaderboard: undefined;
  JoinJournal: { journal: Journal };
  EnterInviteCode: undefined;
  UserStats: undefined;
  HealthScoreExpanded: undefined;
  TopFoodsExpanded: undefined;
};
