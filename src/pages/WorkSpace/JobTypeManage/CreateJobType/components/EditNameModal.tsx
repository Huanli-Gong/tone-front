import React , { forwardRef , useImperativeHandle , useState , useRef } from 'react'
import { Form , Modal , Input , Space , Button ,} from 'antd'
import { EditTwoTone } from '@ant-design/icons'
import { FormattedMessage, useIntl  } from 'umi'
import styles from './index.less'

export const EditNameModal = forwardRef(
    ({ onOk } : any , ref ) => {
        const { formatMessage } = useIntl()
        const [ visible , setVisible ] = useState( false )
        const [ id , setId ] = useState( null )
    
        const [ form ] = Form.useForm()
    
        useImperativeHandle(
            ref , 
            () => ({
                show : ({ id , alias , show_name } : any ) => {
                    setId( id )
                    form.setFieldsValue({ alias : alias || show_name })
                    setVisible( true )
                }
            })
        )
    
        const handleOk = () => {
            form
                .validateFields()
                .then( ({ alias }) => {
                    onOk( alias , id )
                    form.resetFields()
                    setVisible( false )
                    setId( null )
                })
                .catch(err => console.log( err ))
        }
    
        const handleCancel = () => {
            setVisible( false )
            form.resetFields()
        }
    
        return (
            <Modal 
                title={<FormattedMessage id="job.types.modify.name"/>}
                visible={ visible }
                onCancel={ handleCancel }
                onOk={ handleOk }
                cancelText={<FormattedMessage id="operation.cancel"/>}
                okText={<FormattedMessage id="operation.ok"/>}
                maskClosable={ false }
            >
                <Form 
                    form={ form }
                    /*hideRequiredMark*/ 
                    layout="vertical"
                >
                    <Form.Item 
                        label={<FormattedMessage id="job.types.alias"/>}
                        name="alias" 
                        rules={[{ max : 10 }]}>
                        <Input autoComplete="off" placeholder={formatMessage({id: 'job.types.alias.placeholder'}) }/>
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
)

export const EditShowName = ({ name , item , onEdit } : any ) => {
    const [ color , setColor ] = useState('')
    const [ edit , setEdit ] = useState( false )
    const [ val , setVal ]  = useState( null )

    const handleHoverEdit = () => setColor('#1890ff')

    const handleLeaveEdit = () => setColor('')

    const modalRef : any = useRef( null )
    const handleEidtOk = () => {
        onEdit( name , item.id , val )
        setEdit( false )
        setColor('')
    }

    const handleOk = ( alias : string , id : number  ) => {
        onEdit( name , id , alias )
    }

    if ( edit )
        return (
            <Space>
                <Input autoComplete="off" size="small" defaultValue={ item.alias } onChange={ (evt:any) => setVal( evt.target.value ) } />
                <Button size="small" type="primary" onClick={ handleEidtOk }><FormattedMessage id="operation.save"/></Button>
                <Button size="small" onClick={ () => {
                    setEdit( false )
                    setColor('')
                }}><FormattedMessage id="operation.cancel"/></Button>
            </Space>
        )

    return (
        <Space
            onMouseEnter={ handleHoverEdit }
            onMouseLeave={ handleLeaveEdit }
        >
            <span style={{ color }} className={ styles.step_check_name }>
                { item.alias || item.show_name }
            </span>
            { color && <EditTwoTone onClick={ () => modalRef.current.show( item ) } /> }
            <EditNameModal ref={ modalRef } onOk={ handleOk } />
        </Space>
    )
}