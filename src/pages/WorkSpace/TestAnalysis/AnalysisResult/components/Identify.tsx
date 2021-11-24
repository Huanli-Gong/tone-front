import React from 'react';
import { Tooltip, Space } from 'antd';
import { ReactComponent as BaseIcon } from '@/assets/svg/Report/BaseIcon.svg';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import _ from 'lodash';
import { PerfGroupData, EnvGroupR } from '../AnalysisUI';

const Identify: React.FC<any> = (props) => {
    const { envData, group, isData } = props

    const TootipItem: React.FC<any> = (props) => {
        const { is_base, tag } = props
        return (
            <>
                <Space>
                    {
                        is_base &&
                        <Tooltip title="基准组">
                            <BaseIcon
                                style={{ marginRight: 4, marginTop: 17, width: 10, height: 14 }}
                            />
                        </Tooltip>
                    }
                </Space>
                <EllipsisPulic title={tag} />
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
                            <EnvGroupR gLen={group} key={idx}>
                                <TootipItem {...item} />
                            </EnvGroupR>
                    )
                })
            }
        </>
    )

}
export default Identify;


