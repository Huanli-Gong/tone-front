
import { Row, Space, Typography, Divider } from 'antd'
import React from 'react'
import styled from 'styled-components'
import scrollIntoView from 'scroll-into-view-if-needed';

const Wrapper = styled(Row)`
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
            const text = l.content[0].text

            return p.concat({ level, text, node: l, index })
        }, [])

    // console.log(result)
    const hanldeClick = React.useCallback((node: any) => {
        const { content: $content, attrs } = node
        const { text } = $content[0]
        const { level } = attrs
        document.querySelectorAll(`.ProseMirror h${level}`).forEach((ele: any) => {
            if (ele.innerText === text)
                scrollIntoView(ele, {
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'start',
                })
        })
    }, [json]);

    return (
        <Wrapper >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Title level={4} style={{ fontWeight: 'normal', margin: 0 }}>大纲</Typography.Title>
                <Divider style={{ margin: 0 }} />
                {
                    result?.map(({ level, text, index, node }: OutlineItem) => (
                        <TitleWrap
                            key={index}
                            textIndent={level}
                            onClick={() => hanldeClick(node)}
                        >
                            <Typography.Text ellipsis={{ tooltip: true }} style={{ width: 250 }}>
                                {text}
                            </Typography.Text>
                        </TitleWrap>
                    ))
                }
            </Space>
        </Wrapper>
    )
}

export default Outline