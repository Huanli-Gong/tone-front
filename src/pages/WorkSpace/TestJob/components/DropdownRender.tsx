import React from "react"
import { useIntl, useAccess, Access } from "umi"
import { Space, Divider, Row, Typography } from "antd"

type DropdownRenderProps = {
    menu: React.ReactNode;
    uri: string;
}

const DropdownRender: React.FC<DropdownRenderProps> = (props) => {
    const { menu, uri } = props
    const access = useAccess()
    const intl = useIntl()

    return (
        <Space direction="vertical" style={{ width: "100%" }} size={0}>
            {menu}
            <Access
                accessible={access.IsSysTestAdmin()}
                fallback={<></>}
            >
                <Divider style={{ margin: 0 }} />
                <Row justify={"center"} align={"middle"} style={{ height: 30 }}>
                    <Typography.Link
                        target="_blank"
                        href={uri}
                        style={{ width: "100%", textAlign: "center" }}
                    >
                        去配置
                    </Typography.Link>
                </Row>
            </Access>
        </Space>
    )
}
export default DropdownRender