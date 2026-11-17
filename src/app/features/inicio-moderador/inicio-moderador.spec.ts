import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioModerador } from './inicio-moderador';

describe('InicioModerador', () => {
  let component: InicioModerador;
  let fixture: ComponentFixture<InicioModerador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioModerador],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioModerador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
