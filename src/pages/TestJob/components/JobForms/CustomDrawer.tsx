

import React , { useState , useImperativeHandle , forwardRef , memo , useCallback, useMemo } from 'react'
import { Space , Button , Form , Drawer , Input } from 'antd'

const CustomDrawer = ( props : any , ref : any ) => {
    const { onOk } = props

    const [ visible , setVisible ] = useState( false )
    const [ source , setSource ] = useState<any>( null )
    const [ pedding , setPedding ] = useState( false )

    const [ form ] = Form.useForm()

    const title = useMemo(() => {
        return source ? '新增' : '编辑'
    } , [ source ])

    useImperativeHandle( ref , () => ({
        show ( _ : any ) {
            setVisible( true )
            if ( _ ) {
                setSource( _ )
                /** code to do ... */
                form.setFieldsValue( _ )
            }
        }
    }))

    const handleClose = useCallback(() => {
        setVisible( false )
        setSource( null )
        form.resetFields()
        /* 自定义 code to do ... */
    } , [])

    const handleOk = () => {
        if ( pedding ) return ;
        setPedding( true )
        form.validateFields()
            .then( 
                async ( values ) => {
                    /* some code ... */
                    onOk()
                    handleClose()
                }
            )
            .catch(( err ) => {})
        setPedding( false )
    }

    return (
        <Drawer 
            maskClosable={ false }
            keyboard={ false } 
            footer={
                <div style={{ textAlign: 'right', }} >
                    <Space>
                        <Button onClick={ handleClose }>取消</Button>
                        <Button type="primary" onClick={ handleOk } >确定</Button>
                    </Space>
                </div>
            }
            visible={ visible }
            destroyOnClose={ true }
            // width={ }  /*自定义*/
            title={ title }
            onClose={ handleClose }
        >
            <Form 
                layout="vertical" 
                form={ form } 
                /*hideRequiredMark*/ 
                scrollToFirstError
            >
                <Form.Item>
                    <Input autoComplete="off" />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef( memo( CustomDrawer ) )