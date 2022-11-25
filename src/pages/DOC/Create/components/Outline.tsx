
import { Row, Space, Typography, Divider } from 'antd'
import React, { memo, useMemo } from 'react'
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
    editor?: any;
    contentJson?: any;
}

type OutlineItem = { level: number; text: string; index: number; node: any[] }

const Outline: React.FC<IProps> = ({ editor, contentJson }) => {
    if (!contentJson) return <></>
    const { content } = contentJson

    const result = content?.filter(({ type }: any) => type === "heading")
        .reduce((p: any, l: any, index: any) => {
            const { attrs } = l
            const { level } = attrs
            if (level < 4) {
                const text = l.content[0].text
                return p.concat({ level, text, node: l, index })
            }
            return p
        }, [])

    const hanldeClick = React.useCallback((node: any) => {
        const { content, attrs } = node
        const { text } = content[0]
        const { level } = attrs
        document.querySelectorAll(`h${level}`).forEach((ele) => {
            if (ele.innerHTML === text)
                scrollIntoView(ele, {
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'start',
                })
        })
    }, [editor]);

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
                            <Typography.Text ellipsis>
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