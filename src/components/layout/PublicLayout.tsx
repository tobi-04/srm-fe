import React from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      <PublicHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
