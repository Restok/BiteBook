import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import {
  getLeaderboard,
  LeaderboardEntry,
  LeaderboardType,
} from "../services/getLeaderboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Journal } from "../types/journal";
import { getUserJournals } from "../services/getUserJournals";
import { Entry } from "../types/entry";
import { loadEntries } from "../services/loadEntries";
import { loadSingleEntry } from "../services/loadSingleEntry";

const LAST_SELECTED_JOURNAL_KEY = "lastSelectedJournal";

interface JournalContextType {
  selectedJournal: Journal | null;
  journals: Journal[];
  setSelectedJournal: (journal: Journal | null) => void;
  loadJournals: () => Promise<void>;
  entries: Entry[];
  loadEntriesForDate: (date: Date) => Promise<void>;
  isLoading: boolean;
  reloadSingleEntry: (entryId: string) => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  leaderboard: LeaderboardEntry[];
  loadLeaderboard: (type: LeaderboardType, date?: Date) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const reloadSingleEntry = useCallback(
    async (entryId: string) => {
      if (!selectedJournal) return;
      try {
        setIsLoading(true);
        const updatedEntry = await loadSingleEntry(entryId, selectedJournal.id);
        if (updatedEntry) {
          setEntries((prevEntries) =>
            prevEntries.map((entry) =>
              entry.id === entryId ? updatedEntry : entry
            )
          );
        }
      } catch (error) {
        console.error("Error reloading entry:", error);
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const loadLeaderboard = useCallback(
    async (type: LeaderboardType, date?: Date) => {
      if (!selectedJournal) return;
      try {
        setIsLoading(true);
        const leaderboardData = await getLeaderboard(
          selectedJournal.id,
          type,
          date
        );
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedJournal]
  );
  const loadEntriesForDate = useCallback(
    async (date: Date) => {
      if (!selectedJournal) {
        await loadJournals();
      }
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
    [selectedJournal, loadJournals]
  );

  useEffect(() => {
    loadEntriesForDate(selectedDate);
  }, [loadEntriesForDate, selectedDate]);

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
        reloadSingleEntry,
        selectedDate,
        setSelectedDate,
        leaderboard,
        loadLeaderboard,
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
