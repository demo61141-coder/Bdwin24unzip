import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "BDWIN24 - Bangladesh's #1 Color Prediction, Casino & Sports Platform",
  description:
    "BDWIN24 অফিসিয়াল বাংলাদেশ গেমিং প্ল্যাটফর্ম। Win Go কালার প্রিডিকশন, এভিয়েটর ক্র্যাশ, স্লট এবং লাইভ ক্যাসিনো। বিকাশ ও নগদে দ্রুত রিচার্জ এবং উত্তোলন।",
  keywords: "bdwin24, bdwin, color prediction, wingo, aviator, casino bangladesh, bkash deposit, nagad withdraw",
  authors: [{ name: "BDWIN24 Official" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
