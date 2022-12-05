import React, { useState, useImperativeHandle } from 'react';
import { Drawer, Button, Input, Tree, Spin, Checkbox, Empty } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRequest, useParams, useAccess, Access, useIntl, FormattedMessage } from 'umi'
import { cloneDeep } from 'lodash';
import { getDomain } from './service'
import styles from './style.less';
import { targetJump } from '@/utils/utils'
import DomainExpaned from './DomainExpanded';

const SelectDrawer: React.FC<any> = ({
    testType,
    onRef,
    handleSelect,
    config,
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

    const allKeys = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any, index: number) => {
            return pre.concat(`${cur.id}-${index}`, cur.test_case_list.map((i: any) => `${i.id}`))
        }, [])
    }, [treeData])

    const hasTree = React.useMemo(() => {
        return treeData.filter((item: any) => ~item.domain_name_list.indexOf(domain) && ~item.name.indexOf(name))
    }, [treeData, domain, name])

    const checkAllChange = (keys: any) => {
        setCheckAll(keys.slice().sort().join(',') && keys.slice().sort().join(',') == allKeys.slice().sort().join(','))
    }

    React.useMemo(() => {
        const ids = hasTree.reduce((pre: any, cur: any, index: number) => {
            return pre.concat(`${cur.id}-${index}`, cur.test_case_list.map((i: any) => `${i.id}`))
        }, [])
        const hasList = ids.map((i: string) => selectData.includes(i))
        setCheckAll([...new Set(hasList)].length === 1 && hasList[0])
    }, [name, domain, hasTree, selectData])

    const { data: domainList } = useRequest(
        getDomain,
        { initialData: [] }
    )

    useImperativeHandle(onRef, () => ({
        openDrawer: () => {
            let keys: any = []
            treeData.forEach((
                (item: any) => {
                    const suiteIdx = config.findIndex(({ id }: any) => id === item.id)
                    if (suiteIdx > -1) {
                        item.test_case_list.forEach(
                            (conf: any) => {
                                const confIdx = config[suiteIdx].test_case_list.findIndex(({ id }: any) => id === conf.id)
                                if (confIdx > -1)
                                    keys.push(`${conf.id}`)
                            }
                        )
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

    const handleCancel = () => {
        setShow(false)
        setSelectData([])
        setDomain("")
        setName("")
    }

    const resultTreeData = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any, index: number) => {
            const hidden = ~cur.domain_name_list.indexOf(domain) && ~cur.name.indexOf(name) ? {} : { display: "none" }
            return pre.concat(
                <Tree.TreeNode key={`${cur.id}-${index}`} title={cur.name} style={hidden}>
                    {
                        cur.test_case_list.map((conf: any) => (
                            <Tree.TreeNode key={conf.id} title={conf.name} />
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
            visible={show}
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
                    onSearch={(value: any) => setName(value.replace(/\s+/g, ""))}
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
                            <Button
                                type="primary"
                                onClick={
                                    () => targetJump(
                                        testType ?
                                            `/ws/${ws_id}/test_suite?test_type=${testType}` :
                                            `/ws/${ws_id}/test_suite`
                                    )
                                }
                            >
                                <FormattedMessage id="select.suite.add.case" />
                            </Button>
                        </Access>
                    </div>
                }
            </Spin>
        </Drawer>
    );
};

export default SelectDrawer;