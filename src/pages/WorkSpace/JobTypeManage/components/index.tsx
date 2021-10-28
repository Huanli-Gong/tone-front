import React , { forwardRef , useState , useImperativeHandle } from 'react'
import { Input , Modal , Button , Space , Row, } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
export const EditTalbeCell : React.FC<any> = ({ priority , id , onChange , size }) => {
    const handleChange = ({ target } : any ) => {
        if ( priority === +target.value ) return;
        if ( typeof +target.value === 'number' ) {
            onChange( id , +target.value )
        }
    }
    
    return (
        <Input 
            defaultValue={ priority }
            style={{ textAlign : 'center' }}
            size={ size || undefined }
            onBlur={ handleChange }
        />
    )
}

export const JobTypeDeleteModal : React.FC<any> = forwardRef(
    ({ onOk } , ref ) => {
        const [ visible , setVisible ] = useState( false )
        const [ secondary , setSecondary ] = useState( false )
        const [ data , setData ] = useState<any>({})
        const [ padding , setPadding ] = useState( false )
        useImperativeHandle(
            ref,
            () => ({
                show : ( _ : any ) => {
                    setVisible( true )
                    _ && setData( _ )
                },
                hide : () => {
                    handleCancle()
                }
            })
        )
        const handleSecond = () => {
            setSecondary(true)
            handleCancle()
        }
        const handleDetail = () => {
            window.open(`/ws/${data.ws_id}/refenerce/2/?name=${data.name}&id=${data.id}`)
        }
        const handleOk = async () => {
            if ( padding ) return 
            setPadding( true )
            onOk( data )
            handleSecondCancle()
        }

        const handleCancle = () => {
            setVisible( false )
            //setData({})
            setPadding( false )
        }
        const handleSecondCancle = () => {
            setSecondary( false )
        }
        return (
            <>
            <Modal
                width={ 600 }
                title="删除提示"
                visible={ visible }
                onCancel={handleCancle}
                footer={
                    <Row justify="end">
                        <Space>
                            {
                                data.is_first ?
                                    <Button disabled={ true } >确定删除</Button> :
                                    <Button onClick={ handleSecond }>确定删除</Button>
                            }
                            <Button onClick={ handleCancle } type="primary">取消</Button>
                            
                        </Space>
                    </Row>
                }
            >
                {
                    data.is_first ?
                        <span>不可删除默认Job类型，请切换默认Job类型后再删除！</span> :
                        <>
                            <div style={{ color:'red',marginBottom: 5 }}> 
                                <ExclamationCircleOutlined style={{ marginRight: 4 	}}/>
                                该操作将删除当前job类型以及应用该job类型的模板，请谨慎删除！！
                            </div>
                            <div style={{ color:'rgba(0,0,0,0.45)',marginBottom: 5 }}>
                                删除job类型会对以下几个操作产生影响：<br/>
                                1、会删除测试模板（因为测试模板无法渲染）<br/>
                                2、会影响job的重跑
                            </div>
                            <div style={{ color:'#1890FF',cursor:'pointer' }} onClick={handleDetail}>查看引用详情</div>
                        </>
                }
            </Modal>
            <Modal
            width={ 600 }
            title="删除提示"
            visible={ secondary }
            onCancel={handleSecondCancle}
            footer={
                <Row justify="end">
                    <Space>
                        {
                            data.is_first ?
                                <Button disabled={ true } >确定删除</Button> :
                                <Button onClick={ handleOk }>确定删除</Button>
                        }
                        <Button onClick={ handleSecondCancle } type="primary">取消</Button>
                        
                    </Space>
                </Row>
            }
        >
            {
                data.is_first ?
                    <span>不可删除默认Job类型，请切换默认Job类型后再删除！</span> :
                    <>
                        <div style={{ color:'red',marginBottom: 5 }}> 
                            <ExclamationCircleOutlined style={{ marginRight: 4 	}}/>
                            如果不需要该job类型显示在使用列表中，建议禁用该job类型，不要随意删除！！
                        </div>
                        <div style={{ color:'rgba(0,0,0,0.45)',marginBottom: 5 }}>
                            删除job类型会对以下几个操作产生影响：<br/>
                            1、会删除测试模板（因为测试模板无法渲染）<br/>
                            2、会影响job的重跑
                        </div>
                    </>
            }
        </Modal>
        </>
        )
    }
)