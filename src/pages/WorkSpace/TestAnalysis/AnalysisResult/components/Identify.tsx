import React from 'react';
import { Tooltip, Space, Typography } from 'antd';
import { FormattedMessage } from 'umi'
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import { ReactComponent as BaseLine } from '@/assets/svg/Report/BaseLine.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import _ from 'lodash';
import { PerfGroupData, EnvGroupR } from '../AnalysisUI';

const Identify: React.FC<any> = (props) => {
    const { envData, group, isData, enLocale } = props

    const TootipItem: React.FC<any> = (props) => {
        const { is_base, is_job, tag } = props
        return (
            <>
                <Space>
                    {
                        is_job ?
                            is_base && <Tooltip title={<FormattedMessage id="analysis.benchmark.group" />}>
                                <BaseIcon
                                    style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                                />
                            </Tooltip>
                            :
                            is_base && <Tooltip title={<FormattedMessage id="analysis.baseline.group" />}>
                                <BaseLine
                                    style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                                />
                                <Typography.Text>（<FormattedMessage id="analysis.test.baseline" />）</Typography.Text>
                            </Tooltip>
                    }
                </Space>
                <EllipsisPulic title={tag} width={'calc(100% - 100px)'} />
            </>
        )
    }

    return (
        <>
            {
                Array.isArray(envData) && envData.map((item: any, idx: number) => {
                    return (
                        isData ?
                            <PerfGroupData gLen={group} key={idx} >
                                <TootipItem {...item} />
                            </PerfGroupData>
                            :
                            <EnvGroupR gLen={group} enLocale={enLocale} key={idx}>
                                <TootipItem {...item} />
                            </EnvGroupR>
                    )
                })
            }
        </>
    )

}
export default Identify;