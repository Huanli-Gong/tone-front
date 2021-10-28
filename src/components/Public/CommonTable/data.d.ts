export interface UserTable {
    list:any[],
    columns:any;
    handlePage?:any;
    onRow?:(record?:any) => void;
    rowSelection?:any;
    expandable?:any;
    loading:boolean;
    size?:any;
    pageSize?:number;
    total?:number;
    page?:number;
    totalPage?:number;
    showPagination? : boolean;
    scrollType? :number;
    className?: any;
    paginationBottom?: boolean;
}