// Force dynamic rendering so Supabase env vars are only needed at runtime, not build time
export const dynamic = 'force-dynamic';

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
