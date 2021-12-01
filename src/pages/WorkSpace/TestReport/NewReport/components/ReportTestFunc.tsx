import React, { useContext, useState, useEffect, useMemo, memo } from 'react';
import { Empty, Popconfirm } from 'antd';
import { ReportContext } from '../Provider';
import { ReactComponent as TestGroupIcon } from '@/assets/svg/Report/TestGroup.svg';
import FuncIndex from './TestDataChild/funcIndex';
import { SettingTextArea } from './EditPublic';
import produce from 'immer';
import {
    TestDataTitle,
    TestWrapper,
    TestItemText,
    TestGroup,
    CloseBtn,
} from '../ReportUI';
import _ from 'lodash';

const ReportTestFunc: React.FC<any> = () => {
    const { obj, setObj, domainResult, btnConfirm, btnState, routeName } = useContext(ReportContext)
    const data = useMemo(() => {
        if (Array.isArray(domainResult.func_item)) {
            let data = _.cloneDeep(domainResult.func_item)
            return data
        }
    }, [domainResult])
    const [dataSource, setDataSource] = useState<any>([])

    useEffect(() => {
        setDataSource(data)
    }, [data])

    const [subObj, setSubObj] = useState<Array<{}>>([])


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

    const filterGroup = (item: any, name: string, field: any, rowKey: string) => {
        if (item.rowKey == rowKey) {
            return item.name = field
        }
        return item
    }
    const handleGroupChange = (field: any, name: string, rowKey: string) => {
        setDataSource(dataSource.map((item: any) => filterGroup(item, name, field, rowKey)))
    }
    /* 
       ** 编辑测试项 测试组
   */
    const filterFieldData = (data: any, name: string, field: any, rowKey: string) => {
        return produce(
            data,
            (draftState: any) => {
                draftState.list = data.list.map((i: any) => {
                    if (!i.is_group && i.rowKey == rowKey) {
                        return produce(i, (draft: any) => {
                            draft.name = field
                        })
                    }
                    return i
                })
            }
        )
    }

    const filterData = (item: any, name: string, field: any, rowKey: string) => {
        if (item.rowKey == rowKey)
            return produce(item, (draft: any) => {
                draft.name = field
            })
        if (item.is_group)
            return filterFieldData(item, name, field, rowKey)
        return item
    }
    const handleFieldChange = (field: any, name: string, rowKey: string) => {
        setDataSource(dataSource.map((item: any) => filterData(item, name, field, rowKey)))
    }
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
            <TestDataTitle id="func_item">功能测试</TestDataTitle>
            <TestWrapper>
                {/* 有组有项 */}
                {
                    (Array.isArray(dataSource) && !!dataSource.length) ?
                        dataSource.map((item: any, idx: number) => {
                            return (
                                <div key={idx}>
                                    {
                                        item.is_group ?
                                            <>
                                                <TestGroup id={`func_item-${item.rowKey}`}>
                                                    <TestGroupIcon style={{ marginLeft: 12, verticalAlign: 'middle' }} />
                                                    <TestItemText>
                                                        <SettingTextArea
                                                            name={item.name}
                                                            btnConfirm={btnConfirm}
                                                            isInput={true}
                                                            fontStyle={{
                                                                fontSize: 14,
                                                                fontFamily: 'PingFangSC-Medium',
                                                                color: 'rgba(0,0,0,0.85)'
                                                            }}
                                                            btn={btnState}
                                                            onOk={(val: any) => handleGroupChange(val, item.name, item.rowKey)}
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
                                                            <FuncIndex
                                                                child={child}
                                                                name="group"
                                                                id={child.rowKey}
                                                                subObj={subObj}
                                                                dataSource={dataSource}
                                                                setDataSource={setDataSource}
                                                                onDelete={handleDelete}
                                                                onChange={handleFieldChange}
                                                            />
                                                        )
                                                    })
                                                }
                                            </> :
                                            <FuncIndex
                                                child={item}
                                                name="item"
                                                id={item.rowKey}
                                                subObj={subObj}
                                                dataSource={dataSource}
                                                setDataSource={setDataSource}
                                                onDelete={handleDelete}
                                                onChange={handleFieldChange}
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
// export default ReportTestFunc;



