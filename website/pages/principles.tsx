import { GetStaticProps } from 'next'
import { motion } from 'framer-motion'
import PageLayout from '@/components/PageLayout'
import PrinciplesRenderer from '@/components/PrinciplesRenderer'
import FlowDivider from '@/components/FlowDivider'
import { loadJsonDataSafe } from '@/lib/dataLoader'

interface PrinciplesProps {
  principles: any[]
}

export default function Principles({ principles }: PrinciplesProps) {
  return (
    <PageLayout 
      title="Principles" 
      description="My operating principles"
      currentPage="principles"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-display font-bold mb-6">
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            Principles
          </span>
        </h1>
        <p className="text-lg text-muted mb-8 max-w-3xl">
          My core operating principles - the fundamental beliefs and values that guide my decisions, actions, and growth.
        </p>
      </motion.div>

      {
      //<FlowDivider variant="wave" />
      }

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PrinciplesRenderer principles={principles} />
      </motion.div>
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const principles = await loadJsonDataSafe('principles.json')
  return {
    props: { principles }
  }
}
