import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Layout, Row, Col, Typography, Spin, Popconfirm, Dropdown, Menu, message, Input } from 'antd'
import { MinusCircleOutlined, MoreOutlined, ExclamationCircleOutlined, HolderOutlined } from '@ant-design/icons'
import { useLocation, useParams, useRequest, useAccess, Access } from 'umi'
import { deleteProduct, updateProject, dropProduct, dropProject, queryDropProduct, queryDropProject } from '../services'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import AddProductDrawer from './AddProduct'
import ShowProjectDrawer from './ViewProjectDetails'
import CreateProjectDrawer from './NewProject'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Example from './Container';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import { requestCodeMessage } from '@/utils/utils';
import styles from './index.less'

export default (props: any) => {
    const access = useAccess()

    const { ws_id } = useParams<any>()
    const { query }: any = useLocation()
    const [current, setCurrent] = useState<any>({})
    const [clickType, setClickType] = useState<string>('menu') // 区分点击位置。
    const [projectUp, setProjectUp] = useState(false)
    const [hover, setHover] = useState(null)
    const addProduct: any = useRef(null)
    const showProject: any = useRef(null)
    const createProject: any = useRef(null)
    const [form] = Form.useForm()
    
    const { data: { data = [] }, refresh, loading, run } = useRequest(
        (params: any) => queryDropProduct(params),
        {
            defaultParams: [{ ws_id }],
            initialData: {
                data: [],
            },
            formatResult: r => r,
        }
    )

    const { data: projectData, refresh: projectRefresh, loading: projectLoading, run: projectRun } = useRequest(
        (params: any) => queryDropProject(params),
        {
            initialData: {
                data: [],
            },
            manual: true,
            formatResult: r => r,
        }
    )

    const getCurrentIdx = (currentId: any) => data.findIndex(({ id }: any) => id === currentId - 0)

    useEffect(() => {
        if (data.length > 0) {
            if ('id' in current)
                setCurrent(data[getCurrentIdx(current.id)])
            else
                setCurrent(data[query.current ? getCurrentIdx(query.current) : 0])
        }
        else
            setCurrent({})
    }, [data, query])


    //改变当前数据
    const handleCurrentChange = (item: any) => {
        setCurrent(item)
        setClickType('menu')
        form.setFieldsValue({ server_type: undefined })
        //projectRun({ product_id: item.id, ws_id })
    }

    const handleAddProduct = () => {
        addProduct.current?.show('新增产品信息')
    }

    const fetchFinally = (code: number, msg: string) => {
        if (code === 200) {
            setCurrent({})
            message.success('操作成功!')
            refresh()
        }
        else requestCodeMessage(code, msg)
    }
    const handleDelete = async (item: any) => {
        const { code, msg } = await deleteProduct({ ws_id, prd_id: item.id })
        fetchFinally(code, msg)
    }

    const hanldeEdit = () => {
        addProduct.current?.show('编辑产品信息', current)
    }
    const hanldeProjectDetail = (item: any) => {
        showProject.current?.show('项目详情', item)
    }

    const handleIcon = async (id: any) => {
        const res = await updateProject({ project_id: id, is_default: 1 })
        if (res.code === 200) {
            setProjectUp(true)

            message.success('修改默认项目成功')
        } else {
            requestCodeMessage(data.code, data.msg)
        }
        setProjectUp(false)
    }
    useEffect(() => {
        projectRefresh()
        refresh()
    }, [projectUp])
    // const handleIcon = useCallback((id: any) => {
    //     updateDefaultProject(id)
    // },[])
    const hanldCreateProject = () => {
        createProject.current?.show('创建项目', {})
    }
    const handleSubmit = async (info: string) => {
        if (info == '新增产品信息') {
            refresh().then(res => {
                setCurrent(res.data[0])
            })
        } else {
            run({ ws_id }).then(res => {
                if (res.code === 200) {
                    projectRun({ product_id: current.id, ws_id })
                }
            })
        }
    }
    const inputSearch = (value: any, event: any) => {
        if (value === '') {
            // 点击清除图标时
            setClickType('menu')
        } else {
            // 点击查询按钮时
            setClickType('searchButton')
            projectRun({ product_id: current.id, name: value, ws_id })
        }
        if (event.target.name === '') {
            projectRun({ product_id: current.id, name: value, ws_id })
        }
    }

    useEffect(() => {
        if (current.id)
            projectRun({ product_id: current.id, ws_id })
    }, [current.id])


    const onDragEnd = async (result: any) => {
        if (!result.destination) {
            return;
        }
        const { code, msg } = await dropProduct({
            ws_id,
            start_id: data[result.source.index].id,
            end_id: data[result.destination.index].id,
            from: result.source.index + 1,
            to: result.destination.index + 1  //后端要从1开始。。
        })
        if (code === 200) {
            // const data = await queryDropProduct({ ws_id })
            // console.log('data',data)
            run({ ws_id }).then(res => {
                if (res.code === 200) {
                    projectRun({ product_id: current.id, ws_id })
                }
            })
        } else {
            requestCodeMessage(code, msg)
        }
    }

    const onDragProjectEnd = async (from: any, to: number, data: any) => {
        try {
            const { code, msg } = await dropProject({
                product_id: current.id,
                ws_id,
                start_id: data[from].id,
                end_id: data[to].id,
                from: from + 1,
                to: to + 1  //后端要从1开始。。
            })
            if (code === 200) {
                projectRun({ product_id: current.id, ws_id })
            } else {
                requestCodeMessage(code, msg)
            }
        }
        catch (err) {
            console.log(err);
        }
    }


    return (
        <Layout.Content>
            <Spin spinning={loading} >
                <Row justify="space-between">
                    <div className={styles.product_left}>
                        <div className={styles.create_button_wrapper}>
                            <Button onClick={handleAddProduct} type="primary" >新增产品</Button>
                        </div>
                        <Row justify="space-between" className={styles.left_title}>
                            <Typography.Text>所有产品 ({data?.length && `${data?.length}`})</Typography.Text>
                        </Row>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided: any, snapshot: any) => (
                                    //这里是拖拽容器 在这里设置容器的宽高等等...
                                    <Row
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={styles.all_product}
                                    >
                                        {
                                            data?.map((item: any, index: number) => {
                                                return (
                                                    <Draggable
                                                        index={index}
                                                        key={item.key}
                                                        draggableId={String(index + 1)}
                                                        product={item.id}
                                                    >
                                                        {(provided: any, snapshot: any) => (
                                                            //在这里写你的拖拽组件的样式 dom 等等...
                                                            <Col
                                                                span={24}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                key={item.id}
                                                                onClick={() => handleCurrentChange(item)}
                                                                onMouseEnter={() => setHover(item.id)}
                                                                onMouseLeave={() => setHover(null)}
                                                            >
                                                                <Row className={styles.product_row}>
                                                                    <div className={hover === item.id ? styles.move_active : styles.move}><HolderOutlined /></div>
                                                                    <div className={item.is_default ? styles.product_item_default : styles.product_item_old}></div>
                                                                    <Row justify="space-between" className={+ current.id === + item.id ? styles.product_item_active : styles.product_item}>
                                                                        <EllipsisPulic title={item.name} width={210}>
                                                                            <Typography.Text >{item.name}</Typography.Text>
                                                                        </EllipsisPulic>
                                                                        {
                                                                            item.is_default
                                                                                ? <Popconfirm
                                                                                    title={<div style={{ color: 'red' }}>不可删除默认产品，请切换默认产品后进行删除！</div>}
                                                                                    onConfirm={() => handleDelete(item)}
                                                                                    cancelText="取消"
                                                                                    okText="确定删除"
                                                                                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                                                                    okButtonProps={{
                                                                                        type: 'default',
                                                                                        disabled: true
                                                                                    }}
                                                                                >
                                                                                    <MinusCircleOutlined
                                                                                        className={hover === item.id ? styles.remove_active : styles.remove}
                                                                                    />
                                                                                </Popconfirm>
                                                                                : <Popconfirm
                                                                                    title={<div style={{ color: 'red' }}>删除产品会对模板和报告有影响(job详<br />情页的“所属项目”变空、模板中project<br />选择变为默认的)，请谨慎删除！！</div>}
                                                                                    onCancel={() => handleDelete(item)}
                                                                                    cancelText="确定删除"
                                                                                    okText="取消"
                                                                                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                                                                >
                                                                                    <MinusCircleOutlined
                                                                                        className={hover === item.id ? styles.remove_active : styles.remove}
                                                                                    />
                                                                                </Popconfirm>
                                                                        }
                                                                        </Row>
                                                                </Row>
                                                            </Col>
                                                        )}
                                                    </Draggable>
                                                )
                                            })
                                        }
                                        {provided.placeholder}
                                    </Row>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                    <div className={styles.product_right}>
                        <Row className={styles.product_right_detail} align="middle">
                            <Col span={24}>
                                <Row>
                                    <Col span={8}>
                                        <Row>
                                            <Typography.Text strong style={{ width: 75 }} >产品名称：</Typography.Text>
                                            <EllipsisPulic title={current.name} style={{ width: 'calc(100% - 85px)' }} />
                                        </Row>
                                    </Col>
                                    <Col span={8}>
                                        <Row>
                                            <Typography.Text strong style={{ width: 75 }}>产品描述：</Typography.Text>
                                            <EllipsisPulic title={current.description} style={{ width: 'calc(100% - 85px)' }} />
                                        </Row>
                                    </Col>
                                    <Col span={8}>
                                        <Row>
                                            <Typography.Text strong style={{ width: 75 }}>版本命令：</Typography.Text>
                                            <EllipsisPulic title={current.command} style={{ width: 'calc(100% - 85px)' }} />
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
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
                        </Row>
                        <Row className={styles.right_project}>
                            <Row style={{ width: '100%', height: 62 }}>
                                <Typography.Text className={styles.product_right_all_project}>所有项目 ({projectData.data?.length && `${projectData.data?.length}`})</Typography.Text>
                                <Form form={form}>
                                    <Form.Item name="server_type">
                                        <Input.Search placeholder="搜索项目" onSearch={inputSearch}
                                            allowClear
                                            style={{ width: 200, height: 32, marginTop: 15 }} />
                                    </Form.Item>
                                </Form>
                            </Row>
                            <Spin spinning={projectLoading}>
                                <DndProvider backend={HTML5Backend}>
                                    <Example
                                        dataSource={projectData.data}
                                        clickType={clickType}
                                        callBackFormTo={onDragProjectEnd}
                                        handleProjecIcon={handleIcon}
                                        hanldCreateProject={hanldCreateProject}
                                        hanldeProjectDetail={hanldeProjectDetail}
                                    />
                                </DndProvider>
                            </Spin>
                        </Row>
                    </div>
                </Row>
            </Spin>
            <AddProductDrawer ref={addProduct} current={current} onOk={handleSubmit} />
            <ShowProjectDrawer ref={showProject} onOk={projectRefresh} projectData={projectData} />
            <CreateProjectDrawer ref={createProject} current={current} onOk={projectRefresh} />
        </Layout.Content>
    )
}