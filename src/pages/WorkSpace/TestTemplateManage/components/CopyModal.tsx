import { requestCodeMessage } from '@/utils/utils'
import { Drawer , Space , Button, Form, Input, Radio, message } from 'antd'
import React , { forwardRef, useState , useImperativeHandle } from 'react'
import { copyTestTemplate , updateTestTemplate } from '../service'

import styles from './index.less'


export default forwardRef(
    ({ onOk } : any , ref : any ) => {
        const [ visible , setVisible ] = useState( false )
        const [ padding , setPadding ] = useState( false )
        const [ name , setName ] = useState('')
        const [ title , setTitle ] = useState('')

        const [ data , setData ] = useState<any>({})

        const [ form ] = Form.useForm()

        const randomStrings = () => new Array(4).fill('').reduce(( p , c ) => p.concat( String.fromCharCode(97 + Math.ceil(Math.random() * 25)) ), '')

        useImperativeHandle(
            ref,
            () => ({
                show : ( tt : string , _ : any = {} ) => {
                    tt && setTitle( tt )
                    if ( tt === '模板复制' ) {
                        setName( _.name )
                        const copyName = `${ _.name }-copy-${ randomStrings() }`
                        console.log( copyName )
                        form.setFieldsValue({ name : copyName })
                    }
                    else
                        form.setFieldsValue({ name : _.name , description : _.description , enable : _.enable })
                    setVisible( true )
                    setData( _ )
                }
            }),
        )

        const handleClose = () => {
            setVisible( false )
            form.resetFields()
        }

        const defaultOptions = ( msg : any  , code : any ) => {
            if ( code === 200 ) {
                onOk()
                setVisible( false )
                form.resetFields()
                message.success('操作成功!')
            }
            else requestCodeMessage( code , msg )
            setPadding( false )
        }

        const handleOk = () => {
            setPadding( true )
            form
                .validateFields()
                .then( async ( values : any ) => {
                    console.log( values , data )
                    if ( title === '模板复制' ) {
                        const { msg , code } = await copyTestTemplate({ ...values , template_id : data.id })
                        defaultOptions( msg , code )
                    }
                    else {
                        const { msg , code } = await updateTestTemplate({ ...values , template_id : data.id , update_item: 'template' })
                        defaultOptions( msg , code )
                    }
                })
                .catch(( err ) => {
                    console.log( err )
                    setPadding( false )
                })
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false } 
                visible={ visible }
                width="380"
                onClose={ handleClose }
                title={ title }
                bodyStyle={{ paddingTop : 12 }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={ handleClose }>取消</Button>
                            <Button type="primary" disabled={ padding } onClick={ handleOk }>
                                { ~ title.indexOf('编辑') ? '更新' : '确定' }
                            </Button>
                        </Space>
                    </div>
                }
            >
                {
                    title === '模板复制' &&
                    <Space style={{ paddingBottom : 12 }}>
                        <div style={{ color :  'rgba(0,0,0,.8)' , fontWeight : 600 }}>原模板名称</div>
                        <div style={{ color : ' rgba(0,0,0,0.65)' }}>{ name }</div>
                    </Space>
                }
                <Form
                    layout="vertical"
                    form={ form }
                    /*hideRequiredMark*/
                    className={ styles.job_test_form }
                >
                    <Form.Item 
                        label={ title === '模板编辑' ? '模板名称' : '新模板名称'} 
                        name="name"
                        // help={msg}
                        rules={[{
                            required: true,
                            message: '仅允许包含字母、数字、下划线、中划线、点，最长64个字符',
                            pattern: /^[A-Za-z0-9\._-]{1,64}$/g
                        }]}
                    >
                        <Input autoComplete="off" placeholder="仅允许包含字母、数字、下划线、中划线、点，最长64个字符"/>
                    </Form.Item>
                    <Form.Item label="模板描述" name="description">
                        <Input.TextArea rows={ 3 } placeholder="请输入模板描述" />
                    </Form.Item>
                    <Form.Item label="启用" name="enable" initialValue={ true }>
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