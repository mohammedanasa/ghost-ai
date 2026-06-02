import { task, metadata } from "@trigger.dev/sdk"
import { generateText, tool, isLoopFinished } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import { getLiveblocks } from "@/lib/liveblocks"
import { NODE_COLORS, NODE_SHAPES } from "@/types/canvas"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

const SYSTEM_PROMPT = `You are an AI system architecture design agent for Ghost AI, a collaborative diagramming tool.

Given a user prompt, generate canvas actions that create a clear, well-organized system design diagram.

## Node Shapes and Their Meanings
- rectangle: general service, application layer, or component
- pill: microservice, worker process, or serverless function
- diamond: API gateway, load balancer, or traffic router
- circle: event, webhook, trigger, or external endpoint
- cylinder: database, cache, message queue, or blob storage
- hexagon: external system, third-party service, or user/client boundary

## Color Palette (colorIndex 0–7)
0 = Neutral dark — generic or default components
1 = Blue — REST APIs, HTTP services, backend services
2 = Purple — auth, identity, access control
3 = Orange — message queues, event buses, async workers
4 = Red — rate limiters, circuit breakers, monitoring
5 = Pink — frontend, UI, CDN, browser clients
6 = Green — databases, persistent storage, file systems
7 = Teal — caches, Redis, temporary or in-memory storage

## Default Node Sizes
rectangle: 160×80 | pill: 160×60 | diamond: 120×120 | circle: 80×80 | cylinder: 100×80 | hexagon: 120×120

## Layout Rules
- Data flows left to right: clients → entry layer → core services → storage
- Client or browser nodes: x=50–150
- API gateway or entry point: x=350–450
- Core application services: x=600–750
- Databases, caches, queues: x=900–1050
- External third-party systems: x=1200–1350
- Vertical spacing between nodes in the same group: 150–180px
- Start y at 120 and increase by 150px per row
- Target 5–12 nodes and meaningful edges only

## Quality Rules
- Labels: 1–3 words, clear and descriptive (e.g. "API Gateway", "User DB", "Auth Service")
- Node IDs: short, descriptive, lowercase with hyphens (e.g. "client", "api-gw", "auth-svc", "user-db")
- Edge IDs: "e-{source}-{target}" pattern (e.g. "e-client-api-gw")
- Only add edges for direct, meaningful data flows
- Choose the shape that best represents each component's role

Call all addNode tools first to place every component, then call addEdge tools to connect them.`

export const designAgent = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    const liveblocks = getLiveblocks()

    async function broadcast(event: Record<string, unknown>) {
      await liveblocks.broadcastEvent(payload.roomId, event as Liveblocks["RoomEvent"])
    }

    async function setAiPresence(thinking: boolean) {
      try {
        await liveblocks.setPresence(payload.roomId, {
          userId: "ghost-ai",
          data: { cursor: null, thinking },
          userInfo: { name: "Ghost AI", avatar: "", color: "#8B5CF6" },
          ttl: thinking ? 120 : 1,
        })
      } catch {}
    }

    let actionsApplied = 0

    try {
      await broadcast({ type: "AI_STATUS", message: "Analyzing your request…", state: "start" })
      await broadcast({ type: "AI_PRESENCE", thinking: true })
      await setAiPresence(true)
      metadata.set("status", "analyzing")

      await broadcast({ type: "AI_STATUS", message: "Generating design…", state: "processing" })
      metadata.set("status", "generating")

      await generateText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT,
        prompt: payload.prompt,
        stopWhen: isLoopFinished(),
        tools: {
          addNode: tool({
            description: "Add a new node to the canvas",
            inputSchema: z.object({
              id: z.string().describe("Unique node ID, e.g. 'api', 'db1', 'cache'"),
              label: z.string().describe("Short label, 1–3 words"),
              shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]),
              colorIndex: z.number().int().min(0).max(7).describe("Index into color palette (0–7)"),
              x: z.number().describe("Canvas x position"),
              y: z.number().describe("Canvas y position"),
              width: z.number().optional(),
              height: z.number().optional(),
            }),
            execute: async ({ id, label, shape, colorIndex, x, y, width, height }) => {
              const color = NODE_COLORS[colorIndex] ?? NODE_COLORS[0]
              const shapeDefault = NODE_SHAPES.find((s) => s.shape === shape)
              await broadcast({
                type: "AI_ADD_NODE",
                id,
                label,
                shape,
                color: color.fill,
                x,
                y,
                width: width ?? shapeDefault?.width ?? 160,
                height: height ?? shapeDefault?.height ?? 80,
              })
              actionsApplied++
              return { success: true }
            },
          }),
          moveNode: tool({
            description: "Move an existing node to a new position",
            inputSchema: z.object({
              id: z.string().describe("Node ID to move"),
              x: z.number().describe("New x position"),
              y: z.number().describe("New y position"),
            }),
            execute: async ({ id, x, y }) => {
              await broadcast({ type: "AI_MOVE_NODE", id, x, y })
              actionsApplied++
              return { success: true }
            },
          }),
          resizeNode: tool({
            description: "Resize an existing node",
            inputSchema: z.object({
              id: z.string().describe("Node ID to resize"),
              width: z.number().describe("New width in pixels"),
              height: z.number().describe("New height in pixels"),
            }),
            execute: async ({ id, width, height }) => {
              await broadcast({ type: "AI_RESIZE_NODE", id, width, height })
              actionsApplied++
              return { success: true }
            },
          }),
          updateNodeData: tool({
            description: "Update the label, color, or shape of an existing node",
            inputSchema: z.object({
              id: z.string().describe("Node ID to update"),
              label: z.string().optional().describe("New label text"),
              colorIndex: z.number().int().min(0).max(7).optional().describe("New color index (0–7)"),
              shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]).optional(),
            }),
            execute: async ({ id, label, colorIndex, shape }) => {
              const event: Record<string, unknown> = { type: "AI_UPDATE_NODE_DATA", id }
              if (label !== undefined) event.label = label
              if (colorIndex !== undefined) event.color = (NODE_COLORS[colorIndex] ?? NODE_COLORS[0]).fill
              if (shape !== undefined) event.shape = shape
              await broadcast(event)
              actionsApplied++
              return { success: true }
            },
          }),
          deleteNode: tool({
            description: "Delete a node from the canvas",
            inputSchema: z.object({
              id: z.string().describe("Node ID to delete"),
            }),
            execute: async ({ id }) => {
              await broadcast({ type: "AI_DELETE_NODE", id })
              actionsApplied++
              return { success: true }
            },
          }),
          addEdge: tool({
            description: "Add an edge connecting two nodes",
            inputSchema: z.object({
              id: z.string().describe("Edge ID, e.g. 'e-client-api'"),
              source: z.string().describe("Source node ID"),
              target: z.string().describe("Target node ID"),
              label: z.string().optional().describe("Optional edge label"),
            }),
            execute: async ({ id, source, target, label }) => {
              const event: Record<string, unknown> = { type: "AI_ADD_EDGE", id, source, target }
              if (label !== undefined) event.label = label
              await broadcast(event)
              actionsApplied++
              return { success: true }
            },
          }),
          deleteEdge: tool({
            description: "Delete an edge from the canvas",
            inputSchema: z.object({
              id: z.string().describe("Edge ID to delete"),
            }),
            execute: async ({ id }) => {
              await broadcast({ type: "AI_DELETE_EDGE", id })
              actionsApplied++
              return { success: true }
            },
          }),
        },
      })

      await broadcast({ type: "AI_STATUS", message: "Design complete.", state: "complete" })
      await broadcast({ type: "AI_PRESENCE", thinking: false })
      await setAiPresence(false)
      metadata.set("status", "complete")

      return { actionsApplied }
    } catch (error) {
      try { await broadcast({ type: "AI_STATUS", message: "Something went wrong. Please try again.", state: "error" }) } catch {}
      try { await broadcast({ type: "AI_PRESENCE", thinking: false }) } catch {}
      await setAiPresence(false)
      metadata.set("status", "error")
      throw error
    }
  },
})
