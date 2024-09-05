import { Journal } from "./journal";

export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  CreateJournal: undefined;
  ExpandBitebook: undefined;
  Login: undefined;
  Onboarding: undefined;
  ExpandedPost: { post: any };
  JournalCreated: { journal: Journal };
};
