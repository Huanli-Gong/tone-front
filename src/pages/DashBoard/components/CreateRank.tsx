/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react'
import { queryChartData } from '../services';
import moment from 'moment'
import { Tabs, DatePicker, message, Spin } from 'antd'
import { FormattedMessage } from 'umi'
import { Container, RankIndex, RankIndexDefault, RankRow, RankUserName, RankCount, RankDesc } from './styled'

const RenderRankRow: React.FC<any> = ({ source, tab }) => (
    source.map((item: any, index: number) => (
        <RankRow key={index}>
            {
                index < 3 ?
                    <RankIndex index={index}>{index + 1}</RankIndex> :
                    <RankIndexDefault>{index + 1}</RankIndexDefault>
            }
            <RankUserName ellipsis>{tab === 'ws' ? item.show_name : item.name}</RankUserName>
            <RankDesc ellipsis type="secondary">{item.dep_desc}</RankDesc>
            <RankCount>{item.count}</RankCount>
        </RankRow>
    ))
)

const CreateRank = () => {
    const DEFAULT_CHART_TYPE = 'personal_create_job'
    const DATE_FORMMATER = 'YYYY-MM-DD'

    const [timer, setTimer] = useState<any>([moment().add(-6, 'days'), moment()])
    const [tabKey, setTabKey] = useState('personal')
    const [source, setSource] = useState([])
    const [loading, setLoading] = useState(false)

    const getRankData = async () => {
        setLoading(true)
        const start_time = moment(timer[0]).format(DATE_FORMMATER)
        const end_time = moment(timer[1]).format(DATE_FORMMATER)
        const create_type = tabKey

        const { data, code, msg } = await queryChartData({ chart_type: DEFAULT_CHART_TYPE, create_type, start_time, end_time })

        if (code !== 200) message.warning(msg)
        else setSource(data)
        setLoading(false)
    }

    useEffect(() => {
        getRankData()
    }, [timer, tabKey])

    const hanldeTabChange = (tab: any) => {
        setTabKey(tab)
    }

    const handleTimerChange = (date: any) => {
        setTimer(date)
    }

    return (
        <Container>
            <Tabs
                tabBarExtraContent={
                    <DatePicker.RangePicker
                        style={{ marginRight: 20 }}
                        value={timer}
                        onChange={handleTimerChange}
                        format={DATE_FORMMATER}
                        allowClear={false}
                    />
                }
                defaultActiveKey={tabKey}
                moreIcon={false}
                onChange={hanldeTabChange}
            >
                <Tabs.TabPane tab={<FormattedMessage id="sys.dashboard.personal.ranking" />} key="personal">
                    <Spin spinning={loading}>
                        <RenderRankRow source={source} tab={tabKey} />
                    </Spin>
                </Tabs.TabPane>
                <Tabs.TabPane tab={<FormattedMessage id="sys.dashboard.ws.ranking" />} key="ws">
                    <Spin spinning={loading}>
                        <RenderRankRow source={source} tab={tabKey} />
                    </Spin>
                </Tabs.TabPane>
            </Tabs>
        </Container>
    )
}

export default CreateRank