import React, { forwardRef, useImperativeHandle , useState , useCallback } from 'react'
import { Drawer , Button , Input } from 'antd'
import { useIntl, FormattedMessage } from 'umi'

//快速修改说明
export default forwardRef(
    ({ onOk } : any , ref : any ) => {
        const { formatMessage } = useIntl()
        const [ val , setVal ] = useState<any>('')
        const [ visible , setVisible ] = useState( false )
        const [ data , setData ] = useState<any>({})

        useImperativeHandle( ref , () => ({
            show : ( _ : any ) => {
                setVisible( true )
                setVal( _.doc )
                setData( _ )
            },
            hide : handleCancle
        }))

        const handleOk = () => {
            onOk({
                ...data,
                doc : val
            })
        }

        const handleCancle = useCallback(() => {
            setVal( '' )
            setVisible( false )
            setData({})
        },[])

        const handleChange = useCallback(({ target } : any ) => setVal( target.value ) , [])

        return (
            <Drawer 
                maskClosable={ false }
                keyboard={ false }
                width={ 376 }
                title={<FormattedMessage id="TestSuite.description.details"/>}
                onClose={ handleCancle }
                visible={ visible }
                footer={
                    <div style={{textAlign: 'right'}} >
                        <Button onClick={ handleCancle } style={{ marginRight: 8 }}>
                            <FormattedMessage id="operation.cancel"/>
                        </Button>
                        <Button onClick={ handleOk } type="primary" htmlType="submit" >
                            <FormattedMessage id="operation.ok"/>
                        </Button>
                    </div>
                }
            >
                <Input.TextArea 
                    style={{ height: '100%' }} 
                    rows={ 6 } 
                    value={ val } 
                    onChange={ handleChange } 
                />
            </Drawer>
        )
    }
)