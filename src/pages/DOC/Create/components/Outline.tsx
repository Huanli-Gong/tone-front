/* eslint-disable react-hooks/exhaustive-deps */

import { Space, Typography, Divider } from 'antd'
import React from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed';

const Wrapper = styled.div`
    position: absolute;
    right: 20px;
    top: 60px;
    width:250px;
`

const TitleWrap = styled.span<{ textIndent: number }>`
    cursor: pointer;
    display: inline-flex;
    text-indent: ${({ textIndent }) => textIndent > 1 ? textIndent - 1 + 'rem' : 'unset'};
    &:hover span {
        color: #1890ff;
    }
`

type IProps = {
    json?: any;
}

type OutlineItem = { level: number; text: string; index: number; node: any[] }

const Outline: React.FC<IProps> = ({ json }) => {
    if (!json) return <></>
    const { content } = json
    if (!content) return <></>

    const result = content?.filter(({ type }: any) => type === "heading")
        .reduce((p: any, l: any, index: any) => {
            const { attrs } = l
            const { level } = attrs
            if (!l.content) return p
            const text = l.content.reduce((p: string, c: any) => p += c.text, "")

            return p.concat({ level, text, node: l, index })
        }, [])

    // console.log(result)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hanldeClick = React.useCallback((node: any) => {
        const { content: $content, attrs } = node
        const { level } = attrs
        document.querySelectorAll(`.ProseMirror h${level}`).forEach((ele: any) => {
            const text = $content.reduce((p: string, c: any) => p += c.text, "")
            if (ele.innerText === text)
                scrollIntoView(ele, {
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'start',
                })
        })
    }, [json]);

    const min = React.useMemo(() => result?.map(({ level }: any) => level).sort((a: number, b: number) => a - b).at(0) || 0, [result])

    const [catalogHeight, setCatalogHeight] = React.useState(0)
    const ref = React.useRef<HTMLDivElement>(null)

    const handleResize = () => {
        if (!ref.current) return
        setCatalogHeight(
            document.body?.getBoundingClientRect()?.height - ref.current.getBoundingClientRect()?.y - 20
        )
    }

    React.useEffect(() => {
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return (
        <Wrapper>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Title level={4} style={{ fontWeight: 'normal', margin: 0 }}>大纲</Typography.Title>
                <Divider style={{ margin: 0 }} />
                <div ref={ref} style={{ overflowY: "scroll", overflowX: "hidden", height: catalogHeight, width: 250 }}>
                    {
                        result?.filter(({ text }: OutlineItem) => text && !!text.trim())
                            .map(({ level, text, index, node }: OutlineItem) => (
                                <TitleWrap
                                    key={index}
                                    textIndent={level - min}
                                    onClick={() => hanldeClick(node)}
                                >
                                    <Typography.Text ellipsis={{ tooltip: { placement: "left" } }} style={{ width: 250 }}>
                                        {text}
                                    </Typography.Text>
                                </TitleWrap>
                            ))
                    }
                </div>
            </Space>
        </Wrapper>
    )
}

export default Outline