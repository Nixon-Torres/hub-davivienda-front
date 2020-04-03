import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
    selector: 'app-video-modal',
    templateUrl: './video-modal.component.html',
    styleUrls: ['./video-modal.component.scss']
})
export class VideoModalComponent implements OnInit {

    public url: SafeResourceUrl;
    constructor(
        public dialogRef: MatDialogRef<VideoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sanitizer: DomSanitizer
    ) {
        this.url = this.getSecureUrl(this.data.url);
    }

    ngOnInit() {
    }

    getSecureUrl(url) {
        let finalUrl = '';
        if (this.data && this.data.type && this.data.type) {
            if (this.data.type === 'Video') {
                const results = url.match('[\\?&]v=([^&#]*)');
                const video   = (results === null) ? url : results[1];
                finalUrl = `https://www.youtube.com/embed/${video}?enablejsapi=1&autoplay=1`;
            } else {
                finalUrl = url;
            }
        }
        return url ? this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl) : '';
    }

    public closeDialog() {
        this.dialogRef.close();
    }

}
