import { TestBed } from '@angular/core/testing';
import { PricesService } from './prices.service';
import { MockHttpClient } from 'test/mocks/mock-http-client';
import { HttpClient } from '@angular/common/http';

describe('PricesService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: HttpClient, useValue: MockHttpClient}
    ]
  }));

  it('should be created', () => {
    const service: PricesService = TestBed.get(PricesService);
    expect(service).toBeTruthy();
  });
});
