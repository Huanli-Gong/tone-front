import React , { useState , forwardRef , useImperativeHandle } from 'react'
import { Button , Space , Row , Input , Typography , Col , Divider , Popover } from 'antd'

export default forwardRef(
    ( props : any , ref : any ) => {
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
                title="申请加入"
                trigger="click"
                visible={ visible }
                onVisibleChange={ handleCancel }
                content={ 
                    <Row>
                        <Col span={ 24 } style={{ marginBottom : 8 }}>
                            <Space>
                                <Typography.Text>拒绝理由</Typography.Text>
                                <Typography.Text disabled>(选填)</Typography.Text>
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
                                    <Button onClick={ () => handleCancel() } >取消</Button>
                                    <Button onClick={ handleSubmit }>确认拒绝</Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>
                }
            >
                <Button onClick={ () => setVisible ( true )} >拒绝</Button>
            </Popover>
        )
    }
)