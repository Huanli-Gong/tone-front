import React, { useState, useImperativeHandle, forwardRef } from 'react'
import { useIntl, FormattedMessage } from 'umi'
import { Drawer, Space, Button, Checkbox, Input, message, Row, Typography, Tooltip, Spin } from 'antd'
import { queryTestTemplateList } from '@/pages/WorkSpace/TestTemplateManage/service'
import { SearchOutlined } from '@ant-design/icons'
import { isArray } from 'lodash'
import styles from './index.less'

const TemplateListDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id, onOk } = props
    const [visible, setVisible] = useState(false)
    const [search, setSearch] = useState('')

    const [dataIndex, setDataIndex] = useState(null)
    const [templates, setTemplates] = useState<any>([])
    const [rowkey, setRowkey] = useState<any>(null)

    const [replaceId, setReplaceId] = useState(null)

    const [list, setList] = useState([])
    const [allList, setAllList] = useState([])
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
        if (search.length === 0) {
            setAllList(data)
        }
        setList(data)
    }

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
            list: allList.filter((i: any) => {
                if (templates.filter((t: any) => i.id === t).length > 0)
                    return i
            }),
            dataIndex
        })
        handleClose()
    }

    const handleSingleTemp = (e:any) => {
        let val = e.target.value
        let temp = templates.slice(0)
            if(e.target.checked){
            temp = temp.concat(val)
        }else{
            temp = temp.filter((item:any) => item !== val)
        }
        setTemplates([...new Set([...temp])])
    }

    const handleReplace = (i: any) => {
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
            title={<FormattedMessage id="plan.template.list" />}
            visible={visible}
            width="376"
            onClose={handleClose}
            footer={
                typeof replaceId !== 'number' &&
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk}><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                </div>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }} className={styles.templateListDrawerSpace}>
                <Input
                    prefix={<SearchOutlined />}
                    value={search}
                    onPressEnter={initList}
                    onChange={({ target }: any) => setSearch(target.value)}
                />
                <Spin spinning={loading} >
                    {
                        typeof rowkey !== 'number' ?
                            <Checkbox.Group style={{ width: '100%' }} value={templates} disabled={templates.length >= 10}>
                                {
                                    list.map((i: any) => (
                                        <Checkbox
                                            style={{ width: '100%', marginLeft: 0 }}
                                            key={i.id}
                                            value={i.id}
                                            onChange={handleSingleTemp}
                                        >
                                            <Tooltip title={i.name} >
                                                <Typography.Text ellipsis>
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