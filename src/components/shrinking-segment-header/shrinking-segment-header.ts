import { Component, Input, ElementRef, Renderer } from '@angular/core';
import { DomController, Platform } from "ionic-angular";

@Component({
 selector: 'shrinking-segment-header',
 templateUrl: 'shrinking-segment-header.html'
})
export class ShrinkingSegmentHeader {

  @Input('scrollArea') scrollArea: any;
  @Input('offset') offset: number;
  @Input('resizeElement') resizeElement: any;
  @Input('dragHandle') dragHandle: any;

  state: number = 1;

  handleHeight: number = 120;
  bounceBack: boolean = true;
  thresholdTop: number = 200;
  thresholdBottom: number = 200;
  minTop: number = 150;

  constructor(
    public element: ElementRef,
    public renderer: Renderer,
    public domCtrl: DomController,
    public platform: Platform)
  { }

  ngAfterViewInit(){

    this.scrollArea.ionScroll.subscribe((ev) => {
      this.resizeHeader(ev);
    });

    
    // let hammer = new window['Hammer'](this.dragHandle);
    // hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_VERTICAL });
 
    // hammer.on('pan', (ev) => {
    //   this.handlePan(ev);
    // });
  }

  resizeHeader(ev){
    console.log(ev);
    ev.domWrite(() => {
    
    if (this.state == 1 && ev.directionY == "down" && ev.scrollTop > this.offset) { // DOWN
      this.renderer.setElementClass(this.element.nativeElement, "state-0", false);
      this.renderer.setElementClass(this.element.nativeElement, "state-1", false);
      this.renderer.setElementClass(this.element.nativeElement, "state-2", true);
      this.state = 2;
    }
    else if (this.state == 1 && ev.scrollTop == 0) { // UP
      this.renderer.setElementClass(this.element.nativeElement, "state-0", true);
      this.renderer.setElementClass(this.element.nativeElement, "state-1", false);
      this.renderer.setElementClass(this.element.nativeElement, "state-2", false);
      this.state = 0;
    }
    else if ((this.state == 2 && (ev.directionY == "up" && ev.velocityY > 5) || (ev.scrollTop <= this.offset)) ||  // UP
             (this.state == 0 && ev.directionY == "down" && ev.scrollTop <= this.offset)) { // DOWN
      this.renderer.setElementClass(this.element.nativeElement, "state-0", false);
      this.renderer.setElementClass(this.element.nativeElement, "state-1", true);
      this.renderer.setElementClass(this.element.nativeElement, "state-2", false);
      this.state = 1;
    }

    });

  }


  handlePan(ev){

    let newTop = ev.center.y;

    let bounceToBottom = false;
    let bounceToTop = false;

    if(this.bounceBack && ev.isFinal){

      let topDiff = newTop - this.thresholdTop;
      let bottomDiff = (this.platform.height() - this.thresholdBottom) - newTop;      

      topDiff >= bottomDiff ? bounceToBottom = true : bounceToTop = true;

    }

    if((newTop < this.thresholdTop && ev.additionalEvent === "panup") || bounceToTop){

      this.domCtrl.write(() => {
        this.renderer.setElementStyle(this.resizeElement, 'transition', 'height 0.5s');
        this.renderer.setElementStyle(this.resizeElement, 'height', this.minTop + 'px');
      });

    } else if(((this.platform.height() - newTop) < this.thresholdBottom && ev.additionalEvent === "pandown") || bounceToBottom){

      this.domCtrl.write(() => {
        this.renderer.setElementStyle(this.resizeElement, 'transition', 'height 0.5s');
        this.renderer.setElementStyle(this.resizeElement, 'height', this.platform.height() - this.handleHeight + 'px');
      });

    } else {

      this.renderer.setElementStyle(this.resizeElement, 'transition', 'none');

      if(newTop > this.minTop && newTop < (this.platform.height() - this.handleHeight)) {

        if(ev.additionalEvent === "panup" || ev.additionalEvent === "pandown"){

          this.domCtrl.write(() => {
            this.renderer.setElementStyle(this.resizeElement, 'height', newTop + 'px');
          });

        }

      }

    }

  }

}