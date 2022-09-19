import React, { memo, useState } from 'react'
import { Space, Input, Button, Row } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import produce from 'immer'

const EditSpan: React.FC<Record<string, any>> = (props) => {
    const { onOk, title, style, icon, width, rowkey } = props

    /* const getEditState = () => {
        const templateEdit = sessionStorage.getItem('template_edit')
        return templateEdit ? JSON.parse(templateEdit) : {}
    }

    const setEditState = (state: any) => sessionStorage.setItem('template_edit', JSON.stringify(state))

    const [context, setContext] = useState(getEditState()[rowkey]?.text || title)

    const [state, setState] = useState(getEditState()[rowkey]) */

    const [state, setState] = React.useState(false)
    const [context, setContext] = React.useState(title)

    const handleEdit = () => {
        /* const state = getEditState()
        setEditState(
            produce(
                state,
                (draftState: any) => {
                    draftState[rowkey] = {
                        text: title
                    }
                }
            )
        ) */
        setState(true)
    }

    const removeKey = () => {
        /* const state = getEditState()
        setEditState(
            produce(
                state,
                (draftState: any) => {
                    delete draftState[rowkey]
                }
            )
        ) */
        setState(false)
        setContext(title)
    }

    const handleCancel = () => {
        removeKey()
    }

    const hanldeContextChange = ({ target }: any) => {
        /* const state = getEditState()
        setEditState(
            produce(
                state,
                (draftState: any) => {
                    draftState[rowkey] = {
                        text: target.value
                    }
                }
            )
        ) */
        setContext(target.value)
    }

    const handleSave = () => {
        /* const state = getEditState()
        onOk(state[rowkey] ? state[rowkey].text : title) */
        onOk(context)
        removeKey()
    }

    const RowIcon: React.FC<any> = () => icon

    if (width <= 0) return <></>
    if (state)
        return (
            <Row >
                {/* icon 长度 20 */}
                {icon && <span style={{ marginRight: 8 }}><RowIcon /></span>}
                {/* width - 20 - 104 - 8 - 14 - 20  */}
                <Input
                    value={context || ''} size="small"
                    onChange={hanldeContextChange}
                    style={{ width: width - 120, marginRight: 8 }}
                />
                {/* 操作宽度 104 */}
                <Space>
                    <Button size="small" onClick={handleCancel}>取消</Button>
                    <Button size="small" type="primary" onClick={handleSave}>确定</Button>
                </Space>
            </Row>
        )
    return (
        <Row >
            {icon && <span style={{ marginRight: 8 }}><RowIcon /></span>}
            <div style={{ width: width - 20 }}>
                <span
                    style={{ ...style, marginRight: 8, wordBreak: 'break-all' }}
                >
                    {title || '-'}
                </span>
                <EditOutlined onClick={handleEdit} />
            </div>
        </Row>
    )
}

export default EditSpan