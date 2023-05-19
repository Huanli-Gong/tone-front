/* eslint-disable react-hooks/exhaustive-deps */
import styled from "styled-components";
import React from "react"
import { Space, Typography } from "antd";

type LineProps = {
    borderColor?: string;
    isBaseline?: number;
}

const Line = styled.div.attrs((props: LineProps) => ({
    style: {
        borderStyle: props?.isBaseline ? "dashed" : "solid",
        borderColor: props.borderColor
    }
})) <LineProps>`
    height: 0;
    width: 10px;
    border-width: 1px;
`
type LegendBoxProps = {
    state: boolean;
}

const unSelectColor = "rgba(0,0,0, .35)"

const LegendBox = styled(Space).attrs((props: any) => ({
    className: props.state ? "" : "legend_un_select"
})) <LegendBoxProps>`
    cursor: pointer;
    &.legend_un_select {
        .ant-typography {
            color: ${unSelectColor};
        }
        ${Line} {
            border-color: ${unSelectColor} !important;
        }
    }
`

const Legend: React.FC<any> = ({ name, chartRef, isBaseline, isStandalone, source, provider_env }) => {
    const [state, setState] = React.useState(true)

    const handleClick = () => {
        chartRef?.dispatchAction({
            type: 'legendToggleSelect',
            name,
        })
    }

    const handleLegendSelectChange = (params: any) => {
        const { selected } = params
        setState(selected[name])
    }

    React.useEffect(() => {
        if (!chartRef) return
        if (!name) return
        chartRef.on("legendselectchanged", { seriesName: name }, handleLegendSelectChange)
        return () => {
            chartRef.off("legendselectchanged", { seriesName: name }, handleLegendSelectChange)
        }
    }, [chartRef])

    if (isStandalone)
        return (
            <Space size={[24, 0]} wrap >
                {
                    source?.map((item: any) => (
                        <Legend key={item.name} {...item} chartRef={chartRef} provider_env={provider_env} />
                    ))
                }
            </Space>
        )

    return (
        <LegendBox
            direction="vertical"
            size={0}
            onClick={handleClick}
            state={state}
        >
            <Space>
                <Line
                    isBaseline={isBaseline ? 1 : 0}
                    borderColor={chartRef?.getModel()?.getColorFromPalette(name)}
                />
                < Typography.Text style={{ fontSize: 10 }} ellipsis>
                    {name}
                </Typography.Text>
            </Space>
            {
                provider_env === "aliyun" &&
                <Space>
                    <Line
                        isBaseline={1}
                        borderColor={chartRef?.getModel()?.getColorFromPalette(name)}
                    />
                    <Typography.Text style={{ fontSize: 10 }}>
                        基线AVG值
                    </Typography.Text>
                </Space>
            }
        </LegendBox>
    )
}

export default Legend