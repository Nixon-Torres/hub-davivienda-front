import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit {
    currentFolder: string;
    currentState: string;
    deletedFg = false;

  constructor() { }

  ngOnInit() {
  }

  setCurrentState(value: any) {
      console.log(value.state, value.folder, value.deleted);
      this.currentFolder = value.folder;
      this.currentState = value.state;
      this.deletedFg = value.deleted;
  }
}
