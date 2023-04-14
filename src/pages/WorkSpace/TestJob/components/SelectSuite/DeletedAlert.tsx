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
    & .ant-alert-close-icon {
        margin-top: 5px;
    }
`

type IProps = {
    isDelete?: boolean;
    sources: {
        ips: any[];
        dispatch_tags: any[];
        instance_setting: any[];
        instance_name: any[];
    },
}
/* 
    调度标签：dispatch_tags: [{id:"xxx",name: "xxx"}]
    指定机器：ips: [{ip: 1.1.1,sn:xxxx}],
    机器实例：instance_name: [{id:"xxx",name: "xxx"}]
    机器配置：instance_setting: [{ip: 1.1.1,sn:xxxx}],
*/
const getMessage = (keyStr: string, source: any[]) => {
    if (["ips", "instance_name"].includes(keyStr)) {
        return source?.map(({ ip, sn }: any) => `${ip}/${sn}`)
    }
    return source?.map(({ name }: any) => name)
}

const DeletedAlert: React.FC<IProps> = (props) => {
    const { sources, isDelete } = props
    const intl = useIntl()

    if (!sources) return <></>
    if (JSON.stringify(sources) === "{}") return <></>

    return (
        <>
            {
                Object.keys(sources).map((item: any) => (
                    item?.length > 0 &&
                    <BasicAlert
                        showIcon
                        key={uuid()}
                        type="warning"
                        closable
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
                                    {intl.formatMessage({ id: `select.suite.${isDelete ? "removed" : "existent"}` })}
                                </Typography.Text>
                            </Space>
                        }
                    />
                )).filter(Boolean)
            }
        </>
    )
}

export default DeletedAlert