import React from "react";
import WhatsAppFloatingButton from "../components/WhatsAppFloatingButton";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <main>{children}</main>
    <WhatsAppFloatingButton />
  </div>
);

export default MainLayout; 