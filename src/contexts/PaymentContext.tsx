import React, { createContext, useContext, useState } from "react";

interface PaymentContextType {
  transaction: any | null;
  setTransaction: (transaction: any) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transaction, setTransaction] = useState<any | null>(null);

  return (
    <PaymentContext.Provider value={{ transaction, setTransaction }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentData = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePaymentData must be used within a PaymentProvider");
  }
  return context;
};
