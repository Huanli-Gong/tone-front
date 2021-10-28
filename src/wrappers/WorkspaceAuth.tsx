import React,{ useEffect } from 'react'
import { history, useRequest , useModel } from 'umi'
import { person_auth } from '@/services/user';

export default ( props : any ) => {
    const { ws_id } = props.match.params
    const { pathname } = location
    const { data, run } = useRequest(() => person_auth({ ws_id }),{ manual:true })
    const { initialState } = useModel('@@initialState')
    
    useEffect(()=>{
        run()
    },[pathname])
    
    if(data){
        initialState.authList = Object.assign(data,{})
    }
    // console.log(data,initialState,'data')
    if ( initialState.authList.sys_role_title === 'super_admin' || initialState.authList.sys_role_title === 'sys_admin'){
        return props.children
    }else{
        if(!data?.ws_is_public){
            if( data?.ws_role_title === null ) {
                history.push({ pathname:'/401',state: ws_id })
            }
        }
        return props.children
    }
}