import React from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <Main>{children}</Main>
      <Footer />
    </div>
  );
};

export default MainLayout;
