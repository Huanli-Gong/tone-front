import React , { useState , forwardRef , useImperativeHandle } from 'react'
import { Button , Space , Row , Input , Typography , Col , Divider , Popover } from 'antd'
import { useRequest, useIntl, FormattedMessage } from 'umi'

export default forwardRef(
    ( props : any , ref : any ) => {
        const { formatMessage } = useIntl()
        const [ visible , setVisible ] = useState( false )
        const [ reason , setReason ] = useState('')
    
        useImperativeHandle( ref , () => ({
            show : () => {
                setVisible( true )
            },
            hide : () => {
                handleCancel ()
            }
        }))
    
        const handleCancel = ( v? : boolean ) => {
            setVisible( v || false )
            setReason('')
        }
    
        const handleSubmit = async () => {
            props.onOk( reason )
        }
    
        return (
            <Popover
                title={<FormattedMessage id="JoinApprove.application.join"/>}
                trigger="click"
                visible={ visible }
                onVisibleChange={ handleCancel }
                content={ 
                    <Row>
                        <Col span={ 24 } style={{ marginBottom : 8 }}>
                            <Space>
                                <Typography.Text><FormattedMessage id="JoinApprove.refuse.reason"/></Typography.Text>
                                <Typography.Text disabled>(<FormattedMessage id="JoinApprove.option"/>)</Typography.Text>
                            </Space>
                        </Col>
                        <Col span={ 24 }>
                            <Input.TextArea 
                                value={ reason } 
                                rows={ 3 }  
                                maxLength={ 200 }
                                onChange={ evt => setReason( evt.target.value ) } 
                            />
                        </Col>
                        <Divider style={{ marginTop : 20 , marginBottom : 10 }}/>
                        <Col span={ 24 }>
                            <Row justify="end">
                                <Space>
                                    <Button onClick={ () => handleCancel() }><FormattedMessage id="operation.cancel"/></Button>
                                    <Button onClick={ handleSubmit }><FormattedMessage id="JoinApprove.confirm.refuse"/></Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>
                }
            >
                <Button onClick={() => setVisible ( true )}><FormattedMessage id="operation.refuse"/></Button>
            </Popover>
        )
    }
)