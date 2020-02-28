import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-site',
  templateUrl: './edit-site.component.html',
  styleUrls: ['./edit-site.component.scss']
})
export class EditSiteComponent implements OnInit {
  
  public view: any;
  @Output() changeView = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { 
    this.view = {
      reports: true,
      editSite: false
    }
  }

  changeViewFn() {
    this.changeView.emit(this.view);
  }
}
