import React from "react";
import { Modal, Space, Button, Spin } from "antd"
import { FormattedMessage, useRequest, useParams } from "umi"

import Performance from "./Performance";
import FunctionalPassRate from "./FunctionalPassRate";
import FunctionalUnPassRate from "./FunctionalUnPassRate"

import { queryTestSuiteCases } from '../../services'

const MetricSelectDrawerLayout: React.ForwardRefRenderFunction<AnyType, AnyType> = (props, ref) => {
    const { test_type, projectId, provider_env, onOk, show_type } = props
    const { ws_id } = useParams() as any

    const [visible, setVisible] = React.useState(false)
    const [info, setInfo] = React.useState<any>({})
    const [basicValues, setBasicValues] = React.useState(undefined)

    const { data: suiteList, loading } = useRequest(
        () => queryTestSuiteCases({ test_type, ws_id, page_num: 1, page_size: 200 }),
        { initialData: [], refreshDeps: [test_type, ws_id] }
    )

    React.useImperativeHandle(ref, () => ({
        show: async (vals: any) => {
            setVisible(true)
            console.log(vals)
            setBasicValues(vals)
        },
    }))

    const handleClose = React.useCallback(() => {
        setVisible(false)
        setInfo({})
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
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].id === info?.activeSuite)
                return suiteList[i].name
        return
    }, [suiteList, info])

    const confList = React.useMemo(() => {
        for (let len = suiteList.length, i = 0; i < len; i++)
            if (suiteList[i].id === info?.activeSuite) {
                if (suiteList[i].test_case_list.length > 0) {
                    return suiteList[i].test_case_list
                }
                return []
            }
        return []
    }, [suiteList, info])

    const selectConfName = React.useMemo(() => {
        for (let len = confList.length, i = 0; i < len; i++)
            if (confList[i].id === info?.activeConf)
                return confList[i].name
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

    React.useEffect(() => {
        return () => {
            setBasicValues(undefined)
        }
    }, [])

    const baseProps = {
        test_type,
        show_type,
        basicValues,
        projectId,
        provider_env,
        loading,
        suiteList,
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
            <Spin spinning={loading}>
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