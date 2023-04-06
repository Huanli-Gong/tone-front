import { Alert, Space, Typography } from "antd";
import React from "react"
import { v4 as uuid } from "uuid";
import { useIntl } from "umi"
import styled from "styled-components";

const BasicAlert = styled(Alert)`
    display: flex !important;
    align-items: start !important;
    & .anticon.anticon-exclamation-circle.ant-alert-icon {
        margin-top: 4px;
    }
`

type IProps = {
    sources: {
        ips: any[];
        dispatch_tags: any[];
        instance: any[];
    }
}
/* 
dispatch_tags: [{id:"xxx",name: "xxx"}]
ips: [{ip: 1.1.1,sn:xxxx}],
instance_name: [{id:"xxx",name: "xxx"}]
instance_setting: [{ip: 1.1.1,sn:xxxx}],
*/
const getMessage = (keyStr: string, source: any[]) => {
    if (["ips", "instance_setting"].includes(keyStr)) {
        return source?.map(({ ip, sn }: any) => `${ip}/${sn}`)
    }
    return source?.map(({ name }: any) => name)
}

const DeletedAlert: React.FC<IProps> = (props) => {
    const { sources } = props
    const intl = useIntl()

    if (!sources) return <></>
    if (JSON.stringify(sources) === "{}") return <></>

    return (
        <Space direction="vertical" style={{ width: "100%", marginBottom: 6 }}>
            {
                Object.keys(sources).map((item: any) => (
                    item?.length > 0 &&
                    <BasicAlert
                        showIcon
                        key={uuid()}
                        type="warning"
                        message={
                            <Space wrap >
                                {
                                    getMessage(item, sources[item]).map(
                                        (i: any) => (
                                            <Typography.Text
                                                key={uuid()}
                                            >
                                                {i}
                                            </Typography.Text>
                                        )
                                    )
                                }
                                <Typography.Text>
                                    {intl.formatMessage({ id: "select.suite.removed" })}
                                </Typography.Text>
                            </Space>
                        }
                    />
                )).filter(Boolean)
            }
        </Space>
    )
}

export default DeletedAlert