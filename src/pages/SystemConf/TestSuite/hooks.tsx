import { useEffect, useState , useContext } from "react";
import { getDomain } from "./service";
import { useLocation } from "umi";
import { ContainerContext } from "./Provider";

export const useDomain = () => {
    const { query } : any = useLocation()
    const { test_type } = query

    const [list, setList] = useState([])
    const qeueryDomain = async () => {
        const { data } = await getDomain({ test_type })
        setList(data || [])
    }
    useEffect(() => {
        qeueryDomain()
    }, [])

    return list
}

export const useSuiteProvider = () => useContext(ContainerContext)