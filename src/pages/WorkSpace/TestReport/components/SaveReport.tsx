import { Drawer, Space, Button, Form, Input, Select, Spin } from 'antd'
import React, { forwardRef, useState, useImperativeHandle, useEffect } from 'react'
import { queryReportTemplateList } from '../services'
import styled from 'styled-components'
import _ from 'lodash'
import { requestCodeMessage } from '@/utils/utils'
const { Option } = Select;
const TemplateDrawer = styled(Drawer)`
    .ant-drawer-title{
        font-weight: 600;
    }
    .server_provider {
        margin-bottom: 5px;  
    }
    .script_right_name{
        font-size: 14px;
        color: rgba(0,0,0,0.85);
    }
`

export default forwardRef(
    (props: any, ref: any) => {
        const { ws_id, onOk, allGroup } = props
        const [form] = Form.useForm()
        const [padding, setPadding] = useState(false) // 确定按钮是否置灰
        const [visible, setVisible] = useState(false) // 控制弹框的显示与隐藏
        const [editer, setEditer] = useState<any>({}) // 编辑的数据
        const [loading, setLoading] = useState(true)
        const [project, setProject] = useState<any>([])
        const [productVersion, setProductVersion] = useState<any>([])
        const [template, setTemplate] = useState<any>([])

        useImperativeHandle(
            ref,
            () => ({
                show: (data: any = {}) => {
                    setVisible(true)
                    setEditer(data)
                    form.setFieldsValue(data) // 动态改变表单值
                    getData()
                }
            })
        )

        const fetchTemplateList = async () => {
            let { data, code, msg } = await queryReportTemplateList({ page_size: 9999, page_num: 1, ws_id })
            if (code === 200) setTemplate(data)
            setLoading(false)
            if (code !== 200) requestCodeMessage(code, msg)
        }

        useEffect(() => {
            fetchTemplateList()
        }, []);

        useEffect(() => {
            const defaultTemplatInfo = _.find(template, 'is_default');
            let defaultTemplate = null
            if (defaultTemplatInfo) defaultTemplate = defaultTemplatInfo.id
            let defaultVersion = null
            if (productVersion.length === 1) defaultVersion = productVersion[0]
            let defaultProject = null
            if (project.length === 1) defaultProject = project[0].id
            const fieldValuesCopy = form.getFieldsValue()
            fieldValuesCopy['template'] = defaultTemplate
            fieldValuesCopy['productVersion'] = defaultVersion
            fieldValuesCopy['project'] = defaultProject
            form.setFieldsValue(fieldValuesCopy)
        }, [template, productVersion, project]);

        const getData = () => {
            let version: any = []
            let projectArr: any = []
            try {
                allGroup.forEach((item: any, index: number) => {
                    if (item && _.isArray(item.members) && item.members.length) {
                        version.push(item.members[0].product_version)
                        item.members.forEach((val: any) => projectArr.push({ id: val.project_id, name: val.project_name }))
                    }
                })
                version = _.uniq(version);
                projectArr = _.uniqWith(projectArr, _.isEqual);
                setProductVersion(version)
                setProject(projectArr)
            } catch (e) {
                console.log(e)
            }

        }

        const handleClose = () => {
            form.resetFields() // 重置一组字段到 initialValues
            setPadding(false)
            setVisible(false)
        }

        const handleOk = () => {
            setPadding(true)
            form.validateFields() // 触发表单验证，返回Promise
                .then(async (values) => {
                    const templateId = values.template
                    const selTemplate = _.find(template, { id: templateId });
                    onOk({ ...values, is_default: _.get(selTemplate, 'is_default') }, editer)
                    handleClose()
                })
                .catch(err => {
                    console.log(err)
                    setPadding(false)
                })
        }

        const initialValue = (type: string) => {
            let defaultValue = '' 
            let optionData = template
            if (type === 'template') {
                const defaultTemplate = _.find(optionData, 'is_default');
                if (defaultTemplate) defaultValue = defaultTemplate.id
            }
            if (type === 'productVersion') {
                optionData = productVersion.filter((val: any) => val)
                if (optionData.length === 1) defaultValue = optionData[0]
            }
            if (type === 'project') {
                optionData = project
                if (optionData.length === 1) defaultValue = optionData[0].id
            }
            return defaultValue;
        }

        const getSelectFn = (type: string) => {
            let text = ''
            let optionData = template
            if (type === 'template') {
                text = '请选择模板'
            }
            if (type === 'productVersion') {
                optionData = productVersion.filter((val: any) => val)
                text = '请选择产品版本'
            }
            if (type === 'project') {
                optionData = project
                text = '请选择项目'
            }
            return (
                <Select
                    showSearch
                    allowClear
                    placeholder={text}
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    onChange={(value: number) => {
                        const fieldValuesCopy = form.getFieldsValue()
                        fieldValuesCopy[type] = value
                        form.setFieldsValue(fieldValuesCopy)
                    }}
                    showArrow={true}
                    filterOption={(input, option: any) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {
                        optionData.map((item: any) => {
                            if (type === 'productVersion') return <Option value={item} key={item}>{item}</Option>
                            return <Option value={item.id} key={item.id}>{item.name}</Option>
                        })
                    }
                </Select>
            )
        }
        
        return (
            <>
                <Spin spinning={loading}>
                    <TemplateDrawer
                        title="生成报告"
                        width="375"
                        onClose={handleClose}
                        visible={visible}
                        footer={
                            <div style={{ textAlign: 'right', }} >
                                <Space>
                                    <Button onClick={handleClose}>取消</Button>
                                    <Button type="primary" disabled={padding} onClick={handleOk}>确定</Button>
                                </Space>
                            </div>
                        }
                    >
                        <Form
                            form={form}
                            layout="vertical" // 表单布局 ，垂直
                            initialValues={{
                                template: initialValue('template'),
                                productVersion:initialValue('productVersion'),
                                project:initialValue('project')
                            }}
                        >
                            <Form.Item
                                label="报告名称"
                                name="name"
                                rules={[{ required: true }]}
                            >
                                <Input autoComplete="auto" placeholder="请输入报告名称" />
                            </Form.Item>
                            <Form.Item
                                label="选择模板"
                                name="template"
                                rules={[{ required: true }]}>
                                {getSelectFn('template')}
                            </Form.Item>
                            <Form.Item
                                label="产品版本"
                                name="productVersion"
                                rules={[{ required: true }]}>
                                {getSelectFn('productVersion')}
                            </Form.Item>
                            <Form.Item
                                label="所属项目"
                                name="project"
                                rules={[{ required: true }]}>
                                {getSelectFn('project')}
                            </Form.Item>
                            <Form.Item label="描述（选填）" name="description">
                                <Input.TextArea placeholder="请输入模板描述信息" />
                            </Form.Item>
                        </Form>
                    </TemplateDrawer>
                </Spin>
            </>
        )
    }
)