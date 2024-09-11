import { Entry } from "./entry";
import { Journal } from "./journal";

export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  CreateJournal: undefined;
  ExpandBitebook: undefined;
  Login: undefined;
  Onboarding: undefined;
  ExpandedPost: { index: number };
  JournalCreated: { journal: Journal };
  FoodAnalysis: { entryData: Entry; index: number };
  Leaderboard: undefined;
};
