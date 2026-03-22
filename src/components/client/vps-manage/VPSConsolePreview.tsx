"use client";

import { Button } from "@/components/ui/button";
import { TerminalSquare } from "lucide-react";

export function VPSConsolePreview() {
    return (
        <div className="bg-black rounded-lg overflow-hidden border border-gray-800 font-mono text-sm relative group h-full min-h-[250px] flex flex-col">
            <div className="bg-gray-900 border-b border-gray-800 p-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-500 text-xs ml-2">Display :0</div>
            </div>
            <div className="p-4 text-green-500 flex-1 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                <p>Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)</p>
                <p className="mt-2"> * Documentation:  https://help.ubuntu.com</p>
                <p> * Management:     https://landscape.canonical.com</p>
                <p> * Support:        https://ubuntu.com/advantage</p>
                <p className="mt-4">Last login: Thu Jan 30 14:02:11 2026 from 192.168.1.50</p>
                <p>root@vps:~# <span className="animate-pulse">_</span></p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                <Button variant="secondary" className="gap-2">
                    <TerminalSquare className="w-4 h-4" />
                    Launch VNC Console
                </Button>
            </div>
        </div>
    );
}
