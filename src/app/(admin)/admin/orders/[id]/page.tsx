"use client";

import { AdminOrderDetails } from "@/components/admin/orders/AdminOrderDetails";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    return <AdminOrderDetails orderId={id} />;
}
