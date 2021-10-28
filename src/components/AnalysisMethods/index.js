import React from 'react';

// 填充颜色
const handleColor = ( name ) => {
    const dict = {
        normal: 'normal',
        increase: 'increase',
        decline: 'decline',
        invalid: 'invalid',
    }
    return dict[name]
} 
// 填充图标
const handleIcon = ( name ) => {
    const dict = {
        normal: '-',
        invalid: '⊘',
        increase: '↑',
        decline: '↓',
    }
    return dict[name]
}
// 差异化排序
const handleArrow = (suite, i) => {
    const list = suite.conf_list.map((conf, index) => {
        let metric_list = []
        let newConf = []
        for (let x = 0; x < 5; x++) newConf.push([])
        conf.metric_list.forEach((metric) => {
            let result = metric.compare_data[i]
            if (result.compare_result === 'decline') {
                result.sortNum = 0
            }else if (result.compare_result === 'increase') {
                result.sortNum = 1
            }else if (result.compare_result === 'normal') {
                result.sortNum = 2
            }else if (result.compare_result === 'invalid') {
                result.sortNum = 3
            }else{
                result.sortNum = 4
            }
            newConf.push(metric)
        })
        metric_list = newConf.reduce((pre, cur) => pre.concat(cur), [])
        return {
            ...conf,
            metric_list
        }
    })
    const toPoint = (percent) => {
        let str = percent === undefined ? 0 : percent.replace("%", "");
        str = Number(str)
        return str;
    }
   
    const sortMetric = (metric_list) => toPoint(metric_list.sort((a, b) => {
        return toPoint(a.compare_data[i].compare_value) - toPoint(b.compare_data[i].compare_value) 
    })[0].compare_data[i].compare_value)

    const newList = list.sort((a, b) => {
        return sortMetric(a.metric_list) - sortMetric(b.metric_list)
    })

    const compare = (metric_list) => metric_list.sort((a,b) => {
        return (a.compare_data[i].sortNum) - (b.compare_data[i].sortNum)
    })[0].compare_data[i].sortNum
    
    const endList = newList.sort((a, b) => {
        return compare(a.metric_list) - compare(b.metric_list)
    })
    setDataSource(
        dataSource.map((item) => {
            if (item.suite_id === suite.suite_id) {
                return {
                    ...item,
                    conf_list:endList
                }
            } else {
                return item
            }
        })
    )
}
const toPercentage = (point) => {
    var str = Number(point * 100).toFixed(1);
    str += "%";
    return str;
}

const toShowNum = (num) => {
    if(num == 0){
        return '0';
    }else if(num){
        return num;
    }else{
        return '-';
    }
}

const handleCaseColor = (type) => {
    if(type == 'Pass'){
        return '#81BF84';
    }else if(type == 'Fail'){
        return '#C84C5A';
    }else if(type == 'Skip'){
        return 'rgba(0,0,0,0.85)';
    }
        
}

export { handleColor, handleIcon, handleArrow, toPercentage, toShowNum, handleCaseColor }