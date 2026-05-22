import { ClientLayout } from "@/components/client/ClientLayout";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
