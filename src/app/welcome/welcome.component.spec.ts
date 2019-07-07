import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeComponent } from './welcome.component';
import { of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PricesService } from '../prices.service';
import { MockHttpClient } from 'test/mocks/mock-http-client';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
class MockPricesService {
  getCurrentPrices(): Observable<any> {
    return of({})
  }
}

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeComponent ],
      providers: [
        { provide: PricesService, useClass: MockPricesService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
