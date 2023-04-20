import { Tooltip } from "antd";
import { useIntl } from 'umi'

const Permission = (props: any) => {
    const { formatMessage } = useIntl()
    return (
        <Tooltip placement="topLeft" title={formatMessage({ id: 'developing' })} >
            {props.children}
        </Tooltip>
    )
}
export default Permission;