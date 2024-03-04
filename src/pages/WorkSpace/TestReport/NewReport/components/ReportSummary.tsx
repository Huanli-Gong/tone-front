/* eslint-disable react/no-array-index-key */
import React, { useContext, memo, useMemo } from 'react';
import { FormattedMessage } from 'umi';
import { ReportContext } from '../Provider';
import { Space, Tooltip, Typography } from 'antd';
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import { ReactComponent as BaseLine } from '@/assets/svg/Report/BaseLine.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { isNaN, isUndefined } from 'lodash';
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

const conversionNum = (val: any) => {
    if (val == 0) {
        return 0;
    } else if (isNaN(val) || isUndefined(val)) {
        return '-';
    } else {
        return val;
    }
}

const RenderPerfItem: React.FC<any> = ({ logoData, groupLen }) => (
    Array.isArray(logoData) && !!logoData.length ?
        <Result>
            <PerfResultTitle gLen={groupLen}><FormattedMessage id="performance.test" /></PerfResultTitle>
            {
                logoData.map((item: any, idx: number) => {
                    const { perfAll, increase, decline } = item.perf_data || item
                    return (
                        <PerfResultData gLen={groupLen} key={idx}>
                            <div style={{ display: 'flex', margin: '18px 0' }}>
                                <Statistical>
                                    <i className="logo"><FormattedMessage id="report.all" /></i><br />
                                    <b className="all">{conversionNum(perfAll)}</b>
                                </Statistical>
                                <Statistical>
                                    <i className="logo"><FormattedMessage id="report.increase" /></i><br />
                                    <b className="up">{conversionNum(increase)}</b>
                                </Statistical>
                                <Statistical >
                                    <i className="logo"><FormattedMessage id="report.decline" /></i><br />
                                    <b className="down">{conversionNum(decline)}</b>
                                </Statistical>
                            </div>
                        </PerfResultData>
                    )
                })
            }
        </Result>
        : <></>
)

const RenderFuncItem: React.FC<any> = ({ logoData, groupLen }) => (
    Array.isArray(logoData) && !!logoData.length ?
        <Result>
            <FuncResultTitle gLen={groupLen}><FormattedMessage id="functional.test" /></FuncResultTitle>
            {
                logoData.map((item: any, idx: number) => {
                    const { funcAll, success, fail } = item.func_data || item
                    return (
                        <FuncResultData gLen={groupLen} key={idx}>
                            <div style={{ display: 'flex', margin: '18px 0' }}>
                                <Statistical >
                                    <i className="logo"><FormattedMessage id="report.all" /></i><br />
                                    <b className="all">{conversionNum(funcAll)}</b>
                                </Statistical>
                                <Statistical >
                                    <i className="logo"><FormattedMessage id="report.success" /></i><br />
                                    <b className="up">{conversionNum(success)}</b>
                                </Statistical>
                                <Statistical>
                                    <i className="logo"><FormattedMessage id="report.fail" /></i><br />
                                    <b className="down">{conversionNum(fail)}</b>
                                </Statistical>
                            </div>
                        </FuncResultData>
                    )
                })
            }
        </Result>
        : <></>
)

const ReportSummary = () => {
    const { logoData, envData, domainResult, groupLen, baselineGroupIndex } = useContext(ReportContext)

    // console.log(logoData)
    // const statisticalWidth = `${String(base_group.all).length * 20}px`  动态计算测试数据的宽度

    const PerfFlag = useMemo(() => {
        let baseIndex = 0
        if (logoData.length > 1) {
            baseIndex = baselineGroupIndex === 0 ? 1 : 0
        }
        return JSON.stringify(logoData[baseIndex]?.perf_data) !== '{}'
    }, [logoData, baselineGroupIndex])

    const FuncFlag: any = useMemo(() => {
        return JSON.stringify(logoData[baselineGroupIndex]?.func_data) !== '{}'
    }, [logoData, baselineGroupIndex])

    return (
        <ModuleWrapper style={{ width: groupLen > 3 ? groupLen * 390 : 1200 }} id="need_test_summary" className="position_mark">
            <SubTitle><span className="line" />Summary</SubTitle>
            <Summary>
                <Group>
                    <GroupTitle gLen={groupLen}><FormattedMessage id="report.comparison.group.name" /></GroupTitle>
                    {
                        Array.isArray(envData) && !!envData.length && envData.map((item: any, idx: number) => {
                            return (
                                <GroupData gLen={groupLen} key={idx}>
                                    <Space>
                                        {
                                            item.is_group && <Tooltip title={<FormattedMessage id="report.benchmark.group" />}>
                                                <BaseIcon
                                                    style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                                                />
                                            </Tooltip>
                                        }
                                        {
                                            item.is_baseline ? <Tooltip title={<FormattedMessage id="report.baseline.group" />}>
                                                <BaseLine
                                                    style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                                                />
                                                <Typography.Text><FormattedMessage id="report.test.baseline" /></Typography.Text>
                                            </Tooltip> : null
                                        }
                                    </Space>
                                    <EllipsisPulic title={item.tag} />
                                </GroupData>
                            )
                        })
                    }
                </Group>
                {(domainResult.is_default && PerfFlag) && <RenderPerfItem groupLen={groupLen} logoData={logoData} />}
                {((!domainResult.is_default && domainResult.need_perf_data) && PerfFlag) && <RenderPerfItem groupLen={groupLen} logoData={logoData} />}
                {(domainResult.is_default && FuncFlag) && <RenderFuncItem groupLen={groupLen} logoData={logoData} />}
                {((!domainResult.is_default && domainResult.need_func_data) && FuncFlag) && <RenderFuncItem groupLen={groupLen} logoData={logoData} />}
            </Summary>
        </ModuleWrapper>
    )
}
export default memo(ReportSummary);