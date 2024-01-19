/* eslint-disable react/no-array-index-key */
import { Row, Spin, Empty } from 'antd'
import { useParams, useRequest, FormattedMessage } from 'umi'
import { queryCaseResultVersionInfo } from '../service'
export default ({ test_case_id, suite_id }: any) => {
    const { id: job_id, share_id } = useParams() as any
    const initialData: any = {
        kernel_version: '',
        rpm_info: [],
    }

    const { data, loading } = useRequest(
        () => queryCaseResultVersionInfo({ job_id, case_id: test_case_id, suite_id, share_id }),
        {
            initialData,
            formatResult: res => {
                if (res.code === 200) {
                    const [{ kernel_version, rpm_info }] = res.data
                    if (rpm_info && rpm_info !== '{}')
                        return {
                            kernel_version,
                            rpm_info: JSON.parse(rpm_info)
                        }
                    return { kernel_version, rpm_info: [] }
                }
                return initialData
            },
        }
    )

    return (
        <div style={{ background: '#fff', padding: 20 }}>
            <Spin spinning={loading} >
                <Row>
                    {
                        data.kernel_version &&
                        <>
                            <b style={{ marginRight: 16 }}><FormattedMessage id="ws.result.details.installed.kernel" />&nbsp;</b><span>{data.kernel_version}</span>
                        </>
                    }
                </Row>
                {
                    data?.rpm_info?.map(
                        (item: any) => (
                            <Row key={item?.rpm}>
                                <b style={{ marginRight: 16 }}><FormattedMessage id="ws.result.details.installed.rpm" /></b>
                                <span>{item.rpm}</span>
                            </Row>
                        )
                    )
                }
                {
                    (!data?.kernel_version && data?.rpm_info?.length === 0) &&
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </Spin>
        </div>
    )
}