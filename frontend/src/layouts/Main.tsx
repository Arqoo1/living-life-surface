import React from "react";

interface MainProps {
  children: React.ReactNode;
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      {children}
    </main>
  );
};

export default Main;
