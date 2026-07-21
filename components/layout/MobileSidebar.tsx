"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="outline" size="icon" className="h-9 w-9 md:hidden">
          <Menu size={16} />
        </Button>
      } />
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <div className="flex flex-col justify-between h-full py-6">
          <SidebarNav onNavigate={() => setOpen(false)} />
          <p className="px-6 text-[11px] text-muted-foreground">
            Track your wealth,
            <br />
            not just your money.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}