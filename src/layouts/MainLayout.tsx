import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <main>{children}</main>
  </div>
);

export default MainLayout; 