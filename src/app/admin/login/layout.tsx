/**
 * Standalone full-screen shell for login - no sidebar, no staff query.
 */
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-ink antialiased">{children}</div>
  );
}
