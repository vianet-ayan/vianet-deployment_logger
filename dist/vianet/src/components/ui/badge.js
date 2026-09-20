import * as React from "react";
import { cn } from "cn";
function Badge({ className, variant = "default", ...props }) {
    const variantStyles = {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
    };
    return (<div data-slot="badge" className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variantStyles[variant], className)} {...props}/>);
}
export { Badge };
