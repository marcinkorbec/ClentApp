import { Pagination } from '../pagination';
import { BasicListContext } from './basic-list-context';

export interface ListContext<listItem, filteringOptions, listItemResponse> extends BasicListContext<listItem, filteringOptions, listItemResponse> {

    pagination: Pagination;
}
