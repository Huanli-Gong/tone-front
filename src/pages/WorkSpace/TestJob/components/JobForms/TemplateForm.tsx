import React , { forwardRef, useImperativeHandle , useEffect } from 'react'
import { Form , Input, Radio } from 'antd'
import styles from './index.less'

export default forwardRef(({ disabled , template , onEnabelChange } : any , ref : any ) => {
    const [ form ] = Form.useForm()

    useImperativeHandle( ref , () => ({
        form,
        reset: form.resetFields,
        setVal: (data:Object) =>{
            form.setFieldsValue(data)
        }
    }))

    useEffect(() => {
        if ( JSON.stringify( template ) !== '{}' ) {
            const { template_name , description , enable } = template
            form.setFieldsValue({ template_name , description , enable })
        }
    } , [ template ])

    return (
        <Form 
            colon={ false }
            layout="horizontal"
            size="small"
            /*hideRequiredMark*/
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
            style={{ width : '100%' }}
            name="basic"
            form={ form }
            className={ styles.job_test_form }
            initialValues={{ enable : true }}
        >
            <Form.Item 
                label="模板名称" 
                name="template_name"
                rules={[{
                    required : true,
                    pattern: /^[A-Za-z0-9\._-]+$/g,
                    message : '允许字母、数字、下划线、中划线，“.”，不允许中文'
                },{
                    required : true ,
                    max : 64,  
                    message : "模板名称最长不超出64字符" 
                }]}
            >
                <Input autoComplete="off" disabled={ disabled } placeholder="仅允许包含字母、数字、下划线、中划线、点，最长64个字符"/>
            </Form.Item>
            <Form.Item label="描述" name="description">
                <Input.TextArea rows={2} disabled={ disabled } autoComplete="off" placeholder="请输入模板描述"/>
            </Form.Item>
            <Form.Item label="启用" name="enable">
                <Radio.Group disabled={ disabled } onChange={ ({ target }) => onEnabelChange( target.value )}>
                    <Radio value={ true }>是</Radio>
                    <Radio value={ false }>否</Radio>
                </Radio.Group>
            </Form.Item>
        </Form>
    )
})