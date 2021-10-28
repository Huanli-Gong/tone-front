import React, { memo, useState } from 'react'
import { Space , Input , Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'

const EditSpan = (props: any) => {
    const { onOk , title , style, btn = true } = props
    const [edit, setEdit] = useState(false)
    const [ context , setContext ] = useState( title )

    const handleEdit = () => {
        setEdit( true )
    }

    const handleCancel = () => {
        setEdit( false )
    }

    const hanldeContextChange = ({ target } : any ) => {
        setContext( target.value )
    }

    const handleSave = () => {
        onOk( context )
        setEdit( false )
    }

    if ( edit ) 
        return (
            <Space>
                <Input value={ context } size="small" onChange={ hanldeContextChange } style={{ width : 300 }}/>
                <Space>
                    <Button size="small" onClick={ handleCancel }>取消</Button>
                    <Button size="small" type="primary" onClick={ handleSave }>确定</Button>
                </Space>
            </Space>
        )
    return (
        <Space>
            <span style={ style }>{ context || '-' }</span>
            { btn && <EditOutlined onClick={ handleEdit }/> }
        </Space> 
    )
}

export default memo( EditSpan )