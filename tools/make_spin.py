#!/usr/bin/env python3
"""
Generira niz sličica za 360° pregled haljine (demo) — bez vanjskih biblioteka.

Koristi istu parametarsku siluetu kao tools/make_gown_glb.py, rotira je oko Y-osi
u N koraka i renderira softverski (ortografska projekcija + Lambert sjenčanje +
painter's algoritam) u PNG. Rezultat se učitava u 360° kartici viewera.

Stvarne haljine: zamijenite ovaj demo nizom pravih fotografija snimljenih u krug.

Pokretanje:  python3 tools/make_spin.py
Rezultat:    assets/spin/viola/frame_00.png ... frame_23.png
"""
import math, struct, zlib, os

FRAMES = 24
W, H = 360, 460
RADIAL = 96
BASE = (0.604, 0.525, 0.769)   # lila (Viola)
BG_TOP = (0.945, 0.925, 0.890)
BG_BOT = (0.886, 0.827, 0.749)
LIGHT = (-0.35, 0.45, 0.82)

PROFILE = [
    (0.00, 0.020),(0.02, 0.300),(0.06, 0.560),(0.25, 0.520),(0.55, 0.430),
    (0.85, 0.330),(1.05, 0.255),(1.22, 0.198),(1.40, 0.262),(1.58, 0.236),
    (1.74, 0.214),(1.86, 0.200),(1.95, 0.190),(2.00, 0.182),(2.02, 0.150),
]


def resample(profile, n):
    ys = [p[0] for p in profile]; rs = [p[1] for p in profile]
    out = []
    for i in range(n):
        y = ys[0] + (ys[-1] - ys[0]) * i / (n - 1)
        for k in range(len(ys) - 1):
            if ys[k] <= y <= ys[k + 1] or k == len(ys) - 2:
                t = 0 if ys[k+1]==ys[k] else (y - ys[k]) / (ys[k+1] - ys[k])
                out.append((y, max(rs[k] + (rs[k+1]-rs[k])*t, 0.0))); break
    return out


def build_mesh():
    prof = resample(PROFILE, 70)
    rings = len(prof)
    verts = []
    for (y, r) in prof:
        for j in range(RADIAL):
            a = 2*math.pi*j/RADIAL
            verts.append((r*math.cos(a), y, r*math.sin(a)))
    idx = lambda i, j: i*RADIAL + (j % RADIAL)
    tris = []
    for i in range(rings-1):
        for j in range(RADIAL):
            a, b, c, d = idx(i,j), idx(i,j+1), idx(i+1,j), idx(i+1,j+1)
            tris.append((a,b,d)); tris.append((a,d,c))
    bc = len(verts); verts.append((0.0, prof[0][0], 0.0))      # bottom (hem) cap
    for j in range(RADIAL):
        tris.append((bc, idx(0,j+1), idx(0,j)))
    tc = len(verts); verts.append((0.0, prof[-1][0], 0.0))     # top (neckline) cap
    last = rings-1
    for j in range(RADIAL):
        tris.append((tc, idx(last,j), idx(last,j+1)))
    return verts, tris


def norm(v):
    L = math.sqrt(sum(c*c for c in v)) or 1.0
    return (v[0]/L, v[1]/L, v[2]/L)


def png(path, buf):
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)
    raw = bytearray()
    for y in range(H):
        raw.append(0)
        raw += buf[y*W*3:(y+1)*W*3]
    out = b"\x89PNG\r\n\x1a\n"
    out += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
    out += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    out += chunk(b"IEND", b"")
    open(path, "wb").write(out)


def render(verts, tris, ang, out):
    ca, sa = math.cos(ang), math.sin(ang)
    # rotate around Y; centre vertically (Y up -> screen up)
    cy = 1.01
    rv = []
    for (x, y, z) in verts:
        rv.append((x*ca + z*sa, y - cy, -x*sa + z*ca))
    scale = H * 0.40
    ox, oy = W/2, H*0.50
    lx, ly, lz = norm(LIGHT)

    # background gradient + soft ground shadow
    buf = bytearray(W*H*3)
    for y in range(H):
        t = y/(H-1)
        r = int(255*(BG_TOP[0]*(1-t)+BG_BOT[0]*t))
        g = int(255*(BG_TOP[1]*(1-t)+BG_BOT[1]*t))
        b = int(255*(BG_TOP[2]*(1-t)+BG_BOT[2]*t))
        row = y*W*3
        for x in range(W):
            buf[row+x*3]=r; buf[row+x*3+1]=g; buf[row+x*3+2]=b
    # ground shadow ellipse
    gyc = oy + scale*1.04
    for yy in range(max(0,int(gyc-22)), min(H,int(gyc+22))):
        for xx in range(W):
            dx=(xx-ox)/95.0; dy=(yy-gyc)/16.0
            d=dx*dx+dy*dy
            if d<1.0:
                f=(1.0-d)*0.28; i=(yy*W+xx)*3
                buf[i]=int(buf[i]*(1-f)); buf[i+1]=int(buf[i+1]*(1-f)); buf[i+2]=int(buf[i+2]*(1-f))

    # project + shade + painter's sort (back to front), backface cull
    SASH = 0.35   # body angle of the asymmetric wrap seam (rotational landmark)
    prims = []
    for (a, b, c) in tris:
        A, B, C = rv[a], rv[b], rv[c]
        ux,uy,uz = B[0]-A[0],B[1]-A[1],B[2]-A[2]
        vx,vy,vz = C[0]-A[0],C[1]-A[1],C[2]-A[2]
        nx,ny,nz = uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx
        nl = math.sqrt(nx*nx+ny*ny+nz*nz) or 1.0
        nx,ny,nz = nx/nl,ny/nl,nz/nl
        if nz <= 0:   # facing away from camera (+Z)
            continue
        diff = max(0.0, nx*lx+ny*ly+nz*lz)
        sh = 0.22 + 0.78*diff
        sh = min(1.0, sh + 0.18*(diff**6))   # subtle rim sheen
        cr, cg, cb = BASE[0]*sh, BASE[1]*sh, BASE[2]*sh
        # original (body-fixed) position for stylised details
        ox0=(verts[a][0]+verts[b][0]+verts[c][0])/3.0
        oz0=(verts[a][2]+verts[b][2]+verts[c][2])/3.0
        oyc=(verts[a][1]+verts[b][1]+verts[c][1])/3.0
        az=math.atan2(oz0, ox0)
        d=math.atan2(math.sin(az-SASH), math.cos(az-SASH))
        if abs(d) < 0.20:                 # vertical wrap seam (asymmetric)
            cr,cg,cb = cr*0.60, cg*0.58, cb*0.66
        if 1.13 < oyc < 1.30:             # waist sash
            cr,cg,cb = cr*0.80, cg*0.78, cb*0.86
        col = (int(255*min(1,cr)), int(255*min(1,cg)), int(255*min(1,cb)))
        pa=(ox+A[0]*scale, oy-A[1]*scale); pb=(ox+B[0]*scale, oy-B[1]*scale); pc=(ox+C[0]*scale, oy-C[1]*scale)
        zavg=(A[2]+B[2]+C[2])/3.0
        prims.append((zavg, pa, pb, pc, col))
    prims.sort(key=lambda p: p[0])

    for (_, pa, pb, pc, col) in prims:
        minx=max(0, int(min(pa[0],pb[0],pc[0]))); maxx=min(W-1, int(max(pa[0],pb[0],pc[0]))+1)
        miny=max(0, int(min(pa[1],pb[1],pc[1]))); maxy=min(H-1, int(max(pa[1],pb[1],pc[1]))+1)
        if minx>maxx or miny>maxy: continue
        x0,y0=pa; x1,y1=pb; x2,y2=pc
        area=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0)
        if abs(area)<1e-6: continue
        inv=1.0/area
        for yy in range(miny,maxy+1):
            for xx in range(minx,maxx+1):
                px,py=xx+0.5,yy+0.5
                w0=((x1-px)*(y2-py)-(x2-px)*(y1-py))*inv
                w1=((x2-px)*(y0-py)-(x0-px)*(y2-py))*inv
                w2=1.0-w0-w1
                if w0>=-0.001 and w1>=-0.001 and w2>=-0.001:
                    i=(yy*W+xx)*3
                    buf[i]=col[0]; buf[i+1]=col[1]; buf[i+2]=col[2]
    png(out, buf)


def main():
    verts, tris = build_mesh()
    d = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "assets", "spin", "viola"))
    os.makedirs(d, exist_ok=True)
    for f in range(FRAMES):
        ang = 2*math.pi*f/FRAMES
        out = os.path.join(d, "frame_%02d.png" % f)
        render(verts, tris, ang, out)
        print("frame", f, "->", os.path.relpath(out))
    print("OK:", FRAMES, "frames")


if __name__ == "__main__":
    main()
