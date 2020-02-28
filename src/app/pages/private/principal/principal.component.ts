import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit {
    currentObj = {};
    cleanObj = true;
    public view: any = {
      reports: true,
      editSite: false
    }
  constructor() { }

  ngOnInit() {
  }

  setCurrentState(value: any) {
      // console.log(value.state, value.folder, value.deleted);

      if (!value) {
          this.cleanObj = false;
      } else  {
          this.cleanObj = true;
      }

      this.currentObj = {
        currentFolder: value ? value.folder : null,
        currentState: value ? value.state : null,
        deletedFg : value ? value.deleted : false,
        currentStateName: value ? value.stateName : 'Todos Informes'
      };
  }

  changeView(event) {
    this.view = event;
    console.log(this.view);
  }
}
