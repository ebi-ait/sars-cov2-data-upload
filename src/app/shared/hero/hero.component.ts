import { Component, Input, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'cv19-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  @Input()
  public title = 'Data Uploader';

  @Input()
  public subTitle = '';

  @Input()
  public thinHeroClass = false;

  // @Input()
  // public showSearchBox = false;

  @Input()
  public set hasThinHeroClass(value: string) {
    this.thinHeroClass = value !== 'false';
  }

  // @Input()
  // public set hasSearchBox(value: string) {
  //   this.showSearchBox = value !== 'false';
  // }

  constructor() { }

  ngOnInit(): void {
  }
}
