import { Space, Typography, Badge, message, Button, Modal, Spin } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import { useRequest, history, useModel } from 'umi'
import { queryTestTemplateList, deleteTestTemplate, queryTemplateDel } from './service'
import { AuthMember, AuthMemberForm } from '@/components/Permissions/AuthMemberCommon';
import { ExclamationCircleOutlined } from '@ant-design/icons'
import CopyModal from './components/CopyModal'
import CommonPagination from '@/components/CommonPagination'
import { getSearchFilter, getRadioFilter, getCheckboxFilter, getUserFilter } from '@/components/TableFilters'
import { SingleTabCard } from '@/components/UpgradeUI';
import ResizeTable from '@/components/ResizeTable';
import { requestCodeMessage } from '@/utils/utils';
import {cloneDeep,get} from 'lodash'
export default (props: any) => {
    const { ws_id } = props.match.params
    const PAGE_DEFAULT_PARAMS = { page_num: 1, page_size: 10, ws_id }
    const { initialState, setInitialState } = useModel<any>('@@initialState')
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const copyModal: any = useRef()
    const { state } = props.location
    const {action} = props.history
    const resizeTableRef = useRef<any>()
    const [scrollX, setScrollX] = useState(0)

    const [params, setParams] = useState<any>(PAGE_DEFAULT_PARAMS)
    const { data: dataSource, run, loading } = useRequest(
        (params: any) => queryTestTemplateList(params),
        {
            formatResult: (response: any) => response,
            initialData: { data: [], total: 0 },
            defaultParams: [PAGE_DEFAULT_PARAMS],
            manual: true
        }
    )
    const handleParmas = () =>{
        const parmasCopy = cloneDeep(params)
        parmasCopy.userName = undefined
        return parmasCopy
    }
    const handleCopyModalOk = () => {
        run(handleParmas())
    }
    useEffect(() =>{
        // action !== 'POP' 区分是否是当前页刷新
        if(state && action !== 'POP') setParams({...params,...state})
    },[state])

    useEffect(() => {
        run(handleParmas())
    }, [params])

    const handleDeleteaModal = async (row: any) => {
        setDeleteObj(row)
        const data = await queryTemplateDel({ template_id: row.id })
        if (data.data.length > 0) {
            setDeleteVisible(true)
        } else {
            setDeleteDefault(true)
        }
    }
    const handleDelete = async () => {
        const { code, msg } = await deleteTestTemplate({ template_id: deleteObj.id, ws_id })
        if (code === 200) {
            const parmasCopy = cloneDeep(params)
            const {page_size,page_num} = parmasCopy
            const remainNum = get(dataSource,'total') % page_size === 1
            const totalPage:number = Math.floor(get(dataSource,'total') / page_size)
            if(remainNum && totalPage && totalPage + 1 <= page_num){
                parmasCopy.page_num = totalPage
                setParams(parmasCopy)
            } else {
                run(handleParmas())
            }
            
            setInitialState({
                ...initialState,
                refreshMenu: !initialState?.refreshMenu
            })
            setDeleteVisible(false)
            setDeleteDefault(false)
            message.success('操作成功!')
        }
        else {
            requestCodeMessage(code, msg)
        }
    }

    const handleEdit = ({ id, job_type, }: any): any => {
        if (!job_type) return message.warning('问题模板，请及时删除！')
        history.push({pathname: `/ws/${ws_id}/test_template/${id}/edit`, state: {params}})
    }
    const handleDetail = () => {
        window.open(`/ws/${ws_id}/refenerce/3/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    const handlePreview = ({ id, job_type, creator }: any): any => {
        if (!job_type) return message.warning('问题模板，请及时删除')
        history.push({ pathname: `/ws/${ws_id}/test_template/${id}/preview`, state: {
            creator,
            params
        } })
    }

    const handleCopy = (_: any) => {
        copyModal.current.show('模板复制', _)
    }

    const columns = [{
        title: '名称',
        dataIndex: 'name',
        ellipsis: true,
        fixed: 'left',
        width: 240,
        // render : ( _ : any ) => (
        //     <Tooltip placement="topLeft" title={ _ }>
        //         { _ }
        //     </Tooltip>
        // ),
        ...getSearchFilter(params, setParams, 'name')
    }, {
        title: '描述',
        ellipsis: true,
        width: 150,
        dataIndex: 'description'
    }, {
        title: '启用',
        ellipsis: true,
        width: 80,
        dataIndex: 'enable',
        render: (_: any) => (
            <>
                <Badge status={_ ? 'success' : 'error'} />
                <Typography.Text>{_ ? '启用' : '停用'}</Typography.Text>
            </>
        ),
        ...getRadioFilter(
            params,
            setParams,
            [{ name: '启用', value: 1 }, { name: '停用', value: 0 }],
            'enable'
        )
    }, {
        title: 'Job类型',
        dataIndex: 'job_type',
        width: 130,
        ellipsis: true,
        ...getCheckboxFilter(
            params,
            setParams,
            initialState?.jobTypeList.map(({ id, name }: any) => ({ name, value: id })),
            'job_type_id',
            {marginTop: 70}
        )
    }, {
        width: 90,
        title: '创建人',
        ellipsis: true,
        dataIndex: 'creator_name',
        ...getUserFilter({ name: 'creator', data: params, setDate: setParams,flag: true })
    }, {
        width: 90,
        ellipsis: true,
        title: '修改人',
        dataIndex: 'update_user',
    }, {
        title: '创建时间',
        width: 120,
        ellipsis: true,
        dataIndex: 'gmt_created',
    }, {
        title: '修改时间',
        width: 120,
        ellipsis: true,
        dataIndex: 'gmt_modified',
    }, {
        title: '操作',
        width: 155,
        fixed: 'right',
        render: (_: any, row: any) => (
            <Space>
                <span onClick={() => handlePreview(_)} style={{ color: '#1890FF', cursor: 'pointer' }}>预览</span>
                {
                    <AuthMember
                        isAuth={['sys_test_admin', 'user', 'ws_member']}
                        children={<span style={{ color: '#1890FF', cursor: 'pointer' }}>复制</span>}
                        onClick={() => handleCopy(_)}
                        creator_id={_.creator}
                    />
                }
                {
                    <AuthMember
                        isAuth={['sys_test_admin', 'user', 'ws_member']}
                        children={<span style={{ color: '#1890FF', cursor: 'pointer' }}>编辑</span>}
                        onClick={() => handleEdit(_)}
                        creator_id={_.creator}
                    />
                }
                {
                    <AuthMemberForm
                        isAuth={['sys_test_admin', 'user', 'ws_member']}
                        children={<span style={{ color: '#1890FF', cursor: 'pointer' }}> 删除 </span>}
                        onFirm={
                            // <Popconfirm
                            // title="确定要删除改模板吗？"
                            // onConfirm={() => handleDelete(_)}
                            // okText="确认"
                            // cancelText="取消"
                            // >
                            //     <span style={{ color: '#1890FF', cursor: 'pointer' }}>
                            //         删除
                            //     </span>
                            // </Popconfirm>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleDeleteaModal({ ...row })}>删除</span>
                        }
                        creator_id={_.creator}
                    />
                }
            </Space>
        )
    },]

    const setResizeScrollX = () => setScrollX(resizeTableRef.current.clientWidth)

    useEffect(() => {
        setResizeScrollX()
        window.addEventListener('resize', setResizeScrollX)
        return () => {
            window.removeEventListener('resize', setResizeScrollX)
        }
    }, [])

    return (
        <SingleTabCard
            title="模板列表"
        >
            <Spin spinning={loading}>
                <div ref={resizeTableRef}>
                    <ResizeTable
                        rowKey="id"
                        size="small"
                        dataSource={dataSource.data}
                        columns={columns}
                        pagination={false}
                        scroll={{ x: scrollX }}
                    />
                </div>

                <CommonPagination
                    pageSize={params.page_size}
                    currentPage={params.page_num}
                    total={dataSource.total}
                    onPageChange={
                        (page_num, page_size) => setParams({
                            ...params,
                            page_size,
                            page_num
                        })
                    }
                />
            </Spin>

            <CopyModal ref={copyModal} onOk={handleCopyModalOk} />

            <Modal
                title="删除提示"
                centered={true}
                visible={deleteVisible}
                //onOk={remOuter}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={handleDelete}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        取消
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    删除该模板将同时移除测试计划中的此模板配置，请谨慎删除！！
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}>查看引用详情</div>
            </Modal>
            <Modal
                title="删除提示"
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={handleDelete}>
                        确定删除
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        取消
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    确定要删除吗？
                </div>
            </Modal>

        </SingleTabCard>
    )
}