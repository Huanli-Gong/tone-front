import React , { useState , useEffect } from 'react'
import { Table, message , Row , Space , Button , Checkbox , Typography , Avatar, Tag, Badge } from 'antd'
import { queryWorkspaceApproveList , optWorkspaceApprove } from '@/services/Workspace'
import { ReactComponent as JoinWorkspace } from '@/assets/svg/join.svg'
import { requestCodeMessage } from '@/utils/utils'

export default ( props : any ) => {
    const { onChange } = props
    const { ws_id } = props.match.params
    const status = props.status

    const [ dataSource , setDataSource ] = useState<any>([])
    const [ loading , setLoading ] = useState( true )
    const [ selectedRowKeys , setSelectedRowKeys ] = useState<Array<any>>([])

    const [ pedding , setPedding ] = useState( false )

    const [ total , setTotal ] = useState(0)
    const [ pagenat , setPagenat ] = useState<any>({
        page_num : 1 ,
        page_size : 20
    })

    const rowSelection = + status === 0 ? {
        selectedRowKeys,
        onChange: ( selectedRowKeys : any[] ) => {
            setSelectedRowKeys( selectedRowKeys )
        }
    } : undefined

    const SwitchApproveClass = ( _ : any ) => {
        return (<JoinWorkspace />)
        switch ( _.object_type ) {
            case 'workspace' : return (
                <Space>
                    <Tag color="#1890FF">加</Tag>
                    <Typography.Text>加入workspace</Typography.Text>
                </Space>
            )
            default : return (<Space></Space>)
        } 
    }

    const hanldeOption = async (action : {
        id : number,
        name : string,
    }) => {
        if ( pedding ) return 
        setPedding( true )
        const {code , msg } = await optWorkspaceApprove({ action : action.name , id : action.id, ws_id })
        
        if ( code === 200 ) {
            initData()
            message.success('操作成功')
            onChange()
        }
        else requestCodeMessage( code , msg )
        setPedding( false )
    }

    let columns : any[] = [
        {
            title : '申请类别',
            dataIndex : 'name',
            render : ( _ : any , record : any ) => (
                <SwitchApproveClass { ...record }/>
            )
        },
        {
            title : '申请人',
            dataIndex : 'name',
            render : ( _ : any , record : any ) => (
                <Space>
                    <Avatar size={ 25 } src={ record.proposer_avatar }/>
                    <Typography.Text>{ record.proposer_name }</Typography.Text>
                </Space>
            )
        },
        {
            title : '申请理由',
            dataIndex : 'reason'
        },
        {
            title : '申请时间',
            dataIndex : 'gmt_created'
        },
    ]

    if ( status === '1' ) {
        columns = [
            ...columns,
            {
                title : '审批时间',
                dataIndex : 'gmt_modified'
            },
            {
                title : '审批结果',
                render : ( _ : any ) => (
                    <Space>
                        <Badge status={ _.status === 'passed' ? 'success' : 'warning' }/>
                        <Typography.Text>
                            {
                                _.status === 'passed' ? '已通过' : '已拒绝'
                            }
                        </Typography.Text>
                    </Space>
                )
            }
        ]
    }
    else {
        columns = [
            ...columns,
            {
                title : '操作',
                render : ( _ : any ) => (
                    <Space>
                        <Button 
                            style={{ padding : 0 }} 
                            type="link" 
                            onClick={ () => hanldeOption({ id : _.id , name : 'pass' }) }
                        >
                            通过
                        </Button>
                        <Button 
                            style={{ padding : 0 }} 
                            type="link" 
                            onClick={ () => hanldeOption({ id : _.id , name : 'refuse' }) }
                        >
                            拒绝
                        </Button>
                    </Space>
                )
            }
        ]
    }

    const initData = async () => {
        setLoading( true )
        const { page_num : pageTotal , data , code , msg } = await queryWorkspaceApproveList({
            status : props.status,
            object_id : ws_id,
            ws_id,
            action : 'join', 
            ...pagenat
        })
        if ( code === 200 ) {
            setDataSource( data )
            setTotal( pageTotal )
        }
        else requestCodeMessage( code , msg )
        setLoading( false )
    }

    const handleBatchOption = async( action : string ) => {
        const { code , msg } = await optWorkspaceApprove({
            ws_id,
            id_list : selectedRowKeys,
            action
        })

        if ( code === 200 ) {
            setSelectedRowKeys([])
            initData()
            message.success('操作成功')
        }
        else requestCodeMessage( code , msg )
    }

    useEffect(() => {
        initData()
    }, [ pagenat ])
    
    return (
        <>
            <Table 
                size="small"
                columns={ columns }
                rowKey="id"
                rowSelection={ rowSelection }
                loading={ loading }
                dataSource={ dataSource }
                // onHeaderRow={( column, index ) => {
                //     return {
                //         onClick: event => { 
                //             console.log( event.target.innerHTML )
                //         }, // 点击行
                //     };
                // }}
                pagination={{
                    //hideOnSinglePage: true,
                    showQuickJumper: true,
                    defaultCurrent: 1,
                    showTotal: t => `共${ t }条`,
                    total: total,
                    pageSize: pagenat.page_size,
                    onChange: (page_num, page_size) => setPagenat({
                        ...pagenat,
                        page_num,
                        page_size
                    })
                }}
            />
            {
                selectedRowKeys.length > 0 && 
                <Row 
                    justify="space-between" 
                    style={{ 
                        paddingRight : 20 , 
                        height:64,
                        position :'absolute',
                        left:0,
                        bottom:-64,
                        width:'100%',
                        background:'#fff',
                        paddingLeft:24,
                        boxShadow:'0 -9px 28px 8px rgba(0,0,0,0.05), 0 -6px 16px 0 rgba(0,0,0,0.08), 0 -3px 6px -4px rgba(0,0,0,0.12)' 
                    }}
                >
                    <Space>
                        <Checkbox indeterminate={ true }/>
                        <Typography.Text>已选择{ selectedRowKeys.length }项</Typography.Text>
                        <Button type="link" onClick={ () => setSelectedRowKeys([]) }>取消</Button>
                    </Space>
                    <Space>
                        <Button onClick={() => handleBatchOption( 'refuse' )}>批量拒绝</Button>
                        <Button onClick={() => handleBatchOption( 'pass' )} type="primary">批量通过</Button>
                    </Space>
                </Row>
            }
        </>
    )
}