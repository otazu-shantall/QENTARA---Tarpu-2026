"""Publica archivos de trabajos anteriores antes de separar API y trabajador.
Uso: python -m tarpu_datos.publicar_archivos (TARPU_ALMACEN=supabase y credenciales del servidor).
No crea extracciones ni descarga proveedores. Asistencia de IA (Codex); entrega/uso-de-ia.md.
"""
from pathlib import Path
from .archivos import relativa
from .repositorio import obtener


def publicar(repo=None) -> dict:
    repo = repo or obtener()
    if repo.nombre != 'supabase':
        raise ValueError('Esta publicación requiere TARPU_ALMACEN=supabase.')
    root = Path(__file__).resolve().parent.parent / 'almacen'
    seen, missing = set(), []

    def visit(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == 'archivos' and isinstance(child, dict):
                    for ruta in child.values():
                        if not isinstance(ruta, str) or ruta in seen:
                            continue
                        seen.add(ruta)
                        path = Path(ruta)
                        if not path.is_file():
                            path = root / relativa(ruta)
                        if path.is_file():
                            repo.publicar_archivos({'archivo': str(path)})
                        else:
                            missing.append(relativa(ruta))
                else:
                    visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    for job in repo.listar_trabajos():
        visit(repo.leer_trabajo(job['clave']))
    return {'publicados': len(seen) - len(missing), 'faltantes': missing}


if __name__ == '__main__':
    import json
    print(json.dumps(publicar(), ensure_ascii=False, indent=2))
