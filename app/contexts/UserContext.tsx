import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { User } from "../types/user";
import { loadUserByUid } from "../services/loadUserByUid";
import { Journal } from "../types/journal";
import { getBatchUsersByIds } from "../services/getBatchUsersByIds";
import { useJournalContext } from "./JournalContext";

interface UserContextType {
  journalUsersById: Record<string, User | null>;
  isLoading: boolean;
  loadJournalUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [journalUsersById, setJournalUsersById] = useState<
    Record<string, User | null>
  >({});
  const { selectedJournal } = useJournalContext();
  const [isLoading, setIsLoading] = useState(false);

  const loadJournalUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = await getBatchUsersByIds(selectedJournal.members);
      setJournalUsersById(users);
    } catch (error) {
      console.error("Error loading journal users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedJournal]);

  useEffect(() => {
    if (selectedJournal) {
      loadJournalUsers();
    }
  }, [selectedJournal, loadJournalUsers]);

  return (
    <UserContext.Provider
      value={{ journalUsersById, isLoading, loadJournalUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};