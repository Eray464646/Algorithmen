// Multiple-Choice-Fragen zum Thema: Bäume, Suchen, Spanning-Tree-Heuristik

const mcFragen = [
  {
    id: 1,
    question: "Warum ist ein Baum mit 3 Knoten und 5 Kanten nicht kreisfrei?",
    options: [
      "Weil ein Baum immer genau N−1 Kanten hat; bei 3 Knoten also 2 Kanten — 5 Kanten erzwingen Zyklen.",
      "Weil in Bäumen die Knotengrade alle gleich sein müssen, und 5 Kanten das verhindert.",
      "Weil ein Baum maximal N Kanten haben darf; 5 überschreitet diese Grenze.",
      "Weil ein Baum keine Blätter haben darf und 5 Kanten bedeuten mindestens ein Blatt."
    ],
    correctIndex: 0,
    explanation: "Definition: Ein Baum mit N Knoten hat genau N−1 Kanten. Bei N=3 wären es 2. 5 Kanten → mindestens ein Kreis."
  },
  {
    id: 2,
    question: "Warum liefert die Spanning-Tree-Heuristik (für metrisches TSP) oft gute Ergebnisse?",
    options: [
      "Sie nutzt einen minimalen Spannbaum (MST), bevorzugt kurze Kanten, verletzt die Dreiecksungleichung nicht und ist höchstens Faktor 2 vom Optimum entfernt.",
      "Sie testet exhaustiv alle Permutationen und findet dadurch immer die optimale Tour.",
      "Sie sortiert die Knoten topologisch und garantiert dadurch eine 1,5-Approximation.",
      "Sie verwendet Hashing, um Kantenkosten in O(1) zu minimieren."
    ],
    correctIndex: 0,
    explanation: "MST-basierte Heuristik (z. B. Twice-Around-The-Tree): kurze Kanten, Dreiecksungleichung, bewiesene 2-Approximation im metrischen Fall."
  },
  {
    id: 3,
    question: "Welche Laufzeit hat die lineare Suche?",
    options: [
      "O(n)",
      "O(1)",
      "O(log n)",
      "O(n log n)"
    ],
    correctIndex: 0,
    explanation: "Worst Case prüft die lineare Suche alle n Elemente → O(n)."
  },
  {
    id: 4,
    question: "Unter welcher Voraussetzung kann man die Laufzeit bei der Suche deutlich verbessern?",
    options: [
      "Die Suchmenge ist sortiert.",
      "Die Daten liegen in zufälliger Reihenfolge vor.",
      "Die Daten enthalten Duplikate.",
      "Die Daten sind in einem Textformat gespeichert."
    ],
    correctIndex: 0,
    explanation: "Sortierte Daten erlauben z. B. binäre oder Proportional-/Interpolation-Suche → schneller als linear."
  },
  {
    id: 5,
    question: "Was macht die binäre Suche?",
    options: [
      "Sie halbiert den Suchraum und fährt nur in der relevanten Hälfte fort.",
      "Sie durchsucht immer sequentiell vom Anfang bis zum Ende.",
      "Sie permutiert die Daten zufällig, bis das Element gefunden wird.",
      "Sie speichert alle Elemente in einem Hash, um O(1) zu erreichen."
    ],
    correctIndex: 0,
    explanation: "Divide-and-Conquer: Mitte prüfen, Hälfte verwerfen, in der anderen Hälfte weitersuchen."
  },
  {
    id: 6,
    question: "Bei welcher Voraussetzung kann man die Proportional-/Interpolationssuche erfolgreich anwenden?",
    options: [
      "Die Schlüssel sind gleichmäßig verteilt (und die Daten sortiert).",
      "Die Schlüssel sind stark geclustert und unsortiert.",
      "Die Daten sind unsortiert, aber eindeutig.",
      "Die Datenmenge ist extrem klein (z. B. n < 5)."
    ],
    correctIndex: 0,
    explanation: "Interpolation nutzt Positionsschätzungen — das funktioniert gut bei sortierten Daten mit annähernd gleichmäßiger Verteilung."
  },
  {
    id: 7,
    question: "Binäre Suche: Vorgehen, Prinzip und Komplexität?",
    options: [
      "Sortierte Daten, Mitte vergleichen, Hälfte verwerfen; Prinzip: Divide-and-Conquer; Laufzeit: O(log n).",
      "Unsortierte Daten, linear prüfen; Prinzip: Greedy; Laufzeit: O(n).",
      "Sortierte Daten, Dreiteilung des Arrays; Prinzip: Backtracking; Laufzeit: O(√n).",
      "Hash-Tabelle aufbauen; Prinzip: Amortisiert; Laufzeit: O(1)."
    ],
    correctIndex: 0,
    explanation: "Klassisch: Mitte prüfen, Bereich halbieren. Theoretisch O(log n), setzt Sortierung voraus."
  },
  {
    id: 8,
    question: "Lineare Suche: Vorgehen und geeignete Anwendungen?",
    options: [
      "Elemente der Reihe nach prüfen; gut bei kleinen/unsortierten Mengen oder einmaligen Suchen ohne Vorverarbeitung.",
      "Immer die Mitte prüfen; gut bei großen sortierten Arrays.",
      "Auf Hash umorganisieren; gut bei statischen Schlüsseluniversen.",
      "Daten zuerst sortieren; gut für wiederholte Suchen in sehr großen Daten."
    ],
    correctIndex: 0,
    explanation: "Linear = sequentiell prüfen. Vorteil: keine Sortierung/Struktur nötig; sinnvoll bei klein/seltenen Suchen."
  }
];

// Export als ES6-Modul
export default mcFragen;
