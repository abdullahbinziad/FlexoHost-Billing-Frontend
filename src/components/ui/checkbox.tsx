"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

// Since we are avoiding installing new packages if possible, and I see radx-ui usage in standard shadcn but I cannot run npm install.
// I will build a custom Checkbox component without radix-ui dependency to be safe, creating a standard controlled checkbox wrapper.
// Actually, I can check package.json to see if radix-ui/react-checkbox is there.
// But earlier "Dialog" was missing so likely not installed.
// I will make a pure React implementation.

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        type="checkbox"
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground accent-primary",
            className
        )}
        ref={ref}
        {...props}
    />
))
Checkbox.displayName = "Checkbox" // Standard HTML Checkbox styling can be limited, but using accent-color works for chrome/firefox. 
// For a better custom checkbox without radix key, we can wrap it.

// Let's try a custom styled div approach that hides the real checkbox.
const CustomCheckbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }
>(({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
        <div className="relative flex items-center">
            <input
                type="checkbox"
                className="peer absolute h-4 w-4 opacity-0 cursor-pointer z-10"
                ref={ref}
                checked={checked}
                onChange={(e) => {
                    onChange?.(e);
                    onCheckedChange?.(e.target.checked);
                }}
                {...props}
            />
            <div className={cn(
                "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "flex items-center justify-center",
                checked ? "bg-primary text-primary-foreground" : "bg-background",
                className
            )}>
                {checked && <Check className="h-3 w-3" />}
            </div>
        </div>
    )
})
CustomCheckbox.displayName = "Checkbox"


export { CustomCheckbox as Checkbox }
