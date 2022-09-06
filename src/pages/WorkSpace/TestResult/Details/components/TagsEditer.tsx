import React, { useState , useEffect , useRef } from 'react'
import { Button, Select, Space, Tag , Row } from 'antd'

import { tagList as queryTagList } from '@/pages/WorkSpace/TagManage/service'
import { useRequest, Access, useAccess, useIntl, FormattedMessage } from 'umi'
import { EditOutlined, PlusOutlined} from '@ant-design/icons'
import { updateJobTags } from '../service'

import JobTagsCreate from './JobTagsCreate'

import styles from './index.less'
import { requestCodeMessage, AccessTootip } from '@/utils/utils'

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

export default ({ tags = [] , onOk , ws_id , job_id, creator_id, accessLabel } : any ) => {
    
    const [ state , setState ] = useState( false )
    const [ keys , setKeys ] = useState([])
    const access = useAccess();
    const { data : tagList , loading , refresh,  run : getTagList } = useRequest(() => queryTagList({ ws_id }) , { manual : true , initialData : [] })
    const jobTagsCreateModal : any = useRef( null )
    const handleOk = async () => {
        console.log( keys )
        const { code , msg } = await updateJobTags({ job_id , tag_id : keys , ws_id})
        if ( code !== 200 ) {
            requestCodeMessage( code , msg )
            return ;
        }
        onOk()
        handleCancel()
    }

    useEffect(() => {
        getTagList()
    }, [ ws_id ])

    useEffect(() => {
        setKeys( tags.map(( i : any ) => i.id ))
    }, [ tags ])

    const handleCancel = () => {
        setState( false )
    }

    const handleSetTags = () => {
        getTagList()
        setState( true )
    }

    const handleSelectChange = ( val : any ) => {
        setKeys( val )
    }

    const newLabel = () => {
        jobTagsCreateModal.current?.show()
    }

    const editBtn = {
        paddingTop: 5,
        paddingRight: 8
    }

    return (
        <>
            {/* <Typography.Text className={ styles.test_summary_item }>
                Job标签
            </Typography.Text> */}
            {
            !state ?
            <Row align="middle">
                <>
                    <Access accessible={access.WsTourist()}>
                        <Access 
                            accessible={access.WsMemberOperateSelf(creator_id)}
                            fallback={<EditOutlined onClick={()=> AccessTootip()} style={editBtn}/>}
                        >
                            <EditOutlined onClick={ handleSetTags } style={editBtn}/>
                        </Access>
                    </Access>
                    {
                        tags.length > 0 
                        ?
                            tags.map(
                                ( tag : any , index : number ) => <Tag color={ tag.color } key={ index }>{ tag.name }</Tag>
                            )
                        :
                        <span style={{ color:'rgba(0,0,0,0.85)'}}>-</span>
                    }
                </>
            </Row> :
            <Row >
                <Select 
                    mode="multiple"
                    value={ keys }
                    loading={ loading }
                    size="small"
                    style={{ width : 300 , marginRight : 10 }}
                    tagRender={ tagRender }
                    onChange={ handleSelectChange }
                    allowClear
                    getPopupContainer={ node => node.parentNode }
                    dropdownRender={menu => (
                        <div>
                            {menu}
                            { accessLabel && 
                                <div style={{ maxHeight: 300, overflow: 'auto', padding: '10px', borderTop: '1px solid #eee', marginBottom: '-4px' }} onClick={newLabel}>
                                    <span className={ styles.test_summary_job }><PlusOutlined style={{ marginRight:8, color: '#1890ff' }}/>
                                        <FormattedMessage id="ws.result.details.new.tag" />
                                    </span>
                                </div>
                            }
                        </div>
                        )}
                >
                    {
                        tagList.map(
                            ( tag : any , index : number ) => (
                                <Select.Option key={ index } value={ tag.id }>
                                    <Tag color={ tag.tag_color } >{ tag.name }</Tag>
                                </Select.Option>
                            )
                        )
                    }
                    </Select>
                    <Space>
                        <Button onClick={ handleCancel } size="small"  ><FormattedMessage id="operation.cancel"/></Button>
                        <Button onClick={ handleOk } size="small" type="primary"><FormattedMessage id="operation.ok"/></Button>
                    </Space>
                </Row>
            }
            <JobTagsCreate ref={jobTagsCreateModal} ws_id={ws_id} onOk={refresh}/>
        </>
    )
}