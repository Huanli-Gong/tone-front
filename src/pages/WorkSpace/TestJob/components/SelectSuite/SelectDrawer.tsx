import React, { useState, useImperativeHandle } from 'react';
import { Drawer, Button, Input, Tree, Spin, Checkbox, Empty, Typography } from 'antd';
import { useRequest, useParams, useAccess, Access, useIntl, FormattedMessage } from 'umi'
import { cloneDeep } from 'lodash';
import { getDomain } from './service'
import styles from './style.less';
import DomainExpaned from './DomainExpanded';
import { v4 as uuid } from 'uuid';

const SelectDrawer: React.FC<any> = ({
    testType,
    onRef,
    handleSelect,
    control,
    treeData = [],
    loading,
}) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams<any>()
    const { Search } = Input;
    const [show, setShow] = useState<boolean>(false)
    const access = useAccess()
    const [selectData, setSelectData] = useState<any>([])
    const [checkAll, setCheckAll] = useState<boolean>(false)
    const [domain, setDomain] = useState<any>('')
    const [name, setName] = React.useState<string>("")

    const checkDomainName = (item: any) => ~item.domain_name_list.indexOf(domain) && ~item.name.indexOf(name)

    const allKeys = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any) => {
            return pre.concat(cur.test_case_list.map((i: any) => `${i.id}`))
        }, [])
    }, [treeData])

    const hasTree = React.useMemo(() => {
        return treeData.filter((item: any) => checkDomainName(item))
    }, [treeData, domain, name])

    const checkAllChange = (keys: any) => {
        setCheckAll(keys.slice().sort().join(',') && keys.slice().sort().join(',') == allKeys.slice().sort().join(','))
    }

    React.useMemo(() => {
        const ids = hasTree.reduce((pre: any, cur: any) => {
            return pre.concat(cur.test_case_list.map((i: any) => `${i.id}`))
        }, [])
        const hasList = ids.map((i: string) => selectData.includes(i))
        setCheckAll([...new Set(hasList)].length === 1 && hasList[0])
    }, [name, domain, hasTree, selectData])

    const { data: domainList } = useRequest(
        getDomain,
        { initialData: [] }
    )

    useImperativeHandle(onRef, () => ({
        openDrawer: ({ test_config }: any) => {
            const keys = treeData.reduce((pre: any, cur: any) => {
                const suiteIdx = test_config.findIndex(({ id }: any) => id === cur.id)
                return ~suiteIdx ?
                    pre.concat(
                        cur.test_case_list.reduce((p: any, c: any) => {
                            const confIdx = test_config[suiteIdx].test_case_list.findIndex(({ id }: any) => id === c.id)
                            return ~confIdx ? p.concat(`${c.id}`) : p
                        }, [])
                    ) :
                    pre
            }, [])
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
        setCheckAll(target.checked)
        if (hasTree.length > 0 && (name || domain)) {
            const currentHasIds = treeData.reduce((pre: any, cur: any) => {
                const filter = checkDomainName(cur)
                if (filter) return pre.concat(cur.test_case_list.map((i: any) => `${i.id}`))
                return pre
            }, [])
            setSelectData(
                target.checked ?
                    selectData.concat(currentHasIds) :
                    selectData.reduce((pre: any, cur: any) => {
                        if (currentHasIds.includes(cur)) return pre
                        return pre.concat(cur)
                    }, [])
            )
        }
        else
            setSelectData(target.checked ? allKeys : [])
    }

    const handleCancel = () => {
        setShow(false)
        setSelectData([])
        setDomain("")
        setName("")
    }

    const onConfirm = () => {
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
        handleCancel()
    }

    const resultTreeData = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any) => {
            const { test_case_list } = cur
            const hidden = checkDomainName(cur) ? {} : { display: "none" }
            const caseList = test_case_list.filter((i: any) => checkDomainName(i))
            return pre.concat(
                <Tree.TreeNode key={uuid()} title={cur.name} style={caseList.length > 0 ? {} : hidden}>
                    {
                        cur.test_case_list.map((conf: any) => {
                            return (
                                <Tree.TreeNode
                                    key={conf.id}
                                    title={conf.name}
                                    style={checkDomainName(conf) ? {} : { display: "none" }}
                                />
                            )
                        })
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
                    {
                        !!hasTree.length &&
                        <Checkbox
                            onChange={selectAll}
                            checked={checkAll}
                            disabled={loading}
                            style={{ float: 'left' }}
                        >
                            <FormattedMessage id="select.suite.drawer.checkbox" />
                        </Checkbox>
                    }
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                        <FormattedMessage id="operation.cancel" />
                    </Button>
                    <Button onClick={onConfirm} type="primary">
                        <FormattedMessage id="operation.ok" />
                    </Button>
                </div>
            }
        >
            <Spin spinning={loading} wrapperClassName={styles.spinWrapper}>
                <Search
                    placeholder={formatMessage({ id: 'please.enter' })}
                    onChange={({ target }: any) => setName(target.value.replace(/\s+/g, ""))}
                    style={{ width: 420 }}
                    allowClear
                />
                <div style={{ marginTop: 16 }}>
                    {
                        control.indexOf('domain') > -1 &&
                        <DomainExpaned active={domain} onChange={setDomain} dataSource={domainList} />
                    }
                </div>
                {
                    (!!treeData?.length) &&
                    <Tree
                        style={{ marginTop: 8 }}
                        checkedKeys={selectData}
                        checkable
                        onCheck={onCheck}
                    >
                        {resultTreeData}
                    </Tree>
                }
                {
                    (treeData?.length === 0 || hasTree.length === 0) &&
                    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
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
                }
            </Spin>
        </Drawer>
    );
};

export default SelectDrawer;