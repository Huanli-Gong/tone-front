

import React, { useState, useImperativeHandle, forwardRef, memo, useCallback, useMemo } from 'react'
import { Space, Button, Drawer, Input, Spin, Tree, Empty } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useParams, useRequest, useIntl, FormattedMessage } from 'umi'
import { suiteList } from '@/pages/WorkSpace/TestJob/components/SelectSuite/service'
import { getDomain } from '@/pages/SystemConf/TestSuite/service'
import styles from '@/pages/WorkSpace/TestJob/components/SelectSuite/style.less';

const CustomDrawer = (props: any, ref: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams<any>()
    const { onOk, perfKeys, funcKeys } = props

    const [visible, setVisible] = useState(false)
    const [source, setSource] = useState<any>(null)
    const [pedding, setPedding] = useState(false)
    const [selectData, setSelectData] = useState<any>([])

    const [selectIds, setSelectIds] = useState<any>([])
    const [domain, setDomain] = useState('')
    const [name, setName] = useState('')
    const [expand, setExpand] = useState<boolean>(false)

    const [testType, setTestType] = useState('')
    const [expandedKeys, setExpandedKeys] = useState<any>([])
    const { data: domainList } = useRequest(
        () => getDomain({ ws_id, page_size: 999 }),
        { initialData: [] }
    )

    const { data, loading, run } = useRequest(
        (params) => suiteList(params),
        { initialData: [], manual: true }
    )

    const treeData = useMemo(() => {
        return data.reduce((pre: any, cur: any, index: number) => {
            let sum = 0
            const test_case_list: any = cur.test_case_list.reduce((p: any, c: any, idx: number) => {
                const elKey = `${index}-${idx}`
                let disableCheckbox = false
                let disabled = false
                if (!selectIds.includes(c.id)) {
                    const clude = testType === 'performance' ? perfKeys.includes(c.id) : funcKeys.includes(c.id)
                    if (clude) sum++
                    disableCheckbox = clude
                    disabled = clude
                }
                return p.concat({
                    ...c,
                    parentId: cur.id,
                    key: elKey,
                    title: c.name,
                    disableCheckbox,
                    disabled,
                })
            }, [])
            return pre.concat({
                ...cur,
                key: cur.id + '',
                title: cur.name,
                children: test_case_list,
                checkable: sum !== cur.test_case_list.length,
            })
        }, [])
    }, [data, testType, perfKeys, funcKeys, selectIds])

    const handleDomainChange = (d: any) => {
        setDomain(d)
        run({ domain: d, ws_id, test_type: testType, name, page_size: 999 })
    }
    
    const onNameChange = (n: any) => {
        setName(n)
        run({ domain, ws_id, test_type: testType, name: n, page_size: 999 })
            .then((res: any) => {
                if (!!res.length) {
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].name.indexOf(n) === -1) {
                            const key = []
                            key.push(res[i].id + '')
                            setExpandedKeys(key)
                        } else {
                            setExpandedKeys([''])
                        }
                    }
                }
            })
    }

    const onExpand = (expandedKeysValue: React.Key[]) => {
        setExpandedKeys(expandedKeysValue);
    };

    const onCheck = (checkedKeys: any) => {
        setSelectData(checkedKeys)
    }

    useImperativeHandle(ref, () => ({
        show(_: any, rowkey: string, testClass: string) {
            if (_)
                setSource({ source: _, rowkey, testType: testClass })

            const test_type: string = testClass === 'func_item' ? 'functional' : 'performance'

            setTestType(test_type)
            setVisible(true)

            run({ domain, ws_id, test_type, name, page_size: 999 })
                .then(ret => {
                    const list = []

                    const checkIds = _.list.reduce((pre: any, cur: any) => {
                        return pre.concat(
                            cur.case_source.reduce(
                                (p: any, c: any) => p.concat(c.test_conf_id), []
                            )
                        )
                    }, [])

                    setSelectIds(checkIds)

                    for (let x = 0; x < ret.length; x++)
                        for (let y = 0; y < ret[x].test_case_list.length; y++)
                            if (checkIds.includes(ret[x].test_case_list[y].id))
                                list.push(`${x}-${y}`)

                    setSelectData(list)
                })
        }
    }))

    const handleClose = useCallback(() => {
        setVisible(false)
        setSource(null)
        setDomain('')
        setName('')
        setSelectData([])
        setExpand(false)
        setSelectIds([])
    }, [])

    const handleOk = () => {
        if (pedding) return;
        setPedding(true)
        const result = data.reduce((pre: any, cur: any, index: number) => {
            const case_source = cur.test_case_list.reduce((p: any, c: any, idx: number) => {
                const caseIdx = selectData.findIndex((k: any) => k === `${index}-${idx}`)
                if (caseIdx > -1) {
                    return p.concat({
                        "test_conf_id": c.id,
                        "test_conf_name": c.name
                    })
                }
                return p
            }, [])

            if (case_source.length > 0) {
                return pre.concat({
                    "test_suite_id": cur.id,
                    "suite_show_name": cur.name,
                    case_source
                })
            }
            return pre
        }, [])
        onOk({ ...source, result })
        handleClose()
        setPedding(false)
    }

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                        <Button type="primary" onClick={handleOk} ><FormattedMessage id="operation.ok" /></Button>
                    </Space>
                </div>
            }
            visible={visible}
            destroyOnClose={true}
            width={634}  /*自定义*/
            title={<FormattedMessage id="report.case.list" />}
            onClose={handleClose}
        >
            <Spin spinning={loading} style={{ width: '100%', height: '100%' }}>
                <Input.Search
                    placeholder={formatMessage({ id: 'please.enter' })}
                    onSearch={(value: any) => onNameChange(value.replace(/\s+/g, ""))}
                    style={{ width: 420 }}
                />
                {
                    <div style={{ position: 'relative', paddingTop: '16px', display: 'flex' }}>
                        <div className={styles.nav}><FormattedMessage id="report.domain" />：</div>
                        <div style={{ width: 500 }}>
                            <Button
                                type={domain === '' ? 'primary' : 'ghost'}
                                size="small"
                                style={{ marginRight: 8, marginBottom: 8, border: 'none' }}
                                onClick={() => handleDomainChange('')}
                            >
                                <FormattedMessage id="report.all.s" />
                            </Button>
                            {
                                domainList.map((item: any, index: number) => {
                                    if (!expand && index > 6) {
                                        return
                                    }
                                    return item.id == domain ?
                                        <Button
                                            key={item.id}
                                            type="primary"
                                            size="small"
                                            style={{ marginRight: 8, marginBottom: 8 }}
                                            onClick={() => handleDomainChange(item.id)}
                                        >
                                            {item.name}
                                        </Button> :
                                        <Button
                                            key={item.id}
                                            type='ghost'
                                            size="small"
                                            style={{ border: 'none', marginRight: 8, marginBottom: 8 }}
                                            onClick={() => handleDomainChange(item.id)}
                                        >
                                            {item.name}
                                        </Button>
                                })
                            }
                        </div>
                        <Button
                            type="link"
                            size="small"
                            style={{ position: 'absolute', right: 0 }}
                            onClick={() => setExpand(!expand)}
                            icon={expand ? <UpOutlined /> : <DownOutlined />}
                        >
                            {expand ? <FormattedMessage id="operation.collapse" /> : <FormattedMessage id="operation.expand" />}
                        </Button>
                    </div>
                }
                <Tree
                    treeData={treeData}
                    checkedKeys={selectData}
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    checkable
                    onCheck={onCheck}
                />
                {
                    data.length === 0 &&
                    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="no.use.case" />} />
                    </div>
                }
            </Spin>
        </Drawer>
    )
}

export default memo(forwardRef(CustomDrawer))
