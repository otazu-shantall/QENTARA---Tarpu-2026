"""Dónde se guardan los datos: archivos (como hasta hoy) o Supabase (DT-23), con la misma interfaz.

TARPU_ALMACEN=archivos (por defecto) | supabase. El resto del código llama siempre a obtener() y no sabe cuál es.
Escrito con asistencia de IA (Claude Code). Declarado en entrega/uso-de-ia.md.
"""
from __future__ import annotations

import os
from functools import lru_cache


@lru_cache(maxsize=1)
def obtener():
    modo = os.environ.get('TARPU_ALMACEN', 'archivos').strip().lower()
    if modo == 'supabase':
        from .supabase import RepositorioSupabase
        return RepositorioSupabase()
    from .archivos import RepositorioArchivos
    return RepositorioArchivos()
