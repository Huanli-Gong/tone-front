import React , { useState , useImperativeHandle , forwardRef } from 'react'

import { Drawer , Form , Input , Space , Button , message, Spin } from 'antd'
import { queryServerTagList , createServerGroup , updateServerGroup } from '../../services'
import { TagSelect } from '../../Components'
import Owner from '@/components/Owner/index'
import { requestCodeMessage } from '@/utils/utils'

const CreateGroupDrawer = ( props : any , ref  : any ) => {
    const { ws_id , run_mode , run_environment , onFinish } = props 

    const [ tagList , setTagList ] = useState([])
    const [ padding , setPadding ] = useState( false )
    const [ loading , setLoading ] = useState( true )
    const [ visible , setVisible ] = useState( false )
    const [ source , setSource ] = useState<any>( null )

    const [ form ] = Form.useForm()

    useImperativeHandle( ref , () => ({
        show ( _ : any ) {
            setVisible( true )
            initDrawer()
            if ( _ ) {
                setSource( _ )
                let params = _
                params.tags = params.tag_list.map(( i : any ) => i.id )
                form.setFieldsValue( params )
            }
        }
    }))

    const initDrawer = async () => {
        setLoading( true )
        const { data } = await queryServerTagList({ ws_id }) //run_mode , run_environment , 
        setTagList( data || [] )
        setLoading( false )
    }

    const handleFinish = () => {
        setPadding( true )
        form
            .validateFields()
            .then( async ( values : any ) => {
                let data : any;
                if ( !source )
                    data = await createServerGroup({
                        ...values,
                        cluster_type : 'aligroup',
                        ws_id
                    })
                else 
                    data = await updateServerGroup( source.id , { ...values , ws_id } )

                if ( data.code === 200 ) {
                    message.success('操作成功')
                    onFinish()
                    handleCancel()
                }
                else 
                    requestCodeMessage( data.code , data.msg )
                setPadding( false )
            })
            .catch(( err : any ) => {
                console.log(err)
                setPadding( false )
            })
    }

    const handleCancel = () => {
        form.resetFields()
        setVisible( false )
        setSource( null )
    }

    return (
        <Drawer 
            maskClosable={ false }
            keyboard={ false }
            title={ !source ? '创建集群' : '编辑集群' }
            forceRender={ true }
            visible={ visible }
            onClose={ handleCancel }
            width="376"
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={ handleCancel }>取消</Button>
                        <Button type="primary" disabled={ padding } onClick={ handleFinish }>
                            { !source ? '确定' : '更新' }
                        </Button>
                    </Space>
                </div>
            }
        >
            <Spin spinning={ loading } >
                <Form
                    layout="vertical" 
                    /*hideRequiredMark*/ 
                    form={ form }
                    name="createGroup"
                >
                    <Form.Item name="name" label="集群名称" rules={[{message : '名称不能为空' , required : true }]}>
                        <Input autoComplete="off" placeholder="请输入"/>
                    </Form.Item>
                    <Owner />
                    <TagSelect tags={ tagList } />
                    <Form.Item name="description" label="备注">
                        <Input.TextArea 
                            placeholder="请输入备注信息"
                        />
                    </Form.Item>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default forwardRef( CreateGroupDrawer )


                    {/* {
                        members && 
                        <MemberSelect 
                            initialValue={ source.owner } 
                            members={ members } 
                            callback={ ( data : any ) => setMembers( data ) }
                            rules={[{message : 'Owner不能为空' , required : true }]}
                        />
                    } */}