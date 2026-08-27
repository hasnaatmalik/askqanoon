import { redirect } from "next/navigation";

// Video forensics feature has been removed.
export default function VideoPage() {
    redirect("/");
}
