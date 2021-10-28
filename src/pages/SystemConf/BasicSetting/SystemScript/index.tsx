import { Button, Layout, Row, Col, Typography, Space, Spin, Popconfirm, Dropdown, Menu, message, Input, Divider, Empty, Tooltip } from 'antd'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import styles from './index.less'

import { MinusCircleOutlined, MoreOutlined, FilterFilled, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useRequest } from 'umi'

import { queryConfigList, deleteConfig, updateConfig } from '../services'

import AddScripotDrawer from './AddScript'
import CodeEditer from '@/components/CodeEditer'
import HistroyVersion from './HistoryVersion'
import CommentModal from './CommentModal'
import { requestCodeMessage } from '@/utils/utils'

export default (props: any) => {
    const PAGE_DEFAULT_PARAMS = { config_type: 'script' }

    const [current, setCurrent] = useState<any>({})
    const [hover, setHover] = useState(null)
    const [filterVisible, setFilterVisible] = useState(false)

    const [search, setSearch] = useState('')

    const [disabled, setDisabled] = useState(false)

    const [stage, setStage] = useState<any>([])

    const historyModal: any = useRef(null)
    const addScript: any = useRef(null)
    const commentModal: any = useRef(null)

    const { data: { bind_stage, data }, refresh, loading, run } = useRequest(
        (params: any) => queryConfigList(params),
        {
            defaultParams: [PAGE_DEFAULT_PARAMS],
            initialData: {
                data: [],
                bind_stage: {}
            },
            formatResult: r => r,
        }
    )

    //改变当前数据
    const handleCurrentChange = (item: any) => setCurrent(item)

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

        if (JSON.stringify(bind_stage) !== '{}')
            setStage(
                Object.keys(bind_stage).map((key) => ({
                    name: bind_stage[key],
                    value: key
                }))
            )
    }, [data])

    const handleAddScript = () => {
        addScript.current?.show('新增脚本')
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
        const { code, msg } = await deleteConfig({ ...PAGE_DEFAULT_PARAMS, config_id: item.id })
        fetchFinally(code, msg)
    }

    const hanldeEdit = () => {
        addScript.current?.show('编辑脚本', current)
    }

    const handleOpenComment = () => {
        commentModal.current.show(current)
    }

    const handleSubmit = async () => {
        run(PAGE_DEFAULT_PARAMS).then(res=>{
            if(res.code === 200){
                setCurrent(res.data[0])
            }
        })
    }
    const handleComSubmit = () => {
        message.success('操作成功！')
        refresh()
    }

    const handleClickFilter = () => {
        setFilterVisible(!filterVisible)
    }

    const handleSearchScript = () => {
        run({ ...PAGE_DEFAULT_PARAMS, config_key: search })
        setFilterVisible(!filterVisible)
    }

    const handleResetSearch = () => {
        if (search)
            run(PAGE_DEFAULT_PARAMS)
        setSearch('')
        setFilterVisible(!filterVisible)
    }

    const handleOpenHistoryModal = () => {
        historyModal.current.show(current)
    }
    
    useEffect(() => {
        if ('id' in current) {
            const idx = data.findIndex(({ id }: any) => id === current.id)
            setDisabled(data[idx].config_value == current.config_value)
        }
    }, [current])

    const bindStage = useMemo(() => {
        let bindStageText = ''
        stage.forEach(({ name, value }: any) => {
            if (current.bind_stage === value)
                bindStageText = name
        })
        return bindStageText
    }, [stage, current])

    const beforeunload = (event: any) => {
        if (!disabled) {
            event.preventDefault()
            return event.returnValue = '内容尚未保存，确定要离开吗？'
        }
        return false
    }

    useEffect(() => {
        window.addEventListener('beforeunload', beforeunload)

        // Modal.confirm({
        //     title : '关闭提示',
        //     content : '内容尚未保存，确定要离开吗？',
        //     okText : '提交',
        //     cancelText : '离开',
        //     onOk : async () => {
        //         await updateConfig({ config_type : 'script' , config_id : current.id , ...current })
        //     },
        //     onCancel : () => {
        //     }
        // })
        return () => {
            window.removeEventListener('beforeunload', beforeunload)
        }
    }, [disabled])

    const transformKey = ( key : string ) => {
        return key && key.indexOf('TONE_') !== 0 ? `TONE_${key}` : key
    }

    return (
        <Layout.Content>
            <Spin spinning={loading} >
                <Row justify="space-between">
                    <div className={styles.script_left}>
                        <div className={styles.create_button_wrapper}>
                            <Button type="primary" onClick={handleAddScript}>新增脚本</Button>
                        </div>
                        <Row justify="space-between" className={styles.left_title}>
                            <Typography.Text>所有脚本 {data?.length && `(${data?.length})`}</Typography.Text>
                            <div className={styles.filter_icon} onClick={handleClickFilter}>
                                <FilterFilled style={{ color: 'rgba(0 , 0 , 0 ,.45)' }} />
                            </div>
                            <Row
                                className={styles.filter_dropdown}
                                style={filterVisible ? { display: 'block' } : { display: 'none' }}
                            >
                                <Col span={24} className={styles.filter_search_box}>
                                    <Input
                                        placeholder="支持按照脚本名称、备注搜索"
                                        value={search}
                                        onChange={({ target }) => setSearch(target.value)}
                                        suffix={<SearchOutlined />}
                                    />
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
                        <Row className={styles.all_script}>
                            {
                                data?.map(
                                    (item: any) => (
                                        <Col
                                            span={24}
                                            className={+ current.id === + item.id ? styles.script_item_active : styles.script_item}
                                            key={item.id}
                                            onClick={() => handleCurrentChange(item)}
                                            onMouseEnter={() => setHover(item.id)}
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            <Row justify="space-between">
                                                <Typography.Text>
                                                    { transformKey( item.config_key ) }
                                                </Typography.Text>
                                                <Popconfirm
                                                    title={<div style={{ color:'red' }}>删除脚本将可能导致Job无法正常<br/>运行，请谨慎删除！！</div>}
                                                    onCancel={() => handleDelete(item)}
                                                    okText="取消"
                                                    cancelText="确定删除"
                                                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
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
                    </div>
                    <div className={styles.script_right}>
                        {
                            data.length ?
                                <>
                                    <Row className={styles.script_right_detail} align="middle">
                                        <Col span={24}>
                                            <Row>
                                                <Col span={ 8 } className={ styles.history_top_info }>
                                                    <Typography.Text className={ styles.script_right_name }>脚本名称：</Typography.Text>
                                                    <Typography.Text>
                                                        <Tooltip title={ transformKey( current.config_key ) } placement="bottomLeft">
                                                            { transformKey( current.config_key ) }
                                                        </Tooltip>
                                                    </Typography.Text>
                                                </Col>
                                                <Col span={ 6 } className={ styles.history_top_info }>
                                                    <Typography.Text className={ styles.script_right_name }>原子步骤：</Typography.Text>
                                                    <Typography.Text>{ bindStage }</Typography.Text>
                                                </Col>
                                                <Col span={ 10 } className={ styles.history_top_info }>
                                                    <Typography.Text className={ styles.script_right_name }>描述：</Typography.Text>
                                                    <Typography.Text className={ styles.desc_content_style }>
                                                        <Tooltip title={ current.description } placement="bottomLeft">
                                                            { current.description }
                                                        </Tooltip>
                                                    </Typography.Text>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col span={24}>
                                            <Space>
                                                <Typography.Text className={styles.script_right_name}>是否启用：</Typography.Text>
                                                <Typography.Text>
                                                {
                                                    current.enable ? 
                                                    <span style={{ color: "#10CF2D"}}>启用</span> : 
                                                    <span style={{ color: "#F5222D"}}>停用</span>
                                                }
                                                </Typography.Text>
                                            </Space>
                                        </Col>
                                        <Dropdown
                                            overlayStyle={{ cursor: 'pointer' }}
                                            overlay={
                                                <Menu>
                                                    <Menu.Item onClick={hanldeEdit}>编辑信息</Menu.Item>
                                                    <Menu.Item onClick={handleOpenHistoryModal}>历史版本</Menu.Item>
                                                </Menu>
                                            }
                                        >
                                            <MoreOutlined style={{ cursor: 'pointer', position: 'absolute', right: 0, top: 5 }} />
                                        </Dropdown>
                                    </Row>
                                    <Row className={styles.right_code_context}>
                                        <CodeEditer
                                            code={current.config_value}
                                            onChange={(value: any) => setCurrent({
                                                ...current,
                                                config_value: value
                                            })}
                                        />
                                    </Row>
                                    <Row className={styles.right_bottom_options}>
                                        <Space>
                                            <Button style={{ width: 80, marginRight: 20 }} onClick={handleOpenComment} disabled={disabled} type="primary" >提交</Button>
                                            <Typography.Text style={{ fontSize: 12, color: 'rgba( 0 , 0 , 0 , .65 )', marginRight: 20 }}>最后修改时间：{current.gmt_modified}</Typography.Text>
                                            <Typography.Text style={{ fontSize: 12, color: 'rgba( 0 , 0 , 0 , .65 )', marginRight: 20 }}>最后修改人：{current.update_user}</Typography.Text>
                                            {
                                                current.commit &&
                                                <Typography.Text style={{ fontSize: 12, color: 'rgba( 0 , 0 , 0 , .65 )' }}>Comment：{current.commit}</Typography.Text>
                                            }
                                        </Space>
                                    </Row>
                                </> :
                                <Empty />
                        }
                    </div>
                </Row>
            </Spin>
            <AddScripotDrawer stage={stage} ref={addScript} onOk={handleSubmit} />
            <HistroyVersion stage={ stage } ref={historyModal} />
            <CommentModal ref={commentModal} onOk={handleComSubmit} />
        </Layout.Content>
    )
}