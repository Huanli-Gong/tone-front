import { requestCodeMessage } from '@/utils/utils'
import { Drawer , Space , Button , Form , Row , Input, Typography, message } from 'antd'
import React , { useState , forwardRef , useImperativeHandle } from 'react'
import { updateAnalysisNote } from '../services'

//编辑备注
export default forwardRef(
    ( props : any , ref : any ) => {
        const { showType , testType , onOk } = props
        const [ form ] = Form.useForm()
        const [ visible , setVisible ] = useState( false )
        const [ data , setData ] = useState<any>({ suite_name : '' , conf_name : '' })
        const [ padding , setPadding ] = useState( false )

        useImperativeHandle(
            ref , () => ({
                show : ( _ : any = false ) => {
                    setVisible( true )
                    if ( _ !== false ) {
                        setData( _ )
                        form.setFieldsValue({ note : _.note })
                    }
                },
                hide : handleClose
            })
        )

        const handleClose = () => {
            setVisible( false )
            setData( undefined )
            setPadding( false )
            form.resetFields()
        }

        const handleOk = () => {
            if ( padding ) return 
            setPadding( true )
            form
                .validateFields()
                .then(
                    async ( values : any ) => {
                        let editor_obj = 'perf_analysis'
                        if ( testType !== 'performance' ) {
                            editor_obj = 'func_case_analysis'
                            if ( showType === 'pass_rate' ) {
                                editor_obj = 'func_conf_analysis'
                            }
                        }
                        const { code , msg } = await updateAnalysisNote({ 
                            editor_obj, 
                            result_obj_id : data.result_obj_id , 
                            note : values.note 
                        })
                        setPadding( false )
                        if ( code !== 200 ) return requestCodeMessage( code , msg )
                        onOk()
                        handleClose()
                    }
                )
                .catch(( err ) => {
                    console.log( err )
                    setPadding( false )
                })
        }

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                width="376"
                title="编辑标注"
                visible={ visible }
                onClose={ handleClose }
                bodyStyle={{ padding : 0  }}
                footer={
                    <div style={{ textAlign: 'right', }} >
                        <Space>
                            <Button onClick={ handleClose }>取消</Button>
                            <Button type="primary" onClick={ handleOk } >更新</Button>
                        </Space>
                    </div>
                }
            >
                {
                    data && 
                    <Row style={{ marginBottom : 10 , background : '#fff' , padding : 20 , borderBottom : '10px solid #f0f2f5'}}>
                        <Typography.Text style={{ width : 70 , fontWeight : 600 , marginRight : 8 }}>Job名称</Typography.Text>
                        <Typography.Paragraph style={{ width : "calc( 100% - 70px - 8px)" , marginBottom : 0 }} ellipsis>{ data.job_name }</Typography.Paragraph>
                    </Row>
                }
                <Form
                    form={ form }
                    layout="vertical"
                    /*hideRequiredMark*/
                    style={{ background : '#fff' , padding : 20 , height : 'calc( 100% - 94px )'}}
                >
                    <Form.Item label="分析标注" name="note">
                        <Input.TextArea rows={ 8 } placeholder="请输入标注信息" />
                    </Form.Item>
                </Form>
            </Drawer>
        )
    }
)