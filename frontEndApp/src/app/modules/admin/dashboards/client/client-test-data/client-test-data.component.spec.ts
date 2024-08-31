import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTestDataComponent } from './client-test-data.component';

describe('ClientTestDataComponent', () => {
  let component: ClientTestDataComponent;
  let fixture: ComponentFixture<ClientTestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTestDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientTestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
