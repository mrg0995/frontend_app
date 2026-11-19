/**
 * DATOS DE PRUEBA mientras el back no tiene categorías ni artículos.
 * Imitan las respuestas de la API del contrato (docs/api.md).
 * Cuando los dos servicios usen el back real, este archivo se puede borrar
 */
import { ArticuloTarjeta, Categoria } from './models';
import { FiltrosBusqueda, PaginaArticulos } from './busqueda';

/** Las mismas categorías que el seed del back */
export const CATEGORIAS_DEMO: Categoria[] = [
  { id: 1, nombre: 'Anillos' },
  { id: 2, nombre: 'Collares' },
  { id: 3, nombre: 'Pendientes' },
  { id: 4, nombre: 'Pulseras' },
  { id: 5, nombre: 'Otros' },
];

type ArticuloDemo = ArticuloTarjeta & { id_categoria: number };

const ana = { id: 4, nombre_usuario: 'anagl' };
const luis = { id: 5, nombre_usuario: 'luism' };
const sara = { id: 6, nombre_usuario: 'sarap' };

const ARTICULOS_DEMO: ArticuloDemo[] = [
  { id: 16, id_categoria: 1, titulo: 'Anillo de plata con circonita', precio: 45, estado_conservacion: 'como_nuevo', estado: 'publicado', ubicacion: 'Madrid', foto_portada: null, vendedor: ana },
  { id: 15, id_categoria: 2, titulo: 'Collar de perlas cultivadas', precio: 120.5, estado_conservacion: 'buen_estado', estado: 'publicado', ubicacion: 'Sevilla', foto_portada: null, vendedor: luis },
  { id: 14, id_categoria: 3, titulo: 'Pendientes de aro dorados', precio: 18, estado_conservacion: 'nuevo', estado: 'publicado', ubicacion: 'Valencia', foto_portada: null, vendedor: sara },
  { id: 13, id_categoria: 4, titulo: 'Pulsera de cuero y plata', precio: 25, estado_conservacion: 'buen_estado', estado: 'publicado', ubicacion: 'Madrid', foto_portada: null, vendedor: ana },
  { id: 12, id_categoria: 1, titulo: 'Sortija de oro 18k', precio: 280, estado_conservacion: 'como_nuevo', estado: 'publicado', ubicacion: 'Bilbao', foto_portada: null, vendedor: luis },
  { id: 11, id_categoria: 5, titulo: 'Broche vintage de flor', precio: 35, estado_conservacion: 'aceptable', estado: 'publicado', ubicacion: 'Granada', foto_portada: null, vendedor: sara },
  { id: 10, id_categoria: 2, titulo: 'Gargantilla de plata', precio: 40, estado_conservacion: 'nuevo', estado: 'publicado', ubicacion: 'Madrid', foto_portada: null, vendedor: ana },
  { id: 9, id_categoria: 3, titulo: 'Pendientes de perla', precio: 55, estado_conservacion: 'como_nuevo', estado: 'publicado', ubicacion: 'Barcelona', foto_portada: null, vendedor: luis },
  { id: 8, id_categoria: 1, titulo: 'Alianza de plata', precio: 30, estado_conservacion: 'buen_estado', estado: 'publicado', ubicacion: 'Sevilla', foto_portada: null, vendedor: sara },
  { id: 7, id_categoria: 4, titulo: 'Pulsera de charms', precio: 60, estado_conservacion: 'buen_estado', estado: 'publicado', ubicacion: 'Valencia', foto_portada: null, vendedor: ana },
  { id: 6, id_categoria: 5, titulo: 'Reloj de bolsillo antiguo', precio: 150, estado_conservacion: 'aceptable', estado: 'publicado', ubicacion: 'Zaragoza', foto_portada: null, vendedor: luis },
  { id: 5, id_categoria: 2, titulo: 'Colgante de corazón', precio: 22, estado_conservacion: 'nuevo', estado: 'publicado', ubicacion: 'Madrid', foto_portada: null, vendedor: sara },
  { id: 4, id_categoria: 1, titulo: 'Anillo ajustable con piedra azul', precio: 15, estado_conservacion: 'como_nuevo', estado: 'publicado', ubicacion: 'Málaga', foto_portada: null, vendedor: ana },
  { id: 3, id_categoria: 3, titulo: 'Pendientes largos de cristal', precio: 28, estado_conservacion: 'buen_estado', estado: 'publicado', ubicacion: 'Bilbao', foto_portada: null, vendedor: luis },
  { id: 2, id_categoria: 4, titulo: 'Esclava de oro', precio: 320, estado_conservacion: 'buen_estado', estado: 'publicado', ubicacion: 'Barcelona', foto_portada: null, vendedor: sara },
  { id: 1, id_categoria: 2, titulo: 'Cadena de plata fina', precio: 19.9, estado_conservacion: 'aceptable', estado: 'publicado', ubicacion: 'Madrid', foto_portada: null, vendedor: ana },
];

/** Hace en memoria lo mismo que hará GET /api/articulos: filtrar, ordenar y paginar */
export function buscarEnDemo(filtros: FiltrosBusqueda): PaginaArticulos {
  const pagina = filtros.pagina ?? 1;
  const porPagina = filtros.por_pagina ?? 12;
  const texto = filtros.q?.trim().toLowerCase();
  const ciudad = filtros.ubicacion?.trim().toLowerCase();

  let lista = ARTICULOS_DEMO.filter(
    (a) =>
      (!texto || a.titulo.toLowerCase().includes(texto)) &&
      (!filtros.id_categoria || a.id_categoria === filtros.id_categoria) &&
      (filtros.precio_min === undefined || a.precio >= filtros.precio_min) &&
      (filtros.precio_max === undefined || a.precio <= filtros.precio_max) &&
      (!filtros.estado_conservacion || a.estado_conservacion === filtros.estado_conservacion) &&
      (!ciudad || (a.ubicacion ?? '').toLowerCase().includes(ciudad)) &&
      (!filtros.id_vendedor || a.vendedor.id === filtros.id_vendedor),
  );

  if (filtros.orden === 'precio_asc') lista = [...lista].sort((a, b) => a.precio - b.precio);
  if (filtros.orden === 'precio_desc') lista = [...lista].sort((a, b) => b.precio - a.precio);

  const inicio = (pagina - 1) * porPagina;
  return {
    articulos: lista.slice(inicio, inicio + porPagina),
    total: lista.length,
    pagina,
    por_pagina: porPagina,
  };
}
