"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <NotificationDropdown>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-gold hover:bg-gold/10"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </NotificationDropdown>
  );
}
