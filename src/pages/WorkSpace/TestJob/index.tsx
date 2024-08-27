import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Row,
    Tag,
    Space,
    Button,
    Col,
    Spin,
    Typography,
    message,
    Menu,
    Input,
    Popover,
    Popconfirm,
    notification,
    Form,
    Radio,
    Alert,
} from 'antd';

import {
    history,
    useRequest,
    useModel,
    useAccess,
    Access,
    useIntl,
    FormattedMessage,
    useParams,
    useLocation,
} from 'umi';
import { requestCodeMessage, AccessTootip, redirectErrorPage, isNumber } from '@/utils/utils';
import { useClientSize, writeDocumentTitle, useCopyText } from '@/utils/hooks';
import styles from './index.less';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import NotLoggedIn from '@/components/Public/NotLoggedIn';
import { queryJobTypeItems } from '@/pages/WorkSpace/JobTypeManage/CreateJobType/services';
import { queryJobTypeList } from '@/pages/WorkSpace/JobTypeManage/services';

import { ArrowLeftOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';

import BasciForm from './components/JobForms/BasicForm';
import EnvForm from './components/JobForms/EnvForm';
import MoreForm from './components/JobForms/MoreForm';
import SelectSuite from './components/SelectSuite';
import SaveTemplate from './components/SaveTemplate';
import TemplateForm from './components/JobForms/TemplateForm';

import {
    createWsJobTest,
    queryTestTemplateData,
    queryTestExportValues,
    formatYamlToJson,
    testYaml,
    queryCheckJobTemplate,
} from './services';
import {
    saveTestTemplate,
    queryTestTemplateList,
    updateTestTemplate,
} from '@/pages/WorkSpace/TestTemplateManage/service';

import lodash from 'lodash';
import { ReactComponent as YamlFormat } from '@/assets/svg/yaml_format.svg';
import { ReactComponent as YamlCopy } from '@/assets/svg/yaml_copy.svg';
import { ReactComponent as YamlDownload } from '@/assets/svg/yaml_download.svg';
import { ReactComponent as YamlTest } from '@/assets/svg/yaml_test.svg';
import CodeEditer from '@/components/CodeEditer';
import CaseConfTables from './SuiteTables/layout';
import { TestJobProvider } from './provider';

interface PropsTypes {
    templateEditFormInfo?: any;
    basicFormInfo?: any;
    envFormInfo?: any;
    moreFormInfo?: any;
    new_test_config?: any;
}

const compact = (obj: any) => {
    const result: any = {};
    Object.keys(obj).forEach((key) => {
        const z = obj[key];
        if ([null, undefined, ''].includes(z)) return;
        const t = Object.prototype.toString.call(z);
        if (t === '[object Array]') {
            const arrayItem = z.filter((item: any) => {
                let noData = false;
                if (!item) return false;
                Object.keys(item).forEach((ctx) => {
                    const o = item[ctx];
                    if ([null, undefined, ''].includes(o)) noData = true;
                });
                if (!noData) return item;
            });
            if (arrayItem.length !== 0) result[key] = arrayItem;
        } else if (t === '[object Object]') {
            if (JSON.stringify(z) !== '{}') result[key] = compact(z);
        } else result[key] = z;
    });
    return Object.assign({}, result);
};

const TestJob: React.FC<any> = (props) => {
    const { formatMessage } = useIntl();
    const { name } = props.route;
    const { height: layoutHeight } = useClientSize();
    const hasNav = ['TemplatePreview', 'TemplateEdit', 'JobTypePreview'].includes(name);
    const [form] = Form.useForm();

    const { initialState, setInitialState } = useModel('@@initialState');
    const { authList } = initialState;
    const { ws_id, jt_id } = useParams() as any;
    const { query, state, pathname } = useLocation() as any;
    const access = useAccess();
    writeDocumentTitle(`Workspace.${name}`);
    const [test_config, setTest_config] = useState<any>([]);
    const [detail, setDetail] = useState<any>({ name: '', server_type: '', test_type: '' });
    const [items, setItems] = useState<any>({ basic: {}, env: {}, suite: {}, more: {} });
    const [loading, setLoading] = useState(true);
    const [envErrorFlag, setEnvErrorFlag] = useState(false);
    const [isloading, setIsloading] = useState(false);
    const [disabled, setDisabled] = useState(name === 'TemplatePreview');
    const [modifyTemplate, setModifyTemplate] = useState(false);
    const [templateDatas, setTemplateDatas] = useState<any>({});
    const [templateBtnVisible, setTemplateBtnVisible] = useState(false);
    const moreForm: any = useRef(null);
    const envForm: any = useRef(null);
    const basicForm: any = useRef(null);
    const suiteTable: any = useRef(null);
    // yaml 回显
    const projectListData: any = useRef(null);
    const baselineListData: any = useRef(null);
    const tagsData: any = useRef(null);
    const reportTemplateData: any = useRef(null);
    const caseData: any = useRef(null);

    const caseConfTableRef: any = useRef(null);

    const saveTemplateDrawer: any = useRef();
    const templateEditForm: any = useRef();
    const [projectId, setProjectId] = useState();
    const [templateEnabel, setTemplateEnable] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [newSaveLoading, setNewSaveLoading] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [timeTagList, setTimeTagList]: any = useState([]);

    /* show type case or conf 时 选择框使用的值 */
    const [suiteSelectedKeys, setSuiteSelectedKeys] = React.useState({
        cluster: [],
        standalone: [],
    });
    const [jobInfo, setJobInfo] = useState('');
    const [isYamlFormat, setIsYamlFormat] = useState(false);
    const {
        data: templateList,
        run: requestTemplateRun,
        refresh: templatePopoverRefresh,
    } = useRequest((params: any) => queryTestTemplateList(params), {
        initialData: [],
        throttleInterval: 300,
        manual: true,
    });

    const handleModifySetting = () => {
        setDisabled(false);
        setModifyTemplate(true);
    };

    const goValidate = (form: any) => {
        return new Promise((resolve, reject) =>
            form
                .validateFields()
                .then(resolve)
                .catch(() => {
                    reject();
                    setFetching(false);
                    setNewSaveLoading(false);
                }),
        );
    };

    const getPageData = async () => {
        setLoading(true);
        let job_type_id = jt_id;

        if (name === 'TestExport') {
            const { data } = await queryTestExportValues({ job_id: jt_id, ...query });
            setTemplateDatas(data);
            setTest_config(data.test_config);
            job_type_id = data.job_type_id;
            if (data?.server_schedule_rule) {
                form.setFieldsValue({ server_schedule_rule: data?.server_schedule_rule });
            }
        }

        if (['TestTemplate', 'TemplatePreview', 'TemplateEdit', 'TestJob'].includes(name)) {
            let template_id: any = null;
            if (name === 'TestJob' && query.template_id) template_id = query.template_id;

            if (['TestTemplate', 'TemplatePreview', 'TemplateEdit'].includes(name))
                template_id = jt_id;

            if (template_id) {
                const { code, data } = await queryTestTemplateData({ template_id });
                if (code === 500) {
                    redirectErrorPage(500);
                    return;
                }
                const [datas] = data;
                job_type_id = datas.job_type_id;
                setTemplateDatas(datas);
                setTest_config(datas.test_config);
                setTemplateEnable(datas.enable);
                if (datas?.server_schedule_rule) {
                    form.setFieldsValue({ server_schedule_rule: datas?.server_schedule_rule });
                }
            } else {
                setTemplateDatas({});
            }
        }

        const {
            data: [jobTypedetail],
        } = await queryJobTypeList({ jt_id: job_type_id });
        if (!jobTypedetail) return redirectErrorPage(404);
        setDetail(jobTypedetail);
        const { data: items } = await queryJobTypeItems({ jt_id: job_type_id });
        filterItems(items);
        setLoading(false);
        if (name === 'TestJob') requestTemplateRun({ ws_id, job_type_id, enable: 'True' });
    };

    const filterItems = (t: any) => {
        const basic: any = {},
            env: any = {},
            suite: any = {},
            more: any = {};

        t?.forEach((i: any) => {
            if (i.config_index === 1) basic[i.name] = i;
            if (i.config_index === 2) env[i.name] = i;
            if (i.config_index === 3) suite[i.name] = i;
            if (i.config_index === 4) more[i.name] = i;
        });

        setItems({ basic, env, suite, more });
    };

    const handleCopyText = useCopyText(formatMessage({ id: 'request.copy.success' }));

    const handleReset = (flag = false) => {
        setIsReset(flag);
        setJobInfo('');

        caseConfTableRef.current?.rest();
        templateEditForm.current?.reset();
        basicForm.current?.reset();
        moreForm.current?.reset();
        envForm.current?.reset();
        suiteTable.current?.reset();
    };

    //数据初始化 init hooks //新建job 1 jobType预览 2 模板预览 3 模板测试 4
    useEffect(() => {
        handleReset();
        getPageData();
    }, [pathname, query]);

    const toSuiteItemData = (item: any) => {
        const {
            id: test_suite,
            setup_info,
            console: Console,
            need_reboot,
            priority,
            cleanup_info,
            run_mode,
            test_case_list: cases,
            ...rest
        }: any = item;
        const { suite_show_type } = detail;

        const itemData = {
            ...compact({
                test_suite,
                setup_info,
                cleanup_info,
                console: Console,
                need_reboot,
                priority,
                run_mode,
            }),
            cases,
        };

        if (suite_show_type === 'case') {
            const {
                server_object_id,
                server_tag_id,
                customer_server,
                is_instance,
                custom_ip,
                custom_channel,
            } = rest;
            const serverObject: any = {
                server_object_id,
                customer_server,
                is_instance,
            };

            if (server_tag_id) {
                serverObject.server_tag_id = server_tag_id?.map((item: any) => item.id);
            }

            if (custom_ip && custom_channel && !customer_server) {
                serverObject.customer_server = {
                    custom_channel,
                    custom_ip,
                };
            }

            Object.keys(serverObject).forEach((ctx: any) => {
                if ([null, undefined, ''].includes(serverObject?.[ctx])) return;
                itemData[ctx] = serverObject?.[ctx];
            });
        }

        return itemData;
    };

    const toYamlServer = (item: any, run_mode: any) => {
        const { server_type: server_provider } = detail || {};
        const { server_object_id, server_tag_id, customer_server, is_instance } = item;
        const server: any = {};

        if (customer_server) {
            const { custom_ip, custom_channel } = customer_server;
            server.ip = custom_ip;
            server.channel_type = custom_channel;
        }

        if (server_tag_id) {
            server.tag = server_tag_id;
        }

        if (Object.prototype.toString.call(server_object_id) === '[object Number]') {
            if (server_provider === 'aliyun' && run_mode !== 'cluster') {
                if (Object.prototype.toString.call(is_instance) === '[object Number]') {
                    if (is_instance === 0) {
                        server.config = server_object_id;
                    }
                    if (is_instance === 1) {
                        server.instance = server_object_id;
                    }
                }
            } else {
                if (run_mode === 'cluster') server.cluster = server_object_id;
                else server.id = server_object_id;
            }
        }
        return server;
    };

    const toYamlItem = (item: any, run_mode: any) => {
        const { server_object_id, server_tag_id, customer_server, is_instance, ...caseRest } = item;
        const yamlObject = {
            ...caseRest,
        };

        const server = toYamlServer(item, run_mode);
        if (JSON.stringify(server) !== '{}') {
            yamlObject.server = server;
        }

        return yamlObject;
    };

    const transConfData = (testConfigData: any) => {
        return testConfigData.map((item: any) => {
            const { cases, ...rest } = toSuiteItemData(item);
            return {
                ...rest,
                cases: cases.map((ctx: any) => {
                    const {
                        id: test_case,
                        setup_info,
                        cleanup_info,
                        repeat,
                        timeout,
                        server_object_id,
                        server_tag_id,
                        need_reboot,
                        console: Console,
                        monitor_info,
                        priority,
                        env_info,
                        is_instance,
                        custom_ip,
                        custom_channel,
                    } = ctx;

                    const caseItemData: any = {
                        test_case,
                        cleanup_info,
                        repeat,
                        timeout,
                        server_object_id,
                        need_reboot,
                        console: Console,
                        monitor_info,
                        priority,
                        is_instance,
                    };

                    if (setup_info !== '[]') {
                        caseItemData.setup_info = setup_info;
                    }

                    if (server_tag_id?.length) {
                        caseItemData.server_tag_id = server_tag_id?.map((ctx: any) => ctx?.id);
                    }

                    if (env_info?.length) {
                        const envs: any = env_info?.filter((i: any) => {
                            if (i.name && i.val) return i;
                        });
                        const evnInfoStr = envs?.reduce(
                            (i: any, p: any, idx: number) =>
                                i.concat(`${idx ? '\n' : ''}${p?.name?.trim()}=${p?.val}`),
                            '',
                        );
                        caseItemData.env_info = evnInfoStr;
                    }

                    if (custom_channel && custom_ip) {
                        caseItemData.customer_server = {
                            custom_channel,
                            custom_ip,
                        };
                    }

                    return compact(caseItemData);
                }),
            };
        });
    };

    const yamlToObject = (list: any) => {
        return list.reduce((pre: any, cur: any) => {
            const { cases, ...rest } = cur;
            const listItem = { ...rest };
            listItem.cases = cases.map((ctx: any) => {
                const { server, ...caseItemRest } = ctx;

                const caseObj = { ...caseItemRest };

                const {
                    id,
                    config,
                    instance,
                    cluster,
                    tag,
                    channel_type,
                    ip,
                    name: $name,
                } = server || {};

                if (id) caseObj.server_object_id = id;
                if (config) {
                    caseObj.server_object_id = config;
                    caseObj.is_instance = 0;
                }

                if (instance) {
                    caseObj.server_object_id = instance;
                    caseObj.is_instance = 1;
                }

                if (cluster) {
                    caseObj.server_object_id = cluster;
                    caseObj.run_mode = cluster;
                }
                if (tag?.length) {
                    caseObj.server_tag_id = tag.map((ctx: any) => ctx?.id);
                }

                if (channel_type && ip) {
                    caseObj.customer_server = {
                        custom_channel: channel_type,
                        custom_ip: ip,
                    };
                    caseObj.ip = ip;
                }

                if ($name) {
                    if (Object.prototype.toString.call($name) === '[object Array]') {
                        caseObj.ip = ip.join(',');
                    } else {
                        caseObj.ip = ip;
                    }
                }
            });
            return pre.concat(listItem);
        }, []);
    };

    const transformDate = async (result: PropsTypes | null = null) => {
        let data: any = {};
        let installKernel = '';

        if (['TestTemplate', 'TemplatePreview', 'TemplateEdit'].includes(name)) {
            const templateFormVal = result
                ? result.templateEditFormInfo
                : await goValidate(templateEditForm.current.form);
            data = Object.assign(data, compact(templateFormVal));
        }

        if (JSON.stringify(items.basic) !== '{}') {
            const basicVal = result
                ? result.basicFormInfo
                : await goValidate(basicForm.current.form);
            data = Object.assign(data, compact(basicVal));
        }

        if (JSON.stringify(items.env) !== '{}') {
            const envVal = result ? result.envFormInfo : await goValidate(envForm.current.form);
            const {
                env_info,
                rpm_info,
                script_info,
                moniter_contrl,
                monitor_info,
                reclone_contrl,
                app_name,
                os,
                vm,
                need_reboot,
                kernel_version,
                kernel_install,
                code_repo,
                code_branch,
                compile_branch,
                cpu_arch,
                commit_id,
                kernel_packages,
                build_config,
                build_machine,
                scripts,
                kernel,
                devel,
                headers,
                hotfix_install,
                ...rest
            }: any = envVal;

            installKernel = kernel_install;
            const envStr = env_info;

            const build_pkg_info = {
                code_repo,
                code_branch,
                compile_branch,
                cpu_arch,
                commit_id,
                build_config,
                build_machine,
                scripts,
                ...rest,
            };

            const kernel_info = {
                hotfix_install,
                scripts,
                kernel_packages: kernel_packages?.map((item: any) => item?.trim()), // 去除输入内容两端空格
            };

            let scriptInfo = script_info;
            let rpmInfo = rpm_info;

            if (!need_reboot) {
                rpmInfo = rpmInfo ? rpmInfo.map((i: any) => ({ ...i, pos: 'before' })) : undefined;
                scriptInfo = scriptInfo
                    ? scriptInfo.map((i: any) => ({ ...i, pos: 'before' }))
                    : undefined;
            }

            const envProps: any = {
                env_info: envStr ? envStr : '',
                rpm_info: rpmInfo,
                script_info: scriptInfo,
                moniter_contrl,
                // monitor_info,
                reclone_contrl,
                iclone_info: os || app_name || vm ? { os, app_name, vm } : undefined,
                need_reboot,
                kernel_version,
            };

            if (code_repo) envProps.build_pkg_info = build_pkg_info;
            else envProps.kernel_info = kernel_info;

            data = Object.assign(data, compact(envProps), { monitor_info });
        }

        if (JSON.stringify(items.more) !== '{}') {
            const moreVal: any = result
                ? result.moreFormInfo
                : await goValidate(moreForm.current.form);
            const email = moreVal.email ? moreVal.email.replace(/\s/g, ',') : null;
            data = Object.assign(data, compact({ ...moreVal, email }));
        }

        const testConfigData = result ? result.new_test_config : test_config;
        const test_list_data =
            detail.suite_show_type === 'default'
                ? testConfigData
                : Object.entries(suiteSelectedKeys).reduce((pre, cur) => {
                      const [, vals]: any = cur;
                      return pre.concat(vals);
                  }, []);

        if (test_list_data?.length > 0) {
            const test_conf = transConfData(test_list_data);
            data.test_config = test_conf;
        }

        if (installKernel !== 'install_push') data.kernel_version = null;
        const report_template = data.report_template;
        delete data.report_template;
        if ('report_name' in data && lodash.get(data, 'report_name'))
            data.report_template = report_template;

        try {
            const { server_schedule_rule } = await form.validateFields();
            data.server_schedule_rule = server_schedule_rule;
        } catch (err) {}

        return data;
    };

    const handleFormatChange = async (operateType: any = '') => {
        let parmas = {};
        const envVal = envForm && envForm.current ? await goValidate(envForm.current.form) : {};
        const { suite_show_type } = detail;
        setIsloading(true);
        if (!isYamlFormat) {
            const formData: any = (await transformDate()) || {};
            const {
                test_config: $test_config,
                moniter_contrl,
                reclone_contrl,
                kernel_version,
                ...json_rest
            } = formData;

            const json_data = {
                ...json_rest,
                test_config: $test_config?.reduce((pre: any, cur: any) => {
                    const { run_mode, cases, ...rest } = cur;
                    let suiteItemData = rest;

                    if (suite_show_type === 'case') {
                        suiteItemData = toYamlItem(rest, run_mode);
                    }

                    const suiteObject = {
                        ...suiteItemData,
                        cases: cases?.map((item: any) => toYamlItem(item, run_mode)),
                    };
                    return pre.concat(suiteObject);
                }, []),
            };

            if (kernel_version) {
                json_data.kernel_version = kernel_version;
            }

            parmas = { type: 'json2yaml', json_data, workspace: ws_id };
        }

        if (isYamlFormat) parmas = { type: 'yaml2json', yaml_data: jobInfo, workspace: ws_id };

        const { code, msg, data } = await formatYamlToJson(parmas);
        // operateType !== 'template' && setIsloading(false)
        setIsloading(false);
        let result = {};
        if (code !== 200) {
            requestCodeMessage(code, msg);
        } else {
            if (!isYamlFormat) setJobInfo(data);
            if (isYamlFormat) {
                const dataCopy = lodash.cloneDeep(data);
                const { test_config: $suite_list } = data;
                if (lodash.isArray($suite_list)) {
                    $suite_list.forEach((item: any) => {
                        let cases = lodash.get(item, 'cases');
                        item.run_mode = 'standalone';
                        if (lodash.isArray(cases)) {
                            cases = cases.map((obj: any) => {
                                const server = lodash.get(obj, 'server');
                                if (lodash.has(server, 'id')) {
                                    obj.server_object_id = lodash.get(server, 'id');
                                }
                                if (lodash.get(server, 'config')) {
                                    obj.server_object_id = lodash.get(server, 'config');
                                    obj.is_instance = 0;
                                }
                                if (lodash.get(server, 'instance')) {
                                    obj.server_object_id = lodash.get(server, 'instance');
                                    obj.is_instance = 1;
                                }
                                if (lodash.get(server, 'cluster')) {
                                    obj.server_object_id = lodash.get(server, 'cluster');
                                    item.run_mode = 'cluster';
                                }
                                if (lodash.get(server, 'tag') && lodash.get(server, 'tag').length)
                                    obj.server_tag_id = lodash.get(server, 'tag');
                                if (
                                    lodash.get(server, 'channel_type') &&
                                    lodash.get(server, 'ip')
                                ) {
                                    obj.customer_server = {
                                        custom_channel: lodash.get(server, 'channel_type'),
                                        custom_ip: lodash.get(server, 'ip'),
                                    };
                                    obj.ip = lodash.get(server, 'ip');
                                }
                                if (lodash.get(server, 'name')) {
                                    let ip = server.name;
                                    if (lodash.isArray(ip)) ip = ip.join(',');
                                    obj.ip = ip;
                                }
                                delete obj.server;
                                return obj;
                            });
                            item.cases = cases;
                        }
                    });
                }
                dataCopy.test_config = $suite_list?.map((i: any) => ({
                    ...i,
                    test_suite_id: i.test_suite,
                    cases: i.cases.map((t: any) => ({ ...t, test_case_id: t.test_case })),
                }));
                dataCopy.moniter_contrl = false;
                dataCopy.reclone_contrl = lodash.get(envVal, 'reclone_contrl') || false;
                if (lodash.get(dataCopy, 'monitor_info')) dataCopy.moniter_contrl = true;
                // 以下是表单值的同步
                result = getFormData(dataCopy);
            }
            if (operateType !== 'template' && operateType !== 'submit')
                setIsYamlFormat(!isYamlFormat);
        }

        return { code, result };
    };

    const changeCustomerToServer = (ctx: any) => {
        const { inheriting_machine } = query;

        const { customer_server, server_object_id } = ctx || {};
        const { custom_channel, custom_ip } = customer_server || {};
        if (custom_channel && custom_ip) {
            ctx.server = {
                ip: custom_ip,
                channel_type: custom_channel,
            };
            delete ctx.customer_server;
        }
        if (inheriting_machine && server_object_id) {
            delete ctx.server_tag_id;
        }
        return ctx;
    };

    const handleServerChannel = (testConfig: any[]) => {
        return testConfig.map((item: any) => {
            const { cases, ...rest } = item;

            const { suite_show_type } = detail;
            let objs = { ...rest };

            if (suite_show_type === 'case') {
                objs = {
                    ...changeCustomerToServer(rest),
                };
            }

            return {
                ...objs,
                cases: cases.map((ctx: any) => changeCustomerToServer(ctx)),
            };
        });
    };

    const handleSubmit = async () => {
        if (fetching) return;
        setEnvErrorFlag(false);
        let formData = {};
        setFetching(true);
        if (isYamlFormat) {
            const { code, result = {} } = await handleFormatChange('submit');
            if (code !== 200) {
                setFetching(false);
                return;
            }
            formData = await transformDate(result);
        }
        formData = await transformDate();
        let data: any = {
            ...formData,
            workspace: ws_id,
            job_type: detail.id,
        };

        if (name === 'TestTemplate') {
            data = {
                ...data,
                data_from: 'template',
                template_id: templateDatas.id,
                job_type: detail.id,
            };
        }

        if (name === 'TestExport') {
            data = {
                ...data,
                data_from: 'rerun',
                job_id: jt_id,
            };
        }
        if (isMonitorEmpty(data)) {
            setFetching(false);
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }));
        }

        if (!data.test_config) {
            setFetching(false);
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }));
        }
        /* setFetching(false);
        return; */
        const $test_config = handleServerChannel(data.test_config);

        const { code, msg } = await createWsJobTest({ ...data, test_config: $test_config }).catch(
            () => setFetching(false),
        );
        if (code === 200) {
            setInitialState({ ...initialState, refreshMenu: !initialState?.refreshMenu });
            history.push(`/ws/${ws_id}/test_result`);
            message.success(formatMessage({ id: 'ws.test.job.operation.success' }));
        } else if (code === 1380) {
            setEnvErrorFlag(true);
        } else {
            requestCodeMessage(code, msg);
        }
        setFetching(false);
    };

    const isMonitorEmpty = (data: any) => {
        let flag = false;
        if (data && data.moniter_contrl) {
            const arrData = Array.isArray(data.monitor_info) ? data.monitor_info : [];
            flag = arrData.some(
                (item: any) => item && item.monitor_type === 'custom_machine' && !item.server,
            );
        }
        return flag;
    };

    const getFormData = (dataCopy: any) => {
        const {
            template_name,
            description,
            enable,
            name,
            project,
            baseline,
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
            cleanup_info,
            tags,
            notice_subject,
            report_name,
            callback_api,
            email,
            ding_token,
            report_template,
        } = dataCopy;
        const { os = '', app_name = '' } = iclone_info || {};
        const { branch, ...kernels } = kernel_info || {};
        const templateEditFormInfo = { template_name, description, enable };
        const basicFormInfo = { name, project, baseline };
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
            ...build_pkg_info,
        };

        const testConfigInfo = test_config;
        const moreFormInfo = {
            cleanup_info,
            tags,
            notice_subject,
            email,
            ding_token,
            report_template,
            report_name,
            callback_api,
        };
        templateEditForm.current?.setVal(templateEditFormInfo);
        basicForm.current?.setVal(basicFormInfo);
        envForm.current?.setVal({ ...envFormInfo, kernel_info, build_pkg_info });
        moreForm.current?.setVal(moreFormInfo);
        const new_test_config = suiteTable.current?.setVal(testConfigInfo) || [];
        return { templateEditFormInfo, basicFormInfo, envFormInfo, moreFormInfo, new_test_config };
    };

    const handleSaveTemplateOk = async (vals: any) => {
        if (fetching) return false;
        setFetching(true);
        let data = await transformDate();
        if (isMonitorEmpty(data)) {
            setFetching(false);
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }));
        }
        if (!data.test_config) {
            setFetching(false);
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }));
        }
        data = {
            workspace: ws_id,
            ...data,
            job_type: detail.id,
        };
        const $test_config = handleServerChannel(data.test_config);
        const { code, msg } = await saveTestTemplate({
            ...data,
            test_config: $test_config,
            ...vals,
        }).catch(() => setFetching(false));

        if (code === 200) {
            message.success(formatMessage({ id: 'ws.test.job.operation.success' }));
            saveTemplateDrawer.current.hide();
            templatePopoverRefresh();
            setInitialState({ ...initialState, refreshMenu: !initialState?.refreshMenu });
        } else requestCodeMessage(code, msg);
        setFetching(false);
    };

    const handleOpenTemplate = async () => {
        let resultData = {};
        if (isYamlFormat) {
            const { code, result } = await handleFormatChange('template');
            resultData = result;
            if (code !== 200) return;
        }
        const data = isYamlFormat ? await transformDate(resultData) : await transformDate();
        if (isMonitorEmpty(data))
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }));
        if (!data.test_config)
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }));
        if (['TestJob', 'TestExport'].includes(name)) {
            saveTemplateDrawer.current.show();
        } else handleSaveTemplateOk({});
    };

    const handleChangeTemplateName = ({ target }: any) => {
        requestTemplateRun({ ws_id, job_type_id: detail.id, name: target.value });
    };

    const handleTemplateEditFunction = async (data: any) => {
        const $test_config = handleServerChannel(data.test_config);
        const { code, msg } = await updateTestTemplate({
            template_id: templateDatas.id,
            workspace: ws_id,
            job_type: detail.id,
            ...data,
            test_config: $test_config,
        });
        notification.destroy();
        if (code === 200) {
            const {
                data: [datas],
            } = await queryTestTemplateData({ template_id: templateDatas.id });
            setTemplateDatas(datas);
            setModifyTemplate(false);
            setDisabled(true);
            setTemplateEnable(data.enable);
            message.success(formatMessage({ id: 'operation.success' }));
            if (name !== 'TemplatePreview')
                history.push({ pathname: `/ws/${ws_id}/job/templates`, state: state || {} });
        } else requestCodeMessage(code, msg);
        setFetching(false);
    };

    const handleCancelTemplate = (key: any) => {
        notification.close(key);
    };

    const handleSaveTemplateModify = async () => {
        if (fetching) return;
        setFetching(true);
        const data = await transformDate();
        if (isMonitorEmpty(data)) {
            setFetching(false);
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }));
        }
        if (!data.test_config) {
            setFetching(false);
            message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }));
            return;
        }
        if (!data.baseline) {
            data.baseline = null;
        }

        if (!data.baseline_job_id) {
            data.baseline_job_id = null;
        }
        if (!data.cleanup_info) {
            data.cleanup_info = '';
        }
        if (Object.prototype.toString.call(data) === '[object Object]') {
            const key = `open${Date.now()}`;
            const btn = (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleTemplateEditFunction(data)}
                    >
                        确认
                    </Button>
                    <Button type="primary" size="small" onClick={() => handleCancelTemplate(key)}>
                        取消
                    </Button>
                </Space>
            );
            const res = await queryCheckJobTemplate({ template_id: jt_id });
            if (res.code === 200 && res.data.length > 0) {
                notification.warning({
                    duration: null,
                    message: '提示',
                    description: `当前有测试计划（${res?.data?.[0]?.plan_name}）引用了该模版，编辑该模版将同时影响到测试计划中的此模版配置，请谨慎操作！`,
                    btn,
                    key,
                });
            } else {
                handleTemplateEditFunction(data);
            }
        }
        setFetching(false);
    };

    const handleSaveCreateSubmit = async () => {
        if (newSaveLoading) return;
        setNewSaveLoading(true);

        const data = await transformDate();
        if (isMonitorEmpty(data)) {
            setNewSaveLoading(false);
            return message.warning(formatMessage({ id: 'ws.test.job.machine.cannot.be.empty' }));
        }
        if (!data.test_config) {
            setNewSaveLoading(false);
            return message.warning(formatMessage({ id: 'ws.test.job.suite.cannot.be.empty' }));
        }
        if (!data.baseline) {
            data.baseline = null;
        }
        const $test_config = handleServerChannel(data.test_config);
        const { code, msg } = await updateTestTemplate({
            template_id: templateDatas.id,
            workspace: ws_id,
            job_type: detail.id,
            ...data,
            test_config: $test_config,
        });

        if (code === 200) {
            message.success(formatMessage({ id: 'request.save.success' }));
            history.push(`/ws/${ws_id}/test_job/${detail.id}?template_id=${templateDatas.id}`);
        } else requestCodeMessage(code, msg);
        setNewSaveLoading(false);
    };

    const handleTemplatePopoverChange = (v: any) => {
        setTemplateBtnVisible(v);
    };

    const modalProps = {
        disabled,
        ws_id,
        template: templateDatas,
        test_type: detail?.test_type,
        business_type: detail?.business_type || '',
        server_provider: detail?.server_type,
        server_type: detail?.server_type,
    };

    const layoutCss = useMemo(() => {
        const defaultCss = { minHeight: layoutHeight, overflow: 'auto', background: '#f5f5f5' };
        return hasNav ? { ...defaultCss, paddingTop: 50 } : defaultCss;
    }, [layoutHeight, hasNav]);

    const handleTestYaml = async () => {
        const parmas = { yaml_data: jobInfo, workspace: ws_id };
        const { code, msg } = await testYaml(parmas);
        if (code !== 200) requestCodeMessage(code, msg);
        else message.success(formatMessage({ id: 'operation.success' }));
    };

    const handleClose = () => {
        setIsYamlFormat(false);
        setJobInfo('');
    };

    const fakeClick = (obj: any) => {
        const ev = document.createEvent('MouseEvents');
        ev.initMouseEvent(
            'click',
            true,
            false,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null,
        );
        obj.dispatchEvent(ev);
    };

    const exportRaw = ($name: string, data: any) => {
        const urlObject = window.URL || window.webkitURL || window;
        const export_blob = new Blob([data]);
        const save_link: any = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = $name;
        fakeClick(save_link);
    };
    const handleDownload = async () => {
        const fileName = 'job_' + +new Date();
        exportRaw(`${fileName}.yaml`, jobInfo);
    };

    const queryProjectId = (id: any) => {
        setProjectId(id);
    };

    const renderButton = (
        <>
            {templateEnabel && (
                <Button onClick={handleSaveCreateSubmit} loading={newSaveLoading}>
                    <FormattedMessage id="ws.test.job.SaveCreateSubmit" />
                </Button>
            )}
            <Button type="primary" onClick={handleSaveTemplateModify} loading={fetching}>
                <FormattedMessage id="ws.test.job.SaveTemplateModify" />
            </Button>
        </>
    );

    const transSuiteSelectedKeys = (obj: any) => {
        return Object.entries(obj).reduce((pre: any, cur: any) => {
            const [, $list] = cur;
            return pre.concat($list);
        }, []);
    };

    /*  */
    const suite_conf_lists = React.useMemo(() => {
        const { suite_show_type } = detail;
        const confs = ['conf', 'case'].includes(suite_show_type)
            ? transSuiteSelectedKeys(suiteSelectedKeys)
            : test_config;
        return confs;
    }, [test_config, suiteSelectedKeys, detail]);

    const dohasRule = (item: any) => {
        const { server_object_id, server_tag_id, is_instance, ip } = item;

        if (!ip || ip === '随机') {
            return true;
        }

        if (isNumber(server_object_id) && isNumber(is_instance)) {
            if (is_instance === 0) {
                return true;
            }
        }

        if (server_tag_id?.length) {
            return true;
        }

        return false;
    };

    const hasServerScheduleRule = React.useMemo(() => {
        let hasRule: boolean = false;
        const { suite_show_type } = detail;
        console.log(suite_conf_lists);
        if (!suite_conf_lists?.length) {
            return hasRule;
        }
        for (const ctx in suite_conf_lists) {
            const { test_case_list } = suite_conf_lists[ctx];
            if (suite_show_type === 'case') {
                const rule = dohasRule(suite_conf_lists[ctx]);
                if (rule) return rule;
            }

            if (suite_show_type !== 'case') {
                for (const item in test_case_list) {
                    const caseRule = dohasRule(test_case_list[item]);
                    if (caseRule) return caseRule;
                }
            }
        }
        return hasRule;
    }, [suite_conf_lists, detail]);

    return (
        <TestJobProvider.Provider
            value={{
                jobTypeDetails: detail,
                templateDatas,
                items,
                suiteSelectedKeys,
                setSuiteSelectedKeys,
            }}
        >
            <div style={layoutCss}>
                {/** 用户未登录提示 */}
                {!loading && !authList?.user_id ? (
                    <div className={styles.not_logged_in}>
                        <div style={{ width: '1240px' }}>
                            <NotLoggedIn />
                        </div>
                    </div>
                ) : null}

                {hasNav && (
                    <Row align="middle" className={styles.page_preview_nav} justify="space-between">
                        <Space>
                            <div
                                style={{
                                    height: 50,
                                    width: 50,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onClick={() => {
                                    if (name === 'JobTypePreview')
                                        history.push(`/ws/${ws_id}/job/types`);
                                    else {
                                        if (access.IsWsSetting())
                                            history.push({
                                                pathname: `/ws/${ws_id}/job/templates`,
                                                state: state || {},
                                            });
                                    }
                                }}
                            >
                                <ArrowLeftOutlined style={{ fontSize: 20 }} />
                            </div>
                            <Typography.Title level={4}>
                                <FormattedMessage id={`ws.test.job.${name}`} />
                            </Typography.Title>
                        </Space>
                        {name === 'TemplatePreview' && (
                            <Space>
                                {modifyTemplate && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                setDisabled(true);
                                                setModifyTemplate(false);
                                                suiteTable.current.setChecked(false);
                                            }}
                                        >
                                            <FormattedMessage id="operation.cancel" />
                                        </Button>
                                        {renderButton}
                                    </>
                                )}
                                {!modifyTemplate && (
                                    <>
                                        <Button onClick={() => handleCopyText(location.href)}>
                                            <FormattedMessage id="ws.test.job.copy.link" />
                                        </Button>
                                        <Access
                                            accessible={access.WsMemberOperateSelf(
                                                templateDatas?.creator,
                                            )}
                                            fallback={
                                                <Button onClick={() => AccessTootip()}>
                                                    <FormattedMessage id="ws.test.job.ModifySetting" />
                                                </Button>
                                            }
                                        >
                                            <Button onClick={handleModifySetting}>
                                                <FormattedMessage id="ws.test.job.ModifySetting" />
                                            </Button>
                                        </Access>
                                    </>
                                )}
                            </Space>
                        )}
                        {name === 'TemplateEdit' && <Space>{renderButton}</Space>}
                    </Row>
                )}

                <Spin spinning={loading}>
                    <div
                        className={styles.page_header}
                        style={
                            ['TestJob', 'TestExport'].includes(name) ? { paddingBottom: 80 } : {}
                        }
                    >
                        <div
                            style={{
                                height: 250,
                                minWidth: 1080,
                                background: '#fff',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '100%',
                            }}
                        />
                        <Row className={styles.page_title} justify="center">
                            <Row
                                style={{
                                    width: 1400,
                                }}
                            >
                                <Col span={24}>
                                    <Row justify="space-between">
                                        <span>{detail.name}</span>
                                        <Access accessible={access.IsWsSetting()}>
                                            {name === 'TestJob' && !loading && (
                                                <Popover
                                                    overlayClassName={styles.template_popover}
                                                    placement={'bottomRight'}
                                                    open={templateBtnVisible}
                                                    onOpenChange={handleTemplatePopoverChange}
                                                    title={
                                                        <Input
                                                            autoComplete="off"
                                                            prefix={<SearchOutlined />}
                                                            className={styles.job_search_inp}
                                                            placeholder={formatMessage({
                                                                id: 'ws.test.job.search.placeholder.template',
                                                            })}
                                                            onChange={handleChangeTemplateName}
                                                        />
                                                    }
                                                    content={
                                                        <Menu
                                                            style={{
                                                                maxHeight: 480,
                                                                overflow: 'auto',
                                                                paddingBottom: 12,
                                                            }}
                                                        >
                                                            {templateList?.length > 0 ? (
                                                                templateList.map((item: any) => (
                                                                    <div
                                                                        className={
                                                                            styles.template_item
                                                                        }
                                                                        key={item.id}
                                                                        onClick={(): any => {
                                                                            if (!item.job_type)
                                                                                return message.error(
                                                                                    formatMessage({
                                                                                        id: 'ws.test.job.please.delete',
                                                                                    }),
                                                                                );
                                                                            history.push(
                                                                                `/ws/${ws_id}/test_job/${item.job_type_id}?template_id=${item.id}`,
                                                                            );
                                                                            setTemplateBtnVisible(
                                                                                false,
                                                                            );
                                                                        }}
                                                                    >
                                                                        <EllipsisPulic
                                                                            title={item.name}
                                                                        />
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        lineHeight: '80px',
                                                                        textAlign: 'center',
                                                                        color: 'rgba(0,0,0,.35)',
                                                                    }}
                                                                >
                                                                    <FormattedMessage id="ws.test.job.no.template" />
                                                                </div>
                                                            )}
                                                        </Menu>
                                                    }
                                                >
                                                    <Button type="default">
                                                        <FormattedMessage id="ws.test.job.use.template.create" />
                                                    </Button>
                                                </Popover>
                                            )}
                                        </Access>
                                    </Row>
                                    <div className={styles.page_tags}>
                                        <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>
                                            {detail.server_type && (
                                                <FormattedMessage
                                                    id={`header.${detail.server_type}`}
                                                    defaultMessage=""
                                                />
                                            )}
                                        </Tag>
                                        <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>
                                            {detail.test_type === 'business' ? (
                                                <FormattedMessage
                                                    id={`header.business.${detail.business_type}`}
                                                    defaultMessage="business.others"
                                                />
                                            ) : (
                                                detail.test_type && (
                                                    <FormattedMessage
                                                        id={`header.test_type.${detail.test_type}`}
                                                        defaultMessage=""
                                                    />
                                                )
                                            )}
                                        </Tag>
                                    </div>
                                    <div className={styles.page_dec}>{detail.description}</div>
                                </Col>
                            </Row>
                        </Row>
                        <div
                            className={styles.page_body_content}
                            style={{
                                display: !isYamlFormat ? 'flex' : 'none',
                            }}
                        >
                            <Spin spinning={isloading} style={{ width: '100%' }}>
                                <Row className={styles.page_body} justify="center">
                                    <Row justify={'end'} style={{ width: '100%' }}>
                                        {['TestJob', 'TestExport'].includes(name) && (
                                            <Space
                                                onClick={handleFormatChange}
                                                className={styles.yaml_copy_link}
                                            >
                                                <YamlFormat />
                                                <FormattedMessage id="ws.test.job.switch.yaml.mode" />
                                            </Space>
                                        )}
                                    </Row>
                                    <Row
                                        style={{
                                            width: '100%',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {[
                                            'TemplatePreview',
                                            'TemplateEdit',
                                            'TestTemplate',
                                        ].includes(name) && (
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span>
                                                        <FormattedMessage id="ws.test.job.templateForm" />
                                                    </span>
                                                </div>
                                                <TemplateForm
                                                    onEnabelChange={setTemplateEnable}
                                                    ref={templateEditForm}
                                                    {...modalProps}
                                                />
                                            </Row>
                                        )}
                                        {JSON.stringify(items.basic) !== '{}' && (
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span>
                                                        <FormattedMessage id="ws.test.job.basicForm" />
                                                    </span>
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
                                        )}
                                        {JSON.stringify(items.env) !== '{}' && (
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span>
                                                        <FormattedMessage id="ws.test.job.envForm" />
                                                    </span>
                                                </div>
                                                <EnvForm
                                                    onRef={envForm}
                                                    contrl={items.env}
                                                    envErrorFlag={envErrorFlag}
                                                    project_id={projectId}
                                                    {...modalProps}
                                                />
                                            </Row>
                                        )}
                                        {detail.test_type && (
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span>
                                                        <FormattedMessage id="ws.test.job.suiteTable" />
                                                    </span>
                                                </div>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8,
                                                        width: '100%',
                                                    }}
                                                >
                                                    {!['case', 'conf'].includes(
                                                        detail.suite_show_type,
                                                    ) ? (
                                                        <SelectSuite
                                                            {...modalProps}
                                                            key={detail.test_type}
                                                            handleData={(data: any) =>
                                                                setTest_config(data)
                                                            }
                                                            contrl={items.suite}
                                                            onRef={suiteTable}
                                                            setPageLoading={setLoading}
                                                            caseDataRef={caseData}
                                                        />
                                                    ) : (
                                                        <CaseConfTables ref={caseConfTableRef} />
                                                    )}
                                                    {!!suite_conf_lists?.length &&
                                                        hasServerScheduleRule && (
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.server_alert_tips
                                                                    }
                                                                >
                                                                    <Alert
                                                                        type="warning"
                                                                        showIcon
                                                                        message={`已识别您使用了【云上配置】或【标签】或【随机】选项，请进一步选择适合的机器调度策略`}
                                                                    />
                                                                </div>
                                                                <Form
                                                                    form={form}
                                                                    initialValues={{
                                                                        server_schedule_rule:
                                                                            'by_test_suite',
                                                                    }}
                                                                >
                                                                    <Form.Item
                                                                        name="server_schedule_rule"
                                                                        label="机器调度策略"
                                                                    >
                                                                        <Radio.Group
                                                                            options={
                                                                                [
                                                                                    {
                                                                                        label: '按Job级分配',
                                                                                        value: 'by_test_job',
                                                                                    },
                                                                                    {
                                                                                        label: '按Test Suite分配',
                                                                                        value: 'by_test_suite',
                                                                                    },
                                                                                    detail?.suite_show_type !==
                                                                                        'case' && {
                                                                                        label: '按Test Conf分配',
                                                                                        value: 'by_test_conf',
                                                                                    },
                                                                                ].filter(
                                                                                    Boolean,
                                                                                ) as any
                                                                            }
                                                                        />
                                                                    </Form.Item>
                                                                </Form>
                                                            </div>
                                                        )}
                                                </div>
                                            </Row>
                                        )}
                                        {JSON.stringify(items.more) !== '{}' && (
                                            <Row className={styles.form_row}>
                                                <div className={styles.page_body_nav}>
                                                    <span>
                                                        <FormattedMessage id="ws.test.job.moreForm" />
                                                    </span>
                                                </div>
                                                <MoreForm
                                                    {...modalProps}
                                                    onRef={moreForm}
                                                    contrl={items.more}
                                                    isReset={isReset}
                                                    tagsDataRef={tagsData}
                                                    reportTemplateDataRef={reportTemplateData}
                                                    callback={setTimeTagList}
                                                />
                                            </Row>
                                        )}
                                    </Row>
                                </Row>
                            </Spin>
                        </div>
                        {isYamlFormat && (
                            <div className={styles.page_body_content}>
                                <div className={styles.yaml_container}>
                                    <Col span={24} className={styles.yaml_operate}>
                                        <Row
                                            style={{
                                                width: '100%',
                                                paddingLeft: 20,
                                                paddingRight: 20,
                                            }}
                                            justify={'space-between'}
                                        >
                                            <Space>
                                                <Space
                                                    align="center"
                                                    className={styles.yaml_copy_link}
                                                    onClick={handleTestYaml}
                                                >
                                                    <YamlTest className={styles.operate_icon} />
                                                    <FormattedMessage id="ws.test.job.yaml.test" />
                                                </Space>
                                                <Space
                                                    align="center"
                                                    className={styles.yaml_copy_link}
                                                    id="copy_dom_id"
                                                    onClick={() =>
                                                        handleCopyText(jobInfo.replace('---', ''))
                                                    }
                                                    style={{ marginLeft: 10 }}
                                                >
                                                    <YamlCopy className={styles.operate_icon} />
                                                    <FormattedMessage id="ws.test.job.copy" />
                                                </Space>
                                                <Space
                                                    align="center"
                                                    className={styles.yaml_copy_link}
                                                    onClick={handleDownload}
                                                    style={{ marginLeft: 10 }}
                                                >
                                                    <YamlDownload className={styles.operate_icon} />
                                                    <FormattedMessage id="ws.test.job.download" />
                                                </Space>
                                                <CloseOutlined
                                                    onClick={handleClose}
                                                    style={{ float: 'right', color: '#fff' }}
                                                />
                                            </Space>
                                            {['TestJob', 'TestExport'].includes(name) && (
                                                <Space
                                                    onClick={handleFormatChange}
                                                    className={styles.yaml_copy_link}
                                                >
                                                    <YamlFormat />
                                                    <FormattedMessage id="ws.test.job.switch.form.mode" />
                                                </Space>
                                            )}
                                        </Row>
                                    </Col>
                                    <div style={{ height: `calc(100% - 40px)`, width: '100%' }}>
                                        <CodeEditer
                                            mode="yaml"
                                            code={jobInfo}
                                            onChange={(value: any) => setJobInfo(value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {['TestJob', 'TestExport', 'TestTemplate'].includes(name) && (
                        <Row justify="end" className={styles.options_bar}>
                            <Space>
                                <Popconfirm
                                    title={<FormattedMessage id="ws.test.job.reset.confirm.info" />}
                                    onConfirm={lodash.partial(handleReset, true)}
                                    okText={<FormattedMessage id="operation.confirm" />}
                                    cancelText={<FormattedMessage id="operation.cancel" />}
                                >
                                    <Button>
                                        <FormattedMessage id="ws.test.job.reset" />
                                    </Button>
                                </Popconfirm>

                                {/** 有时间的系统标签时，二次弹框确认； */}
                                {timeTagList.length ? (
                                    <>
                                        <Popconfirm
                                            title={formatMessage(
                                                { id: 'ws.result.details.keep.time.job.tag' },
                                                { data: timeTagList[0]?.label },
                                            )}
                                            onConfirm={handleOpenTemplate}
                                            okText={<FormattedMessage id="operation.ok" />}
                                            cancelText={<FormattedMessage id="operation.cancel" />}
                                            placement="topRight"
                                        >
                                            <Button disabled={!access.IsWsSetting()}>
                                                <FormattedMessage id="ws.test.job.save.as.template" />
                                            </Button>
                                        </Popconfirm>
                                        <Popconfirm
                                            title={formatMessage(
                                                { id: 'ws.result.details.keep.time.job.tag' },
                                                { data: timeTagList[0]?.label },
                                            )}
                                            onConfirm={handleSubmit}
                                            okText={<FormattedMessage id="operation.ok" />}
                                            cancelText={<FormattedMessage id="operation.cancel" />}
                                            placement="topRight"
                                        >
                                            <Button type="primary" disabled={!access.IsWsSetting()}>
                                                <FormattedMessage id="ws.test.job.submit.test" />
                                            </Button>
                                        </Popconfirm>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleOpenTemplate}
                                            disabled={!access.IsWsSetting()}
                                        >
                                            <FormattedMessage id="ws.test.job.save.as.template" />
                                        </Button>
                                        <Button
                                            type="primary"
                                            loading={fetching}
                                            onClick={handleSubmit}
                                            disabled={!access.IsWsSetting()}
                                        >
                                            <FormattedMessage id="ws.test.job.submit.test" />
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </Row>
                    )}
                    <SaveTemplate ref={saveTemplateDrawer} onOk={handleSaveTemplateOk} />
                </Spin>
            </div>
        </TestJobProvider.Provider>
    );
};

export default TestJob;
