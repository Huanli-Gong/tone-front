/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Row, Tag, Space, Button, Col, Spin, Typography, message, Menu, Input, Popover, Popconfirm, notification } from 'antd'

import { history, useRequest, useModel, useAccess, Access, useIntl, FormattedMessage, useParams, useLocation } from 'umi'
import { requestCodeMessage, AccessTootip, redirectErrorPage } from '@/utils/utils'
import { useClientSize, writeDocumentTitle, useCopyText } from '@/utils/hooks'
import styles from './index.less'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import NotLoggedIn from '@/components/Public/NotLoggedIn'
import { queryJobTypeItems } from '@/pages/WorkSpace/JobTypeManage/CreateJobType/services'
import { queryJobTypeList } from '@/pages/WorkSpace/JobTypeManage/services'

import { ArrowLeftOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'

import BasciForm from './components/JobForms/BasicForm'
import EnvForm from './components/JobForms/EnvForm'
import MoreForm from './components/JobForms/MoreForm'
import SelectSuite from './components/SelectSuite'
import SaveTemplate from './components/SaveTemplate'
import TemplateForm from './components/JobForms/TemplateForm'

import { createWsJobTest, queryTestTemplateData, queryTestExportValues, formatYamlToJson, testYaml, queryCheckJobTemplate } from './services'
import { saveTestTemplate, queryTestTemplateList, updateTestTemplate } from '@/pages/WorkSpace/TestTemplateManage/service'

import _ from 'lodash'
import { ReactComponent as YamlFormat } from '@/assets/svg/yaml_format.svg'
import { ReactComponent as YamlCopy } from '@/assets/svg/yaml_copy.svg'
import { ReactComponent as YamlDownload } from '@/assets/svg/yaml_download.svg'
import { ReactComponent as YamlTest } from '@/assets/svg/yaml_test.svg'
import CodeEditer from '@/components/CodeEditer'
import { useSize } from 'ahooks'

interface PropsTypes {
    templateEditFormInfo?: any,
    basicFormInfo?: any,
    envFormInfo?: any,
    moreFormInfo?: any,
    new_test_config?: any
}

const TestJob: React.FC<any> = (props) => {
    const { formatMessage } = useIntl()
    const { name } = props.route
    const { height: layoutHeight, width: layoutWidth } = useClientSize()
    const hasNav = ["TemplatePreview", "TemplateEdit", "JobTypePreview"].includes(name)

    const { initialState, setInitialState } = useModel('@@initialState')
    const { authList } = initialState;
    const { ws_id, jt_id } = useParams() as any
    const { query, state, pathname } = useLocation() as any
    const access = useAccess();
    writeDocumentTitle(`Workspace.${name}`)
    const [test_config, setTest_config] = useState<any>([])
    const [detail, setDetail] = useState<any>({ name: '', server_type: '', test_type: '' })
    const [items, setItems] = useState<any>({ basic: {}, env: {}, suite: {}, more: {} })
    const [loading, setLoading] = useState(true)
    const [envErrorFlag, setEnvErrorFlag] = useState(false)
    const [isloading, setIsloading] = useState(false)
    const [disabled, setDisabled] = useState(name === 'TemplatePreview')
    const [modifyTemplate, setModifyTemplate] = useState(false)
    const [templateDatas, setTemplateDatas] = useState<any>({})
    const [templateBtnVisible, setTemplateBtnVisible] = useState(false)
    const moreForm: any = useRef(null)
    const envForm: any = useRef(null)
    const basicForm: any = useRef(null)
    const suiteTable: any = useRef(null)
    const bodyRef: any = useRef(null)
    // yaml 回显
    const projectListData: any = useRef(null)
    const baselineListData: any = useRef(null)
    const tagsData: any = useRef(null)
    const reportTemplateData: any = useRef(null)
    const caseData: any = useRef(null)

    const saveTemplateDrawer: any = useRef()
    const templateEditForm: any = useRef()
    const [projectId, setProjectId] = useState()
    const [templateEnabel, setTemplateEnable] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [isReset, setIsReset] = useState(false)

    const [jobInfo, setJobInfo] = useState('')
    const [isYamlFormat, setIsYamlFormat] = useState(false)
    const { data: templateList, run: requestTemplateRun, refresh: templatePopoverRefresh } = useRequest(
        (params: any) => queryTestTemplateList(params),
        {
            initialData: [],
            throttleInterval: 300,
            manual: true,
        }
    )

    const handleModifySetting = () => {
        setDisabled(false)
        setModifyTemplate(true)
    }

    const goValidate = (form: any) => {
        return new Promise(
            (resolve, reject) => (
                form
                    .validateFields()
                    .then(resolve)
                    .catch(() => {
                        reject()
                        setFetching(false)
                    })
            )
        )
    }

    const getPageData = async () => {
        setLoading(true)
        let job_type_id = jt_id

        if (name === 'TestExport') {
            const { data } = await queryTestExportValues({ job_id: jt_id, ...query })
            setTemplateDatas(data)
            setTest_config(data.test_config)
            job_type_id = data.job_type_id
        }


        if (["TestTemplate", "TemplatePreview", "TemplateEdit", "TestJob"].includes(name)) {
            let template_id: any = null
            if (name === 'TestJob' && query.template_id)
                template_id = query.template_id

            if (["TestTemplate", "TemplatePreview", "TemplateEdit"].includes(name))
                template_id = jt_id

            if (template_id) {
                const { code, data } = await queryTestTemplateData({ template_id })
                if (code === 500) {
                    redirectErrorPage(500)
                    return
                }
                const [datas] = data
                job_type_id = datas.job_type_id
                setTemplateDatas(datas)
                setTest_config(datas.test_config)
                setTemplateEnable(datas.enable)
            }
            else {
                setTemplateDatas({})
            }
        }

        const { data: [jobTypedetail] } = await queryJobTypeList({ jt_id: job_type_id })
        setDetail(jobTypedetail)
        const { data: items } = await queryJobTypeItems({ jt_id: job_type_id })
        filterItems(items)
        setLoading(false)
        if (name === 'TestJob') requestTemplateRun({ ws_id, job_type_id, enable: 'True' })
    }

    const filterItems = (t: any) => {
        const basic = {}, env = {}, suite = {}, more = {}
        t?.forEach((i: any) => {
            if (i.config_index === 1) basic[i.name] = i
            if (i.config_index === 2) env[i.name] = i
            if (i.config_index === 3) suite[i.name] = i
            if (i.config_index === 4) more[i.name] = i
        })

        setItems({ basic, env, suite, more })
    }

    const handleCopyText = useCopyText(formatMessage({ id: 'request.copy.success' }))

    const handleReset = (flag = false) => {
        setIsReset(flag)
        setJobInfo('')
        templateEditForm.current?.reset()
        basicForm.current?.reset()
        moreForm.current?.reset()
        envForm.current?.reset()
        suiteTable.current?.reset()
    }

    //数据初始化 init hooks //新建job 1 jobType预览 2 模板预览 3 模板测试 4
    useEffect(() => {
        handleReset()
        getPageData()
    }, [pathname, query])

    const compact = (obj: any) => {
        const result = {}
        Object.keys(obj).forEach(
            key => {
                const z = obj[key]
                if (z === null || z === undefined || z === '')
                    return
                const t = Object.prototype.toString.call(z)
                if (t === '[object Array]') {
                    const arrayItem = z.filter(
                        (item: any) => {
                            let noData = false
                            Object.keys(item).forEach(
                                ctx => {
                                    const o = item[ctx]
                                    if (o === null || o === undefined || o === '')
                                        noData = true
                                }
                            )
                            if (!noData)
                                return item
                        }
                    )
                    if (arrayItem.length !== 0)
                        result[key] = arrayItem
                }
                else if (t === '[object Object]') {
                    if (JSON.stringify(z) !== '{}')
                        result[key] = compact(z)
                }
                else
                    result[key] = z
            }
        )
        return Object.assign({}, result)
    }


    const transformDate = async (result: PropsTypes | null = null) => {
        let data: any = {}
        let installKernel = ''
        if (name === 'TestTemplate' || name === 'TemplatePreview' || name === 'TemplateEdit') {
            const templateFormVal = result ? result.templateEditFormInfo : await goValidate(templateEditForm.current.form)
            data = Object.assign(data, compact(templateFormVal))
        }

        if (JSON.stringify(items.basic) !== '{}') {
            const basicVal = result ? result.basicFormInfo : await goValidate(basicForm.current.form)
            data = Object.assign(data, compact(basicVal))
        }

        if (JSON.stringify(items.env) !== '{}') {
            const envVal = result ? result.envFormInfo : await goValidate(envForm.current.form)
            const {
                env_info, rpm_info, script_info, moniter_contrl,
                monitor_info, reclone_contrl, app_name, os,
                vm, need_reboot, kernel_version, kernel_install,
                code_repo, code_branch, compile_branch, cpu_arch, commit_id, kernel_packages,
                build_config, build_machine, scripts, kernel, devel, headers, hotfix_install, ...rest
            }: any = envVal

            installKernel = kernel_install
            const envStr = env_info

            const build_pkg_info = {
                code_repo, code_branch, compile_branch, cpu_arch, commit_id,
                build_config, build_machine, scripts, ...rest
            }

            const kernel_info = { hotfix_install, scripts, kernel_packages }

            let scriptInfo = script_info
            let rpmInfo = rpm_info

            if (!need_reboot) {
                rpmInfo = rpmInfo ? rpmInfo.map((i: any) => ({ ...i, pos: 'before' })) : undefined
                scriptInfo = scriptInfo ? scriptInfo.map((i: any) => ({ ...i, pos: 'before' })) : undefined
            }

            const envProps: any = {
                env_info: envStr ? envStr : '',
                rpm_info: rpmInfo,
                script_info: scriptInfo,
                moniter_contrl,
                // monitor_info,
                reclone_contrl,
                iclone_info: (os || app_name || vm) ? { os, app_name, vm } : undefined,
                need_reboot,
                kernel_version,
            }

            if (code_repo) envProps.build_pkg_info = build_pkg_info
            else envProps.kernel_info = kernel_info

            data = Object.assign(data, compact(envProps), { monitor_info })
        }

        if (JSON.stringify(items.more) !== '{}') {
            const moreVal: any = result ? result.moreFormInfo : await goValidate(moreForm.current.form)
            const email = moreVal.email ? moreVal.email.replace(/\s/g, ',') : null
            data = Object.assign(data, compact({ ...moreVal, email }))
        }

        const testConfigData = result ? result.new_test_config : test_config

        if (testConfigData.length > 0) {
            const test_conf = testConfigData.map((item: any) => {
                const {
                    id: test_suite,
                    setup_info,
                    console: Console,
                    need_reboot,
                    priority,
                    cleanup_info,
                    run_mode,
                    test_case_list: cases
                }: any = item
                return {
                    ...compact({
                        test_suite,
                        setup_info,
                        cleanup_info,
                        console: Console,
                        need_reboot,
                        priority,
                        run_mode,
                    }),
                    cases: cases.map((ctx: any) => {
                        // console.log(ctx)
                        const {
                            id: test_case,
                            setup_info,
                            cleanup_info,
                            repeat,
                            server_object_id,
                            server_tag_id,
                            need_reboot,
                            console: Console,
                            monitor_info,
                            priority,
                            env_info,
                            // server: {
                            // ip,
                            // tag,
                            // },
                            is_instance,
                            custom_ip,
                            custom_channel
                        } = ctx

                        const envs: any = env_info.filter((i: any) => {
                            if (i.name && i.val) return i
                        })
                        const evnInfoStr = envs.reduce((i: any, p: any, idx: number) => i.concat(`${idx ? '\n' : ''}${p.name}=${p.val}`), '')

                        let customer_server = undefined
                        if (custom_channel && custom_ip) {
                            customer_server = {
                                custom_channel,
                                custom_ip
                            }
                        }

                        // console.log(monitor_info)

                        return compact({
                            test_case,
                            setup_info: setup_info === '[]' ? '' : setup_info,
                            cleanup_info,
                            repeat,
                            server_object_id,
                            server_tag_id,
                            need_reboot,
                            console: Console,
                            monitor_info,
                            priority,
                            is_instance,
                            env_info: evnInfoStr,
                            // server: {
                            //     ip,
                            //     tag: tag && _.isArray(tag) ? tag.toString() : '',
                            // },
                            customer_server
                        })
                    })
                }
            })
            data.test_config = test_conf
        }

        if (installKernel !== 'install_push')
            data.kernel_version = null
        const report_template = data.report_template
        delete data.report_template
        if ('report_name' in data && _.get(data, 'report_name')) data.report_template = report_template
        return data
    }

    const handleFormatChange = async (operateType: any = '') => {
        let parmas = {}
        const envVal = envForm && envForm.current ? await goValidate(envForm.current.form) : {}
        const server_provider = detail?.server_type
        // operateType !== 'template' && setIsloading(true)
        setIsloading(true)
        if (!isYamlFormat) {
            const formData = await transformDate()
            const dataCopy = _.cloneDeep(formData)
            const $test_config = _.get(dataCopy, 'test_config')
            if (_.isArray($test_config)) {
                $test_config.forEach((item: any) => {
                    let cases = _.get(item, 'cases')
                    const runMode = _.get(item, 'run_mode')
                    if (_.isArray(cases)) {
                        cases = cases.map((obj: any) => {
                            let server: AnyType = {}
                            const objCopy = _.cloneDeep(obj)
                            if (_.has(objCopy, 'server_object_id') && objCopy.server_object_id !== undefined) {
                                // server = {}
                                const is_instance = _.get(objCopy, 'is_instance')
                                let key = 'id'
                                if (is_instance === 0 && server_provider === 'aliyun') key = 'config'
                                if (is_instance === 1 && server_provider === 'aliyun') key = 'instance'
                                if (runMode === 'cluster') key = 'cluster'
                                server[key] = _.get(objCopy, 'server_object_id')
                            }
                            if (_.has(objCopy, 'server_tag_id') && objCopy.server_tag_id.length) server = { tag: _.get(objCopy, 'server_tag_id') }
                            if (_.get(objCopy, 'customer_server')) {
                                const customServer = _.get(objCopy, 'customer_server')
                                server = { channel_type: customServer.custom_channel, ip: customServer.custom_ip }
                            }
                            if (server) obj.server = server
                            delete obj.server_object_id
                            delete obj.server_tag_id
                            delete item.run_mode
                            delete obj.is_instance
                            delete obj.customer_server
                            return obj
                        })
                        item.cases = cases
                    }
                })
            }

            dataCopy.test_config = $test_config
            delete dataCopy.moniter_contrl
            delete dataCopy.reclone_contrl
            if (!dataCopy.kernel_version) delete dataCopy.kernel_version
            parmas = { type: 'json2yaml', json_data: dataCopy, workspace: ws_id }
        }

        if (isYamlFormat) parmas = { type: 'yaml2json', yaml_data: jobInfo, workspace: ws_id }

        const { code, msg, data } = await formatYamlToJson(parmas)
        // operateType !== 'template' && setIsloading(false)
        setIsloading(false)
        let result = {}
        if (code === 200) {
            if (!isYamlFormat) setJobInfo(data)
            if (isYamlFormat) {
                const dataCopy = _.cloneDeep(data)
                const { test_config: $suite_list } = data
                if (_.isArray($suite_list)) {
                    $suite_list.forEach((item: any) => {
                        let cases = _.get(item, 'cases')
                        item.run_mode = 'standalone'
                        if (_.isArray(cases)) {
                            cases = cases.map((obj: any) => {
                                const server = _.get(obj, 'server')
                                if (_.has(server, 'id')) {
                                    obj.server_object_id = _.get(server, 'id')
                                }
                                if (_.get(server, 'config')) {
                                    obj.server_object_id = _.get(server, 'config')
                                    obj.is_instance = 0
                                }
                                if (_.get(server, 'instance')) {
                                    obj.server_object_id = _.get(server, 'instance')
                                    obj.is_instance = 1
                                }
                                if (_.get(server, 'cluster')) {
                                    obj.server_object_id = _.get(server, 'cluster')
                                    item.run_mode = 'cluster'
                                }
                                if (_.get(server, 'tag') && _.get(server, 'tag').length) obj.server_tag_id = _.get(server, 'tag')
                                if (_.get(server, 'channel_type') && _.get(server, 'ip')) {
                                    obj.customer_server = { custom_channel: _.get(server, 'channel_type'), custom_ip: _.get(server, 'ip') }
                                    obj.ip = _.get(server, 'ip')
                                }
                                if (_.get(server, 'name')) {
                                    let ip = server.name
                                    if (_.isArray(ip)) ip = ip.join(',')
                                    obj.ip = ip
                                }
                                delete obj.server
                                return obj
                            })
                            item.cases = cases
                        }
                    })
                }
                dataCopy.test_config = $suite_list?.map((i: any) => ({ ...i, test_suite_id: i.test_suite, cases: i.cases.map((t: any) => ({ ...t, test_case_id: t.test_case })) }))
                dataCopy.moniter_contrl = false
                dataCopy.reclone_contrl = _.get(envVal, 'reclone_contrl') || false
                if (_.get(dataCopy, 'monitor_info')) dataCopy.moniter_contrl = true
                // 以下是表单值的同步
                result = getFormData(dataCopy)
            }
            if (operateType !== 'template' && operateType !== 'submit')
                setIsYamlFormat(!isYamlFormat)
        } else {
            requestCodeMessage(code, msg)
        }
        return { code, result }
    }

    const handleServerChannel = (testConfig: any[]) => {
        const flag = location.search.indexOf('inheriting_machine') !== -1
        return testConfig.map((item: any) => {
            const cases = _.get(item, 'cases') || []
            item.cases = cases.map((ctx: any) => {
                const { customer_server, server_object_id } = ctx || {}
                const channel_type = _.get(customer_server, 'custom_channel')
                const ip = _.get(customer_server, 'custom_ip')
                if (channel_type && ip) {
                    ctx.server = {
                        ip,
                        channel_type
                    }
                    delete ctx.customer_server
                }
                if (flag && server_object_id) {
                    delete ctx.server_tag_id
                }
                return ctx
            })

            return item
        })
    }

    const handleSubmit = async () => {
        if (fetching) return false
        setEnvErrorFlag(false)
        setFetching(true)
        let resultData = {}
        if (isYamlFormat) {
            const { code, result } = await handleFormatChange('submit')
            resultData = result
            if (code !== 200) return
        }
        let data = isYamlFormat ? await transformDate(resultData) : await transformDate()
        data = {
            ...data,
            workspace: ws_id,
            job_type: detail.id,
        }

        if (name === 'TestTemplate') {
            data = {
                ...data,
                data_from: 'template',
                template_id: templateDatas.id,
                job_type: detail.id,
            }
        }

        if (name === 'TestExport') {
            data = {
                ...data,
                data_from: 'rerun',
                job_id: jt_id
            }
        }
        if (isMonitorEmpty(data)) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }))
        }

        if (!data.test_config) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }))
        }
        // console.log(data.test_config)
        const $test_config = handleServerChannel(data.test_config)
        try {
            const { code, msg } = await createWsJobTest({ ...data, test_config: $test_config })
            if (code === 200) {
                setInitialState({ ...initialState, refreshMenu: !initialState?.refreshMenu })
                history.push(`/ws/${ws_id}/test_result`)
                message.success(formatMessage({ id: 'ws.test.job.operation.success' }))
            }
            if (code !== 200) {
                if (code === 1380)
                    setEnvErrorFlag(true)
                else
                    requestCodeMessage(code, msg)
            }
        }
        catch (error) {

        }
        setFetching(false)
    }

    const isMonitorEmpty = (data: any) => {
        let flag = false
        if (data && data.moniter_contrl) {
            const arrData = Array.isArray(data.monitor_info) ? data.monitor_info : []
            flag = arrData.some((item: any) => item && item.monitor_type === 'custom_machine' && !item.server)
        }
        return flag
    }

    const getFormData = (dataCopy: any) => {
        const { template_name, description, enable,
            name, project, baseline,
            monitor_info,
            need_reboot,
            rpm_info,
            script_info,
            env_info,
            kernel_info,
            kernel_version,
            iclone_info,
            build_pkg_info,
            reclone_contrl,
            moniter_contrl,
            test_config,
            cleanup_info, tags, notice_subject, report_name, callback_api, email, ding_token, report_template
        } = dataCopy
        const { os = '', app_name = '' } = iclone_info || {}
        const { branch, ...kernels } = kernel_info || {}
        const templateEditFormInfo = { template_name, description, enable }
        const basicFormInfo = { name, project, baseline }
        const envFormInfo = {
            monitor_info,
            rpm_info,
            script_info,
            need_reboot,
            env_info,
            reclone_contrl,
            os,
            app_name,
            moniter_contrl,
            kernel_version,
            ...kernels,
            ...build_pkg_info
        }

        const testConfigInfo = test_config
        const moreFormInfo = {
            cleanup_info,
            tags,
            notice_subject,
            email,
            ding_token,
            report_template,
            report_name,
            callback_api
        }
        templateEditForm.current?.setVal(templateEditFormInfo)
        basicForm.current?.setVal(basicFormInfo)
        envForm.current?.setVal({ ...envFormInfo, kernel_info, build_pkg_info })
        moreForm.current?.setVal(moreFormInfo)
        const new_test_config = suiteTable.current?.setVal(testConfigInfo) || []
        return { templateEditFormInfo, basicFormInfo, envFormInfo, moreFormInfo, new_test_config }
    }

    const handleSaveTemplateOk = async (vals: any) => {
        if (fetching) return false
        setFetching(true)
        let data = await transformDate()
        if (isMonitorEmpty(data)) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }))
        }
        if (!data.test_config) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }))
        }
        data = {
            workspace: ws_id,
            ...data,
            job_type: detail.id
        }
        const $test_config = handleServerChannel(data.test_config)
        const { code, msg } = await saveTestTemplate({ ...data, test_config: $test_config, ...vals })

        if (code === 200) {
            message.success(formatMessage({ id: 'ws.test.job.operation.success' }))
            saveTemplateDrawer.current.hide()
            templatePopoverRefresh()
            setInitialState({ ...initialState, refreshMenu: !initialState?.refreshMenu })
        }
        else
            requestCodeMessage(code, msg)
        setFetching(false)
    }

    const handleOpenTemplate = async () => {
        let resultData = {}
        if (isYamlFormat) {
            const { code, result } = await handleFormatChange('template')
            resultData = result
            if (code !== 200) return
        }
        const data = isYamlFormat ? await transformDate(resultData) : await transformDate()
        if (isMonitorEmpty(data)) return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }))
        if (!data.test_config) return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }))
        if (name === 'TestJob' || name === 'TestExport')
            saveTemplateDrawer.current.show()
        else
            handleSaveTemplateOk({})
    }

    const handleChangeTemplateName = ({ target }: any) => {
        requestTemplateRun({ job_type_id: detail.id, name: target.value })
    }
    
    const handleTemplateEditFunction = async() => {
        const data = await transformDate()
        if (isMonitorEmpty(data)) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }))
        }
        if (!data.test_config) {
            setFetching(false)
            message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }))
            return
        }
        if (!data.baseline) {
            data.baseline = null
        }
        
        if (!data.baseline_job_id) {
            data.baseline_job_id = null
        }
        if (!data.cleanup_info) {
            data.cleanup_info = ""
        }
        const $test_config = handleServerChannel(data.test_config)
        const { code, msg } = await updateTestTemplate({
            template_id: templateDatas.id,
            workspace: ws_id,
            job_type: detail.id,
            ...data,
            test_config: $test_config
        })
        notification.destroy()
        if (code === 200) {
            const { data: [datas] } = await queryTestTemplateData({ template_id: templateDatas.id })
            setTemplateDatas(datas)
            setModifyTemplate(false)
            setDisabled(true)
            setTemplateEnable(data.enable)
            message.success(formatMessage({ id: 'operation.success' }))
            if (name !== 'TemplatePreview')
                history.push({ pathname: `/ws/${ws_id}/job/templates`, state: state || {} })
        }
        else
            requestCodeMessage(code, msg)
        setFetching(false)
    }

    const handleCancelTemplate = (key:any) =>  {
        notification.close(key)
        setFetching(false)
    }

    const handleSaveTemplateModify = async () => {
        if (fetching) return
        setFetching(true)
        const key = `open${Date.now()}`;
        const btn = (
            <Space>
              <Button type="primary" size="small" onClick={()=> handleTemplateEditFunction()}>
                确认
              </Button>
              <Button type="primary" size="small" onClick={()=> handleCancelTemplate(key)}>
                取消
              </Button>
            </Space>
        );
        const res = await queryCheckJobTemplate({ template_id: jt_id })
        if(res.code === 200 && res.data.length > 0){
            notification.warning({
                duration: null,
                message: '提示',
                description:`当前有测试计划（${res.data[0].plan_name}）引用了该模版，编辑该模版将同时影响到测试计划中的此模版配置，请谨慎操作！`,
                btn,
                key,
              });
        }
        setFetching(false)
    }

    const handleSaveCreateSubmit = async () => {
        if (fetching) return
        setFetching(true)

        const data = await transformDate()
        if (isMonitorEmpty(data)) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }))
        }
        if (!data.test_config) {
            setFetching(false)
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }))
        }
        if (!data.baseline) {
            data.baseline = null
        }
        const $test_config = handleServerChannel(data.test_config)
        const { code, msg } = await updateTestTemplate({
            template_id: templateDatas.id,
            workspace: ws_id,
            job_type: detail.id,
            ...data,
            test_config: $test_config
        })

        if (code === 200) {
            message.success(formatMessage({ id: 'request.save.success' }))
            history.push(`/ws/${ws_id}/test_job/${detail.id}?template_id=${templateDatas.id}`)
        }
        else requestCodeMessage(code, msg)
        setFetching(false)
    }

    const handleTemplatePopoverChange = (v: any) => {
        setTemplateBtnVisible(v)
    }

    const modalProps = {
        disabled, ws_id,
        template: templateDatas,
        test_type: detail?.test_type,
        business_type: detail?.business_type || '',
        server_provider: detail?.server_type,
        server_type: detail?.server_type,
    }
    const bodyPaddding = useMemo(() => {
        if (layoutWidth >= 1240) return (1240 - 1000) / 2
        return 20
    }, [layoutWidth])

    const bodySize = useSize(bodyRef)

    const layoutCss = useMemo(() => {
        const defaultCss = { minHeight: layoutHeight, overflow: 'auto', background: "#f5f5f5" }
        return hasNav ? { ...defaultCss, paddingTop: 50 } : defaultCss
    }, [layoutHeight, hasNav])

    const handleTestYaml = async () => {
        const parmas = { yaml_data: jobInfo, workspace: ws_id }
        const { code, msg } = await testYaml(parmas)
        if (code !== 200)
            requestCodeMessage(code, msg)
        else
            message.success(formatMessage({ id: 'operation.success' }))
    }

    const handleClose = () => {
        setIsYamlFormat(false)
        setJobInfo('')
    }

    const fakeClick = (obj: any) => {
        const ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        obj.dispatchEvent(ev);
    }

    const exportRaw = ($name: string, data: any) => {
        const urlObject = window.URL || window.webkitURL || window;
        const export_blob = new Blob([data]);
        const save_link: any = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = $name;
        fakeClick(save_link);
    }
    const handleDownload = async () => {
        // const parmas = { type: 'yaml2json', yaml_data: jobInfo }
        // let { code, data } = await formatYamlToJson(parmas)
        const fileName = 'job_' + (+new Date())
        // if (code === 200 && _.get(data, 'name')) fileName = _.get(data, 'name')
        exportRaw(`${fileName}.yaml`, jobInfo);
    }

    const queryProjectId = (id: any) => {
        setProjectId(id)
    }

    const renderButton = (
        <>
            {templateEnabel && <Button onClick={handleSaveCreateSubmit}><FormattedMessage id="ws.test.job.SaveCreateSubmit" /></Button>}
            <Button type="primary" onClick={handleSaveTemplateModify} loading={fetching}><FormattedMessage id="ws.test.job.SaveTemplateModify" /></Button>
        </>
    )

    return (
        <div style={layoutCss}>
            {/** 用户未登录提示 */}
            {(!loading && !authList?.user_id) ?
                <div className={styles.not_logged_in}><div style={{ width: '1240px' }}><NotLoggedIn /></div></div> : null}

            {
                hasNav &&
                <Row align="middle" className={styles.page_preview_nav} justify="space-between">
                    <Space>
                        <div
                            style={{ height: 50, width: 50, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onClick={
                                () => {
                                    if (name === 'JobTypePreview') history.push(`/ws/${ws_id}/job/types`)
                                    else {
                                        /* @ts-ignore */
                                        history.push(access.IsWsSetting() ? { pathname: `/ws/${ws_id}/job/templates`, state: state || {} } : "./")
                                    }
                                }
                            }
                        >
                            <ArrowLeftOutlined style={{ fontSize: 20 }} />
                        </div>
                        {name === 'JobTypePreview' && <Typography.Title level={4} ><FormattedMessage id="ws.test.job.JobTypePreview" /></Typography.Title>}
                        {name === 'TemplatePreview' && <Typography.Title level={4} ><FormattedMessage id="ws.test.job.TemplatePreview" /></Typography.Title>}
                        {name === 'TemplateEdit' && <Typography.Title level={4} ><FormattedMessage id="ws.test.job.TemplateEdit" /></Typography.Title>}
                    </Space>
                    {
                        name === 'TemplatePreview' &&
                        <Space>
                            {
                                modifyTemplate &&
                                <>
                                    <Button
                                        onClick={
                                            () => {
                                                setDisabled(true)
                                                setModifyTemplate(false)
                                                suiteTable.current.setChecked(false)
                                            }
                                        }
                                    >
                                        <FormattedMessage id="operation.cancel" />
                                    </Button>
                                    {renderButton}
                                </>
                            }
                            {
                                !modifyTemplate &&
                                <>
                                    <Button onClick={() => handleCopyText(location.href)}><FormattedMessage id="ws.test.job.copy.link" /></Button>
                                    <Access accessible={access.WsMemberOperateSelf(state?.creator)}
                                        fallback={<Button onClick={() => AccessTootip()}><FormattedMessage id="ws.test.job.ModifySetting" /></Button>}
                                    >
                                        <Button onClick={handleModifySetting}><FormattedMessage id="ws.test.job.ModifySetting" /></Button>
                                    </Access>
                                </>
                            }
                        </Space>
                    }
                    {
                        name === 'TemplateEdit' &&
                        <Space>
                            {renderButton}
                        </Space>
                    }
                </Row>
            }

            <Spin spinning={loading}>
                <div className={styles.page_header}
                    style={['TestJob', 'TestExport'].includes(name) ? { paddingBottom: 80 } : {}}
                >
                    <div style={{ height: 250, minWidth: 1080, background: '#fff', position: 'absolute', left: 0, top: 0, width: '100%' }} />
                    <Row className={styles.page_title} justify="center" >
                        <Row style={{ width: bodySize?.width ? bodySize?.width + bodyPaddding * 2 : bodySize?.width }}>
                            <Col span={24}>
                                <Row justify="space-between">
                                    <span>{detail.name}</span>
                                    <Access accessible={access.IsWsSetting()}>
                                        {
                                            (name === 'TestJob' && !loading) &&
                                            <Popover
                                                overlayClassName={styles.template_popover}
                                                placement={"bottomRight"}
                                                open={templateBtnVisible}
                                                onOpenChange={handleTemplatePopoverChange}
                                                title={
                                                    <Input
                                                        autoComplete="off"
                                                        prefix={<SearchOutlined />}
                                                        className={styles.job_search_inp}
                                                        placeholder={formatMessage({ id: 'ws.test.job.search.placeholder.template' })}
                                                        onChange={handleChangeTemplateName}
                                                    />
                                                }
                                                content={
                                                    <Menu style={{ maxHeight: 480, overflow: 'auto', paddingBottom: 12 }} >
                                                        {
                                                            Array.isArray(templateList) && templateList.length > 0 &&
                                                            <>
                                                                {
                                                                    templateList.map(
                                                                        (item: any) => (
                                                                            <div className={styles.template_item}
                                                                                key={item.id}
                                                                                onClick={(): any => {
                                                                                    if (!item.job_type) return message.error(formatMessage({ id: 'ws.test.job.please.delete' }))
                                                                                    history.push(`/ws/${ws_id}/test_job/${item.job_type_id}?template_id=${item.id}`)
                                                                                    setTemplateBtnVisible(false)
                                                                                }}
                                                                            >
                                                                                <EllipsisPulic title={item.name} />
                                                                            </div>
                                                                        )
                                                                    )
                                                                }
                                                            </>
                                                        }
                                                        {
                                                            Array.isArray(templateList) && templateList.length === 0 &&
                                                            <div style={{ lineHeight: '80px', textAlign: 'center', color: 'rgba(0,0,0,.35)' }}>
                                                                <FormattedMessage id="ws.test.job.no.template" />
                                                            </div>
                                                        }
                                                    </Menu>
                                                }
                                            >
                                                <Button type="default"><FormattedMessage id="ws.test.job.use.template.create" /></Button>
                                            </Popover>
                                        }
                                    </Access>
                                </Row>
                                <div className={styles.page_tags}>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>
                                        {
                                            detail.server_type &&
                                            <FormattedMessage id={`header.${detail.server_type}`} defaultMessage="" />
                                        }
                                    </Tag>
                                    <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>
                                        {detail.test_type === 'business' ?
                                            <FormattedMessage id={`header.business.${detail.business_type}`} defaultMessage="business.others" /> :
                                            detail.test_type && <FormattedMessage id={`header.test_type.${detail.test_type}`} defaultMessage="" />}
                                    </Tag>
                                </div>
                                <div className={styles.page_dec}>{detail.description}</div>
                            </Col>
                        </Row>
                    </Row>
                    <div className={styles.page_body_content} style={isYamlFormat ? { paddingLeft: 0, paddingRight: 0, paddingTop: 0 } : { paddingLeft: bodyPaddding, paddingRight: bodyPaddding, paddingTop: 24 }}>
                        <Spin spinning={isloading} style={{ width: '100%' }}>
                            <Row className={styles.page_body} justify="center" >
                                <div ref={bodyRef} style={{ width: 1000 }} />
                                {
                                    (name === 'TestJob' || name === 'TestExport') &&
                                    <div
                                        className={styles.yaml_transform_icon}
                                        style={isYamlFormat ? { top: 10, right: 10 } : { top: -14, right: -110 }}
                                        onClick={handleFormatChange}
                                    >
                                        <Space>
                                            <YamlFormat />
                                            {isYamlFormat ?
                                                <FormattedMessage id="ws.test.job.switch.form.mode" /> :
                                                <FormattedMessage id="ws.test.job.switch.yaml.mode" />
                                            }
                                        </Space>
                                    </div>
                                }
                                <div style={isYamlFormat ? { width: 1240, display: 'none' } : { width: 1000 }}>
                                    <Col span={24} style={{ width: 1000 }}>
                                        {name === 'TestJob' && <Row className={styles.page_body_title}><FormattedMessage id="ws.test.job.create.job" /></Row>}
                                        {name === 'TestExport' && <Row className={styles.page_body_title}><FormattedMessage id="ws.test.job.import.config" /></Row>}
                                        {
                                            (name === 'TemplatePreview' || name === 'TemplateEdit' || name === 'TestTemplate') &&
                                            <Row className={styles.page_body_title}><FormattedMessage id="ws.test.job.test.template" /></Row>
                                        }
                                    </Col>

                                    <Col span={24} style={{ width: 1000 }}>

                                        {
                                            (name === 'TemplatePreview' || name === 'TemplateEdit' || name === 'TestTemplate') &&
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span><FormattedMessage id="ws.test.job.templateForm" /></span>
                                                </div>
                                                <TemplateForm
                                                    onEnabelChange={setTemplateEnable}
                                                    ref={templateEditForm}

                                                    {...modalProps}
                                                />
                                            </Row>
                                        }
                                        {
                                            JSON.stringify(items.basic) !== '{}' &&
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span><FormattedMessage id="ws.test.job.basicForm" /></span>
                                                </div>
                                                <BasciForm
                                                    onRef={basicForm}
                                                    contrl={items.basic}
                                                    callBackProjectId={queryProjectId}
                                                    projectListDataRef={projectListData}
                                                    baselineListDataRef={baselineListData}
                                                    isYamlFormat={isYamlFormat}
                                                    {...modalProps}
                                                />
                                            </Row>
                                        }
                                        {
                                            JSON.stringify(items.env) !== '{}' &&
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span><FormattedMessage id="ws.test.job.envForm" /></span>
                                                </div>
                                                <EnvForm
                                                    onRef={envForm}
                                                    contrl={items.env}
                                                    envErrorFlag={envErrorFlag}
                                                    project_id={projectId}
                                                    {...modalProps}
                                                />
                                            </Row>
                                        }
                                        {
                                            detail.test_type &&
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span><b style={{ fontWeight: 'normal', color: '#ff4d4f' }}>*&nbsp;</b>
                                                        <FormattedMessage id="ws.test.job.suiteTable" />
                                                    </span>
                                                </div>
                                                <Col offset={3} span={21}>
                                                    <SelectSuite
                                                        {...modalProps}
                                                        key={detail.test_type}
                                                        handleData={(data: any) => setTest_config(data)}
                                                        contrl={items.suite}
                                                        onRef={suiteTable}
                                                        setPageLoading={setLoading}
                                                        caseDataRef={caseData}
                                                    />
                                                </Col>
                                            </Row>
                                        }
                                        {
                                            JSON.stringify(items.more) !== '{}' &&
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span><FormattedMessage id="ws.test.job.moreForm" /></span>
                                                </div>
                                                <MoreForm
                                                    {...modalProps}
                                                    onRef={moreForm}
                                                    contrl={items.more}
                                                    isReset={isReset}
                                                    tagsDataRef={tagsData}
                                                    reportTemplateDataRef={reportTemplateData}
                                                />
                                            </Row>
                                        }
                                    </Col>
                                </div>
                                {
                                    isYamlFormat &&
                                    <div className={styles.yaml_container} >
                                        <Col span={24} className={styles.yaml_operate} >
                                            <Space align="center" className={styles.yaml_copy_link} onClick={handleTestYaml}>
                                                <YamlTest className={styles.operate_icon} />
                                                <FormattedMessage id="ws.test.job.yaml.test" />
                                            </Space>
                                            <Space align="center" className={styles.yaml_copy_link} id='copy_dom_id' onClick={() => handleCopyText(jobInfo.replace('---', ''))} style={{ marginLeft: 10 }}>
                                                <YamlCopy className={styles.operate_icon} />
                                                <FormattedMessage id="ws.test.job.copy" />
                                            </Space>
                                            <Space align="center" className={styles.yaml_copy_link} onClick={handleDownload} style={{ marginLeft: 10 }}>
                                                <YamlDownload className={styles.operate_icon} />
                                                <FormattedMessage id="ws.test.job.download" />
                                            </Space>
                                            <CloseOutlined onClick={handleClose} style={{ float: 'right', color: '#fff' }} />
                                        </Col>
                                        <CodeEditer
                                            mode='yaml'
                                            code={jobInfo}
                                            onChange={(value: any) => setJobInfo(
                                                value
                                            )}
                                        />
                                    </div>
                                }
                            </Row>
                        </Spin>
                    </div>
                </div>
                {
                    (name === 'TestJob' || name === 'TestTemplate' || name === 'TestExport') &&
                    <Row justify="end" className={styles.options_bar}>
                        <Space>
                            <Popconfirm
                                title={<FormattedMessage id="ws.test.job.reset.confirm.info" />}
                                onConfirm={_.partial(handleReset, true)}
                                okText={<FormattedMessage id="operation.confirm" />}
                                cancelText={<FormattedMessage id="operation.cancel" />}
                            >
                                <Button><FormattedMessage id="ws.test.job.reset" /></Button>
                            </Popconfirm>

                            {/* <Access accessible={access.IsWsSetting()}>
                                <Button onClick={handleOpenTemplate}><FormattedMessage id="ws.test.job.save.as.template" /></Button>
                            </Access>
                            <Access accessible={access.IsWsSetting()}>
                                <Button type="primary" onClick={handleSubmit} ><FormattedMessage id="ws.test.job.submit.test" /></Button>
                            </Access> */}
                            <Button onClick={handleOpenTemplate} disabled={!access.IsWsSetting()}><FormattedMessage id="ws.test.job.save.as.template" /></Button>
                            <Button type="primary" onClick={handleSubmit} disabled={!access.IsWsSetting()}><FormattedMessage id="ws.test.job.submit.test" /></Button>
                        </Space>
                    </Row>
                }
                <SaveTemplate ref={saveTemplateDrawer} onOk={handleSaveTemplateOk} />
            </Spin>
        </div >
    )
}

export default TestJob