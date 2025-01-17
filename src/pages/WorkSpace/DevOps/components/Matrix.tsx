import React from "react"
import ConfigRow from "./ConfigRow"
import { FormattedMessage } from "umi"
import { Button, Space, Input } from "antd"
import { useDevOpsContext } from "../Provider"

const MatrixBranch: React.FC<any> = (props) => {
    const { field, iType } = props
    const { dataSource, update } = useDevOpsContext()

    const data = dataSource[field]

    const [val, setVal] = React.useState(data)

    React.useEffect(() => {
        setVal(data?.trim())
    }, [data])

    const handleOk = () => {
        update({ [field]: val?.trim() })
    }

    return (
        <ConfigRow
            title={
                <FormattedMessage id={`devOps.matrix_repo.${iType}`} />
            }
        >
            <Space>

                <Input
                    size="small"
                    allowClear
                    value={val}
                    onChange={({ target }) => setVal(target.value)}
                />
                <Button size="small" type="primary" onClick={handleOk}>
                    <FormattedMessage id="operation.update" />
                </Button>
            </Space>
        </ConfigRow>
    )
}

export default MatrixBranch