import Logo from "./_components/Logo";
import Navigation from "./_components/Navigation";
import { Josefin_Sans } from "next/font/google";
import { ReservationProvider } from "./_components/ReservationContext";
import "react-day-picker/dist/style.css";

import "@/app/_styles/globals.css";
import Header from "./_components/Header";

const josefin = Josefin_Sans({
  subsets: ["latin"], // for type of charater like chinese or latin
  display: "swap",
});
export const metadata = {
  title: {
    template: "%s The wild oasis",
    default: "Welcome to the wild oasis",
  },
  description:
    "Luxirious cabin hotel, located in the heart of the Italian Dolomites, surrounded by the beautiful mountains and dark forests ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} bg-primary-950 text-primary-100 min-h-screen flex flex-col antialiased`}
      >
        <Header />
        <main className="max-w-7xl flex-1 mx-auto ">
          <div className=" px-8 py-12 w-full mx-auto ">
            <ReservationProvider>{children}</ReservationProvider>
          </div>
        </main>
      </body>
    </html>
  );
}
