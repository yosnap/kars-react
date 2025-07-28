import React from "react";
import WhatsAppFloatingButton from "../components/WhatsAppFloatingButton";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <main className="px-0 md:px-4 lg:px-0">{children}</main>
    <WhatsAppFloatingButton />
  </div>
);

export default MainLayout; 