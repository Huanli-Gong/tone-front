import * as antv from '@antv/g2';
const { Chart } = antv
export const filterChartSource = (data: any, key: any, judge: boolean) => data.reduce((pre: any, cur: any) => pre.concat(
    Object.keys(cur).reduce(
        (p: any, c: any) => {
            if (c === 'date') return p
            const $data = { date: cur.date, name: c.split(/(?=[A-Z])/).join(" "), count: cur[c] }
            if (judge)
                return ~c.indexOf(key) ? p.concat($data) : p
            return c.indexOf(key) === -1 ? p.concat($data) : p
        }, []
    )
), [])


export const renderChart = (dom: any, data: any[]) => {
    const chart = new Chart({
        container: dom,
        autoFit: true,
    });
    chart.data(data);
    chart.scale({
        count: {
            nice: true,
        }
    });
    chart.axis('date', {
        tickLine: {
            alignTick: true
        }
    })
    chart.legend({
        position: 'top-right',
    });
    chart.tooltip({
        showCrosshairs: true,
        shared: true,
    });
    chart
        .line()
        .position('date*count')
        .color('name')
        .shape('smooth');

    chart
        .point()
        .position('date*count')
        .color('name')
        .shape('circle')
        .style({
            stroke: '#fff',
            lineWidth: 1,
        });
    chart.render();
    return chart
}