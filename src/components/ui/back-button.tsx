"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    href?: string;
    label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className="mb-4 -ml-2 hover:bg-muted"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {label}
        </Button>
    );
}
