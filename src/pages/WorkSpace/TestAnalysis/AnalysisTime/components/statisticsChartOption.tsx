import { textTip, commitLinkTip } from '.'


const statisticsChartOption: any = (dataSource: any, ws_id: any, formatMessage: any) => {
    
    const baseicData = [
        { value: "Fail", color: "#C84C5A" },
        { value: "Skip", color: "#D9D9D9" },
        { value: "Pass", color: "#81BF84" }
    ];

    const data = Object.keys(dataSource).map((key: any) => {
        const value = dataSource[key]
        return {
          name: key,
          value,
        }
    })

    const baseZoomLen = 25
    const yAxisLabel = ["Pass", "Skip", "Fail"];

    const option = {
      tooltip: {
        trigger: 'item'
      },
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
      series: [
        {
          name: '数量',
          type: 'pie',
          radius: '50%',
          data: data,
          // [
          //   { value: 1048, name: 'Search Engine' },
          //   { value: 735, name: 'Direct' },
          //   { value: 580, name: 'Email' },
          //   { value: 484, name: 'Union Ads' },
          //   { value: 300, name: 'Video Ads' }
          // ],
          label: {
            formatter: '{b}: ({d}%)'
          },
          itemStyle: {
            // color: yAxisLabel.map((i) =>  baseicData.filter((v) => v.value === i)[0].color, )
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    return option
};

export default statisticsChartOption;
