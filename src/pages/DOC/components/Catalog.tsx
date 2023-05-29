import React from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed';
import { Typography } from 'antd';
import cls from 'classnames'
import { history, useLocation } from 'umi';

const Wrapper = styled.div`
    position: absolute;
    right: 0;
    top: 20px;
    width: 230px;
    height: 100%;
    padding: 10px;
    overflow: auto;
    .item-active {
        border-left: 1px solid #1890ff;
        span {
            color: #1890ff;
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
    position: number,
    setPosition: (p: number) => void
}

const Catalog: React.FC<IProps> = ({ source }) => {
    const { pathname, hash } = useLocation()

    const hanldeClick = (node: any) => {
        scrollIntoView(node.dom, {
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
        });
        history.replace(`${pathname}#${node.text}`)
    }

    const base = React.useMemo(() => {
        if (!source) return []
        return source?.filter(({ text }: any) => !!text.trim())
    }, [source])

    const handleScroll = (evt?: any) => {
        const currentScroll = evt ? evt.target.scrollTop : 0
        const $current = base?.reduce((prev, curr) => {
            const currDistance = Math.abs(curr.dom.offsetTop - currentScroll);
            const prevDistance = Math.abs(prev.dom.offsetTop - currentScroll);
            return currDistance < prevDistance ? curr : prev;
        })

        history.replace(`${pathname}#${$current.text}`)
    }

    React.useEffect(() => {
        handleScroll()
    }, [])

    React.useEffect(() => {
        if (!source) return
        const dom = document.querySelector(".ProseMirror") as any
        if (!dom) return
        dom.addEventListener("scroll", handleScroll)
        return () => {
            dom.removeEventListener("scroll", handleScroll)
        }
    }, [source])

    return (
        <Wrapper>
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
                            style={{ textIndent: l.level - 1 + "em" }}
                        >
                            {l.text}
                        </Typography.Text>
                    </CatalogItem>
                ))
            }
        </Wrapper>
    )
}

export default Catalog