
declare namespace Workspace {
    export type BaselineItem = {
        name?: string;
        id?: string;
        description?: string;
        creator?: string;
        creator_name?: string;
        gmt_created?: string;
        server_provider?: string;
        test_type?: string;
        update_user?: string;
        update_user_name?: string;
        version?: string;
        is_first?: boolean;
    }

    export type BaselineListQuery = {
        total?: number;
        data?: BaselineItem[];
        page_num?: number;
        page_size?: number;
    }
}
