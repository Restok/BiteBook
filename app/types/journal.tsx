export interface Journal {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  icon: string;
  inviteCode?: string;
  isPersonal: boolean;
  mode: string;
}

export type JournalData = Omit<Journal, "id">;
