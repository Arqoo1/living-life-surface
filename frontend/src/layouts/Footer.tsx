import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: "1rem",
        backgroundColor: "#2E186A",
        color: "#fff",
        textAlign: "center",
      }}
    >
      &copy; {new Date().getFullYear()} Life Dashboard. All rights reserved.
    </footer>
  );
};

export default Footer;
