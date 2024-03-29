import React from "react";
import { Modal, Space, Button, Spin } from "antd"
import { FormattedMessage, useRequest, useParams } from "umi"

import Performance from "./Performance";
import FunctionalPassRate from "./FunctionalPassRate";
import FunctionalUnPassRate from "./FunctionalUnPassRate"

import { getSelectMetricOrSubcase } from '../../services'
import { useAnalysisProvider } from '@/pages/WorkSpace/TestAnalysis/AnalysisTime/provider';


const MetricSelectDrawerLayout: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { test_type, project_id, provider_env, onOk, show_type, tag, start_time, end_time, metricData } = props
    const { ws_id } = useParams() as any

    const { suiteList, suiteListLoading, setMetrics } = useAnalysisProvider()

    const [visible, setVisible] = React.useState(false)
    const [info, setInfo] = React.useState<any>({})

    const defaultParams = { ws_id, test_type, provider_env }

    const { data: metrics, run: runGetMetrics } = useRequest((params: any) => getSelectMetricOrSubcase({
        ...defaultParams,
        project_id, start_time, end_time, tag,
        ...params,
    }), { manual: true })

    React.useEffect(() => {
        setMetrics(metrics)
    }, [metrics])

    React.useImperativeHandle(ref, () => ({
        show: async (vals: any) => {
            setVisible(true)
        },
    }))

    const handleClose = React.useCallback(() => {
        setVisible(false)
        setInfo({})
        setMetrics([])
    }, [])

    const title = React.useMemo(() => {
        const { selectMetric } = info
        if (test_type === 'performance')
            return `Metric${selectMetric?.length ? `(${selectMetric?.length})` : ''}`
        return show_type === 'pass_rate' ? 'Test Conf' : 'Test Case'
    }, [test_type, show_type, info])

    const canSubmit = React.useMemo(() => {
        const { selectMetric, selectSubcase, activeConf } = info
        if (test_type === 'performance')
            return selectMetric?.length > 0
        if (show_type !== 'pass_rate')
            return selectSubcase?.length > 0
        return activeConf || false
    }, [test_type, show_type, info])

    const selectSuiteName = React.useMemo(() => {
        if (!suiteList) return
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].test_suite_id === info?.activeSuite)
                return suiteList[i].test_suite_name
        return
    }, [suiteList, info])

    const confList = React.useMemo(() => {
        if (!suiteList) return
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].test_suite_id === info?.activeSuite) {
                if (suiteList[i].test_case_list.length > 0) {
                    return suiteList[i].test_case_list
                }
                return []
            }
        return []
    }, [suiteList, info])

    const selectConfName = React.useMemo(() => {
        if (!confList) return
        for (let len = confList.length, i = 0; i < len; i++)
            if (confList[i].test_case_id === info?.activeConf)
                return confList[i].test_case_name
        return
    }, [confList, info])

    const handleOk = (): any => {
        const { activeSuite, activeConf, selectMetric, selectSubcase } = info
        const params: any = { test_suite_id: activeSuite }

        if (test_type === 'performance') {
            params.test_case_id = activeConf
            params.metric = selectMetric
            params.title = `${selectSuiteName}/${selectConfName}`///${ selectMetric.toString() }
        }

        if (test_type === 'functional') {
            params.test_case_id = activeConf
            params.title = `${selectSuiteName}/${selectConfName}`
            if (show_type !== 'pass_rate') {
                params.sub_case_name = selectSubcase
                params.test_case_id = activeConf
                params.title = `${selectSuiteName}/${selectConfName}` ///${ selectSubcase.toString() }
            }
        }

        onOk(params)
        handleClose()
    }

    const baseProps = {
        test_type,
        show_type,
        basicValues: metricData,
        project_id,
        provider_env,
        suiteList,
        loading: suiteListLoading,
        visible,
        runGetMetrics,
        metrics,
        onChange: (data: any) => {
            setInfo((p: any) => ({ ...p, ...data }))
        }
    }

    return (
        <Modal
            title={title}
            width={940}
            open={visible}
            onCancel={handleClose}
            destroyOnClose
            footer={
                <Space>
                    <Button onClick={handleClose}><FormattedMessage id="operation.cancel" /></Button>
                    <Button
                        type="primary"
                        onClick={handleOk}
                        disabled={!canSubmit}
                    >
                        <FormattedMessage id="operation.ok" />
                    </Button>
                </Space>
            }
        >
            <Spin spinning={suiteListLoading}>
                {
                    test_type === "performance" &&
                    <Performance {...baseProps} />
                }
                {
                    test_type !== "performance" &&
                    (
                        show_type === "pass_rate" ?
                            <FunctionalPassRate  {...baseProps} /> :
                            <FunctionalUnPassRate  {...baseProps} />
                    )
                }
            </Spin>
        </Modal>
    )
}

export default React.forwardRef(MetricSelectDrawerLayout)