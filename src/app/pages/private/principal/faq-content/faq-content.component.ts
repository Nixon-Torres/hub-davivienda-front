import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from '../../../../services/auth.service';

@Component({
  selector: 'app-faq-content',
  templateUrl: './faq-content.component.html',
  styleUrls: ['./faq-content.component.scss']
})
export class FaqContentComponent implements OnInit {
    @Output() changeView: EventEmitter<object>;
    public marketing: boolean;

  constructor(
      private auth: AuthService
  ) {
      this.changeView = new EventEmitter<object>();
      this.marketing = this.auth.isMarketing();
  }

  ngOnInit() {
  }

  onChangeView() {
      this.changeView.emit({
          reports: true,
          editSite: false,
          faq: false
      });
  }

}
