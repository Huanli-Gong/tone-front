/* eslint-disable react-hooks/exhaustive-deps */
import { Row, Space, Typography } from 'antd'
import styled from 'styled-components';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import RichEditor from '@/components/RichEditor';
import { EditFilled } from '@ant-design/icons';
import { history, useParams, useAccess, Access } from 'umi'
import { queryDocList } from '../services'
import Loading from './Loading';
import Empty from './Empty'
import Catalog from './Catalog'
import { tarnsformEmoji } from '@/components/RichEditor/components/Emoji/emojiReplacer';

const Wrapper = styled(Row)`
    height: 100%;
    width:100%;
    position: relative;
    padding: 20px;
`

const EditorContent = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: start;
    flex-direction: row;
`

const EditorContainer = styled.div<{ hasCatalog: number }>`
    width: ${({ hasCatalog }) => hasCatalog ? 'calc(100% - 230px)' : '100%'};
    height: 100%;
    display: flex;
    overflow-y: auto;
    /* padding-top: 20px; */
    flex-direction: column;
    gap: 8px;
`

const EditorTitle = styled.div`
    display:flex;
    width: 100%;
    height: 38px;
    align-items: center;
    justify-content: space-between;
    /* padding-right: 20px; */
    h2 {
        margin: 0 !important;
    }
`

const EditorWrapper = styled.div`
    width: 100%;
    min-height : calc(100% - 80px);
`

const EditorEditBtn = styled.span`
    cursor: pointer;
    width: 60px;
    &:hover {
        color :#108ee9;
    }
`

const EditorBlock: React.FC<any> = ({ id, title, gmt_created, gmt_modified }) => {
    const { doc_type } = useParams() as any
    const access = useAccess()

    const [loading, setLoading] = useState(true)
    const [editor, setEditor] = useState<any>()
    const [isEmpty, setIsEmpty] = useState(false)
    const [text, setText] = React.useState("")

    const ref = useRef(null) as any

    const queryDocContent = async () => {
        setLoading(true)
        if (id) {
            const { data } = await queryDocList({ id })
            if (data[0]) {
                setText(tarnsformEmoji(data[0].content))
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        queryDocContent()
        return () => {
            setLoading(true)
            setIsEmpty(false)
        }
    }, [id])

    const catalogSource = useMemo(() => {
        if (!editor) return []

        const { content } = editor.getJSON()
        return content?.filter(({ type, content: textContent }: any) => type === "heading" && textContent)
            .reduce((p: any, l: any, index: any) => {
                const { attrs, content: $content } = l
                if (!$content) return p
                const $text = $content.reduce((p: string, c: any) => p += c.text, "")
                const { level } = attrs

                return p.concat({
                    level,
                    text: $text,
                    node: l,
                    index,
                })
            }, [])
    }, [editor])

    return (
        <Wrapper>
            <EditorContent >
                {
                    !loading && !text ?
                        <Empty /> :
                        <EditorContainer hasCatalog={catalogSource.length ? 1 : 0}>
                            {
                                title &&
                                <>
                                    <EditorTitle >
                                        <Typography.Title ellipsis={{ tooltip: true }} level={2}>{title}</Typography.Title>
                                        <Access accessible={access.IsSysTestAdmin()}>
                                            <EditorEditBtn onClick={() => history.push(`/${doc_type}/edit/${id}`)}>
                                                <Space>
                                                    <EditFilled />
                                                    编辑
                                                </Space>
                                            </EditorEditBtn>
                                        </Access>
                                    </EditorTitle>
                                    <Space size={16}>
                                        <Typography.Text type="secondary">
                                            创建时间：{gmt_created}
                                        </Typography.Text>
                                        <Typography.Text type="secondary">
                                            更新时间：{gmt_modified}
                                        </Typography.Text>
                                    </Space>
                                </>
                            }

                            <EditorWrapper ref={ref as any} >
                                <RichEditor
                                    editable={false}
                                    content={text}
                                    onCreate={({ editor: $vm }: any) => {
                                        setEditor($vm)
                                    }}
                                />
                            </EditorWrapper>
                        </EditorContainer>
                }

                {
                    !!catalogSource.length &&
                    <Catalog
                        source={catalogSource}
                    />
                }
            </EditorContent>
            {
                isEmpty && <Empty />
            }
            <Loading loading={loading} />
        </Wrapper>
    )
}

export default EditorBlock