import * as React from "react";
import { cn } from "cn";
const TabsContext = React.createContext(null);
function Tabs({ defaultValue = "overview", value, onValueChange, className, children, ...props }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value ?? internalValue;
    const handleChange = onValueChange ?? setInternalValue;
    return (<TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>);
}
function TabsList({ className, ...props }) {
    return (<div className={cn("flex gap-1 border-b", className)} {...props}/>);
}
function TabsTrigger({ className, value, children, ...props }) {
    const ctx = React.useContext(TabsContext);
    if (!ctx)
        throw new Error("TabsTrigger must be used within Tabs");
    const active = ctx.value === value;
    return (<button className={cn("px-4 py-2 text-sm font-medium transition-colors", active ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground", className)} onClick={() => ctx.onValueChange(value)} {...props}>
      {children}
    </button>);
}
function TabsContent({ className, value, children, ...props }) {
    const ctx = React.useContext(TabsContext);
    if (!ctx)
        throw new Error("TabsContent must be used within Tabs");
    if (ctx.value !== value)
        return null;
    return (<div className={cn(className)} {...props}>
      {children}
    </div>);
}
export { Tabs, TabsList, TabsTrigger, TabsContent };
