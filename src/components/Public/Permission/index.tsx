import React from "react";
import { Tooltip } from "antd";
const Permission = (props:any) => {
    return (
        <Tooltip placement="topLeft" title="开发中..." >
            {props.children}
        </Tooltip>
    )
}
export default Permission;