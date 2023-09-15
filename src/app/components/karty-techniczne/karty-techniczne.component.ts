import {Component, OnInit} from '@angular/core';
import {b2b} from '../../../b2b';
import {MenuService} from '../../model/menu.service';
import {ConfigService} from '../../model/config.service';

@Component({
    selector: 'app-karty-techniczne',
    templateUrl: './karty-techniczne.component.html',
    styleUrls: ['./karty-techniczne.component.scss']
})
export class KartyTechniczneComponent implements OnInit {
    menuItems: b2b.MenuItem[];

    constructor(
        public menuService: MenuService,
        public configService: ConfigService,
    ) { }

    ngOnInit() {
        this.menuService.loadFullMenuItems().then(() => {
            this.menuItems = [this.menuService.defaultBackItem];

            if (this.configService.permissions.hasAccessToNews) {
                this.menuItems.push(this.menuService.fullMenuItems.find(item => item.url === this.menuService.routePaths.news));
            }
        });
    }
}
