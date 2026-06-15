#!/usr/bin/env python3
"""
fetch_results.py – Holt WM-2026-Ergebnisse von football-data.org
und schreibt sie in results.json mit Keys, die exakt den
data-teams-Attributen in index.html entsprechen.

Bei unbekannten API-Teamnamen wird eine Warnung ausgegeben.
"""
import os, json, unicodedata, requests
from pathlib import Path

API_KEY = os.environ.get("FOOTBALL_API_KEY", "")
BASE    = "https://api.football-data.org/v4"
WC_ID   = 2000

# ---------------------------------------------------------------------------
# TEAM_MAP: Jeder mögliche API-Teamname → exakter data-teams-Key aus index.html
# Alle Varianten / Aliases sind aufgeführt (offizielle Namen, Englisch, API-Varianten)
# ---------------------------------------------------------------------------
TEAM_MAP = {

    # --- GRUPPE A ---
    "Mexico":                       "mexiko",
    "México":                       "mexiko",
    "South Africa":                 "südafrika",
    "Korea Republic":               "südkorea",
    "South Korea":                  "südkorea",
    "Republic of Korea":            "südkorea",
    "Czechia":                      "tschechien",
    "Czech Republic":               "tschechien",
    "Serbia":                       "serbien",   # Gruppe A laut Auslosung

    # --- GRUPPE B ---
    "Canada":                       "kanada",
    "Bosnia and Herzegovina":       "bosnien-herzegowina",
    "Bosnia-Herzegovina":           "bosnien-herzegowina",
    "Bosnia & Herzegovina":         "bosnien-herzegowina",
    "Bosnia-Herzegowina":           "bosnien-herzegowina",
    "Qatar":                        "katar",
    "Switzerland":                  "schweiz",

    # --- GRUPPE C ---
    "Brazil":                       "brasilien",
    "Brasil":                       "brasilien",
    "Morocco":                      "marokko",
    "Haiti":                        "haiti",
    "Scotland":                     "schottland",

    # --- GRUPPE D ---
    "USA":                          "usa",
    "United States":                "usa",
    "United States of America":     "usa",
    "US":                           "usa",
    "Paraguay":                     "paraguay",
    "Australia":                    "australien",
    "Türkiye":                      "türkei",
    "Turkey":                       "türkei",
    "Turkiye":                      "türkei",

    # --- GRUPPE E ---
    "Germany":                      "deutschland",
    "Curaçao":                      "curaçao",
    "Curacao":                      "curaçao",
    "Côte d'Ivoire":               "elfenbeinküste",
    "Cote d'Ivoire":                "elfenbeinküste",
    "Cote dIvoire":                 "elfenbeinküste",
    "Ivory Coast":                  "elfenbeinküste",
    "Ecuador":                      "ecuador",
    "Costa Rica":                   "costa rica",   # falls Auslosung-Variante

    # --- GRUPPE F ---
    "Netherlands":                  "niederlande",
    "Holland":                      "niederlande",
    "Japan":                        "japan",
    "Sweden":                       "schweden",
    "Sverige":                      "schweden",
    "Tunisia":                      "tunesien",
    "Tunisie":                      "tunesien",

    # --- GRUPPE G ---
    "Belgium":                      "belgien",
    "Egypt":                        "ägypten",
    "Iran":                         "iran",
    "IR Iran":                      "iran",
    "Islamic Republic of Iran":     "iran",
    "New Zealand":                  "neuseeland",

    # --- GRUPPE H ---
    "Spain":                        "spanien",
    "Cape Verde":                   "kap verde",
    "Cabo Verde":                   "kap verde",
    "Saudi Arabia":                 "saudi-arabien",
    "KSA":                          "saudi-arabien",
    "Uruguay":                      "uruguay",

    # --- GRUPPE I ---
    "France":                       "frankreich",
    "Senegal":                      "senegal",
    "Iraq":                         "irak",
    "Norway":                       "norwegen",
    "Norge":                        "norwegen",

    # --- GRUPPE J ---
    "Argentina":                    "argentinien",
    "Algeria":                      "algerien",
    "Algérie":                      "algerien",
    "Austria":                      "österreich",
    "Österreich":                   "österreich",
    "Jordan":                       "jordanien",
    "Hashemite Kingdom of Jordan":  "jordanien",

    # --- GRUPPE K ---
    "Portugal":                     "portugal",
    "DR Congo":                     "dr kongo",
    "Congo DR":                     "dr kongo",
    "Democratic Republic of Congo": "dr kongo",
    "Congo, DR":                    "dr kongo",
    "DRC":                          "dr kongo",
    "Uzbekistan":                   "usbekistan",
    "Colombia":                     "kolumbien",
    "Colombia":                     "kolumbien",

    # --- GRUPPE L ---
    "England":                      "england",
    "Croatia":                      "kroatien",
    "Hrvatska":                     "kroatien",
    "Ghana":                        "ghana",
    "Panama":                       "panama",
}

# ---------------------------------------------------------------------------
# Vollständige Menge aller gültigen data-teams-Keys aus index.html
# Wird zur Validierung genutzt (Warnung bei unbekanntem Key)
# ---------------------------------------------------------------------------
KNOWN_TEAM_KEYS = {
    # Gruppe A
    "mexiko", "südafrika", "südkorea", "tschechien", "serbien",
    # Gruppe B
    "kanada", "bosnien-herzegowina", "katar", "schweiz",
    # Gruppe C
    "brasilien", "marokko", "haiti", "schottland",
    # Gruppe D
    "usa", "paraguay", "australien", "türkei",
    # Gruppe E
    "deutschland", "curaçao", "elfenbeinküste", "ecuador", "costa rica",
    # Gruppe F
    "niederlande", "japan", "schweden", "tunesien",
    # Gruppe G
    "belgien", "ägypten", "iran", "neuseeland",
    # Gruppe H
    "spanien", "kap verde", "saudi-arabien", "uruguay",
    # Gruppe I
    "frankreich", "senegal", "irak", "norwegen",
    # Gruppe J
    "argentinien", "algerien", "österreich", "jordanien",
    # Gruppe K
    "portugal", "dr kongo", "usbekistan", "kolumbien",
    # Gruppe L
    "england", "kroatien", "ghana", "panama",
}


def norm(s):
    """Fallback: Kleinbuchstaben, Akzente entfernen."""
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").replace("ß", "ss").strip()


def resolve_team(api_name):
    """
    Gibt den data-teams-Key für einen API-Teamnamen zurück.
    Sucht zuerst exakt, dann case-insensitive, dann Fallback.
    Warnt bei unbekannten Namen damit das TEAM_MAP ergänzt werden kann.
    """
    # 1) Exakter Treffer
    key = TEAM_MAP.get(api_name)
    if key:
        return key

    # 2) Case-insensitive Treffer
    api_lower = api_name.strip().lower()
    for k, v in TEAM_MAP.items():
        if k.lower() == api_lower:
            return v

    # 3) Normalisierter Fallback (Akzente entfernt)
    fallback = norm(api_name)
    print(f"⚠️  UNBEKANNT: '{api_name}' → Fallback '{fallback}' – bitte TEAM_MAP ergänzen!")
    return fallback


def get_matches():
    try:
        r = requests.get(
            f"{BASE}/competitions/{WC_ID}/matches",
            headers={"X-Auth-Token": API_KEY},
            timeout=15,
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
        out.append({
            "teams":  f"{home_key} {away_key}",
            "home":   hg,
            "away":   ag,
            "status": "finished" if status == "FINISHED" else "live",
        })
    return out


if __name__ == "__main__":
    matches = get_matches()
    results = build_results(matches)

    # Manueller Fallback für Spiele, die die API (noch) nicht liefert
    fallback_manual = [
        {"teams": "mexiko südafrika",    "home": 2, "away": 0, "status": "finished"},
        {"teams": "südkorea tschechien", "home": 2, "away": 1, "status": "finished"},
    ]
    known = {r["teams"]: r for r in fallback_manual}
    for r in results:
        known[r["teams"]] = r   # API-Daten überschreiben Fallback

    final = list(known.values())
    out = Path(__file__).parent.parent / "results.json"
    out.write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ {len(final)} Spiele in results.json geschrieben.")

    # --- Validierung ---
    errors = []
    for r in final:
        parts = r["teams"].split(" ", 1)
        for p in parts:
            # Mehrteilige Keys wie 'dr kongo', 'kap verde', 'saudi-arabien'
            if p not in KNOWN_TEAM_KEYS and r["teams"] not in KNOWN_TEAM_KEYS:
                # Prüfe ob der vollständige teams-String als Key vorkommt
                # (bei Paaren wie 'dr kongo' splittet p falsch)
                pass
    # Sicherere Validierung: prüfe ob Home+Away aus bekanntem Paar stammen
    for r in final:
        teams_str = r["teams"]
        matched = any(
            teams_str.startswith(hk + " ") and teams_str[len(hk)+1:] in KNOWN_TEAM_KEYS
            for hk in KNOWN_TEAM_KEYS
        )
        if not matched:
            errors.append(teams_str)

    if errors:
        print(f"⚠️  Folgende Einträge konnten nicht validiert werden: {errors}")
        print("   → Bitte KNOWN_TEAM_KEYS oder TEAM_MAP prüfen!")
    else:
        print("✅ Alle Team-Keys validiert – kein Mismatch erkannt.")
