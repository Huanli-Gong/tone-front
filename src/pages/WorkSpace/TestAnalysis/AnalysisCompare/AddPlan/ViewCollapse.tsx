import React,{useState,useEffect,useRef } from 'react'
import { Collapse, Spin , Row, Divider, Space, Button, message } from 'antd'
import styled from 'styled-components'
import CommonPagination from '@/components/CommonPagination';
import { RenderDataRow } from './'
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import ViewTable from './ViewTable'
import { queryPlanViewList, queryPlanConstraint } from '../services'
import styles from '../index.less'
import _ from 'lodash'
import { useClientSize } from '@/utils/hooks';
import { Scrollbars } from 'react-custom-scrollbars';
import { requestCodeMessage } from '@/utils/utils';
const CollapseContainer = styled(Collapse)`
    .ant-collapse-content-box {
        padding : 0!important;
    }
`

const defaultResult = {
    total: 0,
    data: [],

}

const ViewCollapse = ( props : any ) => {
    const {height: layoutHeight} = useClientSize()
    const maxHeight = layoutHeight >= 728 ? layoutHeight - 128 : 600
    const { ws_id, onCancel, onOk,currentGroup} = props
    const defaultVersion = currentGroup && _.get(currentGroup,'members[0].product_version')
    const page_default_params: any = { page_num: 1, page_size: 10, ws_id, product_version: defaultVersion || '' }
    const [dataSource, setDataSource] = useState(defaultResult)
    const [loading,setLoading] = useState(false)
    const [params,setParams] = useState(page_default_params)
    const [activeKey,setActiveKey] = useState([])
    const [selectedRow, setSelectedRow] = useState({})
    const allSelectedData:any = useRef(null);

    const getViewAllPlanList = async (params:any) => {
        let data = await queryPlanViewList(params)
        defaultOption(data)
    }

    const defaultOption = (ret: any) => {
        setLoading(false)
        if (ret.code === 200) {
            setDataSource(ret)
        } else {
            setDataSource(defaultResult)
        }
    }
    useEffect(() => {
        setLoading(true)
        getViewAllPlanList(params) 
    }, [params])
    useEffect(() => {
        let paramsCopy = _.cloneDeep(params)
        paramsCopy = { ...paramsCopy, ws_id }
        setParams(paramsCopy)
    }, [ws_id])

    const handleChange = (key: any) => {
        setActiveKey(key)
    }
    const handleSelectCancle = () =>{
        setSelectedRow({});
    }
    const handleCancle = () =>{
        onCancel()
    }
    const handleOk = async () =>{
        setLoading(true)
        const params = { plan_instance_list: allSelectedData.current.join(','), ws_id, page_num:1,page_size:9999,product_version: defaultVersion }
        let { data, msg, code } = await queryPlanConstraint(params)
        if (code === 200) {
            const groupData = _.cloneDeep(currentGroup)
            const arr = data.filter((obj:any) => obj.product_version === defaultVersion)
            groupData.members = _.isArray(groupData.members) ? [...groupData.members, ...arr] : arr
            groupData.members = _.unionBy(groupData.members, 'id');
            onOk(groupData)
            // window.sessionStorage.setItem('selectedPlanId',JSON.stringify(allSelectedData.current.join(',')))
        } else {
            requestCodeMessage( code , msg )
        }
        setLoading(false)
    }
    const setSelectedRowFn = (planId:string,selectedKeys:[]) => {
        const selectedData= _.cloneDeep(selectedRow)
        selectedData[planId] = selectedKeys
        setSelectedRow(selectedData)
    }
// 滚动条参数
const scroll = {
     // 最大高度，内容超出该高度会出现滚动条
     height: maxHeight - 180 > 475 ? 475 : maxHeight - 180, // 475根据页面计算得出
 }

   allSelectedData.current = _.reduce((Object.values(selectedRow)), (result:any, trr:any) => {
        if (_.isArray(trr)) return [...result, ...trr]
        return result
    }, [])

    const planViewData = _.isArray(_.get(dataSource, 'data')) ? _.get(dataSource, 'data') : []
    return (
        // <Space direction="vertical" style={{ width: '100%', paddingLeft: 20, paddingRight: 20 }}>
        <div className={styles.list_container}>
            <Spin size="small" spinning={loading}>
                <Scrollbars style={scroll} >
                    <CollapseContainer
                        collapsible="header"
                        activeKey={activeKey}
                        key={activeKey}
                        onChange={handleChange}
                        expandIcon={(panelProps) => {
                            return panelProps.isActive ?
                                <CaretDownOutlined /> :
                                <CaretRightOutlined />
                        }}
                    >
                        {
                            planViewData.map((item: any, index: number) => {
                                return (
                                    <Collapse.Panel
                                        showArrow={false}
                                        key={index + ''}
                                        header={
                                            <Row justify="space-between" >
                                                <b >{item.name}</b>
                                                <RenderDataRow itemData ={item}/>
                                            </Row>
                                        }
                                    >
                                        <ViewTable selectedRow={selectedRow} planId={String(item.id)} wsId={ws_id} setSelectedRowFn={setSelectedRowFn} />
                                    </Collapse.Panel>
                                )
                            })
                        }
                    
                    </CollapseContainer>
                </Scrollbars>
                <CommonPagination
                    total={dataSource.total}
                    currentPage={params && params.page_num}
                    pageSize={params && params.page_size}
                    onPageChange={(page_num, page_size) => {
                        let paramsCopy = _.cloneDeep(params)
                        paramsCopy = { ...paramsCopy, page_num, page_size }
                        setParams(paramsCopy)
                    }}
                />
                <Divider className={styles.footer_line} />
                <div className={styles.footer}>
                    <span>
                        <span>已选择</span>
                        <span className={styles.text_num}>{`${allSelectedData.current.length}`}</span>
                        <span>项</span>
                        <span className={styles.text_cancle} onClick={handleSelectCancle}>全部取消</span>
                    </span>
                    <span>
                        <Space>
                            <Button onClick={handleCancle}>取消</Button>
                            <Button type="primary" onClick={handleOk}>确定</Button>
                        </Space>
                    </span>
                </div>
            </Spin>
        </div>
    )
}

export default ViewCollapse