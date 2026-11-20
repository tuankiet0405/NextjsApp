import { notFound } from "next/navigation";
import EditReservationForm from "@/app/_components/EditReservationForm";
import { requireGuest } from "@/app/_lib/auth";
import { getBookingForGuest, getCabin } from "@/app/_lib/data-service";

export const metadata = { title: "Edit reservation" };

export default async function Page({ params }: { params: { bookingId: string } }) {
  const user = await requireGuest();
  const bookingId = Number(params.bookingId);
  if (!Number.isInteger(bookingId)) notFound();

  const booking = await getBookingForGuest(bookingId, user.guestId);
  if (!booking) notFound();
  const { maxCapacity } = await getCabin(booking.cabinId);

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{booking.id}
      </h2>
      <EditReservationForm booking={booking} maxCapacity={maxCapacity} />
    </div>
  );
}
