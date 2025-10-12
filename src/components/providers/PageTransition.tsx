'use client'
//melembra/src/components/providers/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -20,
    },
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}