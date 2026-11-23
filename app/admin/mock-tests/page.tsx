import { redirect } from "next/navigation";

// Tests are managed in the Question Bank now. Old bookmarks to this page land there.
export default function AdminMockTestsPage() {
  redirect("/admin/questions");
}
