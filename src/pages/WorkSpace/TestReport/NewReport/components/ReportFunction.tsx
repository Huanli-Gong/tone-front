import produce from 'immer'

export const simplify = (child: any, idx: number, listId: number, name: string, isOldReport:any ) => {
    let suite_list: any = []
    child.list?.map((suite: any, suiteId: number) => {
        let conf_list: any = []
        suite.conf_list.map((conf: any, index: number) => {
                let baseJobList = isOldReport ? [conf?.obj_id || conf.conf_source?.obj_id] : []
                let compareJobList = (conf.conf_compare_data || conf.compare_conf_list).map((i:any) => ({ job_id: i?.obj_id || '', is_baseline:i?.is_baseline }))
            conf_list.push({
                conf_id: conf.conf_id,
                conf_name: conf.conf_name,
                job_list: baseJobList.concat(compareJobList)
            })
        })
        suite_list.push({
            suite_id:suite.suite_id,
            suite_name: suite.suite_name,
            conf_list,
            rowKey: name == 'group' ? `${idx}-${listId}-${suiteId}` : `${idx}-${suiteId}`
        })
    })
    return suite_list;
}
export const deleteMethod = (dataSource:any, name: string, domain: any, rowKey: any) => {
    if (name === 'group') {
        return dataSource.map((i: any, idx: number) => {
            let ret: any = []
            if (i.is_group) {
                i.list.map((b: any) => {
                    if (b.rowKey === rowKey) {
                        ret = i.list.filter((c: any) => c.name !== domain)
                    }
                })
                return {
                    ...i,
                    list: ret,
                }
            }
            return {
                ...i,
            }
        })
    } else {
       return dataSource.filter((item: any) => item.name !== domain && item.rowKey !== rowKey)
    }
}

export const deleteSuite = (item:any, row:any) => {
    let ret = item.list.reduce((pre:any, suite:any) => {
         if (suite.suite_id == row.suite_id) return pre
         return pre.concat(suite)
     }, [])
     return {
         ...item,
         list:ret,
     }
 }

export const deleteConf = (item:any, row:any) => {
    return produce(item, (draft:any) => {
        draft.list = item.list.map(
            (suite:any) => {
                let conf_list = suite.conf_list.reduce(
                    (pre:any, conf:any) => {
                        if (conf.conf_id == row.conf_id) return pre
                        return pre.concat(conf)
                    },
                    []
                )
                return {
                    ...suite,
                    conf_list
                }
            })
    })
}

export const handleDataArr = (dataArr: any, baseIndex: number) => {
    if (Array.isArray(dataArr.list) && !!dataArr.list.length) {
        dataArr.list.forEach((per: any) => (
            per.conf_list.forEach((conf: any, i: number) => (
                conf.metric_list.forEach((metric: any, idx: number) =>
                (
                    metric.compare_data.splice(baseIndex, 0, {
                        cv_value: metric.cv_value,
                        test_value: metric.test_value,
                    })
                )
                )
            ))
        ))
    }
    return dataArr;
}

export const reportDelete = (dataSource:any, name: string, row: any, rowKey: any) => {
    if (name == 'suite') {
        return dataSource.map((item: any) => {
            if (item.is_group) {
                let list = item.list.map((l: any) => deleteSuite(l, row))
                return {
                    ...item,
                    list,
                }
            } else {
                return deleteSuite(item, row)
            }
        })
    } else {
        return dataSource.map((item: any) => {
            if (item.is_group) {
                let list = item.list.map((l: any) => deleteConf(l, row))
                return {
                    ...item,
                    list,
                }
            } else {
                return deleteConf(item, row)
            }
        })
    }
}