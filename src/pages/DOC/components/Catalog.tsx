import React from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed';
import { Typography } from 'antd';
import cls from 'classnames'

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

const Catalog: React.FC<IProps> = ({ source, position, setPosition }) => {
    const hanldeClick = (node: any) => {
        scrollIntoView(node.dom, {
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
        });
        setPosition(node.position)
    }

    const setActiveClass = (idx: number) => {
        const current = source[idx]
        const next = source[idx + 1]

        if (idx === 0)
            return next && next.position ? position < next.position : position
        if (idx === source.length - 1)
            return position > current.position
        return position >= current.position && position < next.position
    }

    return (
        <Wrapper>
            {
                source?.map((l: any, idx: number) => (
                    <CatalogItem
                        key={l.index}
                        onClick={() => hanldeClick(l)}
                        className={
                            cls(
                                setActiveClass(idx) && 'item-active'
                            )
                        }
                    >
                        <Typography.Text
                            style={{ textIndent: l.level + "em" }}
                            ellipsis={{ tooltip: true }}
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