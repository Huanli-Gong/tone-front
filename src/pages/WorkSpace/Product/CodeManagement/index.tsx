/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Row, Col, Typography, Spin, Popconfirm, Dropdown, Menu, message } from 'antd'
import { useState, useEffect, useRef } from 'react'
import styles from './index.less'
import { MinusCircleOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import { queryRepositoryList, deleteRepository, queryBranchList } from '../services'
import AddCodeDrawer from './AddCodeDrawer'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import CreateBranchDrawer from './CreateBranchDrawer'
import { requestCodeMessage } from '@/utils/utils';
import { Layout, Left, Right, CreateBtnWrap, LeftTitle, StoreWrapper, LoadingWrapper } from '../styled';

export default (props: any) => {
    const { formatMessage } = useIntl()
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
        if (info === 'new') {
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
        addScript.current?.show('new')
    }

    const fetchFinally = (code: number, msg: string) => {
        if (code === 200) {
            setCurrent({})
            message.success(formatMessage({ id: 'operation.success' }))
            refresh()
        }
        else requestCodeMessage(code, msg)
    }

    const handleDelete = async (item: any) => {
        const { code, msg } = await deleteRepository({ repo_id: item.id })
        fetchFinally(code, msg)
    }

    const hanldeEdit = () => {
        addScript.current?.show('edit', current)
    }
    const hanldeBranch = (item: any) => {
        createBranch.current?.show('edit', item)
    }
    const hanldCreateBranch = () => {
        createBranch.current?.show('new', {})
    }


    useEffect(() => {
        if (current.id !== undefined)
            branchRun({ repo_id: current.id })
    }, [current.id])


    return (
        <Layout>
            <Left>
                <CreateBtnWrap>
                    <Button type="primary" onClick={handleAddWareHouse}><FormattedMessage id="product.new.repositories" /></Button>
                </CreateBtnWrap>
                <LeftTitle justify="space-between">
                    <Typography.Text><FormattedMessage id="product.repositories" /> ({data?.length && `${data?.length}`})</Typography.Text>
                </LeftTitle>
                <StoreWrapper>
                    <Row className={styles.all_store}>
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
                                            <Popconfirm
                                                title={<FormattedMessage id="product.delete.this.repositories" />}
                                                onConfirm={() => handleDelete(item)}
                                                okText={<FormattedMessage id="operation.confirm" />}
                                                cancelText={<FormattedMessage id="operation.cancel" />}
                                            >
                                                <MinusCircleOutlined
                                                    className={hover === item.id ? styles.remove_active : styles.remove}
                                                />
                                            </Popconfirm>
                                        </Row>
                                    </Col>
                                )
                            )
                        }
                    </Row>
                </StoreWrapper>
            </Left>
            <Right>
                <Row className={styles.product_right_detail} align="middle">
                    <Col span={24}>
                        <Row>
                            <Col span={8}>
                                <Row className={styles.detail_item_row}>
                                    <Typography.Text strong><FormattedMessage id="product.repositories" />：</Typography.Text>
                                    <EllipsisPulic title={current.name} />
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Row className={styles.detail_item_row}>
                                    <Typography.Text strong>GitUrl：</Typography.Text>
                                    <EllipsisPulic title={current.git_url} />
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Row className={styles.detail_item_row}>
                                    <Typography.Text strong><FormattedMessage id="product.repositories.desc" />：</Typography.Text>
                                    <EllipsisPulic title={current.description} />
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                    {
                        data.length ?
                            <>
                                <Dropdown
                                    overlayStyle={{ cursor: 'pointer' }}
                                    overlay={
                                        <Menu>
                                            <Menu.Item onClick={hanldeEdit}><FormattedMessage id="product.edit.info" /></Menu.Item>
                                        </Menu>
                                    }
                                >
                                    <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 0, top: 5 }} />
                                </Dropdown>
                            </> : null
                    }
                </Row>
                <Row className={styles.right_branch_context}>
                    <Row style={{ width: '100%', height: 62 }}>
                        <Typography.Text className={styles.product_right_all_branch}><FormattedMessage id="product.all.branch" /> ({BranchData.data?.length && `${BranchData.data?.length}`})</Typography.Text>
                    </Row>
                    <Row className={styles.right_branch_context_wrapper} >
                        <div className={styles.right_branch_context_box_father}>
                            {
                                BranchData.data?.map((item: any) => (
                                    <div style={{ width: '22%' }} key={item.id}>
                                        <div className={styles.right_branch_context_box_child} onClick={() => hanldeBranch(item)} >
                                            <EllipsisPulic title={item.name}>
                                                <Typography.Text className={styles.right_branch_context_box_child_firstLine}>{item.name}</Typography.Text>
                                                <div style={{ height: 6 }} />
                                            </EllipsisPulic>
                                            <EllipsisPulic title={item.description}>
                                                <Typography.Text className={styles.right_branch_context_box_child_secondLine}>{item.description}</Typography.Text>
                                                <div style={{ height: 6 }} />
                                            </EllipsisPulic>
                                        </div>
                                    </div>
                                ))
                            }
                            {
                                data.length ?
                                    <div style={{ width: '22%' }}>
                                        <div className={styles.right_branch_context_box_child}>
                                            <div className={styles.right_branch_context_box_child_empty}>
                                                <span onClick={hanldCreateBranch}><PlusOutlined /><i><FormattedMessage id="product.new.branch" /></i></span>
                                            </div>
                                        </div>
                                    </div> : null
                            }
                        </div>
                    </Row>
                </Row>
            </Right>
            {
                loading &&
                <LoadingWrapper>
                    <Spin spinning={loading} />
                </LoadingWrapper>
            }
            <AddCodeDrawer ref={addScript} onOk={handleSubmit} />
            <CreateBranchDrawer ref={createBranch} current={current} onOk={BranchRefresh} />
        </Layout>
    )
}