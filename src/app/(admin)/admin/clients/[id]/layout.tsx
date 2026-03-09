import { ClientLayoutContent } from "@/components/admin/client-details/ClientLayoutContent";

export default function ClientLayout(props: { children: React.ReactNode }) {
    return <ClientLayoutContent>{props.children}</ClientLayoutContent>;
}
