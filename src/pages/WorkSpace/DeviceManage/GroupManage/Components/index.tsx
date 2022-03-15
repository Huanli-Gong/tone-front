import React from 'react'
import { Badge , Tag , Select , Drawer , Space , Button , Form , Popover } from 'antd'
import { queryMember } from '@/services/Workspace'
import { useParams } from 'umi'
import styles from './index.less'

export const getMembers = async ( keyword : string = '' , callback ? : any ) => {
    const { data } = await queryMember({ keyword, /* scope:'aligroup' */ }) //, scope : 'aligroup' 
    if ( callback ) callback( data )
    else return data
}

export const StateBadge = ( state : string , row : any ) => {
    const { ws_id } : any = useParams()

    switch( state ) {
        case 'Available' : return <Badge status="success" text="Available"/>
        case 'Occupied' : return (
            <Popover 
                placement="right" 
                trigger="hover" 
                overlayClassName={ styles.tag_popover_style }
                title={ 
                    <a href={ `/ws/${ ws_id }/test_result/${ row.occupied_job_id }`} target="_blank">
                        JobId #{ row.occupied_job_id }
                    </a>
                }
            >
                <Badge status="processing" text="Occupied"/>
            </Popover>
        )
        case 'Reserved' : return <Badge status="success" text="Reserved"/>
        case 'Broken' : return (
            <Popover 
                placement="right" 
                trigger="hover" 
                overlayClassName={ styles.tag_popover_style }
                title={ row.broken_reason }
            >
                <Badge status="error" text="Broken"/>
            </Popover>
        )
        case 'Unusable' : return <Badge status="default" text="Unusable"/>
        default : return <div>-</div>
    }
}

export const DrawerForm = ( props : any ) => {
    const { visible , width , title , children , onCancel , onFinish , onClose } = props
    const options = { width , title , visible , onClose }
    
    return (
        <Drawer 
            keyboard={ false } 
            { ...options }
            forceRender={ true }
            maskClosable={ false }
            footer={
                <div style={{ textAlign: 'right' }} >
                    <Space>
                        <Button onClick={ onCancel }>取消</Button>
                        <Button type="primary" onClick={ onFinish }>确定</Button>
                    </Space>
                </div>
            }
        >
            { children }
        </Drawer>
    )
}

export const MemberSelect  = ({ members , callback , rules , initialValue } : any ) => (
    <Form.Item 
        name="owner" 
        label="Owner"
        rules={ rules }
        initialValue={ initialValue }
    >
        <Select 
            placeholder="请输入" 
            defaultActiveFirstOption={false}
            filterOption={false}
            showSearch
            getPopupContainer={ node => node.parentNode } 
            onSearch={ ( word ) => getMembers( word , callback ) }
        >
            {
                members.map(
                    ( item : any ) => (
                        <Select.Option 
                            key={ item.id } 
                            value={ item.id }
                        >
                            { item.last_name }
                        </Select.Option>
                    )
                )
            }
        </Select>
    </Form.Item>
)

export const tagRender = ( { label, closable, onClose , value } : any ) => (
    <Tag 
        color={ label.props?.color } 
        closable={closable} 
        onClose={onClose} 
        style={{ marginRight: 3 }}
    >
        { label.props?.children || value }
    </Tag>
)

export const TagSelect = (
    { 
        tags , 
        rules , 
        initialValue , 
        label = '标签' , 
        name = 'tags' , 
        placeholder = '请选择标签' , 
        disabled = false 
    } : any 
) => (
    <Form.Item 
        name={ name } 
        label={ label }
        rules={ rules }
        initialValue={ initialValue && initialValue.map( ( item : any ) => item.id ) }
    >
        <Select 
            placeholder={ placeholder }
            mode="multiple"
            disabled={ disabled }
            tagRender={ tagRender }
            allowClear
            getPopupContainer={ node => node.parentNode } 
        >
            {
                tags.map(
                    ( item:any ) => (
                        <Select.Option key={ item.id } value={ item.id }>
                            <Tag color={ item.tag_color } >{ item.name }</Tag>
                        </Select.Option>
                    )
                )
            }
        </Select>
    </Form.Item>
)