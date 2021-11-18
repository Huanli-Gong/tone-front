import React, { useState , useEffect , useRef } from 'react'
import { Button, Select, Space, Tag , Row } from 'antd'

import { tagList as queryTagList } from '@/pages/WorkSpace/TagManage/service'
import { useRequest } from 'umi'
import { EditOutlined, PlusOutlined} from '@ant-design/icons'
import { updateJobTags } from '../service'

import JobTagsCreate from './JobTagsCreate'

import styles from './index.less'
import { requestCodeMessage } from '@/utils/utils'

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

export default ({ tags = [] , onOk , ws_id , job_id, creator_id, accessible, accessLabel } : any ) => {
    const [ state , setState ] = useState( false )
    const [ keys , setKeys ] = useState([])

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
    return (
        <>
            {/* <Typography.Text className={ styles.test_summary_item }>
                Job标签
            </Typography.Text> */}
            {
            !state ?
            <Row align="middle">
                <Space>
                    {
                        tags.length > 0 
                        ?
                            tags.map(
                                ( tag : any , index : number ) => <Tag color={ tag.color } key={ index }>{ tag.name }</Tag>
                            )
                        :
                        !accessible && <span style={{ color:'rgba(0,0,0,0.85)'}}>-</span>
                    }
                    { accessible ? <EditOutlined onClick={ handleSetTags }/> : <></>}
                </Space>
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
                                <div style={{ display: 'flex', flexWrap: 'nowrap' }} onClick={newLabel}>
                                    <span className={ styles.test_summary_job }><PlusOutlined style={{ marginRight:6 }}/>新建标签</span>
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
                        <Button onClick={ handleCancel } size="small"  >取消</Button>
                        <Button onClick={ handleOk } size="small" type="primary">确定</Button>
                    </Space>
                </Row>
            }
            <JobTagsCreate ref={jobTagsCreateModal} ws_id={ws_id} onOk={refresh}/>
        </>
    )
}