/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
import React, { useContext, useState, useEffect, useMemo, memo } from 'react';
import { Empty, Popconfirm } from 'antd';
import { FormattedMessage } from 'umi';
import { ReportContext } from '../Provider';
import { ReactComponent as TestGroupIcon } from '@/assets/svg/Report/TestGroup.svg';
import FuncIndex from './TestDataChild/FuncReview';
import { GroupItemText } from './EditPerfText';
import { simplify, deleteMethod } from './ReportFunction';
import {
    TestDataTitle,
    TestWrapper,
    TestItemText,
    TestGroup,
    CloseBtn,
} from '../ReportUI';
import _ from 'lodash';

const ReportTestFunc: React.FC<any> = () => {
    const { obj, setObj, domainResult, btnState, routeName, isOldReport } = useContext(ReportContext)

    const data = useMemo(() => {
        if (Array.isArray(domainResult.func_item)) {
            return _.cloneDeep(domainResult.func_item)
        }
    }, [domainResult])

    const [dataSource, setDataSource] = useState<any>([])

    useEffect(() => {
        setDataSource(data)
    }, [data])

    /* 
        ** 删除测试项 测试组
    */
    const handleDelete = (name: string, domain: any, rowKey: any) => {
        setDataSource(deleteMethod(dataSource, name, domain, rowKey))
    }

    // 保存报告数据整理
    useEffect(() => {
        let new_func_data: any = []
        if (!!dataSource.length) {
            dataSource.map((item: any, idx: number) => {
                if (item.is_group) {
                    item.list.map((child: any, index: number) => {
                        let suite_list = simplify(child, idx, index, 'group', isOldReport)
                        new_func_data.push({
                            name: `${item.name}:${child.name}`,
                            suite_list
                        })
                    })
                } else {
                    let suite_list = simplify(item, idx, 0, 'item', isOldReport)
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
            <TestDataTitle id="func_item" className="position_mark"><FormattedMessage id="functional.test" /></TestDataTitle>
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
                                                <TestGroup id={`func_item-${item.rowKey}`} className="position_mark">
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
                                                            title={<FormattedMessage id="delete.prompt" />}
                                                            onConfirm={() => handleDelete('item', item.name, item.rowKey)}
                                                            cancelText={<FormattedMessage id="operation.cancel" />}
                                                            okText={<FormattedMessage id="operation.delete" />}
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
                                                                    // subObj={subObj}
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
                                                // subObj={subObj}
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

