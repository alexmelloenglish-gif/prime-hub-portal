import { MessageSquareQuote } from 'lucide-react'

type Props = {
  feedback: string
  month: string
}

export function TeacherFeedback({ feedback, month }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-prime-red">
          <MessageSquareQuote className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-white">Teacher Feedback</h2>
          <p className="text-xs text-prime-cream/40">{month}</p>
        </div>
      </div>

      <blockquote className="relative border-l-2 border-prime-red pl-4">
        <p className="text-sm text-prime-cream/80 leading-relaxed italic">
          &ldquo;{feedback}&rdquo;
        </p>
        <footer className="mt-3 text-xs text-prime-cream/40">
          — Alexandre Mello, Prime Digital Hub
        </footer>
      </blockquote>
    </div>
  )
}
