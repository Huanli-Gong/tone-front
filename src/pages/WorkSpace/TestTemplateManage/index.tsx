import { Space, Typography, Badge, message, Button, Modal, Spin } from 'antd'
import React, { useRef, useState, useEffect } from 'react'
import { useRequest, history, useModel, FormattedMessage, useIntl } from 'umi'
import { queryTestTemplateList, deleteTestTemplate, queryTemplateDel } from './service'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import CopyModal from './components/CopyModal'
import CommonPagination from '@/components/CommonPagination'
import { getSearchFilter, getRadioFilter, getCheckboxFilter, getUserFilter } from '@/components/TableFilters'
import { SingleTabCard } from '@/components/UpgradeUI';
import ResizeTable from '@/components/ResizeTable';
import { requestCodeMessage, AccessTootip } from '@/utils/utils';
import { cloneDeep, get } from 'lodash'
import { Access, useAccess } from 'umi'

export default (props: any) => {
    const { formatMessage } = useIntl()
    const { ws_id } = props.match.params
    const access = useAccess();
    const PAGE_DEFAULT_PARAMS = { page_num: 1, page_size: 10, ws_id }
    const { initialState, setInitialState } = useModel<any>('@@initialState')
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteDefault, setDeleteDefault] = useState(false);
    const [deleteObj, setDeleteObj] = useState<any>({});
    const copyModal: any = useRef()
    const { state } = props.location
    const { action } = props.history
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
    const handleParmas = () => {
        const parmasCopy = cloneDeep(params)
        parmasCopy.userName = undefined
        return parmasCopy
    }
    const handleCopyModalOk = () => {
        run(handleParmas())
    }
    useEffect(() => {
        // action !== 'POP' 区分是否是当前页刷新
        if (state && action !== 'POP') setParams({ ...params, ...state })
    }, [state])

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
            const { page_size, page_num } = parmasCopy
            const remainNum = get(dataSource, 'total') % page_size === 1
            const totalPage: number = Math.floor(get(dataSource, 'total') / page_size)
            if (remainNum && totalPage && totalPage + 1 <= page_num) {
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
            message.success(formatMessage({id: 'operation.success'}) )
        }
        else {
            requestCodeMessage(code, msg)
        }
    }

    const handleEdit = ({ id, job_type, }: any): any => {
        if (!job_type) return message.warning(formatMessage({id: 'job.templates.delete.the.problem.template'}) )
        history.push({ pathname: `/ws/${ws_id}/test_template/${id}/edit`, state: { params } })
    }
    const handleDetail = () => {
        window.open(`/ws/${ws_id}/refenerce/3/?name=${deleteObj.name}&id=${deleteObj.id}`)
    }
    const handlePreview = ({ id, job_type, creator }: any): any => {
        if (!job_type) return message.warning(formatMessage({id: 'job.templates.delete.the.problem.template'}) )
        history.push({
            pathname: `/ws/${ws_id}/test_template/${id}/preview`, state: {
                creator,
                params
            }
        })
    }

    const handleCopy = (_: any) => {
        copyModal.current.show('copy', _)
    }

    const columns: any = [{
        title: <FormattedMessage id="job.templates.name"/>,
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
        title: <FormattedMessage id="job.templates.description"/>,
        ellipsis: true,
        width: 150,
        dataIndex: 'description'
    }, {
        title: <FormattedMessage id="job.templates.enable"/>,
        ellipsis: true,
        width: 80,
        dataIndex: 'enable',
        render: (_: any) => (
            <>
                <Badge status={_ ? 'success' : 'error'} />
                <Typography.Text>{_ ? <FormattedMessage id="job.templates.enable"/>: <FormattedMessage id="job.templates.stop"/>}</Typography.Text>
            </>
        ),
        ...getRadioFilter(
            params,
            setParams,
            [
                { name: formatMessage({id: 'job.templates.enable'}), value: 1 }, 
                { name: formatMessage({id: 'job.templates.stop'}), value: 0 }],
            'enable'
        )
    }, {
        title: <FormattedMessage id="job.templates.job_type"/>,
        dataIndex: 'job_type',
        width: 130,
        ellipsis: true,
        ...getCheckboxFilter(
            params,
            setParams,
            initialState?.jobTypeList.map(({ id, name }: any) => ({ name, value: id })),
            'job_type_id',
            { marginTop: 70 }
        )
    }, {
        width: 90,
        title: <FormattedMessage id="job.templates.creator_name"/>,
        ellipsis: true,
        dataIndex: 'creator_name',
        ...getUserFilter({ name: 'creator', data: params, setDate: setParams, flag: true })
    }, {
        width: 90,
        ellipsis: true,
        title: <FormattedMessage id="job.templates.update_user"/>,
        dataIndex: 'update_user',
    }, {
        title: <FormattedMessage id="job.templates.gmt_created"/>,
        width: 120,
        ellipsis: true,
        dataIndex: 'gmt_created',
    }, {
        title: <FormattedMessage id="job.templates.gmt_modified"/>,
        width: 120,
        ellipsis: true,
        dataIndex: 'gmt_modified',
    }, {
        title: <FormattedMessage id="Table.columns.operation"/>,
        width: 155,
        fixed: 'right',
        render: (_: any, row: any) => (
            <Space>
                <span onClick={() => handlePreview(_)} style={{ color: '#1890FF', cursor: 'pointer' }}><FormattedMessage id="operation.preview"/></span>
                <Access
                    accessible={access.WsMemberOperateSelf(row.creator)}
                    fallback={
                        <Space>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.copy"/></span>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.edit"/></span>
                            <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => AccessTootip()}><FormattedMessage id="operation.delete"/></span>
                        </Space>
                    }
                >
                    <Space>
                        <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleCopy(_)}><FormattedMessage id="operation.copy"/></span>
                        <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleEdit(_)}><FormattedMessage id="operation.edit"/></span>
                        <span style={{ color: '#1890FF', cursor: 'pointer' }} onClick={() => handleDeleteaModal({ ...row })}><FormattedMessage id="operation.delete"/></span>
                    </Space>
                </Access>
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
        <SingleTabCard title={<FormattedMessage id="job.templates.list"/>}>
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
                title={<FormattedMessage id="job.templates.delete.prompt"/>}
                centered={true}
                visible={deleteVisible}
                //onOk={remOuter}
                onCancel={() => setDeleteVisible(false)}
                footer={[
                    <Button key="submit" onClick={handleDelete}>
                        <FormattedMessage id="operation.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteVisible(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={600}
                maskClosable={false}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                    <FormattedMessage id="job.templates.delete.prompt.ps"/>
                </div>
                <div style={{ color: '#1890FF', cursor: 'pointer' }} onClick={handleDetail}><FormattedMessage id="job.templates.view.details"/></div>
            </Modal>
            <Modal
                title={<FormattedMessage id="job.templates.delete.prompt"/>}
                centered={true}
                visible={deleteDefault}
                onCancel={() => setDeleteDefault(false)}
                footer={[
                    <Button key="submit" onClick={handleDelete}>
                        <FormattedMessage id="operation.delete"/>
                    </Button>,
                    <Button key="back" type="primary" onClick={() => setDeleteDefault(false)}>
                        <FormattedMessage id="operation.cancel"/>
                    </Button>
                ]}
                width={300}
            >
                <div style={{ color: 'red', marginBottom: 5 }}>
                    <ExclamationCircleOutlined style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {<FormattedMessage id="delete.prompt"/>}
                </div>
            </Modal>

        </SingleTabCard>
    )
}