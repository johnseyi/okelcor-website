import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string>> };

export default async function AuthRedirect({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl;
  if (callbackUrl) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  redirect("/login");
}
