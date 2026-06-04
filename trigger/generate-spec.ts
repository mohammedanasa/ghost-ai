import { schemaTask, metadata, logger } from "@trigger.dev/sdk"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { put } from "@vercel/blob"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

const SYSTEM_PROMPT = `You are a technical documentation expert for Ghost AI, a collaborative system architecture diagramming tool.

Given a system architecture canvas (nodes and edges) and a conversation history, generate a comprehensive technical specification document in Markdown.

The spec should cover:
- **Overview**: A short summary of the system and its purpose
- **Architecture**: A description of each component, its role, and how it fits into the system
- **Component Interactions**: How the components connect and communicate (derived from edges)
- **Design Decisions**: Key design choices and rationale, drawing from the conversation history where relevant
- **Technical Notes**: Implementation considerations, constraints, and recommendations

Guidelines:
- Write clearly and concisely in the present tense
- Use the node labels as component names
- Group related components logically
- If no conversation history is provided, infer intent from the canvas structure
- Output only valid Markdown — no preamble, no trailing commentary`

const CanvasNodeSchema = z.object({
  id: z.string(),
  data: z.object({
    label: z.string(),
    shape: z.string().optional(),
    color: z.string().optional(),
  }),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const CanvasEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({ label: z.string().optional() }).optional(),
})

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

const GenerateSpecInputSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(ChatMessageSchema),
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
})

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: GenerateSpecInputSchema,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    randomize: true,
  },
  run: async (payload) => {
    logger.info("generate-spec started", {
      projectId: payload.projectId,
      roomId: payload.roomId,
      nodeCount: payload.nodes.length,
      edgeCount: payload.edges.length,
      chatMessages: payload.chatHistory.length,
    })

    metadata.set("status", "analyzing")
    metadata.set("nodeCount", payload.nodes.length)
    metadata.set("edgeCount", payload.edges.length)

    const nodeDescriptions = payload.nodes
      .map((n) => `- ${n.data.label} (id: ${n.id}, shape: ${n.data.shape ?? "rectangle"})`)
      .join("\n")

    const edgeDescriptions = payload.edges
      .map((e) => {
        const sourceNode = payload.nodes.find((n) => n.id === e.source)
        const targetNode = payload.nodes.find((n) => n.id === e.target)
        const sourceLabel = sourceNode?.data.label ?? e.source
        const targetLabel = targetNode?.data.label ?? e.target
        const label = e.data?.label ? ` (${e.data.label})` : ""
        return `- ${sourceLabel} → ${targetLabel}${label}`
      })
      .join("\n")

    const chatContext =
      payload.chatHistory.length > 0
        ? payload.chatHistory
            .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
            .join("\n")
        : "No conversation history provided."

    const userPrompt = `## Canvas Components\n${nodeDescriptions || "No nodes."}\n\n## Connections\n${edgeDescriptions || "No edges."}\n\n## Conversation History\n${chatContext}`

    metadata.set("status", "generating")

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    })

    metadata.set("status", "saving")

    const tempId = crypto.randomUUID()
    const blob = await put(
      `specs/${payload.projectId}/${tempId}.md`,
      text,
      {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    )

    const specRecord = await prisma.projectSpec.create({
      data: {
        projectId: payload.projectId,
        filePath: blob.url,
      },
    })

    metadata.set("status", "complete")
    logger.info("generate-spec complete", { specLength: text.length, specId: specRecord.id })

    return { spec: text, specId: specRecord.id }
  },
})
