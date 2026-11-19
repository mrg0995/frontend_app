import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PerfilPublico } from './perfil-publico';

describe('PerfilPublico', () => {
  let component: PerfilPublico;
  let fixture: ComponentFixture<PerfilPublico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPublico],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPublico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
