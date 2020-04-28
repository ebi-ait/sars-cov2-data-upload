import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'cv19-app-nav',
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss']
})
export class AppNavComponent implements OnInit {

  constructor(@Inject(DOCUMENT) document) { }

  ngOnInit(): void {
  }

  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(e) {
  //   // Apply stickiness to Application Navbar
  //    if (window.pageYOffset > 400) {
  //      let element = document.getElementById('cv19-app-nav-container');

  //      if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
  //        //  Safari workaround
  //        element.classList.add('cv19-app-nav-sticky-safari');
  //       }
  //       else{
  //         element.classList.add('cv19-app-nav-sticky');
  //       }

  //     } else {
  //       let element = document.getElementById('cv19-app-nav-container');

  //       if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0){
  //         //  Safari workaround
  //         element.classList.remove('cv19-app-nav-sticky-safari');
  //       }
  //       else {
  //         element.classList.remove('cv19-app-nav-sticky');
  //       }
  //    }
  // }

}
