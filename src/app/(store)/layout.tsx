import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { getSiteConfig } from "@/lib/settings";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <div className="flex min-h-full flex-col bg-ivory text-ink">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter config={config} />
    </div>
  );
}
