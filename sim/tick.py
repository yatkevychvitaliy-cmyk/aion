import os
import random
import sys
import requests

URL = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1"
KEY = os.environ["SUPABASE_SERVICE_KEY"]
H = {"apikey": KEY, "Content-Type": "application/json"}
TICKS_PER_DAY = 144  # тік кожні 10 хв, 1 день світу = 1 доба

NAMES = ["Axel", "Nova", "Orion", "Lyra", "Kiro", "Vega", "Zeno", "Mira",
         "Atlas", "Iris", "Rex", "Echo", "Juno", "Titan", "Sola", "Dax",
         "Neo", "Luna", "Hex", "Ada"]
ROLES = ["worker", "engineer", "medic", "scientist", "trader",
         "builder", "teacher", "guard", "banker", "architect"]


def check(r):
    if not r.ok:
        print("HTTP", r.status_code, r.text)
        sys.exit(1)
    return r


def get(table, params=None):
    r = requests.get(f"{URL}/{table}", headers=H, params=params or {}, timeout=30)
    return check(r).json()


def post(table, rows, upsert=False):
    h = dict(H)
    h["Prefer"] = "return=minimal" + (",resolution=merge-duplicates" if upsert else "")
    p = {"on_conflict": "id"} if upsert else {}
    check(requests.post(f"{URL}/{table}", headers=h, params=p, json=rows, timeout=30))


def patch(table, match, data):
    check(requests.patch(f"{URL}/{table}", headers=H, params=match, json=data, timeout=30))


def seed():
    rows = []
    for i, name in enumerate(NAMES):
        rows.append({
            "name": name,
            "role": ROLES[i % len(ROLES)],
            "traits": {"curiosity": random.randint(1, 10),
                       "sociability": random.randint(1, 10)},
            "needs": {"hunger": random.randint(20, 50),
                      "social": random.randint(20, 50)},
            "balance": 100,
            "x": round(random.uniform(5, 95), 1),
            "y": round(random.uniform(5, 95), 1),
            "alive": True,
            "born_tick": 0,
        })
    post("citizens", rows)
    print("Створено 20 громадян")


def nearest(c, others):
    return min(others, key=lambda o: (o["x"] - c["x"]) ** 2 + (o["y"] - c["y"]) ** 2)


def decide(c, others):
    n = c["needs"]
    if n["hunger"] > 60 and c["balance"] >= 5:
        return "eat"
    if c["balance"] < 30:
        return "work"
    if n["social"] > 60 and others:
        return "talk"
    return random.choice(["work", "wander", "wander"])


def clamp(v):
    return max(0, min(100, v))


def main():
    ctrl = get("control")[0]
    if ctrl["paused"]:
        print("Світ на паузі")
        return
    tick = ctrl["tick"] + 1

    citizens = get("citizens", {"alive": "eq.true", "order": "id"})
    if not citizens:
        seed()
        citizens = get("citizens", {"alive": "eq.true", "order": "id"})

    events, ledger = [], []
    for c in citizens:
        c["needs"]["hunger"] = clamp(c["needs"]["hunger"] + 4)
        c["needs"]["social"] = clamp(c["needs"]["social"] + 3)

    for c in citizens:
        others = [o for o in citizens if o["id"] != c["id"]]
        action = decide(c, others)
        payload = {}

        if action == "eat":
            c["balance"] = round(c["balance"] - 5, 2)
            c["needs"]["hunger"] = clamp(c["needs"]["hunger"] - 50)
            ledger.append({"from_id": c["id"], "to_id": None, "amount": 5,
                           "memo": "їжа", "tick": tick})
            reason = "Голод вищий за 60"
            explain = f"{c['name']} купує їжу за 5 монет, бо голодний."
            payload = {"en": f"{c['name']} buys food for 5 coins because they are hungry."}

        elif action == "work":
            pay = 10 + random.randint(0, 5)
            c["balance"] = round(c["balance"] + pay, 2)
            ledger.append({"from_id": None, "to_id": c["id"], "amount": pay,
                           "memo": f"робота: {c['role']}", "tick": tick})
            reason = "Потрібні гроші" if c["balance"] < 60 else "Звичайна робочий день"
            explain = f"{c['name']} ({c['role']}) працює й заробляє {pay} монет."
            payload = {"en": f"{c['name']} ({c['role']}) works and earns {pay} coins.",
                       "amount": pay}

        elif action == "talk":
            p = nearest(c, others)
            c["x"] = round(c["x"] + (p["x"] - c["x"]) * 0.5, 1)
            c["y"] = round(c["y"] + (p["y"] - c["y"]) * 0.5, 1)
            c["needs"]["social"] = clamp(c["needs"]["social"] - 40)
            p["needs"]["social"] = clamp(p["needs"]["social"] - 30)
            reason = "Самотність вища за 60"
            explain = f"{c['name']} підходить поговорити з {p['name']}."
            payload = {"en": f"{c['name']} goes to talk with {p['name']}.",
                       "partner": p["id"]}

        else:
            c["x"] = clamp(round(c["x"] + random.uniform(-8, 8), 1))
            c["y"] = clamp(round(c["y"] + random.uniform(-8, 8), 1))
            reason = "Немає термінових потреб"
            explain = f"{c['name']} гуляє містом."
            payload = {"en": f"{c['name']} wanders around the city."}

        payload["x"] = c["x"]
        payload["y"] = c["y"]
        events.append({"tick": tick, "citizen_id": c["id"], "action": action,
                       "reason": reason, "explain": explain, "payload": payload})

    post("citizens", citizens, upsert=True)
    post("events", events)
    if ledger:
        post("ledger", ledger)
    patch("control", {"id": "eq.1"},
          {"tick": tick, "world_day": 1 + tick // TICKS_PER_DAY})
    print(f"Тік {tick}: {len(events)} подій")


if __name__ == "__main__":
    main()
