import { getSession } from "@/lib/auth";
import { HeaderBar } from "@/components/site/header-bar";

export async function SiteHeader() {
  const user = await getSession();
  return <HeaderBar authed={Boolean(user)} />;
}
