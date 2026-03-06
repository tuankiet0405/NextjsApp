import Logo from "./_components/Logo";
import Navigation from "./_components/Navigation";
import { Josefin_Sans } from "next/font/google";
import { ReservationProvider } from "./_components/ReservationContext";
import "react-day-picker/dist/style.css";

import "@/app/_styles/globals.css";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

const josefin = Josefin_Sans({
  subsets: ["latin"], // for type of charater like chinese or latin
  display: "swap",
});
export const metadata = {
  title: {
    template: "%s | The Wild Oasis",
    default: "Welcome to The Wild Oasis",
  },
  description:
    "Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by beautiful mountains and dark forests.",
  manifest: "/manifest.json",
  openGraph: {
    title: "The Wild Oasis",
    description: "Book luxury cabins in the Italian Dolomites",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} bg-primary-950 text-primary-100 min-h-screen flex flex-col antialiased`}
      >
        <Header />
        <main className="max-w-7xl flex-1 mx-auto w-full">
          <div className="px-8 py-12 w-full mx-auto">
            <ReservationProvider>{children}</ReservationProvider>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
