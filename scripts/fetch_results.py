#!/usr/bin/env python3
import os, json, unicodedata, requests
from pathlib import Path

API_KEY = os.environ.get("FOOTBALL_API_KEY", "")
BASE    = "https://api.football-data.org/v4"
WC_ID   = 2000

TEAM_MAP = {
    "Mexico":"mexiko","South Africa":"s\u00fcdafrika","Korea Republic":"s\u00fcdkorea",
    "Czechia":"tschechien","Canada":"kanada",
    "Bosnia and Herzegovina":"bosnien-herzegowina","USA":"usa",
    "United States":"usa","Paraguay":"paraguay","Qatar":"katar",
    "Switzerland":"schweiz","Brazil":"brasilien","Morocco":"marokko",
    "Haiti":"haiti","Scotland":"schottland","Australia":"australien",
    "T\u00fcrkiye":"t\u00fcrkei","Turkey":"t\u00fcrkei","Germany":"deutschland",
    "Cura\u00e7ao":"cura\u00e7ao","Netherlands":"niederlande","Japan":"japan",
    "C\u00f4te d'Ivoire":"elfenbeink\u00fcste","Ecuador":"ecuador","Sweden":"schweden",
    "Tunisia":"tunesien","Spain":"spanien","Cape Verde":"kap verde",
    "Belgium":"belgien","Egypt":"\u00e4gypten","Saudi Arabia":"saudi-arabien",
    "Uruguay":"uruguay","Iran":"iran","New Zealand":"neuseeland",
    "France":"frankreich","Senegal":"senegal","Iraq":"irak",
    "Norway":"norwegen","Argentina":"argentinien","Algeria":"algerien",
    "Austria":"\u00f6sterreich","Jordan":"jordanien","Portugal":"portugal",
    "DR Congo":"dr kongo","England":"england","Croatia":"kroatien",
    "Ghana":"ghana","Panama":"panama","Uzbekistan":"usbekistan",
    "Colombia":"kolumbien",
}

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").replace("\u00df","ss").strip()

def get_matches():
    try:
        r = requests.get(
            f"{BASE}/competitions/{WC_ID}/matches",
            headers={"X-Auth-Token": API_KEY},
            timeout=15
        )
        r.raise_for_status()
        return r.json().get("matches", [])
    except Exception as e:
        print(f"API-Fehler: {e}")
        return []

def build_results(matches):
    out = []
    for m in matches:
        status = m.get("status","")
        if status not in ("FINISHED","IN_PLAY","PAUSED"):
            continue
        home_name = m.get("homeTeam",{}).get("name","")
        away_name = m.get("awayTeam",{}).get("name","")
        home_key  = TEAM_MAP.get(home_name, norm(home_name))
        away_key  = TEAM_MAP.get(away_name, norm(away_name))
        ft = m.get("score",{}).get("fullTime",{})
        hg, ag = ft.get("home"), ft.get("away")
        if hg is None or ag is None:
            continue
        out.append({
            "teams": f"{home_key} {away_key}",
            "home":  hg,
            "away":  ag,
            "status": "finished" if status == "FINISHED" else "live"
        })
    return out

if __name__ == "__main__":
    matches = get_matches()
    results = build_results(matches)
    fallback = [
        {"teams":"mexiko s\u00fcdafrika",    "home":2,"away":0,"status":"finished"},
        {"teams":"s\u00fcdkorea tschechien", "home":2,"away":1,"status":"finished"},
    ]
    known = {r["teams"]: r for r in fallback}
    for r in results:
        known[r["teams"]] = r
    final = list(known.values())
    out = Path(__file__).parent.parent / "results.json"
    out.write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\u2705 {len(final)} Spiele in results.json geschrieben.")
