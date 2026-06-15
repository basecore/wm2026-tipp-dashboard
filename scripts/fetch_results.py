#!/usr/bin/env python3
import os, json, unicodedata, requests
from pathlib import Path

API_KEY = os.environ.get("FOOTBALL_API_KEY", "")
BASE    = "https://api.football-data.org/v4"
WC_ID   = 2000

# Mapping: API-Teamname → exakter data-teams-Schlüssel aus index.html (Heimteam)
TEAM_MAP = {
    # Gruppe A
    "Mexico":                    "mexiko",
    "South Africa":              "südafrika",
    "Korea Republic":            "südkorea",
    "Czechia":                   "tschechien",
    # Gruppe B
    "Canada":                    "kanada",
    "Bosnia and Herzegovina":    "bosnien-herzegowina",
    "Qatar":                     "katar",
    "Switzerland":               "schweiz",
    # Gruppe C
    "Brazil":                    "brasilien",
    "Morocco":                   "marokko",
    "Haiti":                     "haiti",
    "Scotland":                  "schottland",
    # Gruppe D
    "USA":                       "usa",
    "United States":             "usa",
    "Paraguay":                  "paraguay",
    "Australia":                 "australien",
    "Türkiye":                   "türkei",
    "Turkey":                    "türkei",
    # Gruppe E
    "Germany":                   "deutschland",
    "Curaçao":                   "curaçao",
    "Côte d'Ivoire":             "elfenbeinküste",
    "Ivory Coast":               "elfenbeinküste",
    "Ecuador":                   "ecuador",
    # Gruppe F
    "Netherlands":               "niederlande",
    "Japan":                     "japan",
    "Sweden":                    "schweden",
    "Tunisia":                   "tunesien",
    # Gruppe G
    "Belgium":                   "belgien",
    "Egypt":                     "ägypten",
    "Iran":                      "iran",
    "New Zealand":               "neuseeland",
    # Gruppe H
    "Spain":                     "spanien",
    "Cape Verde":                "kap verde",
    "Saudi Arabia":              "saudi-arabien",
    "Uruguay":                   "uruguay",
    # Gruppe I
    "France":                    "frankreich",
    "Senegal":                   "senegal",
    "Iraq":                      "irak",
    "Norway":                    "norwegen",
    # Gruppe J
    "Argentina":                 "argentinien",
    "Algeria":                   "algerien",
    "Austria":                   "österreich",
    "Jordan":                    "jordanien",
    # Gruppe K
    "Portugal":                  "portugal",
    "DR Congo":                  "dr kongo",
    "Uzbekistan":                "usbekistan",
    "Colombia":                  "kolumbien",
    # Gruppe L
    "England":                   "england",
    "Croatia":                   "kroatien",
    "Ghana":                     "ghana",
    "Panama":                    "panama",
}

# Vollständige Referenz aller data-teams-Werte aus index.html (zur Validierung)
KNOWN_TEAM_KEYS = {
    "mexiko", "südafrika", "südkorea", "tschechien",
    "kanada", "bosnien-herzegowina", "katar", "schweiz",
    "brasilien", "marokko", "haiti", "schottland",
    "usa", "paraguay", "australien", "türkei",
    "deutschland", "curaçao", "elfenbeinküste", "ecuador",
    "niederlande", "japan", "schweden", "tunesien",
    "belgien", "ägypten", "iran", "neuseeland",
    "spanien", "kap verde", "saudi-arabien", "uruguay",
    "frankreich", "senegal", "irak", "norwegen",
    "argentinien", "algerien", "österreich", "jordanien",
    "portugal", "dr kongo", "usbekistan", "kolumbien",
    "england", "kroatien", "ghana", "panama",
}

def norm(s):
    """Fallback-Normalisierung: Kleinbuchstaben, Akzente entfernen, Leerzeichen trimmen."""
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").replace("ß", "ss").strip()

def resolve_team(api_name):
    """Gibt den data-teams-Schlüssel für einen API-Teamnamen zurück.
    Warnt, wenn der Name nicht im TEAM_MAP bekannt ist."""
    key = TEAM_MAP.get(api_name)
    if key:
        return key
    # Fallback: normalisierter Name
    fallback = norm(api_name)
    if fallback not in KNOWN_TEAM_KEYS:
        print(f"⚠️  Unbekannter Teamname: '{api_name}' → Fallback: '{fallback}' (bitte TEAM_MAP ergänzen!)")
    return fallback

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
        status = m.get("status", "")
        if status not in ("FINISHED", "IN_PLAY", "PAUSED"):
            continue
        home_name = m.get("homeTeam", {}).get("name", "")
        away_name = m.get("awayTeam", {}).get("name", "")
        home_key  = resolve_team(home_name)
        away_key  = resolve_team(away_name)
        ft = m.get("score", {}).get("fullTime", {})
        hg, ag = ft.get("home"), ft.get("away")
        if hg is None or ag is None:
            continue
        teams_key = f"{home_key} {away_key}"
        out.append({
            "teams":  teams_key,
            "home":   hg,
            "away":   ag,
            "status": "finished" if status == "FINISHED" else "live"
        })
    return out

if __name__ == "__main__":
    matches  = get_matches()
    results  = build_results(matches)

    # Manueller Fallback für Spiele, die die API noch nicht liefert
    fallback = [
        {"teams": "mexiko südafrika",    "home": 2, "away": 0, "status": "finished"},
        {"teams": "südkorea tschechien", "home": 2, "away": 1, "status": "finished"},
    ]
    known = {r["teams"]: r for r in fallback}
    for r in results:
        known[r["teams"]] = r          # API überschreibt Fallback

    final = list(known.values())
    out = Path(__file__).parent.parent / "results.json"
    out.write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ {len(final)} Spiele in results.json geschrieben.")

    # Validierung: Prüfe ob alle generierten Keys bekannt sind
    unknown = [r["teams"] for r in final
               if not all(p in KNOWN_TEAM_KEYS for p in r["teams"].split(" ", 1))]
    if unknown:
        print(f"⚠️  Folgende Spiele haben unbekannte Team-Keys (bitte prüfen): {unknown}")
    else:
        print("✅ Alle Team-Keys validiert – kein Mismatch erkannt.")
