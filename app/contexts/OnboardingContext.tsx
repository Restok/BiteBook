import React, { createContext, useState, useContext, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useLoading } from "./LoadingContext";

interface OnboardingContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  checkOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );
  const { setIsLoading } = useLoading();

  const checkOnboardingStatus = async () => {
    setIsLoading(true);
    console.log("Checking onboarding status");
    const user = auth().currentUser;
    if (user) {
      try {
        const userDoc = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();
        if (userDoc.exists) {
          const personalJournalDoc = await firestore()
            .collection("journals")
            .doc(user.uid)
            .get();
          setOnboardingComplete(personalJournalDoc.exists);
        } else {
          setOnboardingComplete(false);
        }
      } catch (error) {
        if (error.code === "permission-denied") {
          setOnboardingComplete(false);
        } else {
          console.error("Error checking onboarding status:", error);
          setOnboardingComplete(false);
        }
      }
    } else {
      setOnboardingComplete(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        checkOnboardingStatus();
      } else {
        setOnboardingComplete(false);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingComplete,
        setOnboardingComplete,
        checkOnboardingStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
