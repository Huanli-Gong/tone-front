import React, { useContext, memo } from 'react';
import { ReportContext } from '../Provider';
import { Space, Tooltip } from 'antd';
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import {
    ModuleWrapper,
    Summary,
    Group,
    GroupTitle,
    GroupData,
    Result,
    PerfResultTitle,
    PerfResultData,
    FuncResultTitle,
    FuncResultData,
    Statistical,
    SubTitle,
} from '../ReportUI'

const ReportSummary = () => {
    const { allGroupData, logoData, envData, domainResult, baselineGroupIndex } = useContext(ReportContext)
    let group = allGroupData?.length
    const conversionNum = (val: any) => {
        if (val == 0) {
            return 0;
        } else if (val == undefined) {
            return '-';
        } else {
            return val;
        }
    }
    // const statisticalWidth = `${String(base_group.all).length * 20}px`  动态计算测试数据的宽度
    return (
        <ModuleWrapper style={{ width: group > 4 ? group * 300 : 1200 }} id="need_test_summary">
            <SubTitle><span className="line"></span>Summary</SubTitle>
            <Summary>
                <Group>
                    <GroupTitle gLen={group}>对比组名称</GroupTitle>
                    {
                        Array.isArray(envData) && !!envData.length && envData.map((item: any, idx: number) => {
                            return (
                                <GroupData gLen={group} key={idx}>
                                    <Space>
                                        { item.is_base ? 
                                         <Tooltip title="基准组">
                                            <BaseIcon style={{ marginRight: 4, marginTop: 17 }} />
                                        </Tooltip> : null }
                                    </Space>
                                    <EllipsisPulic title={item.tag} />
                                </GroupData>
                            )
                        })
                    }
                </Group>
                {
                    domainResult.is_default && 
                    <Result>
                        <PerfResultTitle gLen={group}>性能测试</PerfResultTitle>
                        {
                            Array.isArray(logoData) && logoData.length > 0 && logoData.map((item: any, idx: number) => {
                                const { all, increase, decline } = item.perf_data || item
                                return (
                                    <PerfResultData gLen={group} key={idx}>
                                        <div style={{ display: 'flex', margin: '18px 0' }}>
                                            <Statistical>
                                                <i className="logo">总计</i><br />
                                                <b className="all">{conversionNum(baselineGroupIndex === idx?  '-' : all)}</b>
                                            </Statistical>
                                            <Statistical>
                                                <i className="logo">上升</i><br />
                                                <b className="up">{conversionNum(increase)}</b>
                                            </Statistical>
                                            <Statistical >
                                                <i className="logo">下降</i><br />
                                                <b className="down">{conversionNum(decline)}</b>
                                            </Statistical>
                                        </div>
                                    </PerfResultData>
                                )
                            })
                        }
                    </Result>
                }
                {
                    (!domainResult.is_default && domainResult.need_perf_data) &&
                    <Result>
                        <PerfResultTitle gLen={group}>性能测试</PerfResultTitle>
                        {
                            Array.isArray(logoData) && logoData.length > 0 && logoData.map((item: any, idx: number) => {
                                const { all, increase, decline } = item.perf_data || item
                                return (
                                    <PerfResultData gLen={group} key={idx}>
                                        <div style={{ display: 'flex', margin: '18px 0' }}>
                                            <Statistical>
                                                <i className="logo">总计</i><br />
                                                <b className="all">{conversionNum(baselineGroupIndex === idx?  '-' : all)}</b>
                                            </Statistical>
                                            <Statistical>
                                                <i className="logo">上升</i><br />
                                                <b className="up">{conversionNum(increase)}</b>
                                            </Statistical>
                                            <Statistical >
                                                <i className="logo">下降</i><br />
                                                <b className="down">{conversionNum(decline)}</b>
                                            </Statistical>
                                        </div>
                                    </PerfResultData>
                                )
                            })
                        }
                    </Result>
                }
                {
                    domainResult.is_default &&
                    <Result>
                        <FuncResultTitle gLen={group}>功能测试</FuncResultTitle>
                        {
                            Array.isArray(logoData) && logoData.length > 0 && logoData.map((item: any, idx: number) => {
                                const { all, success, fail } = item.func_data || item
                                return (
                                    <FuncResultData gLen={group} key={idx}>
                                        <div style={{ display: 'flex', margin: '18px 0' }}>
                                            <Statistical >
                                                <i className="logo">总计</i><br />
                                                <b className="all">{conversionNum(all)}</b>
                                            </Statistical>
                                            <Statistical >
                                                <i className="logo">通过</i><br />
                                                <b className="up">{conversionNum(success)}</b>
                                            </Statistical>
                                            <Statistical>
                                                <i className="logo">失败</i><br />
                                                <b className="down">{conversionNum(fail)}</b>
                                            </Statistical>
                                        </div>
                                    </FuncResultData>
                                )
                            })
                        }
                    </Result>
                }
                {
                    (!domainResult.is_default && domainResult.need_func_data) &&
                    <Result>
                        <FuncResultTitle gLen={group}>功能测试</FuncResultTitle>
                        {
                            Array.isArray(logoData) && logoData.length > 0 && logoData.map((item: any, idx: number) => {
                                const { all, success, fail } = item.func_data || item
                                return (
                                    <FuncResultData gLen={group} key={idx}>
                                        <div style={{ display: 'flex', margin: '18px 0' }}>
                                            <Statistical >
                                                <i className="logo">总计</i><br />
                                                <b className="all">{conversionNum(all)}</b>
                                            </Statistical>
                                            <Statistical >
                                                <i className="logo">通过</i><br />
                                                <b className="up">{conversionNum(success)}</b>
                                            </Statistical>
                                            <Statistical>
                                                <i className="logo">失败</i><br />
                                                <b className="down">{conversionNum(fail)}</b>
                                            </Statistical>
                                        </div>
                                    </FuncResultData>
                                )
                            })
                        }
                    </Result>
                }
            </Summary>
        </ModuleWrapper>
    )
}
export default memo(ReportSummary);