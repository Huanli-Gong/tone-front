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
const getFinallyData = (suite_dic:any) =>{
    const confIdArr = []
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
    return {suite_dic,confIdArr}
}
const delCompareGroups = (suiteDic:any) => {
    const suite_dic = _.cloneDeep(suiteDic)
    
    for (let suitId in suite_dic) {
        const conf_dic = suite_dic[suitId].conf_dic
        for (let confId in conf_dic) {
              delete conf_dic[confId].compare_groups
        }
    }
    return suite_dic
}   

const handleCompareOk = (suiteData: any) => {
    const suiteDataCopy = _.cloneDeep(suiteData)
    let funcSuite = suiteDataCopy.func_suite_dic || {}
    let perfSuitec = suiteDataCopy.perf_suite_dic || {}
    let func_suite = getFinallyData(funcSuite).suite_dic
    let perf_suite = getFinallyData(perfSuitec).suite_dic
    
     const func_suite_dic =delCompareGroups(func_suite)
     const perf_suite_dic =delCompareGroups(perf_suite)

    const arr = getFinallyData(funcSuite).confIdArr
    const brr = getFinallyData(perfSuitec).confIdArr
    const confIdArr = [...arr,...brr].filter(val => val).map(value => Number(value))
    const paramData = {
        func_suite_dic,
        perf_suite_dic
    }

    return {paramData,confIdArr}
}
const getJobRefSuit = (suiteData:any) => {
    const obj = {}
    const trr:any = []
    const allData  = [...Object.values(suiteData.func_suite_dic),...Object.values(suiteData.perf_suite_dic)]
    allData.forEach((suit:any) => {
        Object.values(suit.conf_dic).forEach((conf:any) => {
            const base_obj_li = _.get(conf,'base_obj_li') || []
            const compare_groups = _.get(conf,'compare_groups') || []
            base_obj_li.forEach((item:any) => {
                const job_id = _.get(item,'obj_id')
                const suite_id = suit.suite_id
                const conf_id = conf.conf_id
                if(obj[job_id] && obj[job_id][suite_id]) {
                    obj[job_id][suite_id].push(conf_id)
                } else {
                    obj[job_id]={}
                    obj[job_id][suite_id]=[conf_id]
                }

            })
            compare_groups.forEach((arr: any,index:number) => {
                const everyGroup = trr[index] || {}
                arr.forEach((item: any) => {
                    const job_id = _.get(item, 'obj_id')
                    const suite_id = suit.suite_id
                    const conf_id = conf.conf_id
                    if (everyGroup[job_id] && everyGroup[job_id][suite_id]) {
                        everyGroup[job_id][suite_id].push(conf_id)
                    } else {
                        everyGroup[job_id] = {}
                        everyGroup[job_id][suite_id] = [conf_id]
                    }
                })
                trr[index] = everyGroup
            })
        })
    })
    return {obj,trr}
}
export {
    resizeDocumentHeight,
    handleCompareOk,
    getFinallyData,
    getJobRefSuit
}
