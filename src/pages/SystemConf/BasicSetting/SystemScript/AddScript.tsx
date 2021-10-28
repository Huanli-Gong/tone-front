import { Drawer, Space , Button , Form, Input, Select, Radio, message } from 'antd'
import React, { forwardRef , useState , useImperativeHandle } from 'react'
import styles from './index.less'
import { createCongfig , updateConfig } from '../services'
import { requestCodeMessage } from '@/utils/utils'

export default forwardRef(
    ( props : any , ref : any ) => {
        const [ form ] = Form.useForm()
        
        const [ padding , setPadding ] = useState( false )
        const [ visible , setVisible ] = useState( false )
        const [ title , setTitle ] = useState( '新增脚本' )
        const [msg, setMsg] = useState<string>()
        const [ editer , setEditer ] = useState<any>({})
    
        useImperativeHandle(
            ref ,
            () => ({
                show : ( title : string = "新增脚本" , data : any = {} ) => {
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
                message.success('操作成功')
                setVisible( false )
                form.resetFields()
            }else if(code === 1362){
                setMsg('config名称已存在')
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
                    if ( title === '新增脚本' ) {
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
                title={ title }
                width="380"
                onClose={ handleClose }
                visible={ visible }
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={ handleClose }>取消</Button>
                            <Button type="primary" disabled={ padding } onClick={ handleOk }>
                                { ~title.indexOf('编辑') ? '更新' : '确定'}
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
                        label="脚本名称" 
                        name="config_key" 
                        help={msg} 
                        rules={[{
                            required: true,
                            max:32,
                            pattern: /^[A-Za-z0-9\._-]+$/g,
                            message: '仅允许包含字母、数字、下划线、中划线、点，最长32个字符'
                        }]}
                    >
                        <Input autoComplete="auto" placeholder="请输入脚本" />
                    </Form.Item>
                    <Form.Item label="原子步骤" name="bind_stage">
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
                    <Form.Item label="是否启用" name="enable" initialValue={ true }>
                        <Radio.Group>
                            <Radio value={ true }>启用</Radio>
                            <Radio value={ false }>停用</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea placeholder="请输入描述信息"/>
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)