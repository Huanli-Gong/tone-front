import { Button, Layout, Row, Col, Typography, Space, Spin, Popconfirm, Dropdown, Menu, message, Input, Divider, Modal, Pagination, Tooltip } from 'antd'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from './index.less'
import { MinusCircleOutlined, MoreOutlined, FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons'
import { useParams, useLocation, FormattedMessage, useIntl } from 'umi'
import { deleteBaseline, queryBaselineList } from '../services'
import AddScripotDrawer from './AddScript'
import { ReactComponent as BaselineSvg } from '@/assets/svg/baseline.svg'
import BaselineDetail from './BaselineDetail'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import _ from 'lodash';
import { requestCodeMessage, AccessTootip, handlePageNum, useStateRef } from '@/utils/utils';
import { useClientSize } from '@/utils/hooks'
import { Access, useAccess } from 'umi'
import CommonPagination from '@/components/CommonPagination'

const { Search } = Input;

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id }: any = useParams()
    const access = useAccess();
    const { query }: any = useLocation()
    const serverProvider = (/\/group$/).test(window.location.pathname) ? 'aligroup' : 'aliyun';
    const { baselineType } = props

    const PAGE_DEFAULT_PARAMS: any = {
        server_provider: serverProvider,
        test_type: baselineType,
        page_size: 20,
        page_num: 1,
        ws_id
    }

    const [current, setCurrent] = useState<any>({})  // 当前基线
    const [hover, setHover] = useState(null)
    const [filterVisible, setFilterVisible] = useState(false) // 过滤的弹框
    const [search, setSearch] = useState<string>('')
    const [params, setParams] = useState<any>(PAGE_DEFAULT_PARAMS)
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState<any>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [isOpen, setIsOpen] = useState(false)
    const addScript: any = useRef(null)
    const input: any = useRef(null);
    const pageCurrent = useStateRef(params)
    const queryData = async () => {
        const data = await queryBaselineList(params)
        const { code, msg } = data
        if (code === 200) {
            setData(data)
        } else {
            requestCodeMessage(code, msg)
        }
        setLoading(false)
    }
    const totalCurrent = useStateRef(data)
    useEffect(() => {
        queryData()
    }, [params])

    //改变当前数据
    const handleCurrentChange = (item: any) => {
        setCurrent(item)
    }

    const baselineData = useMemo(() => {
        return data.data && Array.isArray(data.data) ? data.data : []
    }, [data])

    const getCurrentData = () => {
        if (baselineData.length > 0) {
            if (baselineType === query.test_type && query.baseline_id) {
                const idx = baselineData.findIndex(({ id }: any) => id === Number(query.baseline_id))
                setCurrent(baselineData[idx])
                return;
            }
            if ('id' in current) {
                const idx = baselineData.findIndex(({ id }: any) => id === current.id)
                setCurrent(baselineData[idx])
                return;
            }

            setCurrent(baselineData[0])
        }
        else
            setCurrent({})
    }

    useEffect(() => {
        getCurrentData()
    }, [baselineData, query.baseline_id])

    useEffect(() => {
        input.current?.focus()
    }, []);

    const fn = () => setFilterVisible(false)

    useEffect(() => {
        window.addEventListener('click', fn, false)
        return () => {
            window.removeEventListener('click', fn, false)
        }
    }, []);

    useEffect(() => {
        setSearch('')
        setCurrent({})
        setFilterVisible(false)
        setParams({ ...params, test_type: baselineType, page_num: 1 })
    }, [baselineType])

    const handleAddScript = () => {
        addScript.current?.show('add')
    }

    const handleDelete = async (item: any) => {
        const { code, msg } = await deleteBaseline({ baseline_id: item.id, ws_id: props.ws_id })
        const { page_size } = pageCurrent.current
        if (code == 200) {
            if (item.id === current.id) setCurrent({})
            message.success(formatMessage({ id: 'operation.success' }))
            setParams({ ...params, page_num: handlePageNum(pageCurrent, totalCurrent), page_size })
        }
        else requestCodeMessage(code, msg)
    }

    const hanldeEdit = () => {
        addScript.current?.show('edit', current)
    }
    const handleClickFn = (e: any) => {
        e.stopPropagation();
    }
    const handleClickFilter = (e: any) => {
        e.stopPropagation();
        setFilterVisible(!filterVisible)
    }

    const handleSearchScript = () => {
        setCurrent({})
        setParams({ ...params, name: search, page_num: 1 })
        setFilterVisible(!filterVisible)
    }

    const handleResetSearch = (e: any) => {
        setCurrent({})
        setSearch('')
        setParams({ ...params, page_num: 1 })
        setFilterVisible(!filterVisible)
    }

    const handleResetPaging = () => {
        setCurrent({})
        setParams({ ...params, page_num: 1 })
    }

    const handleCancel = () => {
        setVisible(false);
        destroyAll()
    };
    const destroyAll = () => {
        Modal.destroyAll();
    }

    const dropdown = (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item onClick={hanldeEdit}><FormattedMessage id="baseline.edit.info" /></Menu.Item>
                </Menu>
            }
        >
            <MoreOutlined style={{
                position: 'absolute',
                right: 0,
                top: 5,
                cursor: 'pointer',
                display: baselineData.length ? 'block' : 'none'
            }} />
        </Dropdown>
    )

    let server_provider = serverProvider || '--'
    server_provider = server_provider === "aligroup" ? formatMessage({ id: 'aligroupServer' }) : formatMessage({ id: 'aliyunServer' })
    const clientSize = useClientSize()

    const layoutHeight = clientSize.height - 50 - 48 - 100;

    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <Row justify="space-between" >
                    <div className={styles.script_left} style={{ height: layoutHeight }}>
                        <div className={styles.create_button_wrapper}>
                            <Button type="primary" onClick={handleAddScript}>
                                <FormattedMessage id="baseline.create.btn" />
                            </Button>
                        </div>
                        <Row justify="space-between" className={styles.left_title}>
                            <Typography.Text className={styles.all_baseline_title} strong={true}>
                                <FormattedMessage id="baseline.all.baseline" /> {`(${data?.total || 0})`}
                            </Typography.Text>
                            <div className={styles.filter_icon} onClick={handleClickFilter}>
                                <FilterFilled style={{ color: 'rgba(0 , 0 , 0 ,.45)' }} />
                            </div>
                            <Row
                                className={styles.filter_dropdown}
                                onClick={handleClickFn}
                                style={filterVisible ? { display: 'block' } : { display: 'none' }}
                            >
                                <Col span={24} className={styles.filter_search_box}>
                                    <Search
                                        ref={input}
                                        value={search}
                                        onChange={(e: any) => setSearch(e.target.value)}
                                        onPressEnter={() => handleSearchScript()}
                                        placeholder={formatMessage({ id: 'baseline.search.baseline.name' })}
                                        onSearch={handleSearchScript} />
                                </Col>
                                <Divider style={{ margin: 0 }} />
                                <Col span={24}>
                                    <Row justify="space-between">
                                        <Col span={12} onClick={handleSearchScript} className={`${styles.filter_dropdown_opt} ${styles.filter_search_btn}`}>
                                            <FormattedMessage id="baseline.search" />
                                        </Col>
                                        <Col span={12} onClick={handleResetSearch} className={styles.filter_dropdown_opt}>
                                            <FormattedMessage id="operation.reset" />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Row>
                        <Row className={styles.all_script} style={{ flexDirection: "column", flexFlow: "column" }}>
                            {
                                baselineData?.map(
                                    (item: any) => (
                                        item &&
                                        <div
                                            className={+ current?.id === + item.id ? styles.script_item_active : styles.script_item}
                                            key={item.id}
                                            onClick={() => handleCurrentChange(item)}
                                            onMouseEnter={() => setHover(item.id)}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            <BaselineSvg style={{ transform: 'translateY(2px)' }} />
                                            <Tooltip title={item.name} placement="right" overlayStyle={{ wordBreak: 'break-all' }}>
                                                <Typography.Text className={styles.baseline_name}>{item.name}</Typography.Text>
                                            </Tooltip>
                                            <Access
                                                accessible={access.WsMemberOperateSelf(item.creator)}
                                                fallback={
                                                    <MinusCircleOutlined
                                                        className={hover === item.id ? styles.remove_active : styles.remove}
                                                        onClick={() => AccessTootip()}
                                                    />
                                                }
                                            >
                                                <Popconfirm
                                                    title={<div style={{ color: 'red' }}><FormattedMessage id="baseline.delete.prompt1" /><br /><FormattedMessage id="baseline.delete.prompt2" /></div>}
                                                    onCancel={() => handleDelete(item)}
                                                    cancelText={<FormattedMessage id="operation.confirm.delete" />}
                                                    cancelButtonProps={{ disabled: data.is_first ? true : false }}
                                                    okText={<FormattedMessage id="operation.cancel" />}
                                                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                                >
                                                    <MinusCircleOutlined
                                                        className={hover === item.id ? styles.remove_active : styles.remove}
                                                    />
                                                </Popconfirm>
                                            </Access>
                                        </div>
                                    )
                                )
                            }
                        </Row>
                    </div>
                    <div className={styles.script_right} style={{ height: layoutHeight }}>
                        <Row className={styles.script_right_detail} align="middle">
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={`${styles.script_right_name}`} strong><FormattedMessage id="baseline.baseline_name" />：</Typography.Text>
                                    <EllipsisPulic title={current?.name} style={{ width: 318 }} />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={styles.script_right_name} strong><FormattedMessage id="baseline.product_version" />：</Typography.Text>
                                    <EllipsisPulic title={current?.version} style={{ width: 318 }} />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={styles.script_right_name} strong ><FormattedMessage id="baseline.test.env" />：</Typography.Text>
                                    <EllipsisPulic title={baselineData.length ? server_provider : '-'} style={{ width: 230 }} />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={styles.script_right_name} strong><FormattedMessage id="baseline.baseline_desc" />：</Typography.Text>
                                    <EllipsisPulic title={current?.description} style={{ width: 318 }} />
                                </div>
                            </Col>
                            <Access accessible={access.WsMemberOperateSelf(current?.creator)}>
                                {dropdown}
                            </Access>
                        </Row>
                        <Row className={styles.right_code_context} >
                            <BaselineDetail
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                currentBaseline={current}
                                layoutHeight={layoutHeight}
                            />
                        </Row>

                    </div>
                </Row>
                <CommonPagination
                    pageSize={params.page_size}
                    total={data?.total}
                    currentPage={params.page_num}
                    onPageChange={
                        (page_num, page_size) => { setParams({ ...params, page_num, page_size }), setCurrent({}) }
                    }
                />
            </Spin>
            <AddScripotDrawer
                ref={addScript}
                onOk={handleResetPaging}
                baselineType={params.test_type}
                setCurrent={setCurrent}
            />
            <Modal
                title={<FormattedMessage id="delete.prompt" />}
                visible={visible}
                width={480}
                className={styles.baseline_del_modal}
                destroyOnClose={true}
                onCancel={handleCancel}
                footer={
                    <Row justify="end">
                        <Space>
                            <Button onClick={handleCancel}><FormattedMessage id="operation.cancel" /></Button>
                            {
                                data.is_first ?
                                    <Button disabled={true} ><FormattedMessage id="operation.delete" /></Button> :
                                    <Button onClick={handleDelete} type="primary" danger><FormattedMessage id="operation.delete" /></Button>
                            }
                        </Space>
                    </Row>
                }
            >
                <span><FormattedMessage id="baseline.delete.prompt3" /></span>
            </Modal>
        </Layout.Content>
    )
}