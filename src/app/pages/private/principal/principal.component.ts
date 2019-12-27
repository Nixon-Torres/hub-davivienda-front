import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit { 
    currentObj = {};
  constructor() { }

  ngOnInit() {
  }

  setCurrentState(value: any) {
      console.log(value.state, value.folder, value.deleted);
      this.currentObj ={
        currentFolder: value.folder,
        currentState: value.state,
        deletedFg : value.deleted
      }
  }
}
