export interface Usuario {
    id: number;
    nombre_usuario: string;
    email: string;
    rol: 'usuario' | 'moderador' | 'administrador';
    foto_url?: string | null;
    ubicacion?: string | null;
}

export const STATUS_LABEL: Record<string, string> = {
    borrador: 'Borrador',
    publicado: 'Publicado',
    en_revision: 'En revisión',
    retirado: 'Retirado',
    vendido: 'Vendido'
};

export const CONDITION_LABEL: Record<string, string> = {
    nuevo: 'Nuevo',
    como_nuevo: 'Como nuevo',
    bueno: 'Bueno',
    aceptable: 'Aceptable'
};

export const CONDITIONS = Object.entries(CONDITION_LABEL).map(([value, label]) => ({ value, label }));

export const ROLE_LABEL: Record<string, string> = {
    user: 'Usuario',
    moderator: 'Moderador',
    admin: 'Administrador'
};

export const REPORT_TYPE_LABEL: Record<string, string> = {
    articulo: 'Artículo',
    usuario: 'Usuario',
    conversacion: 'Conversación'
};

export const DECISION_LABEL: Record<string, string> = {
    mantener: 'Mantenido activo',
    retirar: 'Artículo retirado',
    bloquear: 'Usuario bloqueado'
};
