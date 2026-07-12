/**
 * Root admin segment layout - intentionally minimal.
 * Auth + sidebar live in `(panel)/layout.tsx` so `/admin/login`
 * is never wrapped in session checks that can thrash cookies/RSC.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
