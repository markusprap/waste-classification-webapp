import { redirect } from "next/navigation";

// Redirect old /team route to the new /about route
export default function TeamPage() {
  redirect("/about");
}
