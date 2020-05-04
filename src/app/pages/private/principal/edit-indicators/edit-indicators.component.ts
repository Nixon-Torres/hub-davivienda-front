import {AfterViewInit, Component, ElementRef, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpService} from '../../../../services/http.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {forkJoin, Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';

export interface Company {
    name: string;
}

@Component({
    selector: 'app-edit-indicators',
    templateUrl: './edit-indicators.component.html',
    styleUrls: ['./edit-indicators.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EditIndicatorsComponent implements OnInit, AfterViewInit {

    public list: any = {
        companies: []
    };

    public time = '';
    public name = '';

    public content: any = null;
    visible = true;
    public booksVisible: any = {};

    public STORAGE_URL = environment.STORAGE_FILES;

    public blocksTmpls: any = [{
        id: 'title',
        title: 'Titulo Sección ',
        subtitle: 'Actualmente se muestra la siguiente información:',
        placeholder: 'Escriba aquí el titulo',
        content: '',
        type: 'input',
        class: 'title'
    },  {
        id: 'content',
        title: 'Contenido Sección ',
        subtitle: 'Actualmente se muestra la siguiente información:',
        placeholder: 'Escriba aquí el contenido',
        content: '',
        type: 'textarea',
        class: 'title'
    }];
    public books: any = [];
    public blocks: any = [];

    private editorOptions = {
        default: {
        }
    };

    constructor(
        private http: HttpService,
        public dialog: MatDialog,
        private ref: ElementRef
    ) {
    }

    ngOnInit() {
        this.getContent();
    }

    ngAfterViewInit(): void {
    }

    showBook(book: any) {
        if (this.booksVisible[book.id]) {
            return this.booksVisible[book.id].visible = !this.booksVisible[book.id].visible;
        }
        return this.booksVisible[book.id] = {visible: true};
    }

    removeBook(book) {
        this.books = this.books.filter(e => e.id !== book.id);
        this.blocks = this.blocks.filter(e => e.bookId !== book.id);
    }

    addBook() {
        const id = this.books.length === 0 ? 1 : this.books[this.books.length - 1 ].id + 1;
        this.books.push({
            id
        });
        this.blocks = this.blocks.concat(this.blocksTmpls.map(e => {
            return {
                ...e,
                id: e.id + '-' + id,
                bookId: id,
                title: e.title + id
            };
        }));
    }

    getBlocks(book: any) {
        return this.blocks.filter(e => e.bookId === book.id);
    }

    enableInlineEditor() {
        const instance = this;
        setTimeout(() => {
            this.blocks.filter(e => e.type === 'html').forEach((block) => {
                const element = this.ref.nativeElement.querySelector( '#' + block.id);
                if (element) {
                    element.innerHTML = block.content;
                }

                instance.addInlineEditor(block.id, block.placeholder);
            });
        }, 500);
    }

    addInlineEditor(elementId: string, placeholder?: string) {
        const element = this.ref.nativeElement.querySelector( '#' + elementId );
        const options = this.editorOptions[elementId] || this.editorOptions.default;

        const editorOptions = options ? options : {};
        editorOptions.placeholder = placeholder;

        if (this[elementId + 'Data'] && editorOptions.initialData) {
            delete editorOptions.initialData;
        }

        const headers = this.http.headers();
        editorOptions.simpleUpload =  {
            uploadUrl: this.http.path('/reports/' + this.content.id + '/upload'),
            headers
        };

        editorOptions.mediaEmbed = {
            extraProviders: [
                {
                    name: 'dataWrapper',
                    url: /^datawrapper\.dwcdn\.net\/(\w+)/,
                    html: match => '------------------------------------------------------ <br/>' +
                        'DATAWRAPPER IMAGE (NO PREVIEW) <br/> ' +
                        '------------------------------------------------------'
                }
            ]
        };

        InlineEditor
            .create( element, editorOptions)
            .then( editor => {
                window.editor = editor;

                editor.model.document.on( 'change:data', () => {
                    const block = this.blocks.find(e => e.id === elementId);
                    const data = editor.getData();

                    if (block) {
                        block.content = data;
                    }
                } );
            } )
            .catch( error => {
                console.error( 'There was a problem initializing the editor.', error );
            } );
    }

    public createContent() {
        this.http.post({
            path: 'contents',
            data: {
                key: 'indicatorsSectionKey'
            }
        }).subscribe((response: any) => {
            this.getContent();
        });
    }

    public saveContent() {
        const id = this.content ? '/' + this.content.id : '';
        const verb = this.content ? 'patch' : 'post';

        this.http[verb]({
            path: 'contents' + id,
            data: {
                key: 'indicatorsSectionKey',
                blocks: this.blocks.map(e => {
                    return {
                        id: e.id,
                        content: e.content,
                        bookId: e.bookId
                    };
                }),
                books: this.books
            }
        }).subscribe((response: any) => {
            this.saveImages();
        });
    }

    public saveImages() {
        const imgsToCreate = this.blocks.filter(e => e.type === 'image' && e.file && !e.imageId).map((block) => {
            return {
                id: block.id,
                file: block.file,
                imageId: block.imageId
            };
        });

        const imgsToRemove = this.blocks.filter(e => !e.file && e.imageId && !e.assetUrl).map(e => e.imageId);

        this.saveBlockImages(imgsToCreate).then(() => {
            return this.deleteBlockImages(imgsToRemove);
        }).then(() => {
            this.getContent();
            this.showDialog('');
        });
    }

    public saveBlockImages(blocks): Promise<any> {
        if (blocks.length === 0) {
            return Promise.resolve(null);
        }

        const observables = blocks.map((block) => {
            return this.saveBlockImage(block);
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    private saveBlockImage(block): Observable<any> {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['jpg', 'png', 'gif', 'webp', 'jpeg', 'pdf'])));
        formData.append('file', block.file);
        formData.append('key', 'blockImage-' + block.id);
        formData.append('resourceId', this.content.id);
        if (block.imageId) {
            formData.append('id', block.imageId);
        }
        return this.http.post({
            path: 'media/upload',
            data: formData
        });
    }

    public deleteBlockImages(ids): Promise<any> {
        if (ids.length === 0) {
            return Promise.resolve(null);
        }

        const observables = ids.map(id => {
            return this.http.delete({
                path: '/media/' + id,
            });
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    public getContent() {
        this.http.get({
            path: 'contents',
            data: {where: {key: 'indicatorsSectionKey'}, include: ['lastUpdater', 'files']},
            encode: true
        }).subscribe((response) => {
            if ((response.body as unknown as []).length > 0) {
                this.name = response.body[0].lastUpdater.name;
                this.time = response.body[0].updatedAt;
                this.content = response.body[0];
                this.books = this.content.books ? this.content.books : [];

                this.blocks = this.content.blocks.map(e => {
                    const block = this.blocksTmpls.find(j => e.id.indexOf(j.id) > -1);

                    const file = this.content.files.find(j => j.key === 'blockImage-' + e.id);
                    e.fileName =  null;
                    e.file =  null;
                    e.imageUrl = null;
                    e.assetUrl = null;
                    return {
                        ...block,
                        id: e.id,
                        content: e.content,
                        bookId: e.bookId,
                        imageId: file ? file.id : null,
                        assetUrl: file && file.fileName ? this.STORAGE_URL + file.fileName : null,
                        fileName: file && file.fileName ? file.fileName  : null
                    };
                });

                this.enableInlineEditor();
            } else {
                this.createContent();
            }
        });
    }

    public saveBookContent() {
        this.saveContent();
    }

    public removeImageSelected(block: any) {
        const elementId = 'ImgInput' + block.id;
        const element = this.ref.nativeElement.querySelector( '#' + elementId );
        element.value = '';
    }

    public onBlockImageSelected(block: any, event: any) {
        const file: File = event && event.target && event.target.files && event.target.files.length ?
            event.target.files[0] : null;

        if (!file) {
            block.fileName =  null;
            block.file =  null;
            block.imageUrl = null;
            block.assetUrl = null;
            this.removeImageSelected(block);
            return;
        }

        block.fileName = file.name;
        block.file = file;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            block.imageUrl = reader.result;
        };
    }

    public isImage(src) {
        const ext = src ? src.split('.').pop() : '';
        return (src && src.startsWith('data:image')) || (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1);
    }

    public isPdf(src) {
        return src && (src.startsWith('data:application/pdf') || src.endsWith('.pdf'));
    }

    private showDialog(title) {
        this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'Se ha guardado exitosamente el contenido del libro',
                    subtitle: title,
                }
            }
        });
    }
}
