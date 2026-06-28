// ============================================================
// bonus-inject.js  v1  –  WM 2026 Bonus-Tipps Auswertung
//
// Wertet die Bonus-Fragen "Wer gewinnt Gruppe X?" aus.
// Echte Gruppensieger werden hier gepflegt (nach Spieltag 3).
// Zeigt Punkte im Bonus-Tab und erweitert den Statistik-Tab.
//
// Einbinden in index.html (NACH ko-inject.js):
//   <script src="bonus-inject.js"></script>
//
// Gruppensieger Stand 28.06.2026 (alle Gruppen abgeschlossen):
//   A=Mexiko  B=Schweiz  C=Brasilien  D=Türkei  E=Deutschland(*)
//   F=Niederlande  G=Belgien  H=Spanien  I=Frankreich
//   J=Argentinien  K=Kolumbien  L=England
//
// (*) Gruppe E: Ecuador gewann Gruppe E (Ecuador 2:1 Deutschland
//     im letzten Spiel → Deutschland ausgeschieden), daher E=Ecuador
//     → KI hatte Deutschland → ❌
// ============================================================

(function () {
  'use strict';

  // ── ECHTE GRUPPENSIEGER (hier pflegen!) ──────────────────
  // Wert = tatsächlicher Gruppensieger (Kleinschreibung, normalisiert)
  // Sobald eine Gruppe abgeschlossen ist, hier eintragen.
  // Noch offene Gruppen → null lassen.
  var REAL_WINNERS = {
    A: 'mexiko',
    B: 'schweiz',
    C: 'brasilien',
    D: 'türkei',        // KI: usa  → ❌
    E: 'ecuador',       // KI: deutschland → ❌ (Ecuador schlug Deutschland 2:1)
    F: 'niederlande',
    G: 'belgien',
    H: 'spanien',
    I: 'frankreich',
    J: 'argentinien',
    K: 'kolumbien',
    L: 'england',
  };

  // ── BONUS-FRAGEN (KI-Prognosen + je 4 Punkte bei Treffer) ─
  // Format: { id, group, frage, kiTipp (normalisiert), flag, conf }
  var BONUS_FRAGEN = [
    { id:'B01', group:'A', frage:'Wer gewinnt Gruppe A?', kiTipp:'mexiko',       flag:'🇲🇽', conf:'Sehr hoch' },
    { id:'B02', group:'B', frage:'Wer gewinnt Gruppe B?', kiTipp:'schweiz',      flag:'🇨🇭', conf:'Sehr hoch' },
    { id:'B03', group:'C', frage:'Wer gewinnt Gruppe C?', kiTipp:'brasilien',    flag:'🇧🇷', conf:'Hoch'      },
    { id:'B04', group:'D', frage:'Wer gewinnt Gruppe D?', kiTipp:'usa',          flag:'🇺🇸', conf:'Sehr hoch' },
    { id:'B05', group:'E', frage:'Wer gewinnt Gruppe E?', kiTipp:'deutschland',  flag:'🇩🇪', conf:'Sehr hoch' },
    { id:'B06', group:'F', frage:'Wer gewinnt Gruppe F?', kiTipp:'niederlande',  flag:'🇳🇱', conf:'Hoch'      },
    { id:'B07', group:'G', frage:'Wer gewinnt Gruppe G?', kiTipp:'belgien',      flag:'🇧🇪', conf:'Hoch'      },
    { id:'B08', group:'H', frage:'Wer gewinnt Gruppe H?', kiTipp:'spanien',      flag:'🇪🇸', conf:'Sehr hoch' },
    { id:'B09', group:'I', frage:'Wer gewinnt Gruppe I?', kiTipp:'frankreich',   flag:'🇫🇷', conf:'Sehr hoch' },
    { id:'B10', group:'J', frage:'Wer gewinnt Gruppe J?', kiTipp:'argentinien',  flag:'🇦🇷', conf:'Sehr hoch' },
    { id:'B11', group:'K', frage:'Wer gewinnt Gruppe K?', kiTipp:'kolumbien',    flag:'🇨🇴', conf:'Hoch'      },
    { id:'B12', group:'L', frage:'Wer gewinnt Gruppe L?', kiTipp:'england',      flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', conf:'Sehr hoch' },
  ];

  // Flaggen-Map für echte Sieger (für Anzeige)
  var FLAG_MAP = {
    'mexiko':'🇲🇽','schweiz':'🇨🇭','brasilien':'🇧🇷','türkei':'🇹🇷',
    'usa':'🇺🇸','ecuador':'🇪🇨','deutschland':'🇩🇪','niederlande':'🇳🇱',
    'belgien':'🇧🇪','spanien':'🇪🇸','frankreich':'🇫🇷','argentinien':'🇦🇷',
    'kolumbien':'🇨🇴','england':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','portugal':'🇵🇹','japan':'🇯🇵',
    'marokko':'🇲🇦','australien':'🇦🇺','elfenbeinküste':'🇨🇮','südafrika':'🇿🇦',
    'norwegen':'🇳🇴','österreich':'🇦🇹','kroatien':'🇭🇷','cape verde':'🇨🇻',
    'cape verde islands':'🇨🇻',
  };

  function getFlag(name) { return FLAG_MAP[name] || ''; }

  function confColor(c) {
    if (c === 'Sehr hoch') return '#49d28c';
    if (c === 'Hoch')      return '#67a4ff';
    if (c === 'Mittel')    return '#f3b83b';
    return '#ff5d73';
  }

  // ── CSS ──────────────────────────────────────────────────
  var css = `
.bonus-result-block{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid var(--line)}
.bonus-result-block .brh{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:800;margin-bottom:6px}
.bonus-result-block .brs{font-size:14px;font-weight:700;margin-bottom:4px}
.bonus-pts-badge{font-size:12px;font-weight:800;padding:3px 10px;border-radius:999px;display:inline-block;margin-top:2px}
.bonus-pts-badge.hit{background:rgba(73,210,140,.15);color:#49d28c}
.bonus-pts-badge.miss{background:rgba(255,93,115,.12);color:#ff5d73}
.bonus-pts-badge.open{background:rgba(168,180,207,.1);color:#a8b4cf}
.bonus-stat-section{margin-top:32px;padding-top:24px;border-top:1px solid var(--line)}
.bonus-stat-section h3{font-size:18px;font-weight:900;margin-bottom:16px;color:var(--text)}
.bonus-kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:20px}
.bonus-kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;text-align:center}
.bonus-kpi .bk-lbl{font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:6px}
.bonus-kpi .bk-val{font-size:24px;font-weight:900}
.bonus-tbl{width:100%;border-collapse:collapse;font-size:13px}
.bonus-tbl th{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;padding:8px 6px;border-bottom:1px solid var(--line);text-align:left}
.bonus-tbl td{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.bonus-tbl .row-hit td:first-child{border-left:3px solid #49d28c}
.bonus-tbl .row-miss td:first-child{border-left:3px solid #ff5d73}
.bonus-tbl .row-open td:first-child{border-left:3px solid var(--muted)}
`;
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── AUSWERTUNG ───────────────────────────────────────────
  function auswerten() {
    var totalPts = 0, hits = 0, played = 0;
    var tableRows = [];

    BONUS_FRAGEN.forEach(function (q) {
      var real = REAL_WINNERS[q.group]; // null = noch offen
      var isOpen = (real === null || real === undefined);
      var isHit  = !isOpen && (real === q.kiTipp);
      var pts    = isHit ? 4 : 0;

      if (!isOpen) {
        played++;
        if (isHit) { hits++; totalPts += 4; }
      }

      // ── Bonus-Karte im Bonus-Tab aktualisieren ──────────
      // Suche Karte anhand der id (bc-id enthält B01 etc.)
      var card = findBonusCard(q.id);
      if (card) {
        // Vorhandenen Block entfernen falls schon vorhanden
        var old = card.querySelector('.bonus-result-block');
        if (old) old.remove();

        var block = document.createElement('div');
        block.className = 'bonus-result-block';

        if (isOpen) {
          block.innerHTML =
            '<div class="brh">⏳ Ergebnis noch ausstehend</div>' +
            '<div class="brs" style="color:var(--muted)">Gruppe ' + q.group + ' noch nicht abgeschlossen</div>' +
            '<span class="bonus-pts-badge open">Noch offen</span>';
        } else {
          var realFlag = getFlag(real);
          var realName = real.charAt(0).toUpperCase() + real.slice(1);
          block.innerHTML =
            '<div class="brh">✅ Offizielles Ergebnis</div>' +
            '<div class="brs">' + realFlag + ' ' + realName + ' gewinnt Gruppe ' + q.group + '</div>' +
            '<span class="bonus-pts-badge ' + (isHit ? 'hit' : 'miss') + '">' +
              (isHit ? '✅ 4 Pkt – Richtig getippt!' : '❌ 0 Pkt – Falsch getippt') +
            '</span>';
        }

        // Einfügen vor mc-conf
        var conf = card.querySelector('.bc-conf');
        conf ? card.insertBefore(block, conf) : card.appendChild(block);

        // Karte visuell markieren
        if (!isOpen) {
          card.style.borderColor = isHit ? 'rgba(73,210,140,.4)' : 'rgba(255,93,115,.3)';
        }
      }

      // ── Zeile für Statistik-Tabelle ──────────────────────
      var rowClass = isOpen ? 'row-open' : (isHit ? 'row-hit' : 'row-miss');
      var kiFlag = q.flag;
      var kiName = q.kiTipp.charAt(0).toUpperCase() + q.kiTipp.slice(1);
      var realDisplay = isOpen
        ? '<em style="color:var(--muted)">noch offen</em>'
        : (getFlag(real) + ' ' + real.charAt(0).toUpperCase() + real.slice(1));
      var statusBadge = isOpen
        ? '<span style="color:var(--muted);font-size:11px">⏳ offen</span>'
        : (isHit
            ? '<span style="background:rgba(73,210,140,.15);color:#49d28c;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700">✅ 4 Pkt</span>'
            : '<span style="background:rgba(255,93,115,.12);color:#ff5d73;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700">❌ 0 Pkt</span>');

      tableRows.push(
        '<tr class="' + rowClass + '">' +
          '<td style="font-weight:700">' + q.id + '</td>' +
          '<td>Gruppe ' + q.group + '</td>' +
          '<td>' + kiFlag + ' ' + kiName + '</td>' +
          '<td>' + realDisplay + '</td>' +
          '<td>' + statusBadge + '</td>' +
          '<td style="text-align:center;font-size:17px;font-weight:900;color:' + (isHit ? '#49d28c' : (isOpen ? 'var(--muted)' : '#ff5d73')) + '">' + (isOpen ? '–' : pts) + '</td>' +
        '</tr>'
      );
    });

    // ── Statistik-Tab erweitern ──────────────────────────
    buildBonusStatistik(totalPts, hits, played, tableRows);
  }

  // ── BONUS-KARTE FINDEN ───────────────────────────────────
  function findBonusCard(id) {
    var cards = document.querySelectorAll('.bcard');
    for (var i = 0; i < cards.length; i++) {
      var idEl = cards[i].querySelector('.bc-id');
      if (idEl && idEl.textContent.trim().toUpperCase().indexOf(id) !== -1) {
        return cards[i];
      }
    }
    return null;
  }

  // ── STATISTIK-SEKTION AUFBAUEN ───────────────────────────
  function buildBonusStatistik(totalPts, hits, played, tableRows) {
    var statSection = document.getElementById('tab-statistik');
    if (!statSection) return;

    // Alten Block entfernen
    var old = document.getElementById('bonus-stat-block');
    if (old) old.remove();

    var remaining = BONUS_FRAGEN.length - played;
    var maxPts    = BONUS_FRAGEN.length * 4;
    var maxRemain = remaining * 4;

    var block = document.createElement('div');
    block.id = 'bonus-stat-block';
    block.className = 'bonus-stat-section';
    block.innerHTML =
      '<h3>🎯 Bonus-Tipps Auswertung (Gruppensieger)</h3>' +
      '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">' +
        'Jede richtige Antwort "Wer gewinnt Gruppe X?" gibt <strong style="color:var(--gold)">4 Punkte</strong> · ' +
        played + ' von ' + BONUS_FRAGEN.length + ' Gruppen abgeschlossen · ' +
        remaining + ' noch offen (max. ' + maxRemain + ' Pkt noch möglich)' +
      '</p>' +
      '<div class="bonus-kpi-grid">' +
        kpiBox('Bonus Gespielt', played + '/' + BONUS_FRAGEN.length, 'var(--text)') +
        kpiBox('🎯 Bonus Punkte', totalPts, 'var(--gold)') +
        kpiBox('Max. erreichbar', (totalPts + maxRemain), 'var(--blue)') +
        kpiBox('✅ Richtig', hits, 'var(--green)') +
        kpiBox('❌ Falsch', (played - hits), 'var(--red)') +
        kpiBox('Noch offen', remaining, 'var(--muted)') +
      '</div>' +
      '<div style="overflow-x:auto">' +
        '<table class="bonus-tbl">' +
          '<thead><tr>' +
            '<th>ID</th><th>Gruppe</th><th>KI-Tipp</th><th>Richtiger Sieger</th><th>Ergebnis</th><th>Punkte</th>' +
          '</tr></thead>' +
          '<tbody>' + tableRows.join('') + '</tbody>' +
          '<tfoot><tr style="font-weight:900;background:rgba(243,184,59,.06)">' +
            '<td colspan="5" style="padding:10px 6px;font-size:13px">🎯 Bonus-Gesamt</td>' +
            '<td style="text-align:center;font-size:18px;font-weight:900;color:var(--gold)">' + totalPts + '</td>' +
          '</tr></tfoot>' +
        '</table>' +
      '</div>';

    // Gesamtpunkte-Badge im Statistik-Tab aktualisieren
    updateGesamtpunkte(totalPts);

    statSection.appendChild(block);
  }

  function kpiBox(lbl, val, col) {
    return '<div class="bonus-kpi">' +
      '<div class="bk-lbl">' + lbl + '</div>' +
      '<div class="bk-val" style="color:' + col + '">' + val + '</div>' +
    '</div>';
  }

  // ── GESAMTPUNKTE AKTUALISIEREN ───────────────────────────
  // Sucht das Gesamt-Punkte-Element im Statistik-Tab und addiert Bonus-Punkte
  function updateGesamtpunkte(bonusPts) {
    // Ko-Inject schreibt Punkte in #ko-pts
    // Gruppen-Punkte kommen aus dem bestehenden Statistik-Tab
    // Wir suchen nach einem Element mit id="gesamt-pts" oder ähnlichem
    // und aktualisieren ein Bonus-Summary-Badge
    var el = document.getElementById('bonus-pts-total-display');
    if (el) el.textContent = bonusPts;
  }

  // ── INIT ─────────────────────────────────────────────────
  // Wir hängen uns an loadResults (wie ko-inject.js)
  var _origLoad = window.loadResults;
  window.loadResults = function () {
    var p = (_origLoad ? _origLoad() : Promise.resolve());
    Promise.resolve(p).then(function () {
      // Kurz warten bis DOM vollständig gerendert
      setTimeout(auswerten, 1200);
    });
  };

  // Initial laden falls DOM bereits bereit
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(auswerten, 1400);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(auswerten, 1400);
    });
  }

})();
