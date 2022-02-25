import { Button, Layout, Row, Col, Typography, Space, Spin, Popconfirm, Dropdown, Menu, message, Input, Divider, Modal, Pagination, Tooltip } from 'antd'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from './index.less'
import { MinusCircleOutlined, MoreOutlined, FilterFilled, ExclamationCircleOutlined } from '@ant-design/icons'
import { useRequest, useParams, useLocation } from 'umi'
import { deleteBaseline, queryBaselineList } from '../services'
import AddScripotDrawer from './AddScript'
import { ReactComponent as BaselineSvg } from '@/assets/svg/baseline.svg'
import BaselineDetail from './BaselineDetail'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import _ from 'lodash';
import { requestCodeMessage } from '@/utils/utils';
import { useClientSize } from '@/utils/hooks'

const { Search } = Input;

export default (props: any) => {
    const { ws_id }: any = useParams()
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
    const [deleteObj, setDeleteObj] = useState<any>({});
    const [isOpen, setIsOpen] = useState(false)
    const addScript: any = useRef(null)
    const input: any = useRef(null);

    const { data, loading, run, refresh } = useRequest(
        (data) => queryBaselineList(data),
        {
            formatResult: response => response,
            initialData: { data: [], total: 0 },
            defaultLoading: true,
            manual: true
        }
    )

    //改变当前数据
    const handleCurrentChange = (item: any) => {
        setCurrent(item)
    }
    useEffect(()=>{
        setParams({ ...params, test_type: baselineType })
    },[ baselineType ])
    
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
        // window.addEventListener('click',fn,true)
        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            window.removeEventListener('click', fn, false)
        }
    }, []);

    useEffect(() => {
        run(PAGE_DEFAULT_PARAMS)
        setSearch('')
        setCurrent({})
        setFilterVisible(false)
    }, [baselineType])

    const handleChange = (page_num: number) => {
        setParams({ ...params, page_num })
        setCurrent({})
        run({ ...params, page_num });
    }

    const handleAddScript = () => {
        addScript.current?.show('新增基线')
    }

    const fetchFinally = (code: number, msg: string) => {
        setVisible(false)
        if (code === 200) {
            if (deleteObj.id === current.id) setCurrent({})
            message.success('操作成功!')
            refresh()
            destroyAll()
        }
        else requestCodeMessage(code, msg)
    }

    const handleDelete = async (item: any) => {
        const { code, msg } = await deleteBaseline({ baseline_id: item.id, ws_id: props.ws_id })
        //fetchFinally(code, msg)
        if (code == 200) {
            if (item.id === current.id) setCurrent({})
            message.success('操作成功!')
            refresh()
        }
        else requestCodeMessage(code, msg)
    }

    const hanldeEdit = () => {
        addScript.current?.show('编辑基线信息', current)
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
        run({ ...params, name: search, page_num: 1 })
        setFilterVisible(!filterVisible)
    }

    const handleResetSearch = (e: any) => {
        setCurrent({})
        setSearch('')
        setParams({ ...params, page_num: 1 })
        run({ ...params, page_num: 1 })
        setFilterVisible(!filterVisible)
    }

    const showModal = (deleteData: any) => {
        //e.stopPropagation();
        setVisible(true);
        setDeleteObj(deleteData)
    };

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
                    <Menu.Item onClick={hanldeEdit}>编辑信息</Menu.Item>
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
    server_provider = server_provider === 'aligroup' ? '内网环境' : '云上环境'
    const baelineTotal = data && data.total ? data.total : 0

    const clientSize = useClientSize()

    const layoutHeight = clientSize.height - 90 - 48 - 48;

    return (
        <Layout.Content>
            <Spin spinning={loading}>
                <Row justify="space-between" >
                    <div className={styles.script_left} style={{ height: layoutHeight }}>
                        <div className={styles.create_button_wrapper}>
                            <Button type="primary" onClick={handleAddScript}>新增基线</Button>
                        </div>
                        <Row justify="space-between" className={styles.left_title}>
                            <Typography.Text className={styles.all_baseline_title} strong={true}>所有基线 {`(${baelineTotal})`}</Typography.Text>
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
                                        placeholder="支持搜索基线名称"
                                        onSearch={handleSearchScript} />
                                </Col>
                                <Divider style={{ margin: 0 }} />
                                <Col span={24}>
                                    <Row justify="space-between">
                                        <Col span={12} onClick={handleSearchScript} className={`${styles.filter_dropdown_opt} ${styles.filter_search_btn}`}>搜索</Col>
                                        <Col span={12} onClick={handleResetSearch} className={styles.filter_dropdown_opt}>重置</Col>
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
                                            <Popconfirm
                                                title={<div style={{ color: 'red' }}>删除基线将可能导致Job无法正常运行，<br />请谨慎删除！！</div>}
                                                onCancel={() => handleDelete(item)}
                                                cancelText="确定删除"
                                                cancelButtonProps={{ disabled: data.is_first ? true : false }}
                                                okText="取消"
                                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                            >
                                                <MinusCircleOutlined
                                                    className={hover === item.id ? styles.remove_active : styles.remove}
                                                />
                                            </Popconfirm>
                                        </div>
                                    )
                                )
                            }
                        </Row>
                        <Row className={`${styles.all_script} ${styles.pagination_style}`}>
                            {
                                baelineTotal ?
                                    <Pagination
                                        current={params.page_num}
                                        pageSize={20}
                                        showQuickJumper
                                        size="small"
                                        defaultCurrent={1}
                                        total={baelineTotal}
                                        onChange={handleChange}
                                    /> :
                                    ''
                            }
                        </Row>
                    </div>
                    <div className={styles.script_right} style={{ height: layoutHeight }}>
                        <Row className={styles.script_right_detail} align="middle">
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={`${styles.script_right_name}`} strong>基线名称：</Typography.Text>
                                    <EllipsisPulic title={current?.name} style={{ width: 318 }} />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={styles.script_right_name} strong>产品版本：</Typography.Text>
                                    <EllipsisPulic title={current?.version} style={{ width: 318 }} />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={styles.script_right_name} strong style={{ minWidth: 118 }}>ServerProvider：</Typography.Text>
                                    <EllipsisPulic title={baselineData.length ? server_provider : '-'} style={{ width: 230 }} />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className={styles.title_detail_item}>
                                    <Typography.Text className={styles.script_right_name} strong>基线描述：</Typography.Text>
                                    <EllipsisPulic title={current?.description} style={{ width: 318 }} />
                                </div>
                            </Col>
                            {dropdown}
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
            </Spin>
            <AddScripotDrawer
                ref={addScript}
                onOk={refresh}
                baselineType={props.baselineType}
                setCurrent={setCurrent}
            />
            <Modal
                title="删除提示"
                visible={visible}
                width={480}
                className={styles.baseline_del_modal}
                destroyOnClose={true}
                onCancel={handleCancel}
                footer={
                    <Row justify="end">
                        <Space>
                            <Button onClick={handleCancel}>取消</Button>
                            {
                                data.is_first ?
                                    <Button disabled={true} >删除</Button> :
                                    <Button onClick={handleDelete} type="primary" danger>删除</Button>
                            }
                        </Space>
                    </Row>
                }
            >
                <span>该操作将删除当前基线，请谨慎操作</span>
            </Modal>
        </Layout.Content >
    )
}