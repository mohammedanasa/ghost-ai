import type { LiveList, LiveObject } from "@liveblocks/client"
import type { ChatMessage } from "@/types/tasks"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      aiChat: LiveList<LiveObject<ChatMessage>>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent:
      | { type: "AI_STATUS"; message: string; state: "start" | "processing" | "complete" | "error" }
      | { type: "AI_PRESENCE"; thinking: boolean }
      | { type: "AI_ADD_NODE"; id: string; label: string; shape: string; color: string; x: number; y: number; width: number; height: number }
      | { type: "AI_MOVE_NODE"; id: string; x: number; y: number }
      | { type: "AI_RESIZE_NODE"; id: string; width: number; height: number }
      | { type: "AI_UPDATE_NODE_DATA"; id: string; label?: string; color?: string; shape?: string }
      | { type: "AI_DELETE_NODE"; id: string }
      | { type: "AI_ADD_EDGE"; id: string; source: string; target: string; label?: string }
      | { type: "AI_DELETE_EDGE"; id: string };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
