import { Drawer, Space , Button , Form, Input, Select, Radio, message } from 'antd'
import React, { forwardRef , useState , useImperativeHandle } from 'react'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import styles from './index.less'
import { createCongfig , updateConfig } from '../services'
import { requestCodeMessage } from '@/utils/utils'

export default forwardRef(
    ( props : any , ref : any ) => {
        const { formatMessage } = useIntl()
        const [ form ] = Form.useForm()
        
        const [ padding , setPadding ] = useState( false )
        const [ visible , setVisible ] = useState( false )
        const [ title , setTitle ] = useState('new')
        const [msg, setMsg] = useState<string>()
        const [ editer , setEditer ] = useState<any>({})
    
        useImperativeHandle(
            ref ,
            () => ({
                show : ( title : string = "new" , data : any = {} ) => {
                    setVisible( true )
                    setTitle( title )
                    setEditer( data )
                    form.setFieldsValue( data )
                }
            })
        )
    
        const handleClose = () => {
            form.resetFields()
            setPadding( false )
            setVisible( false )
            setMsg(undefined)
        }

        const defaultOption = ( code : number , msg : string ) => {
            if ( code === 200 ) {
                props.onOk()
                message.success(formatMessage({id: 'operation.success'}) )
                setVisible( false )
                form.resetFields()
            }else if(code === 1362){
                setMsg(formatMessage({id: 'basic.config.name.already.exists'}))
            }
            else {
                requestCodeMessage( code , msg )
            }
            setPadding ( false )
        }
    
        const handleOk = () => {
            setPadding( true )
            form.validateFields()
                .then( async ( values ) => {
                    if ( title === 'new' ) {
                        const { code , msg } = await createCongfig({ config_type : 'script' , ...values })
                        defaultOption(code , msg )
                    }
                    else {
                        const { code , msg } = await updateConfig({ config_type : 'script' , config_id : editer.id , ...values })
                        defaultOption(code , msg )
                    }
                })
                .catch( err => {
                    setPadding( false )
                    console.log( err )
                })
        }
    
        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false } 
                title={<FormattedMessage id={`basic.addScript.${title}`}/>  }
                width="380"
                onClose={ handleClose }
                visible={ visible }
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={ handleClose }><FormattedMessage id="operation.cancel"/></Button>
                            <Button type="primary" disabled={ padding } onClick={ handleOk }>
                                { ~title.indexOf('edit') ? <FormattedMessage id="operation.update"/> : <FormattedMessage id="operation.ok"/>}
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Form 
                    form={ form }
                    layout="vertical"
                    /*hideRequiredMark*/
                    className={styles.system_form}
                >
                    <Form.Item 
                        label={<FormattedMessage id="basic.script_name"/>}
                        name="config_key" 
                        help={msg} 
                        rules={[{
                            required: true,
                            max:32,
                            pattern: /^[A-Za-z0-9\._-]+$/g,
                            message: formatMessage({id: 'please.enter.message'}) 
                        }]}
                    >
                        <Input autoComplete="auto" placeholder={formatMessage({id: 'basic.please.enter.script_name'})} />
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="basic.atomic_step"/>} name="bind_stage">
                        <Select>
                            {
                                props.stage?.map(
                                    ( item : any ) => (
                                        <Select.Option 
                                            key={ item.value } 
                                            value={ item.value }
                                        >
                                            { item.name }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="basic.is_enable"/>} name="enable" initialValue={ true }>
                        <Radio.Group>
                            <Radio value={ true }><FormattedMessage id="basic.enable"/></Radio>
                            <Radio value={ false }><FormattedMessage id="basic.stop"/></Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label={<FormattedMessage id="basic.desc"/>} name="description">
                        <Input.TextArea placeholder={formatMessage({id: 'basic.please.enter.desc'})} />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)