import styled from 'styled-components';

interface GroupRowProps {
    gLen?: number   /* group数量 */
}

const setEnvGroupWdith = (l?: number) => {
    if (!l) return ""
    if (l == 1) return (`calc( 100% - 110px )`)
    return (`calc( (100% - 110px) / ${l})`)
}

export const EnvGroupL = styled.div`
    width:110px;
    float:left;
    padding-left:16px;
    border-right:1px solid rgba(0,0,0,0.10);
`
export const MachineGroup = styled.div`
    border: 1px solid rgba(0,0,0,0.10);
    /* min-height:200px; */
    /* margin-bottom:13px; */
    border-bottom:none;
    border-right:none;
`
export const MachineGroupL = styled(EnvGroupL)`
    height:40px;
    line-height:40px;
    color:rgba(0,0,0,0.85);
    border-bottom:1px solid rgba(0,0,0,0.10);
    font-weight:500;
`
export const MachineGroupR = styled.div<GroupRowProps>`
    width: ${({ gLen }) => setEnvGroupWdith(gLen)};
    /* float:left; */
    padding:0px 13px;
    border-right:1px solid rgba(0,0,0,0.10);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height:40px;
    line-height:40px;
    border-bottom:1px solid rgba(0,0,0,0.10);
    border-right:1px solid rgba(0,0,0,0.10);
`
