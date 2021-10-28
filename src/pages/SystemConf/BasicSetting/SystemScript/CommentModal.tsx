import { requestCodeMessage } from '@/utils/utils'
import { Input, Modal , message } from 'antd'
import React , { useState , useImperativeHandle , forwardRef } from 'react'

import { updateConfig }  from '../services'

export default forwardRef(
    ({ onOk } : any , ref : any ) => {
        const PAGE_DEFAULT_PARAMS = { config_type : 'script' }

        const [ visible , setVisible ] = useState( false )
        const [ padding , setPadding ] = useState( false )
        const [ common , setCommon ] = useState('')

        const [ info , setInfo ] = useState<any>({})

        useImperativeHandle(
            ref , 
            () => ({
                show : ( item : any ) => {
                    setVisible( true )
                    setInfo( item )
                }
            })
        )
    
        const handleOk = async () => {
            if ( padding ) return 
            setPadding( true )
            const { code , msg } = await updateConfig({ 
                ...PAGE_DEFAULT_PARAMS , 
                commit : common,
                config_value : info.config_value , 
                config_id : info.id 
            })
            if ( code === 200 ) {
                onOk()
                handleCancel()
            }
            else {
                requestCodeMessage( code , msg )
                setPadding ( false )
            }
        }
    
        const handleCancel = () => {
            setVisible( false )
            setCommon( '' )
            setInfo( {} )
            setPadding( false )
        }
    
        return (
            <Modal
                title="Comment"
                visible={visible}
                onOk={ handleOk }
                onCancel={ handleCancel }
                okText="确认"
                cancelText="取消"
                maskClosable={ false }
            >
                <Input.TextArea 
                    placeholder="请输入Comment信息" 
                    value={ common }
                    rows={ 4 }
                    onChange={ ({ target }) => setCommon( target.value )}
                />
            </Modal>
        )
    }
)