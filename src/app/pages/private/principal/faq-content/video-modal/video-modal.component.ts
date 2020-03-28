import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
    selector: 'app-video-modal',
    templateUrl: './video-modal.component.html',
    styleUrls: ['./video-modal.component.scss']
})
export class VideoModalComponent implements OnInit {

    public videoInfo: any;
    public videoId: SafeResourceUrl;
    constructor(
        public dialogRef: MatDialogRef<VideoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sanitizer: DomSanitizer
    ) {
        this.videoInfo = data;
        this.videoId = this.getVideoIframe(this.videoInfo.videoId);
    }

    ngOnInit() {
    }

    getVideoIframe(url) {
        if (!url) {
            return '';
        }
        const results = url.match('[\\?&]v=([^&#]*)');
        const video   = (results === null) ? url : results[1];
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${video}?enablejsapi=1&autoplay=1`);
    }

    public closeDialog() {
        this.dialogRef.close();
    }

}
