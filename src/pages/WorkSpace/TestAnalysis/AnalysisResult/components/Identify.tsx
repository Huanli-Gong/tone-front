/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import React from 'react';
import { Tooltip, Space, Typography } from 'antd';
import { FormattedMessage } from 'umi'
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import { ReactComponent as BaseLine } from '@/assets/svg/Report/BaseLine.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { PerfGroupData, EnvGroupR } from '../AnalysisUI';

const Identify: React.FC<any> = (props) => {
    const { envData, group, isData, enLocale } = props

    const TootipItem: React.FC<any> = (props) => {
        const { is_group, is_baseline, tag } = props
        return (
            <>
                <Space>
                    {
                        is_group &&
                        <Tooltip title={<FormattedMessage id="analysis.benchmark.group" />}>
                            <BaseIcon
                                style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                            />
                        </Tooltip>
                    }
                    {
                        is_baseline ?
                            <Tooltip title={<FormattedMessage id="analysis.baseline.group" />}>
                                <BaseLine
                                    style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                                />
                                <Typography.Text>（<FormattedMessage id="analysis.test.baseline" />）</Typography.Text>
                            </Tooltip> : null
                    }
                </Space>
                <EllipsisPulic title={tag} width={'calc(100% - 130px)'} />
            </>
        )
    }

    return (
        <>
            {
                Array.isArray(envData) && envData.map((item: any, idx: number) =>
                    isData ?
                        <PerfGroupData gLen={group} key={idx} >
                            <TootipItem {...item} />
                        </PerfGroupData>
                        :
                        <EnvGroupR gLen={group} enLocale={enLocale} key={idx}>
                            <TootipItem {...item} />
                        </EnvGroupR>
                )
            }
        </>
    )
}
export default Identify;