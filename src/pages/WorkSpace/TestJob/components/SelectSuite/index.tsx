/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState, useRef, useEffect, useMemo, useImperativeHandle } from 'react';
import { Button, Card, Empty, Badge, Typography, Space, Alert, Spin, Switch, Row } from 'antd';
import lodash from 'lodash';
import BusinessTestSelectDrawer from './BusinessTestSelectDrawer';
import SelectDrawer from './SelectDrawer';
import { suiteList } from './service';
import SuiteTable from './SuiteTable';
import styles from './style.less';
import { useParams, useIntl, FormattedMessage } from 'umi';
import DeletedAlert from './DeletedAlert';
import { transConfData } from '@/pages/WorkSpace/TestJob/components/untils';
const SelectSuite: React.FC<any> = ({
    handleData,
    contrl,
    test_type,
    business_type,
    template = {},
    disabled = false,
    onRef,
    server_type,
    setPageLoading,
    caseDataRef,
}) => {
    const { formatMessage } = useIntl();
    const { ws_id } = useParams<any>();
    const outTable = useRef<any>(null);
    const drawer: any = useRef(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [treeData, setTreeData] = useState<any>([]);

    const [width, setWidth] = useState<number>(0);

    const [test_config, setTest_config] = useState<any>([]);
    const [control, setControl] = useState<any>([]);

    const [showSuiteDeleteAlart, setShowSuiteDeleteAlart] = React.useState(false);
    const [standalone, setStandalone] = useState([]);
    const [cluster, setCluster] = useState([]);
    const [defaultTreeData, setDefaultTreeData] = useState(false);
    const [firstInit, setFirstInit] = useState(true);
    const [checked, setChecked] = useState<boolean>(true);

    useImperativeHandle(onRef, () => ({
        setChecked: console.log,
        reset: () => setTest_config([]),
        setVal: (data: any[]) => {
            const confs = handleTestConfig(lodash.isArray(data) ? data : []);
            setTest_config(confs);
            return confs;
        },
    }));

    const memoizedValue = useMemo(() => {
        let count = 0;
        test_config.map((item: any) => {
            if (lodash.isArray(lodash.get(item, 'test_case_list')))
                count += item.test_case_list.length;
            // if(lodash.isArray(lodash.get(item,'cases'))) count += item.cases.length
        });
        return count;
    }, [test_config]);

    const SuiteSelect = () => {
        drawer.current?.openDrawer({ test_config });
    };

    const getList = async () => {
        firstInit && setPageLoading(true);
        setLoading(true);
        setTreeData([]);
        const baseQuery = { test_type, ws_id };
        const query = test_type === 'business' ? { business_type } : {};
        const { data = [] } = (await suiteList({ ...baseQuery, ...query, page_size: 200 })) || {};
        data.map((item: any, index: number) => {
            item.key = index + '';
            item.title = item.name;
            item.children = item.test_case_list?.map((el: any, sq: number) => {
                el.parentId = item.id;
                el.key = index + '-' + sq;
                el.title = el.name;
                el.ip = el.ip || '随机'; // 此处的中文不能翻译，不破坏数据，在render的时候去匹配中英文。
                return el;
            });
            return item;
        });
        if (caseDataRef) caseDataRef.current = data;
        setTreeData(data);
        setLoading(false);
        setDefaultTreeData(true);
        setFirstInit(false);
    };

    useEffect(() => {
        getList();
    }, []);

    const handleTestConfig = ($list: any[]) => {
        const list = $list?.reduce((pre, cur) => {
            const { test_suite_id, cases, setup_info } = cur;
            const hasSuiteId = treeData.findIndex(({ id }: any) => id === test_suite_id);
            if (~hasSuiteId) {
                const test_case_list = cases?.reduce((p: any, c: any) => {
                    const caseList = treeData[hasSuiteId].test_case_list;
                    const { test_case_id } = c || {};
                    const idx = caseList.findIndex(({ id }: any) => id === test_case_id);
                    if (~idx) {
                        const caseItem = caseList[idx];
                        return p.concat(transConfData(caseItem, c));
                    }
                    return p;
                }, []);

                if (test_case_list.length > 0)
                    return pre.concat({
                        ...cur,
                        id: test_suite_id,
                        title: treeData[hasSuiteId].name,
                        run_mode: treeData[hasSuiteId].run_mode,
                        setup_info: setup_info === '[]' ? '' : setup_info,
                        test_case_list,
                    });
                return pre;
            }

            return pre;
        }, []);

        if (suiteList.length > list) setShowSuiteDeleteAlart(true);
        return list;
    };

    useEffect(() => {
        if (defaultTreeData && treeData.length > 0 && JSON.stringify(template) !== '{}') {
            const confs = handleTestConfig(template.test_config);
            setTest_config(confs);
        }
    }, [template, defaultTreeData]);

    const validWidth = () => setWidth(outTable.current.clientWidth);

    useEffect(() => {
        validWidth();
        window.addEventListener('resize', validWidth);
        return () => {
            window.removeEventListener('resize', validWidth);
        };
    }, []);

    useEffect(() => {
        const $control: any[] = [];
        Object.keys(contrl).map((key) => {
            if (contrl[key].config_index == 3) $control.push(contrl[key].name);
        });
        setControl($control);
    }, [contrl]);

    useEffect(() => {
        handleData(test_config);
        const standaloneConf: any = [];
        const clusterConf: any = [];
        test_config.forEach((i: any) => {
            if (i.isAdvancedConfig) {
                setChecked(true);
            }
            if (i.run_mode === 'cluster') clusterConf.push(i);
            else standaloneConf.push(i);
        });
        setStandalone(standaloneConf);
        setCluster(clusterConf);
    }, [test_config]);

    const handleSelect = (data: any) => {
        if (data.length === 0) return setTest_config([]);
        const newData: any = [];
        data.forEach((i: any) => {
            const idx = test_config.findIndex((t: any) => t.id === i.id);
            if (idx === -1) newData.push(i);
            else {
                const newCaseList: any = [];
                const confCases = test_config[idx].test_case_list;
                i.test_case_list.forEach((c: any) => {
                    const index = confCases.findIndex((ele: any) => ele.id === c.id);
                    if (index === -1) newCaseList.push(c);
                    else newCaseList.push(confCases[index]);
                });
                newData.push({ ...test_config[idx], test_case_list: newCaseList });
            }
        });
        setTest_config(newData);
    };

    const handleTestConfigChange = (data: any, mode: string) => {
        if (mode === 'cluster') setTest_config(standalone.concat(data));
        else setTest_config(cluster.concat(data));
    };

    const TableProps = {
        disabled,
        width,
        test_type,
        server_type,
        contrl,
        control,
        loading,
        ws_id,
        checked,
        onDataSourceChange: handleTestConfigChange,
    };

    const onChange = ($checked: boolean) => setChecked($checked);

    return (
        <Spin spinning={loading}>
            <div
                className={styles.suite}
                ref={outTable}
                style={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}
            >
                <Row style={{ width: '100%' }} align={'middle'} justify={'space-between'}>
                    <Space align="center" size={24}>
                        <Button disabled={disabled} type="primary" onClick={SuiteSelect}>
                            <span style={{ marginRight: 8 }}>+</span>
                            <FormattedMessage id="select.suite.select.case" />
                        </Button>
                        {test_config.length > 0 && (
                            <Space>
                                <>
                                    <Typography.Text style={{ color: 'rgba(0,0,0,.65)' }}>
                                        <Space>
                                            <FormattedMessage id="added" />
                                            Test Suite
                                        </Space>
                                    </Typography.Text>
                                    <Typography.Text
                                        style={{ color: 'rgba(0,0,0,.85)', fontWeight: 500 }}
                                    >
                                        {test_config.length || 0}
                                    </Typography.Text>
                                </>
                                <>
                                    <Typography.Text style={{ color: 'rgba(0,0,0,.65)' }}>
                                        Test Conf
                                    </Typography.Text>
                                    <Typography.Text
                                        style={{ color: 'rgba(0,0,0,.85)', fontWeight: 500 }}
                                    >
                                        {memoizedValue || 0}
                                    </Typography.Text>
                                </>
                            </Space>
                        )}
                    </Space>

                    {test_config.length > 0 && !disabled && (
                        <Space align="center">
                            <span className={styles.title}>
                                <FormattedMessage id="select.suite.advanced.config" />
                            </span>
                            <Switch checked={checked} onChange={onChange} />
                        </Space>
                    )}
                </Row>

                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    {showSuiteDeleteAlart && (
                        <Alert
                            message={formatMessage({
                                id: 'select.suite.table.is_delete.alart',
                                defaultMessage: '所选用例已不存在',
                            })}
                            type="warning"
                            showIcon
                            closable
                        />
                    )}

                    <DeletedAlert sources={template?.server_deleted} isDelete />

                    <DeletedAlert sources={template?.server_no_allocated} />

                    {test_type === 'business' ? (
                        <BusinessTestSelectDrawer // 业务测试(选择用例)
                            testType={test_type}
                            onRef={drawer}
                            handleSelect={handleSelect}
                            control={control}
                            treeData={treeData}
                            loading={loading}
                        />
                    ) : (
                        <SelectDrawer // 功能、性能(选择用例)
                            testType={test_type}
                            onRef={drawer}
                            handleSelect={handleSelect}
                            control={control}
                            treeData={treeData}
                            loading={loading}
                        />
                    )}

                    {standalone.length === 0 && cluster.length === 0 && (
                        <Card bodyStyle={{ width: width || '100%' }}>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <FormattedMessage id="select.suite.please.select.case" />
                                }
                            />
                        </Card>
                    )}

                    {standalone.length > 0 && (
                        <SuiteTable {...TableProps} dataSource={standalone} run_mode="standalone" />
                    )}

                    {cluster.length > 0 && (
                        <SuiteTable {...TableProps} dataSource={cluster} run_mode="cluster" />
                    )}
                </Space>
            </div>
        </Spin>
    );
};

export default SelectSuite;
