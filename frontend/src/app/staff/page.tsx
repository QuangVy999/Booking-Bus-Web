import { getCurrentStudent } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getTrips } from "@/app/actions/trip";
import StaffPageClient from "./StaffPageClient";

export default async function StaffPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  if (student.role !== 'Admin' && student.role !== 'Check-in Staff') {
    redirect("/");
  }

  // Fetch initial trips list for check-in dropdown
  const tripRes = await getTrips();
  const trips = tripRes.success && tripRes.trips ? tripRes.trips : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <StaffPageClient initialTrips={trips} student={student} />
    </div>
  );
}
