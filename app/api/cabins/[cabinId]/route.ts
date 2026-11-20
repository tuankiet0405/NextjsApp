import supabase from "@/app/_lib/supabase";
import { getBookedDatesByCabinId } from "@/app/_lib/data-service";

export async function GET(_req: Request, { params }: { params: { cabinId: string } }) {
  const id = Number(params.cabinId);
  if (!Number.isInteger(id) || id < 1)
    return Response.json({ message: "Invalid cabin id" }, { status: 400 });

  const { data: cabin, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, description, image")
    .eq("id", id)
    .maybeSingle();

  if (error) return Response.json({ message: "Internal error" }, { status: 500 });
  if (!cabin) return Response.json({ message: "Cabin not found" }, { status: 404 });

  const bookedDates = await getBookedDatesByCabinId(id);
  return Response.json({ cabin, bookedDates });
}
