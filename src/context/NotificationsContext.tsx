"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import type { Notification } from "@/types/notifications";

interface NotificationsState {
  notifications: Notification[];
}

type Action =
  | { type: "ADD"; payload: Notification }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "DISMISS"; id: string }
  | { type: "DISMISS_ALL" }
  | { type: "LOAD"; notifications: Notification[] };

function reducer(state: NotificationsState, action: Action): NotificationsState {
  switch (action.type) {
    case "ADD":
      return { notifications: [action.payload, ...state.notifications] };
    case "MARK_READ":
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };
    case "MARK_ALL_READ":
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "DISMISS":
      return {
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    case "DISMISS_ALL":
      return { notifications: [] };
    case "LOAD":
      return { notifications: action.notifications };
    default:
      return state;
  }
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "date" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pc_notifications");
      if (saved) {
        dispatch({ type: "LOAD", notifications: JSON.parse(saved) });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("pc_notifications", JSON.stringify(state.notifications));
    } catch { /* ignore */ }
  }, [state.notifications]);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "date" | "read">) => {
      dispatch({
        type: "ADD",
        payload: {
          ...n,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          read: false,
        },
      });
    },
    [],
  );

  const markRead = useCallback((id: string) => dispatch({ type: "MARK_READ", id }), []);
  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);
  const dismiss = useCallback((id: string) => dispatch({ type: "DISMISS", id }), []);
  const dismissAll = useCallback(() => dispatch({ type: "DISMISS_ALL" }), []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        dismiss,
        dismissAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider");
  return ctx;
}
