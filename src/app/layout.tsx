import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Foreman Daily",
  description: "Internal daily report app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
