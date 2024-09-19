import React, { createContext, useContext, useState } from "react";

interface ConfettiContextType {
  triggerConfetti: () => void;
  shouldExplode: boolean;
  resetConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(
  undefined
);

export const ConfettiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldExplode, setShouldExplode] = useState(false);

  const triggerConfetti = () => setShouldExplode(true);
  const resetConfetti = () => setShouldExplode(false);

  return (
    <ConfettiContext.Provider
      value={{ triggerConfetti, shouldExplode, resetConfetti }}
    >
      {children}
    </ConfettiContext.Provider>
  );
};

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (context === undefined) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
};
