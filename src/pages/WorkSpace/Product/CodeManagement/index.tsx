import { Button, Layout, Row, Col, Typography, Space, Spin, Popconfirm, Dropdown, Menu, message, Tooltip, Popover } from 'antd'
import React, { useState, useEffect, useRef } from 'react'
import { AuthCommon, AuthForm } from '@/components/Permissions/AuthCommon';
import styles from './index.less'
import { MinusCircleOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useRequest } from 'umi'
import { queryRepositoryList, deleteRepository, queryBranchList } from '../services'
import AddCodeDrawer from './AddCodeDrawer'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import CreateBranchDrawer from './CreateBranchDrawer'
import { requestCodeMessage } from '@/utils/utils';
export default (props: any) => {
    const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const PAGE_DEFAULT_PARAMS = { ws_id }
    const [current, setCurrent] = useState<any>({})
    const [hover, setHover] = useState(null)
    const addScript: any = useRef(null)
    const createBranch: any = useRef(null)
    const { data: { data }, refresh, run, loading } = useRequest(
        (params: any) => queryRepositoryList(params),
        {
            defaultParams: [PAGE_DEFAULT_PARAMS],
            initialData: {
                data: [],
            },
            formatResult: r => r,
        }

    )
    const { data: BranchData, refresh: BranchRefresh, run: branchRun } = useRequest(
        (params: any) => queryBranchList(params),
        {
            initialData: {
                data: [],
            },
            formatResult: r => r,
            manual: true
        }
    )
    //改变当前数据
    const handleCurrentChange = (item: any) => {
        setCurrent(item)
        //branchRun({ repo_id: item.id })
    }
    useEffect(() => {
        if (data.length > 0) {
            if ('id' in current) {
                const idx = data.findIndex(({ id }: any) => id === current.id)
                setCurrent(data[idx])
            }
            else
                setCurrent(data[0])
        }
        else
            setCurrent({})
    }, [data])

    const handleSubmit = async (info: string) => {
        if (info == '新增仓库') {
            refresh().then(res => {
                setCurrent(res.data[0])
            })
        } else {
            run({ ws_id }).then(res => {
                if (res.code === 200) {
                    branchRun({ repo_id: current.id, ws_id })
                }
            })
        }
    }
    const handleAddWareHouse = () => {
        addScript.current?.show('新增仓库')
    }

    const fetchFinally = (code: number, msg: string) => {
        if (code === 200) {
            setCurrent({})
            message.success('操作成功!')
            refresh()
        }
        else requestCodeMessage( code , msg )
    }

    const handleDelete = async (item: any) => {
        const { code, msg } = await deleteRepository({ repo_id: item.id })
        fetchFinally(code, msg)
    }

    const hanldeEdit = () => {
        addScript.current?.show('编辑仓库信息', current)
    }
    const hanldeBranch = (item: any) => {
        createBranch.current?.show('编辑Branch', item)
    }
    const hanldCreateBranch = () => {
        createBranch.current?.show('新增Branch', {})
    }


    useEffect(() => {
        if (current.id !== undefined)
            branchRun({ repo_id: current.id })
    }, [current.id])


    return (
        <Layout.Content>
            <Spin spinning={loading} >
                <Row justify="space-between">
                    <div className={styles.product_left}>
                        <div className={styles.create_button_wrapper}>
                            {<AuthCommon
                                isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin']}
                                children={<Button type="primary" >新增仓库</Button>}
                                onClick={handleAddWareHouse} />
                            }
                        </div>
                        <Row justify="space-between" className={styles.left_title}>
                            <Typography.Text>仓库名称 ({data?.length && `${data?.length}`})</Typography.Text>
                        </Row>
                        <Row className={styles.all_product}>
                            {
                                data?.map(
                                    (item: any) => (
                                        <Col
                                            span={24}
                                            className={+ current.id === + item.id ? styles.product_item_active : styles.product_item}
                                            key={item.id}
                                            onClick={() => handleCurrentChange(item)}
                                            onMouseEnter={() => setHover(item.id)}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            <Row justify="space-between">
                                                <EllipsisPulic title={item.name} width={210}>
                                                    <Typography.Text >{item.name}</Typography.Text>
                                                </EllipsisPulic>
                                                {<AuthForm
                                                    isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin']}
                                                    children={<MinusCircleOutlined className={hover === item.id ? styles.remove_active : styles.remove} />}
                                                    onFirm={
                                                        <Popconfirm
                                                            title="确定要删除该仓库吗？"
                                                            onConfirm={() => handleDelete(item)}
                                                            okText="确认"
                                                            cancelText="取消"
                                                        >
                                                            <MinusCircleOutlined
                                                                className={hover === item.id ? styles.remove_active : styles.remove}
                                                            />
                                                        </Popconfirm>
                                                    } />
                                                }
                                            </Row>
                                        </Col>
                                    )
                                )
                            }
                        </Row>
                    </div>
                    <div className={styles.product_right}>
                        <Row className={styles.product_right_detail} align="middle">
                            <Col span={24}>
                                <Row>
                                    <Col span={8}>
                                        <Row>
                                            <Typography.Text strong style={{ width : 70 }} >仓库名称：</Typography.Text>
                                            <EllipsisPulic title={current.name} style={{ width : 'calc(100% - 85px)'}}/>
                                        </Row>
                                    </Col>
                                    <Col span={8}>
                                        <Row>
                                            <Typography.Text strong style={{ width : 70 }}>GitUrl：</Typography.Text>
                                            <EllipsisPulic title={current.git_url} style={{ width : 'calc(100% - 85px)'}} />
                                        </Row>
                                    </Col>
                                    <Col span={8}>
                                        <Row>
                                            <Typography.Text strong style={{ width : 70 }}>仓库描述：</Typography.Text>
                                            <EllipsisPulic title={current.description} style={{ width : 'calc(100% - 85px)'}} />
                                        </Row>
                                    </Col>
                                </Row>
                                {/* <Space className={styles.title_detail_item}>
                                    <Typography.Text className={styles.product_right_name}></Typography.Text>
                                    <EllipsisPulic title={current.name} style={{ width : 'calc(100% - 85px)'}}/>
                                </Space>
                                <Space className={styles.title_detail_item}>
                                    <Typography.Text className={styles.product_right_name}></Typography.Text>
                                    <EllipsisPulic title={current.git_url} style={{ width : 'calc(100% - 85px)'}} />
                                </Space>
                                <Space className={styles.title_detail_item}>
                                    <Typography.Text className={styles.product_right_name}>仓库描述:</Typography.Text>
                                    <EllipsisPulic title={current.description} style={{ width : 'calc(100% - 85px)'}} />
                                </Space> */}
                            </Col>
                            {
                                data.length ?
                                    <>
                                        {<AuthForm
                                            isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin']}
                                            children={<MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 0, top: 5 }} />}
                                            onFirm={
                                                <Dropdown
                                                    overlayStyle={{ cursor: 'pointer' }}
                                                    overlay={
                                                        <Menu>
                                                            <Menu.Item onClick={hanldeEdit}>编辑信息</Menu.Item>
                                                        </Menu>
                                                    }
                                                >
                                                    <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 0, top: 5 }} />
                                                </Dropdown>
                                            } />
                                        }
                                    </> : null
                            }
                        </Row>
                        <Row className={styles.right_branch_context}>
                            <Row style={{ width: '100%', height: 62 }}>
                                <Typography.Text className={styles.product_right_all_branch}>所有Branch ({BranchData.data?.length && `${BranchData.data?.length}`})</Typography.Text>
                            </Row>
                            <Row className={styles.right_branch_context_wrapper} >
                                <div className={styles.right_branch_context_box_father}>
                                    {
                                        BranchData.data?.map((item: any) => (
                                            <div style={{ width: '22%' }}>
                                                {  <AuthForm
                                                    isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin']}
                                                    children={<div className={styles.right_branch_context_box_child} key={item.id}>
                                                        <div className={styles.right_branch_context_box_child_firstLine}>{item.name}</div>
                                                        <div className={styles.right_branch_context_box_child_secondLine}>{item.description}</div>
                                                    </div>
                                                    }
                                                    onFirm={
                                                        <div className={styles.right_branch_context_box_child} onClick={() => hanldeBranch(item)} key={item.id}>
                                                            <EllipsisPulic title={item.name}>
                                                                <Typography.Text className={styles.right_branch_context_box_child_firstLine}>{item.name}</Typography.Text>
                                                                <div style={{ height : 6 }}></div>
                                                            </EllipsisPulic>
                                                            <EllipsisPulic title={item.description}>
                                                                <Typography.Text className={styles.right_branch_context_box_child_secondLine}>{item.description}</Typography.Text>
                                                                <div style={{ height : 6 }}></div>
                                                            </EllipsisPulic>
                                                            {/* <Tooltip title={item.name} placement="topLeft" overlayStyle={{ wordBreak: 'break-all' }}>
                                                                <div className={styles.right_branch_context_box_child_firstLine}>{item.name}</div>
                                                            </Tooltip>
                                                            <Tooltip title={item.description} placement="topLeft" overlayStyle={{ wordBreak: 'break-all' }}>
                                                                <div className={styles.right_branch_context_box_child_secondLine}>{item.description}</div>
                                                            </Tooltip> */}
                                                        </div>
                                                    } />
                                                }
                                            </div>
                                        ))
                                    }
                                    {
                                        data.length ?
                                            <>
                                                <div className={styles.right_branch_context_box_child}>
                                                    <div className={styles.right_branch_context_box_child_empty}>
                                                        {<AuthCommon
                                                            isAuth={['super_admin', 'sys_admin', 'ws_owner', 'ws_admin']}
                                                            children={<span ><PlusOutlined /><i>新增Branch</i></span>}
                                                            onClick={hanldCreateBranch} />
                                                        }
                                                    </div>
                                                </div>
                                            </> : null
                                    }
                                </div>
                            </Row>
                        </Row>
                    </div>
                </Row>
            </Spin>
            <AddCodeDrawer ref={addScript} onOk={handleSubmit} />
            <CreateBranchDrawer ref={createBranch} current={current} onOk={BranchRefresh} />
        </Layout.Content>
    )
}