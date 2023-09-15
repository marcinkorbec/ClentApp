import { Injectable, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2b } from 'src/b2b';
import { AccountService } from './account.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class NewsService {

    filters: {
        title: string;
        category: string;
        creationDate: string;
    };
    news: b2b.NewsListItem[];
    details: b2b.NewsDetails;

    private logOutSub: Subscription;

    constructor(private httpClient: HttpClient, private accountService: AccountService, private domSanitizer: DomSanitizer) {

        this.filters = this.getDefaultFilter();

        this.logOutSub = this.accountService.logOutSubj.subscribe(() => {
            this.news = undefined;
            this.details = undefined;
            this.filters = this.getDefaultFilter();
        });
    }

    public requestList(title = '', category = '', creationDate = '') {
        const params = {
            title: title,
            category: category,
            creationDate: creationDate
        };

        return this.httpClient.get<b2b.NewsListItem[]>('/api/news/getlist', { params: params }).toPromise();
    }

    loadList() {
        return this.requestList(this.filters.title, this.filters.category, this.filters.creationDate).then((res) => {
            this.news = res;
        }).catch(err => {
            return Promise.reject(err);
        });
    }


    private requestDetails(id): Promise<b2b.NewsDetails> {
        return this.httpClient.get<b2b.NewsDetailsResponse>('/api/news/getdetails/' + id).toPromise().then(res => {
            const safeContent = this.domSanitizer.bypassSecurityTrustHtml(this.convertImages(res.content));
            return Object.assign(res, { content: safeContent });
        });
    }

    loadDetails(id) {

        return this.requestDetails(id).then(res => {
            this.details = res;
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    getDefaultFilter() {
        return {
            title: '',
            category: '',
            creationDate: ''
        };
    }

    updateCurrentFilter(name, value) {
        this.filters[name] = value;
    }


    convertImages(content: string) {

        const convertAttributesMap = {
            'src': '[src]',
            'alt': '[alt]'
        };

        return content.replace(/<img.*>/gi, (matched) => {

            const attributes = matched.slice(5, matched.length - 1)
                .split(' ')
                .map(el => {
                    const attrs = el.split('="');
                    attrs[0] = attrs[0].replace(attrs[0], convertAttributesMap[attrs[0]]);
                    return attrs.join('="');
                });

            return `<template appLazyImage ${attributes.join(' ')}></template>`;
        });
    }


}


