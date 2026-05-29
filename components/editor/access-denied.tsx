import Link from 'next/link'
import { Lock } from 'lucide-react'

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-base">
      <Lock className="h-8 w-8 text-copy-muted" />
      <p className="text-sm text-copy-secondary">You don&apos;t have access to this project.</p>
      <Link href="/editor" className="text-sm text-brand hover:underline">
        Back to editor
      </Link>
    </div>
  )
}
