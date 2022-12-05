import { Tooltip } from "antd";
import React from "react"

type Iprops = {
    style?: React.CSSProperties;
    list: any[];
}

const OverflowList: React.FC<Iprops> = (props) => {
    const { list, style, ...rest } = props

    const ref = React.useRef(null) as any
    const [currentCanShowCount, setCurrentCanShowCount] = React.useState<number | undefined>(undefined)

    const reduceCoutWidth = React.useCallback(
        (entries: IntersectionObserverEntry[], index: number) => entries
            .filter((_: IntersectionObserverEntry, idx: number) => idx <= index)
            .reduce((p: number, c: IntersectionObserverEntry) => (p += c.boundingClientRect.width), 0),
        []
    )

    const oberverCallback = React.useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const count = entries.reduce((pre: number, cur: IntersectionObserverEntry, index: number) => {
                const { rootBounds } = cur;
                const ww = rootBounds?.width
                if (ww) {
                    const rw = reduceCoutWidth(entries, index)
                    if (ww - rw > 0 && index === entries.length) return pre += 1
                    if (rw < (ww - 20))
                        return pre += 1
                }
                return pre
            }, 0)
            setCurrentCanShowCount(count)
        },
        []
    )

    React.useEffect(() => {
        const oberver = new IntersectionObserver(oberverCallback, { root: ref.current })
        if (ref.current) {
            const { childNodes } = ref.current
            childNodes.forEach((node: Element) => oberver.observe(node))
        }
        return () => {
            oberver.disconnect()
            setCurrentCanShowCount(undefined)
        }
    }, [list])

    const listRender = React.useCallback(
        (arr: any) => arr.map(((item: any, index: number) => (
            <React.Fragment key={index}>
                {item}
            </React.Fragment>
        ))),
        []
    )

    const ellipsis = typeof currentCanShowCount === "number"

    if (!list || list.length === 0) return <>-</>
    return (
        <div style={{ position: "relative", userSelect: "none", ...style }} {...rest}>
            <div style={{ width: "100%", overflow: "hidden", opacity: 0 }} ref={ref} >
                {
                    listRender(list)
                }
            </div>
            <div style={{ width: "100%", position: "absolute", left: 0, right: 0, top: 0 }}>
                {
                    ellipsis &&
                    <>
                        {
                            listRender(
                                list
                                    .filter((_: any, index: number) => index < currentCanShowCount)
                            )
                        }
                        {
                            (currentCanShowCount - list.length !== 0) &&
                            <Tooltip
                                color={"#fff"}
                                title={
                                    listRender(
                                        list
                                            .filter((_: any, index: number) => index >= currentCanShowCount)
                                    )
                                }
                            >
                                <span style={{ color: "#8c92a4" }}>
                                    +{list.length - currentCanShowCount}
                                </span>
                            </Tooltip>
                        }
                    </>
                }
            </div>
        </div>
    )
}

export default React.memo(OverflowList)