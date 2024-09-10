/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */

import { useEffect } from 'react'
import _ from 'lodash'

const resizeDocumentHeight = (maxHeight: any) => {
    const getemptyTableDom = () => {
        const emptyDom: any = document.querySelector('#list_container table .ant-empty-normal')
        if (emptyDom) {
            // const scollHeight = maxHeight - 339 > 430 ? 430 : maxHeight - 339
            const scollHeight = maxHeight
            const number = (scollHeight - 130) / 2
            emptyDom.style.margin = `${number}px 0`
        }
    }
    useEffect(() => {
        getemptyTableDom()
    }, [maxHeight])
    useEffect(() => {
        window.addEventListener('resize', getemptyTableDom, false)
        return () => {
            window.removeEventListener('resize', getemptyTableDom, false)
        }

    }, [])
    return ''
}

const getFinallyData = (suite_dic: any) => {
    let confIdArr: any = []
    if (suite_dic.conf_dic) {
        for (let suitId in suite_dic) {
            const conf_dic = suite_dic[suitId].conf_dic
            delete suite_dic[suitId].suite_id
            for (let confId in conf_dic) {
                confIdArr.push(confId)

                let base_obj_li = conf_dic[confId].base_obj_li
                base_obj_li = _.isArray(base_obj_li) ? base_obj_li : []
                const selectJob = base_obj_li.filter((item: any) => item && item.isSelect)
                let is_job = 1
                let obj_id = ''
                if (selectJob.length) {
                    is_job = selectJob[0].is_job
                    obj_id = selectJob[0].obj_id
                }
                if (!selectJob.length && base_obj_li.length) {
                    is_job = base_obj_li[0].is_job
                    obj_id = base_obj_li[0].obj_id
                }

                const compare_groups = conf_dic[confId].compare_groups.map((level: any) => {
                    if (!level || !level.length) return null
                    const trr = level.filter((second: any) => _.get(second, 'isSelect'))
                    if (trr.length) return { is_job: trr[0].is_job, obj_id: trr[0].obj_id }
                    return { is_job: level[0].is_job, obj_id: level[0].obj_id }
                })
                conf_dic[confId].is_job = is_job
                conf_dic[confId].obj_id = obj_id
                conf_dic[confId].compare_objs = compare_groups
                delete conf_dic[confId].base_obj_li
                delete conf_dic[confId].conf_id
            }
        }
        return { suite_dic, confIdArr }
    }
    return { suite_dic, confIdArr }
}

const getRegroupData = (suite: any) => {
    // let arr: any = []
    return Object.values(suite).map((item: any) => {
        if (!item.is_all) {
            return {
                suite_id: item.suite_id,
                is_all: item.is_all,
                conf_list: Object.keys(item.conf_dic).map((i: any) => Number(i))
            }
        }
        return {
            suite_id: item.suite_id,
            is_all: item.is_all,
        }
    })
    // return arr
}

const fillData = (data: any) => {
    return Object.keys(data).map((key: any) => {
        const { suite_name, suite_id, base_index, is_all, group_jobs, duplicate_data, conf_dic } = data[key]
        let obj: any = {
            async_request: '1',
            suite_id,
            suite_name,
            base_index,
            group_jobs,
            duplicate_data,
        }
        if (is_all) {
            obj = { ...obj, is_all: 1 }
        } else {
            obj = { ...obj, is_all: 0, conf_info: Object.values(conf_dic) }
        }
        return obj
    })
}

const getSelectedDataFn = (
    data: any,
    allGroupData: any,
    baseIndex: number,
    selectedKeys: any,
    duplicate: any
) => {
    // 二级
    const suite = _.cloneDeep(data)
    let group_jobs: any = []
    allGroupData.forEach((item: any) => {
        let arr: any = []
        if (item.members) {
            item.members.forEach((item: any) => arr.push(item.id))
        } else {
            arr.push(item.id)
        }

        if (arr.length > 0) {
            group_jobs.push({ 
                job_list: arr, 
                is_baseline: item.type === 'baseline' ? 1 : 0, 
                ws_id: item.selectedWsId || item.ws_id,
            })
        }
    })
    Object.values(suite).forEach((obj: any) => {
        obj.base_index = baseIndex
        obj.group_jobs = group_jobs
        obj.duplicate_data = duplicate
        if (obj.conf_dic) {
            let result: any = []
            const conf_dic = Object.keys(obj.conf_dic)
            conf_dic.forEach(keys => {
                if (!selectedKeys.includes(+keys)) {
                    delete obj.conf_dic[keys]
                }
                obj.conf_dic[keys] && result.push(obj.conf_dic[keys])
            })
            if (!!result.length) {
                obj.is_all = 0
                obj.conf_info = result
            } else {
                delete suite[obj.suite_id]
            }
        } else {
            if (selectedKeys.includes(String(obj.suite_id))) {
                obj.is_all = 1
            } else {
                delete suite[obj.suite_id]
            }
        }
    })
    return suite
}

const handleDomainList = (data: any) => {
    const suiteDataCopy = _.cloneDeep(data)
    let funcSuite = suiteDataCopy.func_suite_dic || {}
    let perfSuitec = suiteDataCopy.perf_suite_dic || {}
    let paramData: any = []
    if (JSON.stringify(funcSuite) !== '{}') {
        paramData = paramData.concat(getRegroupData(funcSuite))
    }
    if (JSON.stringify(perfSuitec) !== '{}') {
        paramData = paramData.concat(getRegroupData(perfSuitec))
    }
    return paramData;
}

const mapToArr = (m: any) => Array.from(m).map((i: any) => {
    const [, v] = i
    return v
})

const getJobRefSuit = (suiteData: any, objList: any[]) => {
    const baseArr: any = new Map()
    const compareArr: any = new Map()
    const allData = [...Object.values(suiteData.func_suite_dic), ...Object.values(suiteData.perf_suite_dic)]

    const jobObj = objList?.reduce((p, c) => {
        p[c.id] = c
        return p
    }, {})

    allData.forEach((suit: any) => {
        suit.group_jobs.forEach((item: any, idx: number) => {
            const obj_li = _.get(item, 'job_list') || []
            obj_li.forEach((arr: any) => {
                const { server_provider } = jobObj[arr]
                if (suit.base_index === idx) {
                    if (!baseArr.get(arr))
                        baseArr.set(arr, {
                            is_baseline: item.is_baseline,
                            server_provider,
                            obj_id: arr,
                        })
                } else {
                    if (!compareArr.get(arr))
                        compareArr.set(arr, {
                            is_baseline: item.is_baseline,
                            server_provider,
                            obj_id: arr,
                        })
                }
            })
        });
    })

    return {
        baseArr: mapToArr(baseArr), compareArr: mapToArr(compareArr)
    }
}

// const getJobRefSuit = (suiteData: any) => {
//     const obj = {}
//     const trr: any = []
//     const allData = [...Object.values(suiteData.func_suite_dic), ...Object.values(suiteData.perf_suite_dic)]
//     allData.forEach((suit: any) => {
//         if (suit.conf_dic) {
//             Object.values(suit.conf_dic).forEach((conf: any) => {
//                 const base_obj_li = _.get(conf, 'base_obj_li') || []
//                 const compare_groups = _.get(conf, 'compare_groups') || []
//                 base_obj_li.forEach((item: any) => {
//                     const job_id = _.get(item, 'obj_id')
//                     const suite_id = suit.suite_id
//                     const conf_id = conf.conf_id
//                     if (obj[job_id] && obj[job_id][suite_id]) {
//                         obj[job_id][suite_id].push(conf_id)
//                     } else {
//                         obj[job_id] = {}
//                         obj[job_id][suite_id] = [conf_id]
//                     }

//                 })
//                 compare_groups.forEach((arr: any, index: number) => {
//                     const everyGroup = trr[index] || {}
//                     arr.forEach((item: any) => {
//                         const job_id = _.get(item, 'obj_id')
//                         const suite_id = suit.suite_id
//                         const conf_id = conf.conf_id
//                         if (everyGroup[job_id] && everyGroup[job_id][suite_id]) {
//                             everyGroup[job_id][suite_id].push(conf_id)
//                         } else {
//                             everyGroup[job_id] = {}
//                             everyGroup[job_id][suite_id] = [conf_id]
//                         }
//                     })
//                     trr[index] = everyGroup
//                 })
//             })
//         } else {
//             // console.log('suite',suit)
//         }

//     })
//     return { obj, trr }
// }

export {
    resizeDocumentHeight,
    getFinallyData,
    getJobRefSuit,
    fillData,
    getSelectedDataFn,
    handleDomainList
}
