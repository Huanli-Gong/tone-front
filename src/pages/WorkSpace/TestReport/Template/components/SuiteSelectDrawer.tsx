

import React, { useState, useImperativeHandle, forwardRef, memo, useCallback, useMemo } from 'react'
import { Space, Button, Drawer, Input, Spin, Tree, Empty } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons';

import { useParams, useRequest } from 'umi'
import { suiteList } from '@/pages/WorkSpace/TestJob/components/SelectSuite/service'
import { getDomain } from '@/pages/SystemConf/TestSuite/service'
import styles from '@/pages/WorkSpace/TestJob/components/SelectSuite/style.less';

const CustomDrawer = (props: any, ref: any) => {
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

    const { data: domainList } = useRequest(
        () => getDomain({ ws_id, page_size: 100 }),
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
                key: `${index}`,
                title: cur.name,
                children: test_case_list,
                checkable: sum !== cur.test_case_list.length,
            })
        }, [])
    }, [data, testType, perfKeys, funcKeys, selectIds])

    const handleDomainChange = (d: any) => {
        setDomain(d)
        run({ domain: d, ws_id, test_type: testType, name, page_size: 100 })
    }

    const onNameChange = (n: any) => {
        setName(n)
        run({ domain, ws_id, test_type: testType, name: n, page_size: 100 })
    }

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

            run({ domain, ws_id, test_type, name, page_size: 100 })
                .then(ret => {
                    let list = []

                    let checkIds = _.list.reduce((pre: any, cur: any) => {
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
                        <Button onClick={handleClose}>取消</Button>
                        <Button type="primary" onClick={handleOk} >确定</Button>
                    </Space>
                </div>
            }
            visible={visible}
            destroyOnClose={true}
            width={634}  /*自定义*/
            title={'用例列表'}
            onClose={handleClose}
        >
            <Spin spinning={loading} style={{ width: '100%', height: '100%' }}>
                <Input.Search
                    placeholder="请输入"
                    onSearch={(value: any) => onNameChange(value.replace(/\s+/g, ""))}
                    style={{ width: 420 }}
                />
                {
                    <div style={{ position: 'relative', paddingTop: '16px', display: 'flex' }}>
                        <div className={styles.nav}>领域：</div>
                        <div style={{ width: 500 }}>
                            <Button
                                type={domain === '' ? 'primary' : 'ghost'}
                                size="small"
                                style={{ marginRight: 8, marginBottom: 8, border: 'none' }}
                                onClick={() => handleDomainChange('')}
                            >
                                全部
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
                            {expand ? '收起' : '展开'}
                        </Button>
                    </div>
                }
                <Tree
                    treeData={treeData}
                    checkedKeys={selectData}
                    checkable
                    onCheck={onCheck}
                />
                {
                    data.length === 0 &&
                    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用例" />
                    </div>
                }
            </Spin>
        </Drawer>
    )
}

export default memo(forwardRef(CustomDrawer))
