import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterUiComponent } from './master-ui.component';

describe('MasterUiComponent', () => {
  let component: MasterUiComponent;
  let fixture: ComponentFixture<MasterUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
