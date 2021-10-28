import _ from 'lodash'
export const transItem = ( source : any , type ? : string ) => {
    let obj = {}
    Object.keys(source).map((i: any, index: number) => {
        let data = source[i]
        if (_.isArray(data)) {
            obj[i]= {}
            obj[i]['update_suite'] = {}
            obj[i]['name'] = ''
            obj[i]['rowKey'] = `${index}`
            obj[i]['delete_suite'] = []
            for (let a = 0; a < data.length; a++) {
                obj[i]['update_suite'][data[a]['item_suite_id']] = {}
                obj[i]['update_suite'][data[a]['item_suite_id']]['delete_conf'] = []
                if ( type ) {
                    obj[i]['update_suite'][data[a]['item_suite_id']]['test_conclusion'] = data[a].test_conclusion
                    obj[i]['update_suite'][data[a]['item_suite_id']]['test_description'] = data[a].test_description
                    obj[i]['update_suite'][data[a]['item_suite_id']]['test_env'] = data[a].test_env
                }
            }
        }else{
            Object.keys(data).map((key: any,idx:number) => {
                let newData = data[key]
                let domain = `${i}:${key}`
                obj[domain]= {}
                obj[domain]['update_suite'] = {}
                obj[domain]['name'] = ''
                obj[domain]['rowKey'] = `${index}-${idx}`
                obj[domain]['delete_suite'] = []
                for (let b = 0; b < newData.length; b++) {
                    obj[domain]['update_suite'][newData[b]['item_suite_id']] = {}
                    obj[domain]['update_suite'][newData[b]['item_suite_id']]['delete_conf'] = []
                    if ( type ) {
                        obj[domain]['update_suite'][newData[b]['item_suite_id']]['test_conclusion'] = newData[b].test_conclusion
                        obj[domain]['update_suite'][newData[b]['item_suite_id']]['test_description'] = newData[b].test_description
                        obj[domain]['update_suite'][newData[b]['item_suite_id']]['test_env'] = newData[b].test_env
                    }
                }
            })
        }
    })
    return {
        update_item : obj,
        delete_item : []
    }
}