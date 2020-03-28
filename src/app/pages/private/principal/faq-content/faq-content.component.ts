import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from '../../../../services/auth.service';
import {VideoModalComponent} from './video-modal/video-modal.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-faq-content',
    templateUrl: './faq-content.component.html',
    styleUrls: ['./faq-content.component.scss']
})
export class FaqContentComponent implements OnInit {
    @Output() changeView: EventEmitter<object>;
    public marketing: boolean;

    public questions = [
        {
            question: '¿Ejemplo de pregunta numero 1?',
            answer: [
                {
                    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                        'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                        'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                        'ratione totam ut voluptatum!',
                }, {
                    list: [
                        {
                            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                                'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                                'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                                'ratione totam ut voluptatum!',
                            image: '/assets/images/section/corredores.svg'
                        }, {
                            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                                'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                                'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                                'ratione totam ut voluptatum!',
                            image: '/assets/images/section/corredores.svg'
                        }
                    ]
                }
            ]
        },
        {
            question: '¿Ejemplo de pregunta numero 2?',
            answer: [
                {
                    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                        'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                        'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                        'ratione totam ut voluptatum!',
                }, {
                    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                        'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                        'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                        'ratione totam ut voluptatum!',
                    image: '/assets/images/section/corredores.svg'
                }
            ]
        },
        {
            question: '¿Ejemplo de pregunta numero 3?',
            answer: [
                {
                    list: [
                        {
                            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                                'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                                'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                                'ratione totam ut voluptatum!',
                            image: '/assets/images/section/corredores.svg'
                        }, {
                            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                                'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                                'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                                'ratione totam ut voluptatum!',
                            image: '/assets/images/section/corredores.svg'
                        }
                    ]
                }, {
                    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis\n' +
                        'commodi dolor et molestias nisi reprehenderit sequi sunt tenetur\n' +
                        'voluptatem. Corporis illo laboriosam nobis omnis praesentium quia\n' +
                        'ratione totam ut voluptatum!',
                }
            ]
        }
    ];
    public videos = [
        {
            name: 'Nombre del video tutorial 1',
            description: 'Pequeña descripción del contenido del video (145\n' +
                'caracteres) Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores\n' +
                'aspernatur consectetur dolores',
            videoId: 'o64suVTh67U',
        }, {
            name: 'Nombre del video tutorial 2',
            description: 'Pequeña descripción del contenido del video (145\n' +
                'caracteres) Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores\n' +
                'aspernatur consectetur dolores',
            videoId: '535Q2OozWJQ',
        }, {
            name: 'Nombre del video tutorial 3',
            description: 'Pequeña descripción del contenido del video (145\n' +
                'caracteres) Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores\n' +
                'aspernatur consectetur dolores',
            videoId: 'zEmyTlPkJE8',
        }
    ];
    public pdfs = [
        {
            name: 'PDF - Nombre del PDF 1',
            description: 'Pequeña descripción del contenido del pdf (145\n' +
                'caracteres) Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores\n' +
                'aspernatur consectetur dolores',
            downloadLink: 'http://www.orimi.com/pdf-test.pdf'
        }, {
            name: 'PDF - Nombre del PDF 2',
            description: 'Pequeña descripción del contenido del pdf (145\n' +
                'caracteres) Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores\n' +
                'aspernatur consectetur dolores',
            downloadLink: 'http://www.orimi.com/pdf-test.pdf'
        }, {
            name: 'PDF - Nombre del PDF 3',
            description: 'Pequeña descripción del contenido del pdf (145\n' +
                'caracteres) Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores\n' +
                'aspernatur consectetur dolores',
            downloadLink: 'http://www.orimi.com/pdf-test.pdf'
        }
    ];

    constructor(
        private auth: AuthService,
        public dialog: MatDialog,
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

    public openVideoModal(videoId: string, videoName: string): void {
        this.dialog.open(VideoModalComponent, {
            width: '800px',
            data: {
                videoId,
                videoName
            }
        });
    }
}
