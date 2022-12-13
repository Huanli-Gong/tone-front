import React, { useEffect, useState } from 'react'
import { Row, Button, Typography } from 'antd'
import styled from 'styled-components'
import { PlusOutlined } from '@ant-design/icons'
import { queryDocList, updateDoc } from '../services';
import { useParams, history, useAccess, Access } from 'umi';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import DocListItem from './DocsListItem';
import Loading from './Loading';
import Empty from './Empty'

const DocsWrapper = styled(Row)`
    height: 100%;
    width: 334px;
    overflow: hidden;
    background-color:#fff;
    flex-direction: column;
`

const Title = styled(Row)`
    width: 100%;
    height: 48px;
    padding: 0 20px;
    border-bottom: 1px solid rgba(0,0,0,.1);
`

const List = styled(Row)`
    width: 100%;
    padding: 8px 0;
    position: relative;
`

type DocItem = {
    id?: number;
    title?: string;
    doc_type?: string;
    [k: string]: any;
}

type IProps = {
    onChange: (doc: DocItem) => void
}

const Docs: React.FC<IProps> = ({ onChange }) => {
    const { doc_type, doc_id } = useParams() as any
    const access = useAccess()

    const [docs, setDocs] = useState<DocItem[]>([])
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState<DocItem>({})

    const getDocs = async () => {
        setLoading(true)
        const { data, code } = await queryDocList({ doc_type, page_size: 1000 })
        setDocs(code === 200 ? data : [])
        setLoading(false)
        return data
    }

    useEffect(() => {
        if (docs.length) {
            setDocData(doc_id ? docs.filter((i: DocItem) => i.id === +doc_id)[0] : docs[0])
        }
    }, [doc_id, docs])

    const setDocData = (ct: DocItem) => {
        setCurrent({ ...ct })
        onChange({ ...ct })
    }

    useEffect(() => {
        getDocs()
        return () => {
            setCurrent({})
            setDocs([])
        }
    }, [])

    const handleMove = async (idx: number, order_id: number) => {
        if (idx === order_id) return
        const drag = docs.filter(({ }, index) => idx === index)[0]
        setDocs(
            docs.reduce((p: DocItem[], c: DocItem, index: number) => {
                if (index === idx && c.id === drag.id)
                    return p
                if (index === order_id)
                    return idx < order_id ? p.concat(c, drag) : p.concat(drag, c)
                return p.concat(c)
            }, [])
        )
        const { code } = await updateDoc({ id: drag.id, order_id: order_id + 1 })
        if (code != 200) {
            getDocs()
        }
    }

    const handleClick = (item: DocItem) => {
        if (item.id === doc_id) return
        setDocData(item)
        history.replace(`/${doc_type}/${item.id}`)
    }

    const handleCreateDoc = () => history.push(`/${doc_type}/create`)

    return (
        <DocsWrapper>
            <Title justify="space-between" align="middle">
                <Typography.Text>
                    {doc_type === 'help_doc' ? '帮助文档' : '公告'}
                </Typography.Text>
                <Access accessible={access.IsSysTestAdmin()}>
                    <Button type="primary" size="small" onClick={handleCreateDoc} style={{ padding: '0 4px' }}>
                        <PlusOutlined />
                    </Button>
                </Access>
            </Title>

            <div style={{ height: "calc(100% - 48px)", position: "relative", width: "100%", overflowY: "auto" }}>
                <DndProvider backend={HTML5Backend}>
                    <List>
                        {
                            docs.map(
                                (item: DocItem, idx: number) => (
                                    <DocListItem
                                        key={item.id}
                                        {...item}
                                        index={idx}
                                        className={current?.id === item.id && 'doc_active'}
                                        onClick={() => handleClick(item)}
                                        onMove={handleMove}
                                        refresh={getDocs}
                                    />
                                )
                            )
                        }
                    </List>
                </DndProvider>
                {
                    docs.length === 0 &&
                    <Empty />
                }
                <Loading loading={loading} />
            </div>
        </DocsWrapper>
    )
}

export default Docs