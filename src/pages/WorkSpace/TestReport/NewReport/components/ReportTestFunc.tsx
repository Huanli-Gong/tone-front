import React, { useContext, useState, useEffect, useMemo, memo } from 'react';
import { Empty, Popconfirm } from 'antd';
import { ReportContext } from '../Provider';
import { ReactComponent as TestGroupIcon } from '@/assets/svg/Report/TestGroup.svg';
import FuncIndex from './TestDataChild/FuncReview';
import { GroupItemText } from './EditPerfText';
import {
    TestDataTitle,
    TestWrapper,
    TestItemText,
    TestGroup,
    CloseBtn,
} from '../ReportUI';
import _ from 'lodash';

const ReportTestFunc: React.FC<any> = () => {
    const { obj, setObj, domainResult, btnState, routeName } = useContext(ReportContext)

    const data = useMemo(() => {
        if (Array.isArray(domainResult.func_item)) {
            let data = _.cloneDeep(domainResult.func_item)
            return data
        }
    }, [domainResult])

    const [dataSource, setDataSource] = useState<any>([])
    const [subObj, setSubObj] = useState<Array<{}>>([])

    useEffect(() => {
        setDataSource(data)
    }, [data])

    useEffect(() => {
        dataSource?.map((item: any) => {
            if (item.is_group) {
                item.list.map((child: any) => {
                    setSubObj(child.list)
                })
            } else {
                setSubObj(item.list)
            }
        })
    }, [dataSource])

    /* 
        ** 删除测试项 测试组
    */
    const handleDelete = (name: string, domain: any, rowKey: any) => {
        if (name === 'group') {
            setDataSource(dataSource.map((i: any, idx: number) => {
                let ret: any = []
                if (i.is_group) {
                    i.list.map((b: any) => {
                        if (b.rowKey === rowKey) {
                            ret = i.list.filter((c: any) => c.name !== domain)
                        }
                    })
                    return {
                        ...i,
                        list: ret,
                    }
                }
                return {
                    ...i,
                }
            }))
        } else {
            setDataSource(dataSource.filter((item: any) => item.name !== domain && item.rowKey !== rowKey))
        }
    }

    const transField = (conf: any, key: string) => {
        const { conf_source } = conf
        return conf[key] ? conf[key] : conf_source ? conf_source[key] : ''
    }

    const simplify = (child: any) => {
        let suite_list: any = []
        child.list.map((suite: any, suiteId: number) => {
            let conf_list: any = []
            suite.conf_list.map((conf: any, index: number) => {
                conf_list.push({
                    conf_id: conf.conf_id,
                    conf_name: conf.conf_name,
                    conf_source: {
                        all_case: transField(conf, 'all_case'),//conf.all_case || conf.conf_source.all_case,
                        success_case: transField(conf, 'success_case'),//conf.success_case || conf.conf_source.success_case,
                        fail_case: transField(conf, 'fail_case'), //conf.fail_case || conf.conf_source.fail_case
                        is_job: transField(conf, 'is_job'), //conf.is_job || conf.conf_source.is_job,
                        obj_id: transField(conf, 'obj_id'),//conf.obj_id || conf.conf_source.obj_id,
                    },
                    compare_conf_list: conf.conf_compare_data || conf.compare_conf_list,
                    sub_case_list: conf.sub_case_list
                })
            })
            suite_list.push({
                suite_id: suite.suite_id,
                suite_name: suite.suite_name,
                conf_list
            })
        })
        return suite_list;
    }
    // 保存报告数据整理
    useEffect(() => {
        let new_func_data: any = []
        if (!!dataSource.length) {
            dataSource.map((item: any, idx: number) => {
                if (item.is_group) {
                    item.list.map((child: any, index: number) => {
                        let suite_list = simplify(child)
                        new_func_data.push({
                            name: `${item.name}:${child.name}`,
                            suite_list
                        })
                    })
                } else {
                    let suite_list = simplify(item)
                    new_func_data.push({
                        name: item.name,
                        suite_list
                    })
                }
            })
        }
        obj.test_item.func_data = new_func_data
        setObj({
            ...obj,
        })
    }, [dataSource, routeName])

    return (
        <>
            <TestDataTitle>功能测试</TestDataTitle>
            <TestWrapper id="func_item" className="position_mark">
                {/* 有组有项 */}
                {
                    (Array.isArray(dataSource) && !!dataSource.length) ?
                        dataSource.map((item: any, idx: number) => {
                            return (
                                <div key={idx}>
                                    {
                                        item.is_group ?
                                            <>
                                                <TestGroup id={`func_item-${item.rowKey}`} className="tree_mark">
                                                    <TestGroupIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                                                    <TestItemText>
                                                        <GroupItemText
                                                            name={item.name}
                                                            rowKey={item.rowKey}
                                                            btn={btnState}
                                                            dataSource={dataSource}
                                                            setDataSource={setDataSource}
                                                        />
                                                    </TestItemText>
                                                    {
                                                        btnState &&
                                                        <Popconfirm
                                                            title='确认要删除吗！'
                                                            onConfirm={() => handleDelete('item', item.name, item.rowKey)}
                                                            cancelText="取消"
                                                            okText="删除"
                                                        >
                                                            <CloseBtn />
                                                        </Popconfirm>
                                                    }
                                                </TestGroup>
                                                {
                                                    item.list.map((child: any, id: number) => {
                                                        return (
                                                            <div key={id}>
                                                                <FuncIndex
                                                                    child={child}
                                                                    name="group"
                                                                    id={child.rowKey}
                                                                    subObj={subObj}
                                                                    dataSource={dataSource}
                                                                    setDataSource={setDataSource}
                                                                    onDelete={handleDelete}
                                                                />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </> 
                                            :
                                            <FuncIndex
                                                child={item}
                                                name="item"
                                                id={item.rowKey}
                                                subObj={subObj}
                                                dataSource={dataSource}
                                                setDataSource={setDataSource}
                                                onDelete={handleDelete}
                                            />
                                    }
                                </div>
                            )
                        })
                        :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </TestWrapper>
        </>
    )
}
export default memo(ReportTestFunc);

