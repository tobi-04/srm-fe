import React, { createContext, useContext, useState, ReactNode } from "react";

interface CountdownContextType {
  isCountdownFinished: boolean;
  setCountdownFinished: (finished: boolean) => void;
}

const CountdownContext = createContext<CountdownContextType | undefined>(
  undefined
);

export const CountdownProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);

  const setCountdownFinished = (finished: boolean) => {
    setIsCountdownFinished(finished);
  };

  return (
    <CountdownContext.Provider
      value={{ isCountdownFinished, setCountdownFinished }}>
      {children}
    </CountdownContext.Provider>
  );
};

export const useCountdown = () => {
  const context = useContext(CountdownContext);
  if (context === undefined) {
    // Return default values if not in provider (for builder mode)
    return { isCountdownFinished: true, setCountdownFinished: () => {} };
  }
  return context;
};
