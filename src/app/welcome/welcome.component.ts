import { Component, OnInit } from '@angular/core';
import { PricesService } from '../prices.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  priceData$: Observable<any>;
  constructor(private _prices: PricesService) { }

  ngOnInit() {
    this.priceData$ = this._prices.getCurrentPrices();
  }

}
