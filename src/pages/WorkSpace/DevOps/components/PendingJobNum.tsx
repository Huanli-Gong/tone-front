import React from "react"
import ConfigRow from "./ConfigRow"
import { FormattedMessage } from "umi"
import { Space, InputNumber } from "antd"
import { useDevOpsContext } from "../Provider"

const JobPeddingCount: React.FC<any> = (props) => {
    const { field } = props
    const { dataSource, update } = useDevOpsContext()

    const data = dataSource[field]

    const [val, setVal] = React.useState(data)

    React.useEffect(() => {
        setVal(data?.trim())
    }, [data])

    return (
        <ConfigRow title={<FormattedMessage id={`devOps.${field}`} />} >
            <Space>
                <FormattedMessage id={'devOps.pedding_job_num.desc'} />

                <InputNumber
                    size="small"
                    value={val}
                    min={1}
                    onBlur={({ target }) => update({ [field]: target.value?.trim() })}
                />
                <FormattedMessage id={'devOps.pedding_job_num.desc_1'} />
            </Space>
        </ConfigRow>
    )
}

export default JobPeddingCount