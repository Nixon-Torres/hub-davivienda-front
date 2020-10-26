import { Component } from '@angular/core';
import { VERSION } from '../environments/version'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor() {
        // use the properties of the VERSION constant
        console.log(`Application version is: version (from package.json)=${VERSION.version}, ` +
            `git-tag=${VERSION.tag}, git-hash=${VERSION.hash}`);
    }
}
