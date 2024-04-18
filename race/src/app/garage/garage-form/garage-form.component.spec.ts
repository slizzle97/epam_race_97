import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarageFormComponent } from './garage-form.component';

describe('GarageFormComponent', () => {
  let component: GarageFormComponent;
  let fixture: ComponentFixture<GarageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GarageFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GarageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
