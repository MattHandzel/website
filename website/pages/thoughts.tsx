import React from 'react'
import { GetStaticProps } from 'next'
import PageLayout from '@/components/PageLayout'
import ThoughtsRenderer from '@/components/ThoughtsRenderer'
import { loadJsonDataSafe } from '@/lib/dataLoader'
import { useRouter } from 'next/router'

interface ThoughtsProps {
  thoughts: any[]
}

export default function Thoughts({ thoughts }: ThoughtsProps) {
  const router = useRouter()
  const { captureId } = router.query

  return (
    <PageLayout 
      title="Thoughts" 
      description="Raw thoughts and quick captures"
      currentPage="thoughts"
    >
      <h2 className="text-2xl font-bold text-text mb-6">Thoughts & Quick Captures</h2>
      <ThoughtsRenderer thoughts={thoughts} focusedCaptureId={captureId as string} />
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const thoughts = await loadJsonDataSafe('thoughts.json')
  return {
    props: { thoughts }
  }
}
