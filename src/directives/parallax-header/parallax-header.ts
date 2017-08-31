import { Directive, ElementRef, Renderer } from '@angular/core';

@Directive({
    selector: '[parallax-header]',
    host: {
        '(ionScroll)': 'onContentScroll($event)',
        '(window:resize)': 'onWindowResize($event)'
    }
})
export class ParallaxHeader {

    headers: any[];
    headerHeights: number[];
    translateAmt: any;
    scaleAmt: any;
    scrollMax: number;

    constructor(public element: ElementRef, public renderer: Renderer) {

    }

    ngOnInit() {
        let content = this.element.nativeElement.getElementsByClassName('scroll-content')[0];
        this.headers = content.getElementsByClassName('header-image');
        let mainContent = content.getElementsByClassName('main-content')[0];

        this.onWindowResize(null);

        for (var i = 0; i < this.headers.length; i++) {
            this.renderer.setElementStyle(this.headers[i], 'webkitTransformOrigin', 'center bottom');
            this.renderer.setElementStyle(this.headers[i], 'background-size', 'cover');
        }

        this.renderer.setElementStyle(mainContent, 'position', 'absolute');

    }

    onWindowResize(ev) {
        this.scrollMax = window.innerHeight;
        this.headerHeights = [];
        for (var i = 0; i < this.headers.length; i++) {
            this.headerHeights.push(this.headers[i].clientHeight);
        }
        console.log(this.headers);
    }

    onContentScroll(ev) {

        ev.domWrite(() => {
            this.updateParallaxHeader(ev);
        });

    }

    updateParallaxHeader(ev) {
        for (var i = 0; i < this.headers.length; i++) {
            if (!this.headerHeights[i]) this.headerHeights[i] = this.headers[i].clientHeight;

            if (ev.scrollTop >= 0) {
                this.translateAmt = ev.scrollTop / ((-8 / this.scrollMax) * this.headerHeights[i] + 10);
                this.scaleAmt = 1;
            } else {
                this.translateAmt = 0;
                this.scaleAmt = -ev.scrollTop / this.headerHeights[i] + 1;
            }

            this.renderer.setElementStyle(this.headers[i], 'webkitTransform', 'translate3d(0,' + this.translateAmt + 'px,0) scale(' + this.scaleAmt + ',' + this.scaleAmt + ')');
        }
    }

}