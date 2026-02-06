import React, { createContext, useContext } from "react";
import type { LandingPage } from "../stores/landingPageStore";

interface LandingPageContextType {
  landingPage: LandingPage | null;
  isPurchaseModalOpen?: boolean;
  setPurchaseModalOpen?: (open: boolean) => void;
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(
  undefined,
);

export const LandingPageProvider: React.FC<{
  landingPage: LandingPage | null;
  isPurchaseModalOpen?: boolean;
  setPurchaseModalOpen?: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ landingPage, isPurchaseModalOpen, setPurchaseModalOpen, children }) => {
  return (
    <LandingPageContext.Provider
      value={{ landingPage, isPurchaseModalOpen, setPurchaseModalOpen }}
    >
      {children}
    </LandingPageContext.Provider>
  );
};

export const useLandingPageData = () => {
  const context = useContext(LandingPageContext);
  if (context === undefined) {
    throw new Error(
      "useLandingPageData must be used within a LandingPageProvider",
    );
  }
  return context;
};
