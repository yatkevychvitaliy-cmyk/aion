import json, math, os, sys, time
import requests

LAT0, LON0 = 50.4501, 30.5234  # Майдан Незалежності
KY = math.pi / 180 * 6371000.0
KX = KY * math.cos(math.radians(LAT0))
HALF = 1500  # метрів від центру
OVERPASS = ["https://overpass-api.de/api/interpreter",
            "https://overpass.private.coffee/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter"]
HEAD = {"User-Agent": "AION-city-builder/1.0 (+https://github.com/yatkevychvitaliy-cmyk/aion)",
        "Accept": "*/*"}
ROAD = {"motorway": 14, "trunk": 14, "primary": 12, "secondary": 10,
        "tertiary": 8, "residential": 6, "unclassified": 6,
        "living_street": 5, "service": 4, "pedestrian": 4,
        "footway": 2, "path": 2, "cycleway": 2}


def run(query):
    for attempt in range(8):
        url = OVERPASS[attempt % len(OVERPASS)]
        try:
            r = requests.post(url, data={"data": query}, headers=HEAD, timeout=240)
            if r.status_code == 200:
                return r.json()
            print("overpass", url, r.status_code, r.text[:120].replace("\n", " "))
        except Exception as e:
            print("помилка", e)
        time.sleep(20 * (attempt + 1))
    sys.exit("Overpass недоступний")


def xy(p):
    return ((p[1] - LON0) * KX, -(p[0] - LAT0) * KY)


def flat(pts, step=0):
    out, last = [], None
    for p in pts:
        x, z = xy(p)
        if last is None or step == 0 or math.hypot(x - last[0], z - last[1]) >= step:
            out += [round(x, 1), round(z, 1)]
            last = (x, z)
    return out


def height(tags, i):
    h = tags.get("height") or tags.get("building:height")
    if h:
        try:
            return max(3.0, float(str(h).split()[0].replace("m", "").replace(",", ".")))
        except ValueError:
            pass
    lv = tags.get("building:levels")
    if lv:
        try:
            return max(3.0, float(str(lv).split(";")[0].replace(",", ".")) * 3.2 + 1.5)
        except ValueError:
            pass
    return 9 + (i * 7919) % 13


def stitch(segs):
    segs = [list(s) for s in segs if len(s) > 1]
    rings = []
    while segs:
        cur = segs.pop()
        changed = True
        while changed and cur[0] != cur[-1]:
            changed = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]:
                    cur += s[1:]
                elif s[-1] == cur[-1]:
                    cur += s[::-1][1:]
                elif s[-1] == cur[0]:
                    cur = s[:-1] + cur
                elif s[0] == cur[0]:
                    cur = s[::-1][:-1] + cur
                else:
                    continue
                segs.pop(i)
                changed = True
                break
        if cur[0] == cur[-1] and len(cur) > 3:
            rings.append(cur)
    return rings


def main():
    dlat, dlon = HALF / KY, HALF / KX
    bb = f"({LAT0 - dlat},{LON0 - dlon},{LAT0 + dlat},{LON0 + dlon})"
    parts = [
        f'way["building"]{bb};',
        f'way["highway"]{bb};',
        f'way["natural"="water"]{bb};way["waterway"="riverbank"]{bb};'
        f'relation["natural"="water"]{bb};relation["waterway"="riverbank"]{bb};',
        f'way["leisure"~"^(park|garden)$"]{bb};'
        f'way["landuse"~"^(forest|grass|recreation_ground)$"]{bb};',
    ]
    elements = []
    for p in parts:
        data = run("[out:json][timeout:180];(" + p + ");out geom;")
        got = data.get("elements", [])
        print("отримано", len(got))
        elements += got
        time.sleep(8)
    out = {"origin": [LAT0, LON0], "half": HALF, "b": [], "r": [], "w": [], "p": []}
    for i, el in enumerate(elements):
        tags = el.get("tags", {})
        if el["type"] == "way" and "geometry" in el:
            pts = [(g["lat"], g["lon"]) for g in el["geometry"]]
            closed = len(pts) > 3 and pts[0] == pts[-1]
            if "building" in tags and closed:
                out["b"].append([round(height(tags, i), 1), flat(pts)])
            elif "highway" in tags and tags["highway"] in ROAD:
                br = 1 if tags.get("bridge") not in (None, "no") else 0
                out["r"].append([ROAD[tags["highway"]], br, flat(pts)])
            elif closed and (tags.get("natural") == "water" or tags.get("waterway") == "riverbank"):
                out["w"].append(flat(pts, 3))
            elif closed and (tags.get("leisure") in ("park", "garden") or "landuse" in tags):
                out["p"].append(flat(pts, 2))
        elif el["type"] == "relation":
            segs = [[(g["lat"], g["lon"]) for g in m["geometry"]]
                    for m in el.get("members", [])
                    if m.get("role") == "outer" and m.get("geometry")]
            for ring in stitch(segs):
                out["w"].append(flat(ring, 3))
    os.makedirs("data", exist_ok=True)
    with open("data/kyiv_center.json", "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print("будівель", len(out["b"]), "доріг", len(out["r"]),
          "води", len(out["w"]), "парків", len(out["p"]))


main()
