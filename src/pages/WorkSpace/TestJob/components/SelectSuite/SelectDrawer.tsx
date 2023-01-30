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

    const treeHasRowkey = React.useMemo(() => {
        return treeData.map((i: any) => ({ ...i, rowkey: uuid() }))
    }, [treeData])

    const allIds = React.useMemo(() => {
        return treeHasRowkey.reduce((pre: any, cur: any) => {
            const { test_case_list, rowkey } = cur
            return pre.concat(rowkey, test_case_list.map((t: any) => t.id))
        }, [])
    }, [treeHasRowkey, name, domain])

    const canSelectKeys = React.useMemo(() => {
        return treeHasRowkey.reduce((pre: any, cur: any) => {
            const { test_case_list, rowkey } = cur
            /* const hasCases = test_case_list.filter((c: any) => checkDomainName(c)) */
            /* if (checkDomainName(cur) || hasCases.length > 0) return pre.concat(rowkey, hasCases.map((t: any) => t.id)) */
            if (checkDomainName(cur)) return pre.concat(rowkey, test_case_list.map((t: any) => t.id))
            return pre
        }, [])
    }, [treeHasRowkey, domain, name])

    const checkAllChange = (keys: any) => {
        setCheckAll(keys.slice().sort().join(',') && keys.slice().sort().join(',') == allIds.slice().sort().join(','))
    }

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
                            return ~confIdx ? p.concat(c.id) : p
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
        setSelectData(target.checked ? allIds : [])
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
                if (selectData.indexOf(el.id) > -1) {
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

    const resultTreeList = React.useMemo(() => {
        return treeHasRowkey.map((i: any) => {
            /* const hasLen = i.test_case_list.filter((c: any) => checkDomainName(c)).length */
            return {
                key: i.rowkey,
                title: i.name,
                children: i.test_case_list.map((cls: any) => ({
                    key: cls.id,
                    title: cls.name,
                    selectable: false,
                    style: { display: checkDomainName(i) ? undefined : "none" }
                    /* style: { display: checkDomainName(cls) ? undefined : "none" } */
                })),
                style: { display: checkDomainName(i) /* || hasLen */ ? undefined : "none" },
                selectable: false,
                checkable: i.test_case_list.length > 0
                /* checkable: hasLen !== 0 */
            }
        })
    }, [domain, name, treeHasRowkey])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            className={styles.suite}
            title={<FormattedMessage id="select.suite.drawer.title" />}
            width={634}
            forceRender
            destroyOnClose
            onClose={() => setShow(false)}
            open={show}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    {
                        !!allIds.length &&
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
                    value={name}
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
                        treeData={resultTreeList}
                    />
                }
                {
                    (treeData?.length === 0 || canSelectKeys.length === 0) &&
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