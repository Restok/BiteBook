import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Journal } from "../types/journal";
import { getUserJournals } from "../services/getUserJournals";
import { Entry } from "../types/entry";
import { loadEntries } from "../services/loadEntries";

const LAST_SELECTED_JOURNAL_KEY = "lastSelectedJournal";

interface JournalContextType {
  selectedJournal: Journal | null;
  journals: Journal[];
  setSelectedJournal: (journal: Journal | null) => void;
  loadJournals: () => Promise<void>;
  entries: Entry[];
  loadEntriesForDate: (date: Date) => Promise<void>;
  isLoading: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  const loadEntriesForDate = useCallback(
    async (date: Date) => {
      if (!selectedJournal) return;
      try {
        setIsLoading(true);
        const fetchedEntries = await loadEntries(selectedJournal.id, date);
        setEntries(fetchedEntries);
      } catch (error) {
        console.error("Error loading entries:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedJournal]
  );

  const loadJournals = useCallback(async () => {
    try {
      setIsLoading(true);
      const userJournals = await getUserJournals();
      setJournals(userJournals);

      let lastSelectedJournalId = await AsyncStorage.getItem(
        LAST_SELECTED_JOURNAL_KEY
      );
      if (!lastSelectedJournalId && userJournals.length > 0) {
        lastSelectedJournalId = userJournals[0].id;
      }
      if (lastSelectedJournalId) {
        const lastJournal = userJournals.find(
          (journal) => journal.id === lastSelectedJournalId
        );
        setSelectedJournal(lastJournal || userJournals[0] || null);
      } else if (userJournals.length > 0) {
        setSelectedJournal(userJournals[0]);
      }
    } catch (error) {
      console.error("Error loading journals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJournals();
    loadEntriesForDate(new Date());
  }, []);

  const handleSetSelectedJournal = useCallback(
    async (journal: Journal | null) => {
      setSelectedJournal(journal);
      if (journal) {
        try {
          await AsyncStorage.setItem(LAST_SELECTED_JOURNAL_KEY, journal.id);
        } catch (error) {
          console.error("Error saving last selected journal:", error);
        }
      }
      loadEntriesForDate(new Date());
    },
    []
  );

  return (
    <JournalContext.Provider
      value={{
        selectedJournal,
        journals,
        setSelectedJournal: handleSetSelectedJournal,
        loadJournals,
        isLoading,
        entries,
        loadEntriesForDate,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournalContext = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournalContext must be used within a JournalProvider");
  }
  return context;
};
