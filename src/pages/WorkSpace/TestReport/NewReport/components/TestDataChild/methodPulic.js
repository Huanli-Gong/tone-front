import React from 'react';

const deleteSuite = (item, row) => {
    let ret = item.list.reduce((pre, suite) => {
         if (suite.suite_id == row.suite_id) return pre
         return pre.concat(suite)
     }, [])
     return {
         ...item,
         list:ret,
     }
 }
 
 const deleteConf = (item, row) => {
     return produce(item, (draft) => {
         draft.list = item.list.map(
             (suite) => {
                 let conf_list = suite.conf_list.reduce(
                     (pre, conf) => {
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

 export { deleteSuite, deleteConf };