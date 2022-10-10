import { requestCodeMessage } from '@/utils/utils'
import { Drawer , Space , Button, Form, Input, Radio, message } from 'antd'
import React , { forwardRef, useState , useImperativeHandle } from 'react'
import { FormattedMessage, useIntl } from 'umi'
import { copyTestTemplate , updateTestTemplate } from '../service'

import styles from './index.less'


export default forwardRef(
    ({ onOk } : any , ref : any ) => {
        const { formatMessage } = useIntl()
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
                    if ( tt === 'copy' ) {
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
                message.success(formatMessage({id: 'operation.success'}) )
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
                    if ( title === 'copy' ) {
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
                title={<FormattedMessage id={`job.templates.${title}`} />}
                maskClosable={ false }
                keyboard={ false } 
                visible={ visible }
                width="380"
                onClose={ handleClose }
                bodyStyle={{ paddingTop : 12 }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={ handleClose }><FormattedMessage id="operation.cancel" /></Button>
                            <Button type="primary" disabled={ padding } onClick={ handleOk }>
                                { ~ title.indexOf('edit') ? <FormattedMessage id="operation.update" />: <FormattedMessage id="operation.ok" />}
                            </Button>
                        </Space>
                    </div>
                }
            >
                {
                    title === 'copy' &&
                    <Space style={{ paddingBottom : 12 }}>
                        <div style={{ color :  'rgba(0,0,0,.8)' , fontWeight : 600 }}><FormattedMessage id="job.templates.original.name" /></div>
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
                        label={ title === 'edit' ? 
                          <FormattedMessage id="job.templates.template.name" />
                          : <FormattedMessage id="job.templates.new.template.name" />
                        } 
                        name="name"
                        // help={msg}
                        rules={[{
                            required: true,
                            message: formatMessage({id: 'job.templates.template.name.message'}),
                            pattern: /^[A-Za-z0-9\._-]{1,64}$/g
                        }]}
                    >
                        <Input autoComplete="off" placeholder={formatMessage({id: 'job.templates.template.name.message'})}/>
                    </Form.Item>
                    <Form.Item 
                        label={<FormattedMessage id="job.templates.template.desc" />}
                        name="description">
                        <Input.TextArea rows={ 3 } placeholder={formatMessage({id: 'job.templates.template.desc.placeholder'})}
                         />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="job.templates.enable" />}
                        name="enable" initialValue={ true }>
                        <Radio.Group>
                            <Radio value={ true }><FormattedMessage id="operation.yes" /></Radio>
                            <Radio value={ false }><FormattedMessage id="operation.no" /></Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)