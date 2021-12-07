import React, { useState, useEffect, useRef } from 'react';
import { Popover,Result,Layout, Space, message, Row, Input, Divider, Form, Col, Select, Button, Radio, Typography, Spin,Modal,DatePicker, Alert } from 'antd';
import { PlusCircleTwoTone, QuestionCircleOutlined } from '@ant-design/icons'
import { ReactComponent as Ellipsis } from '@/assets/svg/ellipsis.svg'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis'
import PartDom from '@/components/Public/TitlePart'
import styles from './index.less'
import _ from 'lodash'
import classes from 'classnames'
import {
    queryTestFarm,
    updateTestFarm,
    queryWorkspace,
    queryProject,
    queryTest,
    queryPushJob,
    queryPushJobAdd,
    createConfig,
    updateConfig,
    deleteConfig,
} from './service'
import moment from 'moment'
import ProverEllipsis from '@/pages/WorkSpace/TestAnalysis/AnalysisCompare/ProverEllipsis'
import { requestCodeMessage } from '@/utils/utils';
const { Text } = Typography;
const QuestionTip:any = ( props : {
    tip : String,
    path : String,
    name : String
}) : React.ReactElement => {
    const [ visible , setVisible ] = useState( false )
    return (
        <div className={ styles.question_tip_container }>
                <span 
                    className={ styles.question_tip_layout }
                    onMouseEnter={ () => setVisible( true ) }
                    onMouseLeave={ () => setVisible( false ) }
                >
                    <QuestionCircleOutlined 
                        className={ styles.question_icon }
                    />
                    <div
                        style={{ display : visible ? 'block' : 'none' }}
                        className={ classes( styles.question_tip_wrapper , styles.w_384 ) }
                    >
                        <p>{ props.tip }</p>
                </div>
            </span>
        </div>
    )
}
const ModalTitle = (): React.ReactElement => {
    const content = () => {
        return (
            <>
                <Result status="success" className={ styles.success_icon }/>
                <span className={styles.icon_des}>图标说明：job已经被推送过</span>
            </>
        )
    }
    return (
        <>
            <span className={styles.modal_Title}>手动推送</span>
            <Popover content={content}>
                <QuestionCircleOutlined
                    className={styles.question_icon}
                />
            </Popover>
        </>
    )
}
// 有用  实时调用接口
const debounceFetcherFn = (fn,data) => {
    fn(1, data)
}
let timer:any = null;
function debounce(fn:any, param:any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
        fn(1, param)
        timer = null;
    }, 200);
}

export default (props: any) => {
    const [form] = Form.useForm()
    const [projectData, setProjectData] = useState<any>({})
    const [workspaceData, setWorkspaceData] = useState<[]>([])
    const [testFarmDataDetail, setTestFarmDataDetail] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [currentEditIndex,setCurrentEditIndex] = useState(0)
    const [visible,setVisible] = useState(false)
    const [jobList,setJobList] = useState<any>([])
    const [nextPageNum,setNextPageNum] = useState<number>(1)
    const [selectJobId,setSelectJobId] = useState<string|number>('')
    const [isEnd,setIsEnd] = useState(false)
    const [confirmLoading,setConfirmLoading] = useState(false)
    const [fetching, setFetching] = useState<boolean>(true)
    const [filterVal,setFilterVal] = useState('')
    const keyword:any = useRef(null)
    const getTestFarm = async () => {
        let { data } = await queryTestFarm()
        return data
    }
    const getTestFarmConfig = async () => {
        let { data,code,msg } = await queryTestFarm()
        if(code !== 200) return requestCodeMessage( code , msg )
        setTestFarmDataDetail(data)
    }

    const getWorkspace = async () => {
        let { data } = await queryWorkspace({ page_num:1,page_size:200 })
        return data
    }
    const getProject = async (parmas: any) => {

        const { ws_id, project_id, job_name_rule, index, sync_start_time } = parmas
        if (ws_id) {
            let { data, code } = await queryProject({ ws_id })
            if (code === 200) {
                setProjectData((projectData:any) => ({ ...projectData, [ws_id]: data }))
                // setProjectData({ ...projectData, [ws_id]: data })
            }
        }
        const fieldsValue = _.cloneDeep(form.getFieldsValue())
        if(fieldsValue && fieldsValue.pushconfig) {
            fieldsValue.pushconfig[index] = { workspace: ws_id, project: Number(project_id) || undefined, job: job_name_rule, startTime: sync_start_time && moment(sync_start_time) }
        }
        form.setFieldsValue(fieldsValue)
        
    }

    useEffect(() => {
        Promise.all([getTestFarm(), getWorkspace()])
            .then((result) => {
                let workspaceData = []
                if (_.isArray(result[1])) {
                    workspaceData = result[1].map(item => ({ id: item && item.id, name: item && item.show_name }))
                }
                const data = _.cloneDeep(form.getFieldsValue())
                data.siteconfig = [{ primarySite: result[0].is_major ? 1 : 0, url: result[0].site_url || '', token: result[0].site_token || '', systemName: result[0].business_system_name || '' }]
                form.setFieldsValue(data)
                setTestFarmDataDetail(result[0])
                setWorkspaceData(result[1])
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
                message.error('请求失败')
                console.log(e)
            })
    }, [])
    useEffect(() => {
        if (_.isArray(testFarmDataDetail.push_config_list)) {
            testFarmDataDetail.push_config_list.forEach((item: any,index:number) => {
                if (item) {
                    getProject({ ws_id: item.ws_id, project_id: item.project_id, job_name_rule: item.job_name_rule, index, sync_start_time: item.sync_start_time })
                }
            })
        } else {
            const fieldsValue = _.cloneDeep(form.getFieldsValue())
            fieldsValue.pushconfig = [{ workspace: undefined, project: undefined, job: '',startTime: undefined }]
            form.setFieldsValue(fieldsValue)
            setProjectData({})
        }
    }, [testFarmDataDetail])

    // 修改推送站点配置
    const putPushConfig = (fieldsValue:any,num:number)=>{
        let pushconfig = {}
        const obj = _.get(fieldsValue,`pushconfig[${num}]`)
        if(obj) {
            let newId = ''
                if (_.isArray(obj.project)) {
                    obj.project.forEach((val:any, index:number) => {
                        if (index === 0) newId = val
                        if (index > 0) newId = `${newId},${val}`
                    })
                } else {
                    newId = obj.project
                }
                pushconfig = {ws_id:obj.workspace,project_id: newId || '',job_name_rule: obj.job,sync_start_time: obj.startTime && moment(obj.startTime).format('YYYY-MM-DD HH:mm:ss') }
        }

        const configId = _.get(testFarmDataDetail,`push_config_list[${num}].id`)
        updatePushConfigFn({ ...pushconfig,push_config_id: configId })
    }
    const delPushConfig = async(parmas:any) => {
        
        const {code,msg} = await deleteConfig(parmas)
        if(code === 200) getTestFarmConfig()
        if(code !== 200) requestCodeMessage( code , msg )
    }
    const onChange = (e: any) => {
        const fieldsValue = _.cloneDeep(form.getFieldsValue())
        fieldsValue.siteconfig = [{ ...fieldsValue.siteconfig[0], primarySite: e.target.value }]
        form.setFieldsValue(fieldsValue)
        updateTestFarmFn({ is_major: e.target.value ? true : false,site_id: testFarmDataDetail.id })
    };
    // workspace的下拉
    const leftHandleChange = async (id: any, option:any, index:number, type:string) => {
    
        const fieldsValue = _.cloneDeep(form.getFieldsValue())
        if (type === 'workspace') {
            getProject({ job_name_rule: fieldsValue.pushconfig[index]['job'], ws_id: id, project_id: '', index,sync_start_time:fieldsValue.pushconfig[index]['startTime'] })
            fieldsValue.pushconfig[index] = { ...fieldsValue.pushconfig[index], [type]: id ||'', project: undefined }
            putPushConfig(fieldsValue,index)
        } else {
            let newId = ''
            if (_.isArray(id)) {
                id.forEach((val, index) => {
                    if (index === 0) newId = val
                    if (index > 0) newId = `${newId},${val}`
                })
            } else {
                newId = id
            }
            
            const postData = _.cloneDeep(fieldsValue)
            fieldsValue.pushconfig[index] = { ...fieldsValue.pushconfig[index], [type]: id || undefined }
            postData.pushconfig[index] = { ...fieldsValue.pushconfig[index], [type]: newId || '' }
            
            form.setFieldsValue(fieldsValue)
            putPushConfig(postData,index)
        }   
    }
    const getLeftOptions = (options: any, fieldsValue: any, index: number) => {
        let project = fieldsValue && fieldsValue.pushconfig;
        project = _.isArray(project) ? project : [];
        const arr = options.map((item: any) => {
            // const fromIndex = _.findIndex(project, function (o: any) { return o && o.workspace == item.id });
            // if (fromIndex !== -1 && fromIndex !== index) {
            //     item.disabled = true
            //     return item
            // }
            item.disabled = false
            return item
        })
        return arr
    }
    // project 下拉选择
    const getSelectNode = (field: any, index: number, type: any) => {
        let arr = []
        if (_.isArray(form.getFieldsValue().pushconfig) && form.getFieldsValue().pushconfig[index]) {
            const ws_id = form.getFieldsValue().pushconfig[index].workspace
            arr = _.isArray(projectData[ws_id]) ? projectData[ws_id] : []
        }
        

        return (
            <Form.Item name={[field.name, type]}>
                <Select
                    showSearch
                    allowClear={true}
                    onChange={_.partial(leftHandleChange,_,_,index,type)}
                    placeholder={getText(type)}
                    filterOption={(input, option: any) => {
                        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }}
                    optionFilterProp="children">
                    {
                        arr.map(
                            (item: any) => (
                                <Select.Option
                                    value={item.id}
                                >
                                    {item.name}
                                </Select.Option>
                            )
                        )
                    }
                </Select>
            </Form.Item>
        )
    }
    const getText = (type: string) => {
        switch (type) {
            case 'url':
                return '请输入Testfarm地址'
            case 'token':
                return '请输入'
            case 'job':
                return '请输入Job名称规则'
            case 'project':
                return '请选择Project'
            default:
                return '请输入'
        }
    }
    const getLabel = (type: string) => {
        switch (type) {
            case 'job':
                return 'Job名称规则'
            case 'token':
                return 'Token'
            case 'url':
                return 'Testfarm地址'
            case 'systemName':
                return 'Slave名称'
            default:
                return ''
        }
    }
    const updateTestFarmFn = async(parmas:any) =>{
      const {code,data} = await updateTestFarm(parmas)
      if(code === 200) setTestFarmDataDetail(data)
    }
    const updatePushConfigFn = async(parmas:any) =>{
        const {code,msg} = await updateConfig(parmas)
        if(code === 200) getTestFarmConfig()
        if(code !== 200) requestCodeMessage( code , msg )
      }
    const inputBlur = (e, type, index) => {
        const fieldsValue = _.cloneDeep(form.getFieldsValue())
            
        if (type === 'url') {
            fieldsValue.siteconfig = [{ ...fieldsValue.siteconfig[0], url: e.target.value }]
            form.setFieldsValue(fieldsValue)
            updateTestFarmFn({ site_url: e.target.value,site_id: testFarmDataDetail.id })
        }
        if (type === 'token') {
            fieldsValue.siteconfig = [{ ...fieldsValue.siteconfig[0], token: e.target.value }]
            form.setFieldsValue(fieldsValue)
            updateTestFarmFn({ site_token: e.target.value,site_id: testFarmDataDetail.id })
        }
        if (type === 'systemName') {
            fieldsValue.siteconfig = [{ ...fieldsValue.siteconfig[0], systemName: e.target.value }]
            form.setFieldsValue(fieldsValue)
            updateTestFarmFn({ business_system_name: e.target.value,site_id: testFarmDataDetail.id })
        }
        if (type === 'job') {
            fieldsValue.pushconfig[index] = { ...fieldsValue.pushconfig[index], job: e.target.value }
            form.setFieldsValue(fieldsValue)
            putPushConfig(fieldsValue,index)
        }
    }
    const handleIpnputChange = (e, type, index) =>{
        if(!e.target.value){
            inputBlur(e, type, index)
        }
    }
    const getInputNode = (field: any, index: number, type: any) => {
        return (
            <Form.Item name={[field.name, type]} label={getLabel(type)} required={type === 'job'}>
                <Input
                allowClear={true}
                onChange={_.partial(handleIpnputChange,_,type,index)}
                placeholder={getText(type)}
                onBlur={_.partial(inputBlur,_,type,index)}/>
            </Form.Item>
        )
    }
    const handleTest = function* () {
        yield queryTest()
    }
    const handleTimeChange = (value:any, dateString:any, index:number) => {
        const fieldsValue = _.cloneDeep(form.getFieldsValue())
        fieldsValue.pushconfig[index] = { ...fieldsValue.pushconfig[index], startTime: value }
        form.setFieldsValue(fieldsValue)
        putPushConfig(fieldsValue,index)
    }
    const handleCancel = () => {
        setSelectJobId('')
        setNextPageNum(1)
        setIsEnd(false)
        setCurrentEditIndex(0)
        setJobList([])
        setVisible(false);
        Modal.destroyAll();
    };
    const handleAddJobId = async () => {
        setConfirmLoading(true)
        const {code, msg} = await queryPushJobAdd({ job_id: selectJobId })
        setConfirmLoading(false)
        if (code === 200) {
            message.success(msg || '推送成功')
            handleCancel()
        }
        if (code !== 200) requestCodeMessage( code , msg )
    }
  
    const queryJob = async (pageNum = 1,seareVal:any = undefined) => {
        if (testFarmDataDetail && _.isArray(testFarmDataDetail.push_config_list)) {
            const id = _.get(testFarmDataDetail.push_config_list[currentEditIndex], 'id')
            setFetching(true)
            const { code, data, msg, page_num } = await queryPushJob({ push_config_id: id, page_num: pageNum,filter_job:seareVal })
            setFetching(false)
            if (code === 200) {
                let jobData = _.isArray(data) ? data : []
                jobData = jobData.map((item:any) => ({...item,name: `#${item.id}  ${item.name}`}))
                if(pageNum === 1) setJobList(jobData)
                if(pageNum !== 1) setJobList((jobList:any) => _.unionBy(jobList, jobData, 'id'))
                setNextPageNum(page_num + 1)
                if(!jobData.length) setIsEnd(true)
            } else {
                setJobList([])
                requestCodeMessage( code , msg )
            }
            
        }
    }
  
    const isHaveWs = (index:number) => {
        const values = form.getFieldsValue()
        const config = values && values.pushconfig
        let flag = true
        if(_.isArray(config) && config.length) {
            flag =  _.get(config[index],'workspace') ? false : true
        }
        return flag
    }
    const getConfigJobInfo = (index:number) => {
        const jobInfo = _.get(testFarmDataDetail,`push_config_list[${index}].job_info`)
        return jobInfo
    }
    const showModal = () => {
        queryJob()
        setVisible(true);
    };
    const handleEllipsis = (obj:any, num:number) => {
        setCurrentEditIndex(num)
    }
    const handlePopupScroll = ({ target }:any) => {
        const { clientHeight, scrollHeight, scrollTop} = target 
        if( clientHeight + scrollTop + 1 >= scrollHeight  && !_.isNaN(nextPageNum) && !isEnd) {
            queryJob(nextPageNum,keyword.current)
        }
    }
    const handleSelChange = (lastVal:any) => {
        setSelectJobId(_.get(lastVal,'value') || '')
    }
    const handleSearch = (word?: string) => {
		const param = word && word.replace(/\s*/g, "")
		if (keyword && keyword.current === param) return
        	setFilterVal(param)
		keyword.current = param
        	debounce(queryJob,param)
	}
	const handleCancleSel = () => {
		handleSearch()
	}
    const handleCreateConfig = async(fn:any) => {
        
        let { code } = await createConfig({ site_id: testFarmDataDetail?.id })
        
        if(code === 200){
            getTestFarmConfig()
            const fieldsValue = _.cloneDeep(form.getFieldsValue())
            fieldsValue.pushconfig.push({ workspace: '', project: undefined, job: '' })
            fn()
        }
    }
    // let testFarmData: any = {}
    // testFarmData = Object.prototype.toString.call(testFarmDataDetail) === '[object Object]' ? testFarmDataDetail : {}
    return (
        <Layout.Content>
            <Spin spinning={loading} >
                <div className={styles.test_parm}>
                   
                    {<Form
                        form={form}
                        initialValues={{
                            siteconfig: [{ primarySite: '', url: '', token: '', systemName: '' }],
                            pushconfig: [{ workspace: '', project: '', job: '' }]
                        }}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 14 }}
                        colon={false}
                        requiredMark={true}
                    >

                        <Row gutter={20} style={{ paddingLeft: 24, paddingRight: 24, backgroundColor: '#fff',margin:'0 0 10px' }} className={styles.site_config_row}>
                            <PartDom text='站点选择' />
                            <Alert
                                message={`上次同步时间：${testFarmDataDetail.last_sync_time || '-'}`}
                                type="success"
                                showIcon
                                style={{ marginBottom: 16,width: '100%' }}
                            />
                            <Form.Item label="" >
                                <Form.List name="siteconfig">
                                    {
                                        (fields) => {
                                            return fields.map(
                                                (field: any, index: number) => {
                                                    return (
                                                        <Row gutter={10} style={{ marginBottom: 8 }} key={field.key}>
                                                            <Col span={24} style={{display:'flex',}}>
                                                                <Form.Item name={[field.name, 'primarySite']} label="是否主站点">
                                                                    <Radio.Group onChange={onChange}>
                                                                        <Radio value={1}> 是</Radio>
                                                                        <Radio value={0}>否</Radio>
                                                                    </Radio.Group>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={24} style={{display:'flex',}}>
                                                                {getInputNode(field, index, 'url')}
                                                                 <span style={{opacity: 0}}><Ellipsis /></span>
                                                            </Col>
                                                            <Col span={24} style={{display:'flex',}}>
                                                                {getInputNode(field, index, 'token')}
                                                                 <span style={{opacity: 0}}><Ellipsis /></span>
                                                            </Col>
                                                            <Col span={24} style={{display:'flex',}}>
                                                                {getInputNode(field, index, 'systemName')}
                                                                 <span style={{opacity: 0}}><Ellipsis /></span>
                                                            </Col>

                                                        </Row>
                                                    )
                                                }
                                            )
                                        }
                                    }
                                </Form.List>
                            </Form.Item>
                        </Row>
                        <Row gutter={20} style={{ paddingLeft: 24, paddingRight: 24, backgroundColor: '#fff',margin:'0 0 10px' }} className={styles.push_config_row}>
                            <PartDom text='推送配置'>
                                <QuestionTip tip="指定project，自动上传更新数据" />
                            </PartDom>
                            <Form.Item label="" labelAlign="left">

                                {
                                    <Form.List name="pushconfig">
                                        {
                                            (fields, { add, remove }) => {
                                                
                                                return fields.map(
                                                    (field: any, index: number) => {
                                                        const isPush = isHaveWs(index)
                                                        const jobInfo = getConfigJobInfo(index)
                                                        return (
                                                                <div className={styles.push_config_box} key={field.key}>
                                                                {testFarmDataDetail?.push_config_list?.length > 0 && <>
                                                                <Col span={24} style={{display:'flex',}}>
                                                                    <Form.Item name={[field.name, 'workspace']} label="Workspace" labelAlign='left' required={true}>
                                                                        <Select showSearch onChange={_.partial(leftHandleChange,_,_,index,'workspace')} placeholder="请选择Workspace" allowClear={true}
                                                                         filterOption={(input, option: any) => {
                                                                            return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                        }}
                                                                        optionFilterProp="children">
                                                                            {
                                                                                getLeftOptions(_.cloneDeep(workspaceData), form.getFieldsValue(), index).map(
                                                                                    (item: any) => (
                                                                                        <Select.Option
                                                                                            value={item.id}
                                                                                            disabled={item.disabled}
                                                                                        >
                                                                                            { item.show_name}
                                                                                        </Select.Option>
                                                                                    )
                                                                                )
                                                                            }
                                                                        </Select>
                                                                    </Form.Item>
                                                                    {

                                                                        <ProverEllipsis
                                                                            iconStyles={{ transform: 'translateY(6px)', cursor: 'pointer',marginLeft: 2 }}
                                                                            currentIndex={index}
                                                                            contentMark={<div>
                                                                                <p onClick={!isPush && _.partial(showModal)} style={{ cursor: isPush ? 'default' : 'pointer', color: isPush ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.85)' }}>手动推送</p>
                                                                                {index > 0 && <p
                                                                                    style={{color:'#FF4D4F'}}
                                                                                    onClick={() => {
                                                                                        const fieldsValue = _.cloneDeep(form.getFieldsValue())
                                                                                        fieldsValue.pushconfig = fieldsValue.pushconfig.filter((obj:any,num: number) => num !== index)
                                                                                        
                                                                                        const configId = _.get(testFarmDataDetail,`push_config_list[${index}].id`)
                                                                                        delPushConfig({push_config_id:configId})
                                                                                        remove(field.name)
                                                                                    }}>移除</p>}
                                                                            </div>}
                                                                            handleEllipsis={handleEllipsis}
                                                                            typeName='master_prover'
                                                                            currentEditGroupIndex={currentEditIndex} />
                                                                    }
                                                                </Col>
                                                                <Col span={24} style={{display:'flex',}}>
                                                                    <Form.Item name={[field.name, 'project']} label="Project" required={true}>
                                                                        {getSelectNode(field, index, 'project')}
                                                                    </Form.Item>
                                                                    <span style={{opacity: 0}}><Ellipsis /></span>
                                                                    
                                                                </Col>
                                                                <Col span={24} style={{display:'flex',}}>
                                                                    {getInputNode(field, index, 'job')}
                                                                    <span style={{opacity: 0}}><Ellipsis /></span>
                                                                </Col>
                                                                <Col span={24}>
                                                                    <Form.Item name={[field.name, 'startTime']} label="同步启始时间">
                                                                        <DatePicker allowClear = {false} onChange={_.partial(handleTimeChange, _, _, index)} showTime />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={24} style={{display:'flex',}}>
                                                                    {jobInfo && <Text className={styles.sync_info}>{`当前同步的Job信息：#${jobInfo.job_id}  ${jobInfo.job_name}`}</Text>}
                                                                </Col>
                                                                </>}
                                                                { index < fields.length - 1 && <Divider dashed style={{ margin: '22px 0 22px 0' }} />}
                                                                {index === fields.length - 1 &&
                                                                    <Space
                                                                        className={styles.add_space}
                                                                        onClick={_.partial(handleCreateConfig,add)}>
                                                                        {/*添加按钮*/}
                                                                        <PlusCircleTwoTone/>
                                                                        <Text className={styles.add_pushconfig} >添加推送配置 </Text>
                                                                    </Space>
                                                                }
                                                            </div>
                                                          
                                                        )
                                                    }
                                                )
                                            }
                                        }
                                    </Form.List>
                                }
                            </Form.Item>

                        </Row>
                        <Row gutter={20} style={{ paddingLeft: 24, paddingRight: 24, backgroundColor: '#fff',margin:'0 0 10px' }} className={styles.push_check_row}>
                            <Col span={24}>
                                <PartDom text='推送验证'></PartDom>
                                <Form.Item>
                                    <div className={styles.button}>
                                        <Button type="primary" onClick={() => {
                                            setLoading(true)
                                            const generObj = handleTest();
                                            const excuteResult: any = generObj.next();
                                            excuteResult.value.then((result: any) => {
                                                const { code, msg } = result;
                                                if (code === 200) {
                                                    message.success('数据链路正常')
                                                } else {
                                                    requestCodeMessage( code , msg || '数据链路异常')
                                                }
                                                setLoading(false)
                                            })

                                        }}>测试一下</Button>
                                        <p>
                                            点击按钮，可手动推送数据，确认流程是否走得通
                                        </p>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                    }
                    <Modal
                        title={ModalTitle()}
                        visible={visible}
                        maskClosable={false}
                        width={480}
                        className={styles.push_job_modal}
                        destroyOnClose={true}
                        onCancel={handleCancel}
                        onOk={handleAddJobId}
                        confirmLoading={confirmLoading}
                        centered={true}
                        okButtonProps={{disabled:!selectJobId}}
                    >
                        <>
                            <p style={{ marginBottom: 8 }}>选择Job</p>
                            <Select
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="请选择Job"
                                showSearchnotFoundContent={fetching ? <Spin size="small" /> : null}
                                onChange={handleSelChange}
                                labelInValue
                                filterOption={false}
                                showSearch
                                onSearch={handleSearch}
                                // optionFilterProp="label"
                                onPopupScroll={handlePopupScroll}
                                onClear={handleCancleSel}
                                showArrow={false}
                                autoFocus={true}
                                optionLabelProp="label"
                                {...props}
                            >
                                {
                                    jobList.map(
                                        (item: any) => (
                                            <Select.Option
                                                value={item.id}
                                                key={item.id}
                                                label={item.name}
                                            >
                                                <div className={styles.option_label_item}>
                                                    <PopoverEllipsis customStyle={{width: 'calc(100% - 32px)'}} title={item.name} refData={jobList}>
                                                        <span  aria-label={item.name}>
                                                            {item.name}
                                                        </span>
                                                    </PopoverEllipsis>
                                                    {item.sync_time && <span role="img" aria-label={item.name} className={styles.option_label_item_success}>
                                                        <Result status="success" />
                                                    </span>}
                                                </div>
                                            </Select.Option>
                                        )
                                    )
                                }
                            </Select>
                        </>
                    </Modal>
                </div>
            </Spin>
        </Layout.Content>
    )
}
