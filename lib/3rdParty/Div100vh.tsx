import React, {HTMLAttributes, useEffect, useState} from 'react'

let warned = false

/**
 * From https://github.com/mvasin/react-div-100vh/blob/master/packages/react-div-100vh/src/index.tsx
 * @param style
 * @param other
 * @constructor
 */
export default function Div100vh({
                                     style = {},
                                     ...other
                                 }: HTMLAttributes<HTMLDivElement>): JSX.Element {
    const height = use100vh()

    if (!warned && style.height) {
        warned = true
        console.warn(
            '<' + 'Div100vh> overrides the height property of the style prop'
        )
    }
    const styleWithRealHeight = {
        ...style,
        height: height ? `${height}px` : '100vh'
    }
    return <div style={styleWithRealHeight} {...other} />
}

export function use100vh(): number | null {
    const [height, setHeight] = useState<number | null>(measureHeight)

    const wasRenderedOnClientAtLeastOnce = useWasRenderedOnClientAtLeastOnce()

    useEffect(() => {
        if (!wasRenderedOnClientAtLeastOnce) return

        function setMeasuredHeight() {
            const measuredHeight = measureHeight()
            setHeight(measuredHeight)
        }

        window.addEventListener('resize', setMeasuredHeight)
        return () => window.removeEventListener('resize', setMeasuredHeight)
    }, [wasRenderedOnClientAtLeastOnce])
    return wasRenderedOnClientAtLeastOnce ? height : null
}

export function measureHeight(): number | null {
    if (!isClient()) return null
    return document.documentElement?.clientHeight || window.innerHeight
}

// Once we ended up on client, the first render must look the same as on
// the server so hydration happens without problems. _Then_ we immediately
// schedule a subsequent update and return the height measured on the client.
// It's not needed for CSR-only apps, but is critical for SSR.
function useWasRenderedOnClientAtLeastOnce() {
    const [
        wasRenderedOnClientAtLeastOnce,
        setWasRenderedOnClientAtLeastOnce
    ] = useState(false)

    useEffect(() => {
        if (isClient()) {
            setWasRenderedOnClientAtLeastOnce(true)
        }
    }, [])
    return wasRenderedOnClientAtLeastOnce
}

function isClient() {
    return typeof window !== 'undefined' && typeof document !== 'undefined'
}