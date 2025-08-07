"use client";

import { useGame } from "@/context/GameContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { NotificationType } from "@/types";

export default function NotificationCenter() {
  const { gameState, dispatch } = useGame();
  const { notifications } = gameState;

  const handleDismiss = (id: number) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: { id } });
  };

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const timer = setTimeout(() => {
        handleDismiss(latestNotification.id);
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getVariant = (type: NotificationType): "default" | "destructive" => {
    if (type === 'error' || type === 'warning') {
        return 'destructive';
    }
    return 'default';
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {notifications.map((notification) => (
        <Alert key={notification.id} variant={getVariant(notification.type)}>
          <div className="flex items-start justify-between">
            <div>
              {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
              <AlertDescription>{notification.message}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDismiss(notification.id)}
            >
              X
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
