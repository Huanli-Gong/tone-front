import React , { useState , useImperativeHandle , forwardRef , memo , useCallback } from 'react'
import { Space , Button , Form , Drawer , Input } from 'antd'

import styled from 'styled-components'

const FormWrapper = styled(Form)`
    .ant-form-item {
        margin-bottom: 8px;
    }
`

const CustomDrawer = ( props : any , ref : any ) => {
    const { onOk } = props

    const [ visible , setVisible ] = useState( false )
    const [ pedding , setPedding ] = useState( false )

    const [ form ] = Form.useForm()

    useImperativeHandle( ref , () => ({
        show ( _ : any ) {
            setVisible( true )
            _ && form.setFieldsValue({ name : _.name , description : _.description })
        }
    }))

    const handleClose = useCallback(() => {
        setVisible( false )
        form.resetFields()
    } , [])

    const handleOk = () => {
        if ( pedding ) return ;
        setPedding( true )
        form.validateFields()
            .then( 
                async ( values ) => {
                    onOk( values )
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
            width={ 376 }  /*自定义*/
            title={ '模版信息' }
            onClose={ handleClose }
        >
            <FormWrapper 
                layout="vertical" 
                form={ form } 
                /*hideRequiredMark*/ 
                scrollToFirstError
            >
                <Form.Item label="模版名称" name="name" rules={[{ required : true , message : '模版名称不能为空！'}]} >
                    <Input autoComplete="off" placeholder="请输入模版名称" />
                </Form.Item>
                <Form.Item label="描述" name="description">
                    <Input.TextArea rows={ 4 } placeholder="请输入描述信息"/>
                </Form.Item>
            </FormWrapper>
        </Drawer>
    )
}

export default memo( forwardRef( CustomDrawer ) )