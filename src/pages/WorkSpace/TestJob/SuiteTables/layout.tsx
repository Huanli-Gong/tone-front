import { Spin } from 'antd';
import React from 'react';
import { useParams } from 'umi';
import { useTestJobContext } from '../provider';
import { suiteList as getTestJobSuiteList } from '@/pages/WorkSpace/TestJob/components/SelectSuite/service';
import SuiteTables from './BaseList';
import styled from 'styled-components';
import DeletedAlert from '../components/SelectSuite/DeletedAlert';

const CaseConfSelectLayout = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;

    .server_alert_tips {
        padding: 0 16px;
    }
`;

const tarnsRunModeData = (sources: any) => {
    return sources.reduce(
        (pre: any, cur: any) => {
            const { run_mode } = cur;
            pre[run_mode] = pre[run_mode].concat(cur);
            return pre;
        },
        {
            standalone: [],
            cluster: [],
        },
    );
};

const transServerItem = (item: any, run_mode: any, server_type: any) => {
    const { ip, is_instance, customer_server, server_object_id, server_tag_id } = item;

    const params: any = {
        server_radio_type: 'pool',
        server_select_type: 'server_object_id',
    };

    if (customer_server) {
        params.custom_channel = customer_server.custom_channel;
        params.custom_ip = customer_server.custom_ip;
        params.server_radio_type = 'custom';
    } else if (Object.prototype.toString.call(server_object_id) === '[object Number]') {
        if (server_type === 'aliyun' && run_mode === 'standalone') {
            if (Object.prototype.toString.call(is_instance) === '[object Number]') {
                params.server_select_type = is_instance === 1 ? 'instance' : 'setting';
            }
        }
        params.is_instance = is_instance;
        params.server_object_id = server_object_id;
        params.ip = ip;
    } else if (server_tag_id && server_tag_id.length > 0) {
        params.server_tag_id = server_tag_id;
        params.server_select_type = 'server_tag_id';
    } else {
        params.server_select_type = 'random';
    }
    return params;
};

const tarnsCasesList = (
    sources: any,
    selectedList: any,
    suite_show_type: any,
    run_mode: any,
    server_type: any,
) => {
    return sources.reduce((pre: any, cur: any) => {
        const { id: case_id } = cur;
        const caseObj = selectedList.find((ctx: any) => ctx.test_case_id === case_id);
        if (caseObj) {
            if (suite_show_type !== 'case') {
                const { ip, is_instance, customer_server, server_object_id, server_tag_id } =
                    caseObj;

                const params = {
                    ...cur,
                    server_radio_type: 'pool',
                    server_select_type: 'server_object_id',
                };

                if (customer_server) {
                    params.custom_channel = customer_server.custom_channel;
                    params.custom_ip = customer_server.custom_ip;
                    params.server_radio_type = 'custom';
                } else if (Object.prototype.toString.call(server_object_id) === '[object Number]') {
                    if (server_type === 'aliyun' && run_mode === 'standalone') {
                        if (Object.prototype.toString.call(is_instance) === '[object Number]') {
                            params.server_select_type = is_instance === 1 ? 'instance' : 'setting';
                        }
                    }

                    params.is_instance = is_instance;
                    params.server_object_id = server_object_id;
                    params.ip = ip;
                } else if (server_tag_id && server_tag_id.length > 0) {
                    params.server_tag_id = server_tag_id;
                    params.server_select_type = 'server_tag_id';
                } else {
                    params.server_select_type = 'random';
                }

                return pre.concat(params);
            }
        }
        return pre.concat(cur);
    }, []);
};

const SuiteTableLayout: React.ForwardRefRenderFunction<any, any> = (props, ref) => {
    const { ws_id } = useParams() as any;

    const { jobTypeDetails, templateDatas } = useTestJobContext();
    const { test_type, suite_show_type, server_type } = jobTypeDetails;
    const { test_config } = templateDatas;

    const [source, setSource] = React.useState<any>();
    const [list, setList] = React.useState<any>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [selectedRows, setSelectedRows] = React.useState<any>();
    const refCluster = React.useRef<any>(null);
    const refStandalone = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
        rest() {
            setSelectedRows(undefined);
            refStandalone.current?.rest();
            refCluster.current?.rest();
        },
    }));

    const init = async () => {
        setLoading(true);
        const { data, code } = await getTestJobSuiteList({
            test_type,
            ws_id,
            suite_show_type,
            page_size: 200,
        });
        setLoading(false);
        if (code !== 200) return setSource(undefined);
        setList(data);
    };

    React.useEffect(() => {
        init();
    }, [jobTypeDetails]);

    React.useEffect(() => {
        if (!list?.length) {
            setSource(undefined);
            return;
        }
        if (test_config?.length) {
            const confs = list?.reduce((pre: any, cur: any) => {
                const { id: suite_id, test_case_list, run_mode } = cur;
                const suiteObj = test_config?.find((ctx: any) => ctx.test_suite_id === suite_id);
                if (suiteObj) {
                    const { cases, id, test_suite_id, ...rest } = suiteObj;

                    const params: any = {
                        ...cur,
                        test_case_list: tarnsCasesList(
                            test_case_list,
                            cases,
                            suite_show_type,
                            run_mode,
                            server_type,
                        ),
                    };

                    const currentServerItemObj =
                        suite_show_type === 'case'
                            ? transServerItem(rest, run_mode, server_type)
                            : rest;

                    Object.entries(currentServerItemObj).forEach((ctx: any) => {
                        const [key, value] = ctx;
                        params[key] = value;
                    });

                    return pre.concat(params);
                }
                return pre.concat(cur);
            }, []);
            const selectedTemlConfs = test_config?.reduce((pre: any, cur: any) => {
                const { test_suite_id, cases, ...rest } = cur;
                return pre.concat({
                    ...rest,
                    id: test_suite_id,
                    test_case_list: cases?.map((ctx: any) => {
                        const { test_case_id } = ctx;
                        return {
                            ...ctx,
                            id: test_case_id,
                        };
                    }),
                });
            }, []);

            setSelectedRows(tarnsRunModeData(selectedTemlConfs));
            setSource(tarnsRunModeData(confs));
        } else setSource(tarnsRunModeData(list));
    }, [list, test_config]);

    return (
        <Spin spinning={loading}>
            <CaseConfSelectLayout>
                <DeletedAlert sources={templateDatas?.server_deleted} isDelete />

                <DeletedAlert sources={templateDatas?.server_no_allocated} />

                {!!source?.standalone?.length && (
                    <SuiteTables
                        ref={refStandalone}
                        loading={loading}
                        run_mode={'standalone'}
                        dataSource={source?.standalone}
                        setDataSource={setSource}
                        templSelectedRows={selectedRows?.standalone}
                    />
                )}

                {!!source?.cluster?.length && (
                    <SuiteTables
                        ref={refCluster}
                        loading={loading}
                        run_mode={'cluster'}
                        dataSource={source?.cluster}
                        setDataSource={setSource}
                        templSelectedRows={selectedRows?.cluster}
                    />
                )}

                {!source && (
                    <SuiteTables dataSource={[]} setDataSource={setSource} templSelectedRows={[]} />
                )}
            </CaseConfSelectLayout>
        </Spin>
    );
};

export default React.forwardRef(SuiteTableLayout);
