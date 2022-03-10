import React, { useState, useImperativeHandle } from 'react';
import { Drawer, Button, Input, Tree, Spin, Checkbox, Empty } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRequest, useParams, useAccess, Access } from 'umi'
import { cloneDeep } from 'lodash';
import { getDomain } from './service'
import styles from './style.less';

const SelectDrawer: React.FC<any> = ({
    testType,
    onRef,
    handleSelect,
    config,
    control,
    treeData = [],
    onNameChange,
    suiteAllKeys,
    loading,
    onDomainChange
}) => {
    const { ws_id } = useParams<any>()
    const { Search } = Input;
    const [show, setShow] = useState<boolean>(false)
    const access = useAccess()
    const [selectData, setSelectData] = useState<any>([])
    const [checkAll, setCheckAll] = useState<boolean>(false)
    const [expand, setExpand] = useState<boolean>(false)
    const [domain, setDomain] = useState<any>('')
    const [name, setName] = React.useState<string | undefined>("")

    const allKeys = React.useMemo(() => {
        return treeData.reduce((pre: any, cur: any, index: number) => {
            return pre.concat(`${cur.id}-${index}`, cur.test_case_list.map((i: any) => i.id))
        }, [])
    }, [treeData])

    console.log(allKeys)

    const checkAllChange = (keys: any) => {
        if (keys.slice().sort().join(',') && keys.slice().sort().join(',') == suiteAllKeys.slice().sort().join(','))
            setCheckAll(true)
        else
            setCheckAll(false)
    }

    const handleDomainChange = (e: any) => {
        setDomain(e)
        onDomainChange(e)
    }

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
                                    keys.push(conf.key)
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
        console.log(checkedKeys)
        setSelectData(checkedKeys)
        checkAllChange(checkedKeys)
    };

    const selectAll = (e: any) => {
        setCheckAll(e.target.checked)
        e.target.checked ? setSelectData(suiteAllKeys) : setSelectData([])
    }

    const onConfirm = () => {
        setShow(false)
        const treeDataCopy = cloneDeep(treeData)
        const data = treeDataCopy.filter((item: any) => {
            item.test_case_list = item.children.filter((el: any) => {
                if (selectData.indexOf(el.key) > -1) {
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
                    el.ip = el.ip || '随机'
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
        setSelectData([])
    }

    const handleCancel = () => {
        setShow(false)
        setSelectData([])
    }

    const resultTreeData = React.useMemo(() => {
        if (domain || name)
            return treeData.reduce((pre: any, cur: any) => {

            }, [])
    }, [treeData, domain, name, domainList])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            className={styles.suite}
            title="用例列表"
            width={634}
            forceRender={true}
            destroyOnClose={true}
            onClose={() => setShow(false)}
            visible={show}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    <Checkbox
                        onChange={selectAll}
                        checked={checkAll}
                        disabled={loading}
                        style={{ float: 'left' }}
                    >
                        全选
                    </Checkbox>
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={onConfirm} type="primary">
                        确定
                    </Button>
                </div>
            }
        >
            <Spin spinning={loading} wrapperClassName={styles.spinWrapper}>
                <Search
                    placeholder="请输入"
                    onSearch={(value: any) => setName(value.replace(/\s+/g, ""))}
                    style={{ width: 420 }}
                    value={name}
                />
                {
                    control.indexOf('domain') > -1 ?
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
                                        if (!expand && index > 6) return
                                        return (
                                            <Button
                                                key={item.id}
                                                type={item.name == domain ? "primary" : "ghost"}
                                                size="small"
                                                style={{ marginRight: 8, marginBottom: 8 }}
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
                                style={{ position: 'absolute', right: 0 }}
                                onClick={() => setExpand(!expand)}
                                icon={expand ? <UpOutlined /> : <DownOutlined />}
                            >
                                {expand ? '收起' : '展开'}
                            </Button>
                        </div> :
                        <div style={{ height: '16px' }}></div>
                }
                {
                    treeData?.length ? (
                        <Tree
                            checkedKeys={selectData}
                            checkable
                            onCheck={onCheck}
                        >
                            {
                                treeData.map((item: any, index: any) => (
                                    <Tree.TreeNode key={`${item.id}-${index}`} title={item.name} >
                                        {
                                            item.test_case_list.map((conf: any) => (
                                                <Tree.TreeNode key={conf.id} title={conf.name} />
                                            ))
                                        }
                                    </Tree.TreeNode>
                                ))
                            }
                        </Tree>
                    ) : (
                        <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用例" />
                            <Access accessible={access.canWsAdmin()}>
                                <Button type="primary"
                                    onClick={() => {
                                        // 跳转至 ws级TestSuite管理
                                        const a = document.createElement('a');
                                        a.target = "_blank";
                                        a.rel = "noopener noreferrer"
                                        a.href = testType ? `/ws/${ws_id}/test_suite?test_type=${testType}` : `/ws/${ws_id}/test_suite`;
                                        a.click();
                                    }}>
                                    添加用例
                                </Button>
                            </Access>
                        </div>
                    )
                }
            </Spin>
        </Drawer>
    );
};

export default SelectDrawer;