import React from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed';
import { Typography } from 'antd';
import cls from 'classnames'
import { history, useLocation } from 'umi';

const Wrapper = styled.div`
    width: 230px;
    height: 100%;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    position: relative;
    .catalog-box {
        position: absolute;
        left: -1px;
        top: 0;
        z-index: 10;
        overflow: auto;
        width: 100%;
        height: 100%;
        .item-active {
            border-left: 1px solid #1890ff;
            span {
                color: #1890ff;
            }
        }
    }
`

const CatalogItem = styled.div`
    width: 100%;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
    padding: 4px 0 4px 20px;
`
type IProps = {
    source: any[],
}

const getNodeDom: any = (data: any) => {
    const { level, text } = data
    let dom;
    document.querySelectorAll(`.ProseMirror h${level}`).forEach((ele: any) => {
        if (ele.innerText === text)
            dom = ele
    })
    return dom
}

const Catalog: React.FC<IProps> = ({ source }) => {
    const { pathname, hash } = useLocation()

    const [start, setStart] = React.useState<any>(undefined)
    const [time, setTime] = React.useState<any>(undefined)
    const [isOver, setIsOver] = React.useState(true)

    const hanldeClick = (node: any) => {
        setStart(node)
        setTime(new Date().getTime())
        setIsOver(false)
        scrollIntoView(getNodeDom(node), {
            behavior: "smooth",
            block: 'start',
            inline: "start"
        })
    }

    React.useEffect(() => {
        if (!isOver) return
        if (start) {
            history.replace(`${pathname}#${start.text}`)
            setStart(undefined)
            return
        }
        const dom = document.querySelector(".ProseMirror") as any
        const $current = base?.reduce((prev, curr) => {
            const currDistance = Math.abs(getNodeDom(curr)?.offsetTop - dom.scrollTop);
            const prevDistance = Math.abs(getNodeDom(prev)?.offsetTop - dom.scrollTop);
            return currDistance < prevDistance ? curr : prev;
        })
        history.replace(`${pathname}#${$current.text}`)
    }, [isOver])

    React.useEffect(() => {
        if (!time) return
        const timer = setInterval(() => {
            if ((new Date().getTime() - time) > 200) setIsOver(true)
        }, 60)
        return () => {
            clearInterval(timer)
        }
    }, [time])

    const base = React.useMemo(() => {
        if (!source) return []
        return source?.filter(({ text }: any) => text && !!text.trim())
    }, [source])

    const handleScroll = () => {
        setTime(new Date().getTime())
        setIsOver(false)
    }

    React.useEffect(() => {
        const idx = base.findIndex(({ text }: any) => `#${text}` === decodeURI(hash))
        if (!~idx) return
        const timer = setTimeout(() => hanldeClick(base[idx]), 1000)
        return () => {
            clearTimeout(timer)
        }
    }, [base])

    React.useEffect(() => {
        const dom = document.querySelector(".ProseMirror") as any
        if (!dom) return
        dom.addEventListener("scroll", handleScroll)
        return () => {
            dom.removeEventListener("scroll", handleScroll)
        }
    }, [])

    const baseLevels = React.useMemo(() => {
        const levels = base.reduce((pre: any, cur: any) => {
            const { level } = cur
            pre[level] = pre[level] ? pre[level] + 1 : 1
            return pre
        }, {})
        const levs = Object.keys(levels)
        const minMaxs: any = levs.sort((a: any, b: any) => a - b)
        const min = minMaxs.at(0) ? + minMaxs.at(0) : 1
        return min
    }, [base])

    return (
        <Wrapper>
            <div className="catalog-box">
                {
                    base.map((l: any) => (
                        <CatalogItem
                            key={l.index}
                            onClick={() => hanldeClick(l)}
                            className={
                                cls(
                                    hash === `#${l.text}` && 'item-active'
                                )
                            }
                        >
                            <Typography.Text
                                ellipsis={{ tooltip: { placement: "left" } }}
                                style={{ textIndent: l.level - baseLevels + "em" }}
                            >
                                {l.text}
                            </Typography.Text>
                        </CatalogItem>
                    ))
                }
            </div>
        </Wrapper>
    )
}

export default Catalog