import React , { useState , forwardRef , useImperativeHandle , useContext } from 'react'
import { Popover, Drawer , Button , Form , Row , Col , Input , Select , InputNumber , Space , Radio , message } from 'antd'
import styles from '../../style.less'
import { DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { TestContext } from '@/pages/SystemConf/SuiteMangement/Provider'


export default forwardRef (
    ({ onOk  } : any , ref : any ) => {
        const { domainList , key } = useContext(TestContext)
        const [ form ] = Form.useForm()
        const [ visible , setVisible ] = useState( false )
        const [ title , setTitle ] = useState('')
        const [ handle, setHandle ] = useState<boolean>(true)

        const [ data , setData ] = useState<any>({ bentch : false })

        const [ pending , setPending ] = useState( false )

        useImperativeHandle(
            ref,
            () => ({
                show : ( t : string , _ : any ) => {
                    t && setTitle( t )
                    setData( _ )
                    setVisible( true )
                    let params : any = { 
                        ..._ ,
                        certificated: _.certificated ? 1 : 0,
                    }
                    if ( domainList.length && ~ t.indexOf('新增')) {
                        domainList.forEach(( { id , name } : any ) => {
                            if ( name === '其他' ) params.domain_list_str = [ id ]
                        })
                    }
                    form.setFieldsValue( params )
                },
                hide : handleCancel
            }),
        )

        const handleCancel = () => {
            setData({ bentch : false })
            setHandle( true )
            setVisible( false )
            setTitle('')
            form.resetFields()
            setPending( false )
        }

        const handleOk = () => {
            if ( pending ) return ;
            setPending( true )
            form.validateFields()
                .then(
                    ( values : any ) => {
                        const { id , test_suite_id } = data
                        onOk({ 
                            ...values , 
                            id , 
                            test_suite_id,
                            domain_list_str : values.domain_list_str ? values.domain_list_str.join() : ''
                        } , data.bentch )
                    }
                )
                .catch(
                    ( error ) => {
                        console.log( error )
                        setPending( false )
                    }
                )
        }

        const validCell = (rule: any, value: any, callback: any, index: any) => {
            let content = form.getFieldValue('var')
            let param = content[index]
            if ((param.name !== '' && param.val !== '' && param.des !== '') || (param.name === '' && param.val === '' && param.des === '')) {
                callback()
                return
            } else {
                if (value == '') {
                    callback('请输入');
                    return
                }
            }
            callback()
        }

        const validFunction = (rule: any, value: any, callback: any) => {
            try {
                let valid = JSON.parse(value)
                if (Object.prototype.toString.call(valid) === '[object Array]') {
                    let len = valid.length
                    for (var i = 0; i < len; i++) {
                        if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                            callback('变量数据格式错误');
                            return
                        }
                    }
                } else {
                    callback('变量数据格式错误');
                    return
                }
            } catch (e) {
                callback('变量数据格式错误');
                return
            }
            callback()
        }

        const handleChangeValueStyle = () => {
            let content = form.getFieldValue('var')
            if (!handle) {
                try {
                    let valid = JSON.parse(content)
                    if (Object.prototype.toString.call(valid) === '[object Array]') {
                        let len = valid.length
                        for (var i = 0; i < len; i++) {
                            if (!(Object.prototype.toString.call(valid[i]) === '[object Object]')) {
                                message.error('变量数据格式错误');
                                return
                            }
                        }
                    } else {
                        message.error('变量数据格式错误');
                        return
                    }
                } catch (e) {
                    message.error('变量数据格式错误');
                    return
                }
            }
            form.setFieldsValue({ var: handle ? JSON.stringify(content, null, 4) : JSON.parse(content) })
            setHandle(!handle)
        }

        const qesContent = (
            <div>
                <p>只有认证过得用例才能同步到Testfarm</p>
            </div>
        )

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                title={ title }
                className={ styles.warp }
                forceRender={ true }
                destroyOnClose={ true }
                width={ 376 }
                onClose={ handleCancel }
                visible={ visible }
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }} >
                        <Button onClick={ handleCancel } style={{ marginRight: 8 }}>
                            取消
                        </Button>
                        <Button onClick={ handleOk } type="primary" htmlType="submit" >
                            { title.indexOf('新增') > -1 ? '确定' : '更新'}
                        </Button>
                    </div>
                }
            >
                <Form 
                    layout="vertical" 
                    form={ form } 
                    /*hideRequiredMark*/ 
                    initialValues={{
                        repeat : key === 'performance' ? 3 : 1,
                        is_default : 1,
                        var : [{ name: '', val: '', des: '' }],
                    }}
                >
                    <Row gutter={16}>
                        {
                            !data.bentch &&
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label="Test Conf"
                                    rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input autoComplete="off" placeholder="请输入" />
                                </Form.Item>
                            </Col>
                        }
                        {
                            !data.bentch && 
                            <Col span={24}>
                                <Form.Item
                                    name="alias"
                                    label="别名"
                                    // rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input placeholder="请输入Test Conf别名" />
                                </Form.Item>
                            </Col>
                        }
                        <Col span={24}>
                            <Form.Item
                                name="domain_list_str"
                                label="领域"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Select placeholder="请选择" mode="multiple" getPopupContainer={ node => node.parentNode } >
                                    {
                                        domainList.map(( item: any ) => (
                                            <Select.Option value={ item.id } key={item.id}>{item.name}</Select.Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="timeout"
                                label="最大运行时长（秒）"
                                rules={[{ required: true, message: '请输入' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={ 0 } step={ 1 } placeholder="请输入" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="repeat"
                                label="运行次数"
                                rules={[{ required: true, message: '请输入' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={ 1 } step={ 1 } placeholder="请输入" />
                            </Form.Item>
                        </Col>
                        {
                            !data.bentch && 
                            <Col span={24}>
                                <Button
                                    style={{ position: 'absolute', right: 0, zIndex: 99 }}
                                    type="link"
                                    size="small"
                                    onClick={ handleChangeValueStyle }
                                >
                                    {handle ? 'Bulk Edit' : 'Key-Value Edit'}
                                </Button>
                                {
                                    !handle ?
                                    <Form.Item
                                        name="var"
                                        label="变量"
                                        rules={[{ validator: validFunction }]}
                                    >
                                        <Input.TextArea rows={4} style={{ width: '100%' }} placeholder="格式：key=value, description，多个换行" />
                                    </Form.Item> :
                                    <Form.List name="var" >
                                        {(fields, { add, remove }) => {
                                            return (
                                                <div>
                                                    {fields.map((field : any, index : any ) => (
                                                        <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                                                            <Form.Item
                                                                label={index == 0 ? '变量' : null}
                                                                {...field}
                                                                name={[field.name, 'name']}
                                                                fieldKey={[field.fieldKey, 'name']}
                                                                rules={[{
                                                                    validator(rule, value, callback) { validCell(rule, value, callback, index) },
                                                                }]}
                                                            >
                                                                <Input autoComplete="off" placeholder="变量名" />
                                                            </Form.Item>
                                                            <div style={{ paddingTop: index == 0 ? '33px' : '0' }}>=</div>
                                                            <Form.Item
                                                                label={index == 0 ? " " : null}
                                                                {...field}
                                                                name={[field.name, 'val']}
                                                                fieldKey={[field.fieldKey, 'val']}
                                                                // rules={[{
                                                                //     validator(rule, value, callback) { validCell(rule, value, callback, index) },
                                                                // }]}
                                                            >
                                                                <Input autoComplete="off" placeholder="默认值" />
                                                            </Form.Item>
                                                            <div style={{ paddingTop: index == 0 ? '38px' : '0' }}>,</div>
                                                            <Form.Item
                                                                label={index == 0 ? " " : null}
                                                                {...field}
                                                                name={[field.name, 'des']}
                                                                fieldKey={[field.fieldKey, 'des']}
                                                            >
                                                                <Input autoComplete="off" placeholder="变量说明" />
                                                            </Form.Item>

                                                            {fields.length>1?
                                                            <div style={{ paddingTop: index == 0 ? '30px' : '0' }}>
                                                                <DeleteOutlined
                                                                    className="dynamic-delete-button"
                                                                    style={{ margin: '8px 0' }}
                                                                    onClick={() => {
                                                                        remove(field.name);
                                                                    }}
                                                                />
                                                            </div>:
                                                            <div style={{ width:'14px' }}> </div>
                                                            }
                                                        </Space>
                                                    ))}

                                                    <Button
                                                        style={{ width: 100, padding: 0, textAlign: 'left', marginBottom: 8 }}
                                                        type="link"
                                                        size="small"
                                                        onClick={() => {
                                                            let content = form.getFieldValue('var')
                                                            content.push({ name: '', val: '', des: '' })
                                                            form.setFieldsValue({ var: content })
                                                        }}
                                                        block
                                                    >
                                                        + 添加变量
                                                    </Button>

                                                </div>
                                            );
                                        }}
                                    </Form.List>
                                }
                            </Col>
                        }
                        {
                            !data.bentch && 
                            <Col span={24}>
                                <Form.Item
                                    name="is_default"
                                    label="默认用例"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Radio.Group>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        }
                        {
                            !data.bentch && 
                            <Col span={24}>
                                <Form.Item
                                    name="certificated"
                                    label={
                                        <span>
                                            是否认证&nbsp;
                                            <Popover
                                            overlayClassName={styles.cer_tips}
                                             content={qesContent} 
                                             placement="bottomLeft" 
                                             destroyTooltipOnHide={true}>
                                                <QuestionCircleOutlined />
                                            </Popover>
                                        </span>
                                    }
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                        <Radio.Group>
                                            <Radio value={1}>是</Radio>
                                            <Radio value={0}>否</Radio>
                                            
                                        </Radio.Group>
                                </Form.Item>
                            </Col>
                        }
                        {
                            !data.bentch && 
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="说明"
                                >
                                    <Input.TextArea rows={4} placeholder="请输入Test Conf说明" />
                                </Form.Item>
                            </Col>
                        }
                        
                    </Row>
                </Form>
            </Drawer>
        )
    }
)