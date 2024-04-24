import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarageHeaderComponent } from './garage-header.component';

describe('GarageHeaderComponent', () => {
  let component: GarageHeaderComponent;
  let fixture: ComponentFixture<GarageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GarageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GarageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
