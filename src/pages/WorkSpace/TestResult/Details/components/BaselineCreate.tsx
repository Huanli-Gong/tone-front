import { Modal, Row , Form , Input } from 'antd'
import React, { useState , useImperativeHandle , forwardRef } from 'react'
import { useIntl, FormattedMessage } from 'umi'

export default forwardRef(
    ( props : any , ref : any ) => {
        const { formatMessage } = useIntl()
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
                title={<FormattedMessage id="ws.result.details.create.baseline" />}
                visible={ visible }
                onCancel={ handleCancel }
                onOk={ handleOk }
                okText={<FormattedMessage id="operation.confirm" />}
                cancelText={<FormattedMessage id="operation.cancel" />}
            >
                <Row>
                    <b><FormattedMessage id="ws.result.details.test.env" /></b>
                    <span></span>
                </Row>
                <Row>
                    <b><FormattedMessage id="ws.result.details.baseline.type" /></b>
                    <span></span>
                </Row>
                <div style={{ width : '100%' , height : 10 , background : '#F5F5F5' }} />
                <Form
                    form={ form }
                    layout="vertical"
                    /*hideRequiredMark*/
                >
                    <Form.Item label={<FormattedMessage id="ws.result.details.baseline.name" />}
                        >
                        <Input autoComplete="off" 
                            placeholder={formatMessage({id: 'ws.result.details.baseline.name.placeholder'})}
                         />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="ws.result.details.baseline.desc" />}
                        >
                        <Input.TextArea rows={ 3 } autoComplete="off" 
                            placeholder={formatMessage({id: 'ws.result.details.baseline.desc.placeholder'})}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)