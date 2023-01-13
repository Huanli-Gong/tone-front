import React, { useState, useImperativeHandle } from 'react';
import { Drawer, Button, Input, Tree, Spin, Checkbox, Empty, Typography } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRequest, useAccess, Access, useParams, useIntl, FormattedMessage } from 'umi'
import { cloneDeep } from 'lodash';
import { getDomain } from '../service';
import styles from './index.less';
import { v4 as uuid } from 'uuid';

/**
 * @author jpt
 * @module 业务测试(选择用例)
 */
const BusinessTestSelectDrawer: React.FC<any> = ({
    testType,
    onRef,
    handleSelect,
    control,
    treeData = [],
    loading,
}) => {
    const { formatMessage } = useIntl()
    const { Search } = Input;
    const { ws_id } = useParams<any>()
    const access = useAccess()
    const [show, setShow] = useState<boolean>(false)
    // 判断全选框的状态
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState<boolean>(false)
    const [selectData, setSelectData] = useState<any>([])
    const [expand, setExpand] = useState<boolean>(false)
    const [domain, setDomain] = useState<any>("")
    const [name, setName] = React.useState<string>("")

    const allKeys = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any, index: number) => {
            return pre.concat(`${cur.id}-${index}`, cur.test_case_list.map((i: any) => `${i.id}`))
        }, [])
    }, [treeData])

    const suiteAllKeys = React.useMemo(() => {
        return []
    }, [])

    const hasTree = React.useMemo(() => {
        return treeData.filter((item: any) => ~item.domain_name_list.indexOf(domain) && ~item.name.indexOf(name))
    }, [treeData, domain, name])

    React.useMemo(() => {
        const ids = hasTree.reduce((pre: any, cur: any, index: number) => {
            return pre.concat(`${cur.id}-${index}`, cur.test_case_list.map((i: any) => `${i.id}`))
        }, [])
        const hasList = ids.map((i: string) => selectData.includes(i))
        setCheckAll([...new Set(hasList)].length === 1 && hasList[0])
    }, [name, domain, hasTree, selectData])

    const checkAllChange = (keys: any) => {
        console.log(keys)
        const selectedKeys = keys.slice().sort().join(',');
        if (selectedKeys && selectedKeys === suiteAllKeys.slice().sort().join(',')) {
            // 全选
            setIndeterminate(false)
            setCheckAll(true)
        } else if (keys && keys.length) {
            // 半选
            setIndeterminate(true)
            setCheckAll(false)
        } else {
            // 不选
            setIndeterminate(false)
            setCheckAll(false)
        }
    }

    const handleDomainChange = (e: any) => {
        setDomain(e)
    }

    const { data: domainList } = useRequest(
        getDomain,
        { initialData: [] }
    )

    useImperativeHandle(onRef, () => ({
        openDrawer: ({ test_config }: any) => {
            let keys: any = []
            treeData.forEach((
                (item: any) => {
                    const suiteIdx = test_config.findIndex(({ id }: any) => id === item.id)
                    if (suiteIdx > -1) {
                        let row: any = []
                        item.test_case_list.forEach(
                            (conf: any) => {
                                const confIdx = test_config[suiteIdx].test_case_list.findIndex(({ id }: any) => id === conf.id)
                                if (confIdx > -1)
                                    row.push(`${conf.id}`)
                            }
                        )
                        if (row.length && (row.length === item.test_case_list.length)) {
                            keys.push(`${item.id}`) // 如果子级全选，则包含父级key
                        }
                        if (row.length) {
                            keys.push(...row)
                        }
                    }
                }
            ))

            checkAllChange(keys)
            setSelectData(keys)
            setShow(true)
        },
    }))

    const onCheck = (checkedKeys: any) => {
        setSelectData(checkedKeys)
        checkAllChange(checkedKeys)
    };

    const selectAll = ({ target }: any) => {
        // setIndeterminate(false);
        // setCheckAll(e.target.checked)
        // e.target.checked ? setSelectData(suiteAllKeys) : setSelectData([])
        setCheckAll(target.checked)
        if (hasTree.length > 0 && (name || domain)) {
            const currentHasIds = treeData.reduce((pre: any, cur: any, index: number) => {
                const filter = ~cur.domain_name_list.indexOf(domain) && ~cur.name.indexOf(name)
                if (filter) return pre.concat(`${cur.id}-${index}`, cur.test_case_list.map((i: any) => `${i.id}`))
                return pre
            }, [])
            target.checked ?
                setSelectData(selectData.concat(currentHasIds)) :
                setSelectData(selectData.reduce((pre: any, cur: any) => {
                    if (currentHasIds.includes(cur)) return pre
                    return pre.concat(cur)
                }, []))
        }
        else
            target.checked ? setSelectData(allKeys) : setSelectData([])
    }

    const onCancel = () => {
        setShow(false)
        setSelectData([])
        setDomain("")
        setName("")
    }

    const onOk = () => {
        const treeDataCopy = cloneDeep(treeData)
        const data = treeDataCopy.filter((item: any) => {
            item.test_case_list = item.children.filter((el: any) => {
                if (selectData.indexOf(`${el.id}`) > -1) {
                    el.setup_info = ''
                    el.cleanup_info = ''
                    el.need_reboot = false
                    el.console = undefined
                    el.monitor_info = [{
                        items: undefined,
                        servers: undefined
                    }]
                    el.priority = 10
                    el.server_object_id = undefined
                    el.ip = el.ip || '随机'; // 此处的中文不能翻译，不破坏数据，在render的时候去匹配中英文。
                    el.env_info = el.var ? (JSON.parse(el.var).length > 0 ? JSON.parse(el.var) : []) : []
                    return el
                }
            })
            delete item.children
            if (item.test_case_list.length > 0) {
                item.need_reboot = false
                item.priority = 10
                item.console = undefined
                item.monitor_info = [{
                    items: undefined,
                    servers: undefined
                }]
                item.setup_info = ''
                item.cleanup_info = ''
                return item
            }
        })
        handleSelect(data)
        onCancel()
    }

    const resultTreeData = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any) => {
            const hidden = ~cur.domain_name_list.indexOf(domain) && ~cur.name.indexOf(name) ? {} : { display: "none" }
            return pre.concat(
                <Tree.TreeNode {...cur} key={uuid()} title={cur.name} style={hidden}>
                    {
                        cur.test_case_list.map((conf: any) => (
                            <Tree.TreeNode {...conf} key={conf.id} title={conf.name} />
                        ))
                    }
                </Tree.TreeNode>
            )
        }, [])
    }, [treeData, domain, name])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            className={styles.suite}
            title={<FormattedMessage id="select.suite.drawer.title" />}
            width={634}
            forceRender={true}
            destroyOnClose={true}
            onClose={() => setShow(false)}
            open={show}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    <Checkbox disabled={loading}
                        indeterminate={indeterminate}
                        onChange={selectAll}
                        checked={checkAll}
                        style={{ float: 'left' }}
                    >
                        <FormattedMessage id="select.suite.drawer.checkbox" />
                    </Checkbox>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}><FormattedMessage id="operation.cancel" /></Button>
                    <Button onClick={onOk} type="primary"><FormattedMessage id="operation.ok" /></Button>
                </div>
            }
        >
            <Spin spinning={loading} wrapperClassName={styles.spinWrapper}>
                <div>
                    <Search
                        onChange={({ target }: any) => setName(target?.value?.replace(/\s+/g, ""))}
                        placeholder={formatMessage({ id: 'select.suite.search.placeholder' })}
                        style={{ width: 420, marginBottom: 16 }}
                    />
                    {
                        control.includes('domain') &&
                        <>
                            <div style={{ position: 'relative', display: 'flex' }}>
                                <div className={styles.nav}><FormattedMessage id="select.suite.domain" /></div>
                                <div className={styles.domainList_Tab}>
                                    <Button
                                        className={styles.domain_all}
                                        size="small"
                                        type={domain === '' ? 'primary' : 'ghost'}
                                        onClick={() => handleDomainChange('')}
                                    >
                                        <FormattedMessage id="select.suite.all.btn" />
                                    </Button>
                                    {
                                        domainList.map((item: any, index: number) => {
                                            if (!expand && index > 6) return
                                            return (
                                                <Button
                                                    key={item.id}
                                                    type={item.name == domain ? "primary" : "ghost"}
                                                    size="small"
                                                    style={{ marginRight: 8, marginBottom: 8, boxShadow: "none", ...(item.name === domain ? {} : { border: 'none' }) }}
                                                    onClick={() => handleDomainChange(item.name)}
                                                >
                                                    {item.name}
                                                </Button>
                                            )
                                        })
                                    }
                                </div>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setExpand(!expand)}
                                    icon={expand ? <UpOutlined /> : <DownOutlined />}
                                    style={{ position: 'absolute', right: 0 }}
                                >
                                    {expand ? formatMessage({ id: 'operation.collapse' }) : formatMessage({ id: 'operation.expand' })}
                                </Button>
                            </div>
                        </>
                    }
                </div>

                {treeData?.length ? (
                    <>
                        <div className={styles.selection_table_thead}>
                            <div style={{ width: 200 }}>Test Suite</div>
                            <div><FormattedMessage id="select.suite.business.name" /></div>
                        </div>
                        <Tree
                            className={styles.selection_table_tbody}
                            checkedKeys={selectData}
                            checkable
                            onCheck={onCheck}
                            titleRender={(nodeData: any) => {
                                const { name, children, business_name } = nodeData || {}
                                return (
                                    <div key={nodeData.id} className={styles.selection_table_row}>
                                        <div className={styles.col} style={{ width: children ? 200 : '100%' }}>{name || null}</div>
                                        <div className={styles.otherCol}>{business_name || (children ? '-' : null)}</div>
                                    </div>
                                )
                            }}
                        >
                            {resultTreeData}
                        </Tree>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<FormattedMessage id="select.suite.no.case" />} />
                        <Access accessible={access.WsMemberOperateSelf()}>
                            <Typography.Link
                                target={"_blank"}
                                href={
                                    testType ?
                                        `/ws/${ws_id}/test_suite?test_type=${testType}` :
                                        `/ws/${ws_id}/test_suite`
                                }
                            >
                                <Button
                                    type="primary"
                                >
                                    <FormattedMessage id="select.suite.add.case" />
                                </Button>
                            </Typography.Link>
                        </Access>
                    </div>
                )}
            </Spin>
        </Drawer>
    );
};

export default BusinessTestSelectDrawer;