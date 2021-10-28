import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'

import { Drawer, Space, Button, Checkbox, Input, message, Row, Typography, Tooltip, Spin } from 'antd'
import { queryTestTemplateList } from '@/pages/WorkSpace/TestTemplateManage/service'
import { SearchOutlined } from '@ant-design/icons'
import { isArray } from 'lodash'

import styles from './index.less'

const TemplateListDrawer = (props: any, ref: any) => {
    const { ws_id, onOk } = props
    const [visible, setVisible] = useState(false)
    const [search, setSearch] = useState('')

    const [dataIndex, setDataIndex] = useState(null)
    const [templates, setTemplates] = useState<any>([])
    const [rowkey, setRowkey] = useState<any>(null)

    const [replaceId, setReplaceId] = useState(null)

    const [list, setList] = useState([])
    const [loading, setLoading] = useState(true)

    useImperativeHandle(ref, () => ({
        show: (_: any, idx: any, rowIndex: any, id: any) => {
            if (typeof rowIndex === 'number') {
                setRowkey(rowIndex)
                setReplaceId(id)
            }
            setVisible(true)
            initList()

            if (isArray(_)) {
                setTemplates(_.map((i: any) => i.id))
                setDataIndex(idx)
            }
        }
    }), [])

    const initList = async () => {
        setLoading(true)
        const { data, code, msg } = await queryTestTemplateList({ ws_id, enable: 'True', name: search, page_size: 100 })
        setLoading(false)
        if (code !== 200) {
            setList([])
            return
        }
        setList(data)
    }

    // const { data: list, run } = useRequest(
    //     () => queryTestTemplateList({ ws_id, enable: 'True', name: search, page_size: 100 }),
    //     { initialData: [] }
    // )

    const handleClose = () => {
        setVisible(false)
        setTemplates([])
        setDataIndex(null)
        setReplaceId(null)
        setRowkey(null)
        setList([])
        setSearch('')
    }

    const handleOk = () => {
        onOk({
            list: list.filter((i: any) => {
                if (templates.filter((t: any) => i.id === t).length > 0)
                    return i
            }),
            dataIndex
        })
        handleClose()
    }

    const hanldeTemplateListChange = (arr: any) => {
        if (arr.length > 10) {
            message.warning('模版最多添加10个')
            return
        }
        setTemplates(arr)
    }

    const handleReplace = (i: number | string) => {
        onOk({
            ...i,
            rowkey,
            dataIndex,
            replaceId,
        })
        handleClose()
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title="模板列表"
            visible={visible}
            width="376"
            onClose={handleClose}
            footer={
                typeof replaceId !== 'number' &&
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}>取消</Button>
                        <Button type="primary" onClick={handleOk} >确定</Button>
                    </Space>
                </div>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }} className={styles.templateListDrawerSpace}>
                <Input
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={({ target }: any) => setSearch(target.value)}
                    onBlur={initList}
                />
                <Spin spinning={loading} >
                    {
                        typeof rowkey !== 'number' ?
                            <Checkbox.Group style={{ width: '100%' }} value={templates} onChange={hanldeTemplateListChange}>
                                {
                                    list.map((i: any) => (
                                        <Checkbox
                                            style={{ width: '100%', marginLeft: 0 }}
                                            key={i.id}
                                            value={i.id}
                                        >
                                            <Tooltip title={i.name} >
                                                <Typography.Text ellipsis style={{ width: '90%' }}>
                                                    {i.name}
                                                </Typography.Text>
                                            </Tooltip>
                                        </Checkbox>
                                    ))
                                }
                            </Checkbox.Group> :
                            list.map((i: any) => {
                                return (
                                    <Row key={i.id} style={{ cursor: 'pointer', width: '100%' }}>
                                        <Tooltip title={i.name}>
                                            {
                                                replaceId === i.id ?
                                                    <Typography.Link onClick={() => handleReplace(i)} ellipsis style={{ width: '100%' }}>{i.name}</Typography.Link> :
                                                    !templates.includes(i.id) ?
                                                        <span onClick={() => handleReplace(i)} style={{ width: '100%' }}>
                                                            <Typography.Text style={{ width: '100%' }} ellipsis >{i.name}</Typography.Text>
                                                        </span> :
                                                        <Typography.Text disabled type="secondary" ellipsis style={{ width: '100%' }}>
                                                            {i.name}
                                                        </Typography.Text>
                                            }
                                        </Tooltip>
                                    </Row>
                                )
                            })
                    }
                </Spin>
            </Space>
        </Drawer>
    )
}

export default forwardRef(TemplateListDrawer)