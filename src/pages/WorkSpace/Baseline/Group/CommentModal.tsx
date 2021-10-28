import { requestCodeMessage } from '@/utils/utils'
import { Input, Modal , message, Space, Typography, Form, Radio, Divider } from 'antd'
import React , { useState , useImperativeHandle , forwardRef, useEffect } from 'react'
import { updatefuncsDetail }  from '../services'
import styles from './index.less'
let padding = false
export default forwardRef(
    ({ onOk, setCurrentObj } : any , ref : any ) => {
        const ws_id = window.location.pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
        const [ visible , setVisible ] = useState( false )
        const [ info , setInfo ] = useState<any>({}) // 当前信息
        const [ form ] = Form.useForm()
        const [ val , setVal ] = useState( '' )
        useEffect(() => {
            setVal(form.getFieldValue('bug'))
        }, [visible])

        useImperativeHandle(
            ref , 
            () => ({
                show : ( item : any ) => { // ref.current.show( currentObj ) 中的参数值
                    setVisible( true )
                    setInfo( item )
                    form.setFieldsValue( item )
                }
            })
        )

        const handleOk = async () => {
            form
                .validateFields()
                .then(
                    async ( values : any ) => {
                        if ( padding ) return 
                        padding = true
                        const { code, msg } = await updatefuncsDetail({
                            id: info.id,
                            ws_id,
                            ...values
                        })
                        
                        padding = false
                        if (code === 200) {
                            setVisible(false)
                            setCurrentObj({...info,...values})
                            setInfo({})
                            onOk()
                            form.resetFields() //重置一组字段到 initialValues
                        }
                        else
                            requestCodeMessage( code , msg )
                    }
                ).catch(errorInfo => {
                    console.log(errorInfo)
                });
        }
    
        const handleCancel = () => {
            setVisible( false )
            form.resetFields() // 重置一组字段到 initialValues
        }
  

        return (
           
            <Modal
                title="编辑FailCase信息"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="更新"
                cancelText="取消"
                maskClosable={false}
                wrapClassName={'editFailCaseModal'}
            >
                <Space>
                    <Typography.Text className={styles.script_right_name}>FailCase</Typography.Text>
                    <Typography.Text>{info.sub_case_name}</Typography.Text>
                </Space>
                <div className={styles.line}>
                    <Divider style={{
                        borderTop: '10px solid #F5F5F5',
                    }} />
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    /*hideRequiredMark*/
                >
                    {/* <Form.Item rules={[{ required : true, pattern: /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/ }]} label="缺陷记录" name="bug"> // 有用 */}
                    <Form.Item rules={[{ required: true }]} label="缺陷记录" name="bug">
                        <Input autoComplete="off" onChange={((e)=> setVal(e.target.value))} title={val}/>
                        {/* <Input autoComplete="off"/> */}
                    </Form.Item>
                    <Form.Item label="问题描述（选填）" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item initialValue={info.impact_result} label="影响结果" name="impact_result">
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)