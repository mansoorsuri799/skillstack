import { permanentRedirect } from "next/navigation";

/** Old URL — keep any links working */
export default function GilgitRedirectPage() {
  permanentRedirect("/");
}
