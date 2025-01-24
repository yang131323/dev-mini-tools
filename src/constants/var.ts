export const isStatic = import.meta.env.static_build == 1; 

export const isProd = import.meta.env.NODE_ENV === 'production';