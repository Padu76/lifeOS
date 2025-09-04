import { Suspense } from 'react'
export const dynamic = 'force-dynamic'

import CallbackClient from './CallbackClient'

export default function CallbackPage() {
  return (
    <Suspense fallback={<p className="p-6">Verifica in corso…</p>}>
      <CallbackClient />
    </Suspense>
  )
}
