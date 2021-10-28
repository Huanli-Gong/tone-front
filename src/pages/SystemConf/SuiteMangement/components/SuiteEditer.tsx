import React , { useState , forwardRef , useImperativeHandle, useContext  } from 'react'
import { Drawer , Button , Form , Spin , Col , Row , Select , Input , Radio , Empty, Popover } from 'antd'
import styles from '../style.less'
import { member, validateSuite } from '../service'
import { useRequest } from 'umi'
import _ from 'lodash'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { TestContext } from '@/pages/SystemConf/SuiteMangement/Provider'
const runList = [{ id: 'standalone', name: '单机' }, { id: 'cluster', name: '集群' }]
const viewType = [{ id: 'Type1',name:'所有指标拆分展示(Type1)'}, { id: 'Type2',name:'多Conf同指标合并(Type2)' },{ id: 'Type3',name:'单Conf多指标合并(Type3)' }]

/**
 * @module 系统级
 * @description 新增、编辑suite级
 */
export default forwardRef (
    ({ onOk  }: any , ref : any ) => {
        const [ form ] = Form.useForm()
        const { domainList , key } = useContext(TestContext)
        const [ visible , setVisible ] = useState( false )
        const [ validateStatus , setValidateStatus ] = useState<any>( '' )
        const [ help, setHelp ] = useState<string | undefined>()
        const [ fetch, setFetch ] = useState<boolean>(false)
        const [ title , setTitle ] = useState('新增Test Suite')
        const [ disable , setDisable ] = useState( false )
        const [ dataSource , setDataSource ] = useState<any>({})

        const { data : user , loading : fetchLoading , run : fetchUserRunner } = useRequest(
            ( keyword = '',) => member({ keyword,  scope:'aligroup' }),
            {
                initialData : [],
                debounceInterval : 300,
            }
        )

        useImperativeHandle(ref , () => ({
            show : ( t : any , d : any = {} ) =>  {
                setTitle( t )
                setVisible( true )
                setDisable( false )
                setDataSource( d )
                form.setFieldsValue({
                    ...d,
                    test_type:key,
                    owner : d.owner_name,
                    certificated: d.certificated ? 1 : 0
                })
            },
            hide : handleCancel
        }))
  
        const handleOk = () => {
            form.validateFields().then(val => {
                
                if (!val.name || val.name.replace(/\s+/g, "") == '') {
                    setValidateStatus('error')
                    setHelp('请输入')
                    return
                }
                val.name = val.name.replace(/\s+/g, "")
                setDisable( true )
                if ( val.owner === dataSource.owner_name ) val.owner = dataSource.owner 
                val.domain_list_str = val.domain_list_str.join()
                onOk(val , dataSource.id ? dataSource.id : '' )
                setDisable( false )
            }).catch(err => {
                if (!err.values.name || err.values.name.replace(/\s+/g, "") == '') {
                    setValidateStatus('error')
                    setHelp('请输入')
                }
                setDisable( false )
            })
        }

        const handleBlur = async (e: any) => {
            const name = e.target.value.replace(/\s+/g, "")
            if (!name) {
                setValidateStatus('error')
                setHelp('请输入')
                return
            }
            setValidateStatus('validating')
            setFetch(true)
            const data = await validateSuite({ suite_name : name , test_type:key  })
            setFetch(false)
            if (data.code != 200) {
                setValidateStatus('error')
                setHelp(data.msg)
                setDisable( true )
            } else {
                setValidateStatus('')
                setHelp(undefined)
                setDisable( false )
            }
        }
        const hanldFocus = () => {
            setDisable( false )
        }

        const handleChange = () => {
            setHelp(undefined)
            setValidateStatus('')
        }
        
        const handleSearch = async (word: any = "") => {
            fetchUserRunner( word )
        }
        const handleCancel = () => {
            setVisible( false )
            setDisable( false )
            form.resetFields()
            setHelp(undefined)
            setValidateStatus('')
            setDataSource({})
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
                className={styles.warp}
                forceRender={true}
                destroyOnClose={true}
                title={ title }
                width={376}
                onClose={ handleCancel }
                visible={visible}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={ handleCancel } style={{ marginRight: 8 }}>取消</Button>
                        <Button onClick={ handleOk } disabled={ disable } type="primary" htmlType="submit" >
                            { ~title.indexOf('编辑') ? '更新' : '确定' }
                        </Button>
                    </div>
                }
            >
                <Spin spinning={fetch} >
                    <Form 
                        layout="vertical" 
                        form={form} 
                        /*hideRequiredMark*/ 
                        initialValues={{ is_default: 1,view_type:'Type1' }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label="Test Suite"
                                    validateStatus={validateStatus}
                                    help={help}
                                    rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input 
                                        autoComplete="off" 
                                        placeholder="请输入" 
                                        onBlur={ handleBlur } 
                                        onFocus = { hanldFocus }
                                        onChange={ handleChange } 
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="test_type"
                                    label="测试类型"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" disabled getPopupContainer={ node => node.parentNode }>
                                        <Select.Option value="functional">功能测试</Select.Option>
                                        <Select.Option value="performance">性能测试</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="run_mode"
                                    label="运行模式"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" getPopupContainer={ node => node.parentNode }>
                                        {
                                            runList.map((item: any, index: number) => {
                                                return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            {
                                key !== 'functional' &&
                                <Col span={24}>
                                    <Form.Item
                                        name="view_type"
                                        label="视图类型"
                                    >
                                        <Select placeholder="请选择">
                                            {
                                                viewType.map((item: any, index: number) => {
                                                    return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                                })
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                            }
                            <Col span={24}>
                                <Form.Item
                                    name="domain_list_str"
                                    label="领域"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" mode="multiple" getPopupContainer={ node => node.parentNode }>
                                        {
                                            domainList.map((item: any, index: number) => {
                                                return <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="emp_id"
                                    label="Owner"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select
                                        allowClear
                                        notFoundContent={
                                            fetchLoading ? 
                                                <Spin size="small" /> : 
                                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                        }
                                        filterOption={false}
                                        onSearch={ handleSearch }
                                        style={{ width: '100%' }}
                                        showArrow={false}
                                        showSearch
                                        getPopupContainer={ node => node.parentNode }
                                    >
                                        {
                                            user?.map((item: any,index:number) => {
                                                return (
                                                <Select.Option 
                                                    value={ item.emp_id } 
                                                    key={ index }
                                                >
                                                    {item.last_name}({item.first_name === "" ?item.last_name : item.first_name}) - {item.emp_id}
                                                </Select.Option>
                                            )})
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
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
                            <Col span={24}>
                                <Form.Item
                                    name="doc"
                                    label="说明"
                                >
                                    <Input.TextArea rows={3} placeholder="请输入Test Suite说明" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="备注"
                                >
                                    <Input.TextArea rows={3} placeholder="请输入" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Drawer>
        )
    }
)