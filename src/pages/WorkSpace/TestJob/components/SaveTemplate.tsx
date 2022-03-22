import { Drawer , Form, Input , Space , Button, Radio } from 'antd'
import React, { forwardRef , useState , useImperativeHandle } from 'react'

import styles from './index.less'

export default forwardRef(
    ( { onOk } : any , ref : any ) => {
        const [ form ] = Form.useForm()

        const [ padding , setPadding ] = useState( false )
        const [ visible , setVisible ] = useState( false )

        useImperativeHandle(
            ref,
            () => ({
                show : () => {
                    setVisible( true )
                },
                hide : () => setVisible( false )
            }),
        )

        const handleClose = () => {
            form.resetFields()
            setVisible( false )
        }

        const handleOk = () => {
            setPadding( true )
            form.validateFields()
                .then(
                    ( values : any ) => {
                        onOk( values )
                        setPadding( false )
                    }
                )
                .catch((err) => {
                    console.log( err )
                    setPadding( false )
                })
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false } 
                title="存为模板"
                width="380"
                onClose={ handleClose }
                visible={ visible }
                bodyStyle={{ paddingTop : 12 }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={ handleClose }>取消</Button>
                            <Button type="primary" disabled={ padding } onClick={ handleOk }>确定</Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={ form }
                    layout="vertical"
                    className={ styles.job_test_form }
                    /*hideRequiredMark*/
                >
                    <Form.Item
                        name="template_name"
                        label="模板名称"
                        rules={[{
                            required : true,
                            message: '仅允许包含字母、数字、下划线、中划线、点，最长64个字符',
                            whitespace : true,
                            type : 'string',
                            pattern: /^[A-Za-z0-9\._-]{1,64}$/g
                        },
                        {
                            type : 'string',
                            min : 1,
                            message : '模板名称不能为空',
                            whitespace : true,
                        }]}
                    >
                        <Input autoComplete="off" placeholder="仅允许包含字母、数字、下划线、中划线、点，最长64个字符" />
                    </Form.Item>
                    {/* <Row style={{ fontSize : 12 , color : 'rgba(0,0,0,0.45)' }}>命名规则：</Row> */}
                    <Form.Item
                        label="模板描述"
                        name="description"
                    >
                        <Input.TextArea placeholder="请输入模板描述" />
                    </Form.Item>
                    <Form.Item
                        label="启用"
                        name="enable"
                        initialValue={ true }
                    >
                        <Radio.Group>
                            <Radio value={ true }>是</Radio>
                            <Radio value={ false }>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)