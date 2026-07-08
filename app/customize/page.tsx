import { Suspense } from 'react'
import CustomizeClient from './CustomizeClient'

export default function CustomizePage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        Loading customizer...
      </div>
    }>
      <CustomizeClient />
    </Suspense>
  )
}