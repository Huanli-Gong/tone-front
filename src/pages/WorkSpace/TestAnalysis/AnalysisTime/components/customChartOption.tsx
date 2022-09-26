import { textTip, commitLinkTip } from './'


const customChartOption: any = (dataSource: any, ws_id: any, formatMessage: any) => {
    const baseicData = [
        { value: "Fail", color: "#C84C5A" },
        { value: "Skip", color: "#D9D9D9" },
        { value: "Pass", color: "#81BF84" }
    ];

    const data = Object.keys(dataSource).map((i: any) => {
        const item = dataSource[i]
        return {
            ...item,
            value: item?.result,
            date: i,
        }
    })
    const series = baseicData.map((i) => {
        return {
            type: "custom",
            name: i.value,
            itemStyle: { color: i.color },
            data: data.map((v) => {
                if (v.value === i.value) {
                    return [v.date, v.value, v];
                } else return [v.date, undefined, v];
            }),
            renderItem: ({ seriesName, coordSys }: any, api: any) => {
                const coord = api.coord([api.value(0), api.value(1)]);

                let x = coord[0],
                    y = coord[1],
                    rect = { width: 40, height: coordSys.height / 3 },
                    style = {
                        fill: baseicData.filter((v) => v.value === seriesName)[0].color
                    };
                x = x - rect.width / 2;
                let pathData: any, arrowX, arrowY;

                if (seriesName === "Skip") {
                    rect = { width: 40, height: 10 };
                    y = y - rect.height / 2;
                }

                if (seriesName === "Pass") {
                    y = y - rect.height;
                    arrowX = x + rect.width / 2;
                    arrowY = y - 3;
                    pathData = `M ${arrowX} ${arrowY} L ${arrowX - 5} ${arrowY - 6} L ${arrowX + 5} ${arrowY - 6}`;
                }

                if (seriesName === "Fail") {
                    arrowX = x + rect.width / 2;
                    arrowY = y + rect.height + 3;
                    pathData = `M ${arrowX} ${arrowY} L ${arrowX - 5} ${arrowY + 6} L ${arrowX + 5} ${arrowY + 6}`;
                }
                let children = [
                    {
                        type: "rect",
                        shape: { x, y, ...rect },
                        style
                    }
                ];
                const len = Math.round(coordSys.width / 6);
                children = children.concat(
                    new Array(len)
                        .fill('')
                        .reduce(
                            (p, cur, x) => p.concat({
                                type: "line",
                                shape: {
                                    x1: coordSys.x + x * 6,
                                    y1: coordSys.y + coordSys.height / 2,
                                    x2: coordSys.x + x * 6 + 4,
                                    y2: coordSys.y + coordSys.height / 2
                                },
                                silent: true,
                                style: {
                                    stroke: "#595959",
                                    fill: "#595959",
                                    lineWidth: 1
                                }
                            }), []
                        )
                )
                if (seriesName !== "Skip")
                    children.push({
                        type: "path",
                        shape: {
                            pathData,
                            x,
                            y
                        },
                        style
                    });

                return {
                    type: "group",
                    children
                };
            }
        };
    });

    const baseZoomLen = 25
    const yAxisLabel = ["Pass", "Skip", "Fail"];

    const option = {
        grid: { left: '3%', right: 30 },
        legend: {
            icon: "rect",
            itemHeight: 6,
            itemWidth: 15,
            top: '5%',
            data: yAxisLabel.map((i) => ({
                name: i,
                textStyle: { color: baseicData.filter((v) => v.value === i)[0].color }
            }))
        },

        dataZoom: data.length > baseZoomLen ? [{
            type: 'slider',
            show: true,
            zoomLock: true,
            start: 0,
            end: parseInt(baseZoomLen / data.length * 100 as any),
            left: '20%',
            right: '20%',
        }] : undefined,

        yAxis: {
            type: "category",
            data: yAxisLabel.map((i) => ({
                value: i,
                textStyle: {
                    color: baseicData.filter((c) => c.value === i)[0].color
                }
            })),
            splitNumber: 2, //坐标轴的分割段数
            axisTick: { show: false },
            axisLine: { show: false }
        },
        xAxis: {
            type: "category",
            date: data.map((i: any) => i.date)
        },
        tooltip: {
            enterable: true,
            trigger: 'item',
            backgroundColor: '#fff',
            borderColor: "#fff",
            textStyle: { color: 'rgba(0,0,0,0.65)', fontSize: 14, },
            extraCssText: 'box-shadow: 0 2px 8px 0 rgba(0,0,0,0.15);border-radius: 2px;padding:12px;',
            formatter: function (params: any) {
                const item = params.data[2]
                return (
                    `<div style="margin-right:10px">
                        ${params.marker} ${params.name} <br />
                        ${commitLinkTip('JobID', item.job_id, ws_id)}
                        ${textTip('commit', item.commit)}
                        ${textTip(formatMessage({ id: 'analysis.table.column.note' }), item.note)}
                    </div>`
                )
            },
        },
        series: [
            ...series,
        ]
    }
    return option
};

export default customChartOption;
