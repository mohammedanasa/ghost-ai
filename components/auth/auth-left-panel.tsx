import { Network, Share2, FileText } from "lucide-react"

const features = [
  {
    icon: Network,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col px-16 py-12">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
          <span className="text-sm font-bold text-base">G</span>
        </div>
        <span className="text-sm font-medium text-copy-primary">Ghost AI</span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md">
        <h1 className="text-5xl font-bold text-copy-primary leading-tight mb-5">
          Design systems at the speed of thought.
        </h1>
        <p className="text-copy-secondary text-base mb-10 leading-relaxed">
          Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
        </p>

        <div className="space-y-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-elevated border border-border-default flex items-center justify-center">
                <Icon className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-copy-primary mb-0.5">{title}</p>
                <p className="text-sm text-copy-muted leading-snug">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
