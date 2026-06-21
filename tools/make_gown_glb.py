#!/usr/bin/env python3
"""
Generira lagani 3D model haljine (.glb, glTF 2.0) bez vanjskih biblioteka.

Model je elegantna silueta večernje haljine dobivena rotacijom profila oko
Y-osi (surface of revolution) + zatvoreni vrh i dno (watertight mesh), s
PBR metalik-rough materijalom u CELI zlatnoj boji. Koristi se kao demo za
interaktivni 3D / AR pregled na webshopu. Stvarne haljine zamijenite vlastitim
.glb modelima (3D sken ili izvoz iz CLO3D / Browzwear / Blender).

Pokretanje:  python3 tools/make_gown_glb.py
Rezultat:    assets/models/celi-3d-demo.glb
"""
import json, struct, math, os

# ---- profil haljine: (visina y, polumjer r) od poruba do vrha ----
PROFILE = [
    (0.00, 0.020),  # mali ravni rub na podu
    (0.02, 0.300),
    (0.06, 0.560),  # raskošan porub suknje
    (0.25, 0.520),
    (0.55, 0.430),
    (0.85, 0.330),
    (1.05, 0.255),  # bokovi
    (1.22, 0.198),  # struk (utegnut)
    (1.40, 0.262),  # poprsje
    (1.58, 0.232),
    (1.74, 0.196),  # prsa
    (1.88, 0.150),  # dekolte
    (1.98, 0.090),  # ramena
    (2.04, 0.030),  # vrat
    (2.06, 0.000),  # zatvoreni vrh (točka)
]

RADIAL = 96   # broj segmenata po obodu (glatka rotacija)


def resample(profile, n):
    """Linearno preuzorkuje profil na n točaka radi glatke siluete."""
    ys = [p[0] for p in profile]
    rs = [p[1] for p in profile]
    y0, y1 = ys[0], ys[-1]
    out = []
    for i in range(n):
        y = y0 + (y1 - y0) * i / (n - 1)
        # pronađi segment
        for k in range(len(ys) - 1):
            if ys[k] <= y <= ys[k + 1] or k == len(ys) - 2:
                if ys[k + 1] == ys[k]:
                    r = rs[k]
                else:
                    t = (y - ys[k]) / (ys[k + 1] - ys[k])
                    r = rs[k] + (rs[k + 1] - rs[k]) * t
                out.append((y, max(r, 0.0)))
                break
    return out


def build():
    prof = resample(PROFILE, 80)
    rings = len(prof)

    verts = []   # (x,y,z)
    # rotiraj profil oko Y osi
    for (y, r) in prof:
        for j in range(RADIAL):
            a = 2 * math.pi * j / RADIAL
            verts.append((r * math.cos(a), y, r * math.sin(a)))

    def idx(i, j):
        return i * RADIAL + (j % RADIAL)

    tris = []
    for i in range(rings - 1):
        for j in range(RADIAL):
            a = idx(i, j); b = idx(i, j + 1)
            c = idx(i + 1, j); d = idx(i + 1, j + 1)
            tris.append((a, b, d))
            tris.append((a, d, c))

    # dno: zatvori porub središnjom točkom
    bottom_center = len(verts); verts.append((0.0, prof[0][0], 0.0))
    for j in range(RADIAL):
        tris.append((bottom_center, idx(0, j + 1), idx(0, j)))

    # ---- normale (po vrhu, glatko sjenčanje) ----
    normals = [[0.0, 0.0, 0.0] for _ in verts]
    for (a, b, c) in tris:
        ax, ay, az = verts[a]; bx, by, bz = verts[b]; cx, cy, cz = verts[c]
        ux, uy, uz = bx - ax, by - ay, bz - az
        vx, vy, vz = cx - ax, cy - ay, cz - az
        nx = uy * vz - uz * vy
        ny = uz * vx - ux * vz
        nz = ux * vy - uy * vx
        for t in (a, b, c):
            normals[t][0] += nx; normals[t][1] += ny; normals[t][2] += nz
    for n in normals:
        L = math.sqrt(n[0]**2 + n[1]**2 + n[2]**2) or 1.0
        n[0] /= L; n[1] /= L; n[2] /= L

    # ---- pakiranje binarnog buffera ----
    pos_bytes = b"".join(struct.pack("<3f", *v) for v in verts)
    nrm_bytes = b"".join(struct.pack("<3f", *n) for n in normals)
    idx_flat = [i for t in tris for i in t]
    idx_bytes = struct.pack("<%dI" % len(idx_flat), *idx_flat)

    def pad4(b):
        return b + b"\x00" * ((4 - len(b) % 4) % 4)

    pos_bytes = pad4(pos_bytes)
    nrm_bytes = pad4(nrm_bytes)
    idx_bytes = pad4(idx_bytes)

    bin_blob = pos_bytes + nrm_bytes + idx_bytes
    pos_off, nrm_off, idx_off = 0, len(pos_bytes), len(pos_bytes) + len(nrm_bytes)

    xs = [v[0] for v in verts]; ys = [v[1] for v in verts]; zs = [v[2] for v in verts]

    gltf = {
        "asset": {"version": "2.0", "generator": "CELI gown generator"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "CELI Haljina"}],
        "meshes": [{"name": "Gown", "primitives": [{
            "attributes": {"POSITION": 0, "NORMAL": 1},
            "indices": 2, "material": 0
        }]}],
        "materials": [{
            "name": "CELI Zlatni saten",
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.722, 0.573, 0.310, 1.0],
                "metallicFactor": 0.55,
                "roughnessFactor": 0.35
            },
            "doubleSided": True
        }],
        "buffers": [{"byteLength": len(bin_blob)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": pos_off, "byteLength": len(verts) * 12, "target": 34962},
            {"buffer": 0, "byteOffset": nrm_off, "byteLength": len(verts) * 12, "target": 34962},
            {"buffer": 0, "byteOffset": idx_off, "byteLength": len(idx_flat) * 4, "target": 34963},
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": len(verts), "type": "VEC3",
             "min": [min(xs), min(ys), min(zs)], "max": [max(xs), max(ys), max(zs)]},
            {"bufferView": 1, "componentType": 5126, "count": len(verts), "type": "VEC3"},
            {"bufferView": 2, "componentType": 5125, "count": len(idx_flat), "type": "SCALAR"},
        ],
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_bytes = json_bytes + b" " * ((4 - len(json_bytes) % 4) % 4)

    glb = bytearray()
    glb += struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(json_bytes) + 8 + len(bin_blob))
    glb += struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes
    glb += struct.pack("<II", len(bin_blob), 0x004E4942) + bin_blob

    out = os.path.join(os.path.dirname(__file__), "..", "assets", "models", "celi-3d-demo.glb")
    out = os.path.normpath(out)
    with open(out, "wb") as f:
        f.write(glb)
    print("OK ->", out, "|", len(glb), "bytes |", len(verts), "vrhova |", len(tris), "trokuta")


if __name__ == "__main__":
    build()
