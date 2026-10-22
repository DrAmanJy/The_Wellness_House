import { notFound } from "next/navigation";
import { AccountSettings } from "@/components/customer/account-settings";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    ![
      "profile",
      "addresses",
      "preferences",
      "security",
      "orders",
      "saved",
    ].includes(section)
  )
    notFound();
  return <AccountSettings section={section} />;
}
