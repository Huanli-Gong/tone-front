import { Modal, Row , Form , Input } from 'antd'
import React, { useState , useImperativeHandle , forwardRef } from 'react'

export default forwardRef(
    ( props : any , ref : any ) => {
        const [ visible , setVisible ] = useState( false )
        const [ padding , setPadding ] = useState( false )
    
        useImperativeHandle(
            ref,
            () => ({
                show : () => {
                    setVisible( true )
                }
            }),
        )
    
        const [ form ] = Form.useForm()
    
        const handleCancel = () => {
            setVisible( false )
        }
    
        const handleOk = () => {
            if ( padding ) return ;
            setPadding( true )
            form.validateFields()
                .then(( values ) => {
                    console.log( values )
                })
                .catch(( err ) => {
                    setPadding( false )
                })
        }
    
        return (
            <Modal 
                width={ 487 }
                title="新建基线"
                visible={ visible }
                onCancel={ handleCancel }
                onOk={ handleOk }
                okText="确认"
                cancelText="取消"
            >
                <Row>
                    <b>ServerProvider</b>
                    <span></span>
                </Row>
                <Row>
                    <b>基线类型</b>
                    <span></span>
                </Row>
                <div style={{ width : '100%' , height : 10 , background : '#F5F5F5' }} />
                <Form
                    form={ form }
                    layout="vertical"
                    /*hideRequiredMark*/
                >
                    <Form.Item label="基线名称">
                        <Input autoComplete="off" placeholder="请输入基线名称" />
                    </Form.Item>
                    <Form.Item label="基线描述(选填)">
                        <Input.TextArea rows={ 3 } autoComplete="off" placeholder="请输入基线描述" />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)