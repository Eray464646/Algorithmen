// algorithmen.js - Fragen zum Thema Algorithmen

const algorithmenQuestions = [

// ==================== INSERTION SORT (ERSATZ FÜR SELECTION SORT) ====================

    {
        question: "Welche Worst-Case Laufzeit hat Insertion Sort?",
        options: [
            { text: "O(n)", correct: false },
            { text: "O(n²)", correct: true },
            { text: "O(n·log n)", correct: false },
            { text: "O(log n)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Insertion Sort hat im Worst Case O(n²), z. B. bei umgekehrter Sortierung. Im Best Case (bereits sortiert) ist die Laufzeit O(n)."
    },

    {
        question: "Was ist das Grundprinzip von Insertion Sort?",
        options: [
            { text: "Finde das Maximum und tausche es ans Ende", correct: false },
            { text: "Finde das Minimum im unsortierten Teil und tausche es an die erste Position", correct: false },
            { text: "Teile das Array rekursiv in zwei Hälften", correct: false },
            { text: "Füge Elemente nacheinander in die richtige Position im bereits sortierten Präfix ein", correct: true }
        ],
        topic: "Algorithmen",
        feedback: "Insertion Sort hält links ein sortiertes Präfix und fügt das nächste Element durch Verschieben (Shifts) an die passende Position ein."
    },

    {
        question: "Welche Eigenschaften treffen auf Insertion Sort zu? (Mehrfachauswahl möglich)",
        options: [
            { text: "Ist stabil", correct: true },
            { text: "Ist in-situ", correct: true },
            { text: "Hat konstantes Laufzeitverhalten", correct: false },
            { text: "Ist schneller bei bereits (nahezu) sortierten Listen", correct: true }
        ],
        topic: "Algorithmen",
        feedback: "Insertion Sort ist stabil und in-situ. Die Laufzeit ist datenabhängig: Best Case O(n), Average/Worst Case O(n²). Auf fast sortierten Daten sehr effizient."
    },

// ==================== BREITENSUCHE (BFS) — ERSATZ FÜR TIEFENSUCHE (DFS) ====================

    {
        question: "Was bedeutet BFS?",
        options: [
            { text: "Breadth-First Search (Breitensuche)", correct: true },
            { text: "Binary-First Search", correct: false },
            { text: "Balanced-First Search", correct: false },
            { text: "Branch-First Search", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "BFS steht für Breadth-First Search, auf Deutsch Breitensuche."
    },

    {
        question: "Welche Datenstruktur wird bei der Breitensuche (BFS) verwendet?",
        options: [
            { text: "Queue", correct: true },
            { text: "Stack", correct: false },
            { text: "Array", correct: false },
            { text: "Heap", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "BFS verwendet eine Queue, um die Knoten Ebene für Ebene abzuarbeiten."
    },

    {
        question: "Welche Laufzeit hat die Breitensuche (BFS)?",
        options: [
            { text: "O(n)", correct: false },
            { text: "O(m)", correct: false },
            { text: "O(n + m)", correct: true },
            { text: "O(n²)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "BFS hat Laufzeit O(n+m), wobei n die Anzahl der Knoten und m die Anzahl der Kanten ist."
    },

    {
        question: "Welche Aussage trifft auf die BFS in ungewichteten Graphen zu?",
        options: [
            { text: "Sie findet beliebige Wege", correct: false },
            { text: "Sie findet kürzeste Wege (nach Anzahl Kanten) vom Startknoten", correct: true },
            { text: "Sie minimiert die Summe der Gewichte", correct: false },
            { text: "Sie erzeugt keine Baumstruktur", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "BFS liefert kürzeste Pfade in ungewichteten Graphen und erzeugt dabei einen BFS-Baum."
    },

    {
        question: "Was entsteht bei der Breitensuche (BFS)?",
        options: [
            { text: "Ein kürzester-Wege-Baum vom Startknoten (in ungewichteten Graphen)", correct: true },
            { text: "Eine sortierte Liste", correct: false },
            { text: "Eine Adjazenzmatrix", correct: false },
            { text: "Ein minimaler Spannbaum", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Die von BFS verfolgten Eltern-Kanten bilden einen BFS-Baum (Level-Struktur) ab dem Startknoten."
    },

// ==================== TOPOLOGISCHE SORTIERUNG ====================

    {
        question: "Für welche Art von Graphen ist eine topologische Sortierung möglich?",
        options: [
            { text: "Nur für ungerichtete Graphen", correct: false },
            { text: "Nur für kreisfreie gerichtete Graphen (DAG)", correct: true },
            { text: "Für alle Graphen", correct: false },
            { text: "Nur für vollständige Graphen", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Topologische Sortierung ist nur in kreisfreien gerichteten Graphen (DAG = Directed Acyclic Graph) möglich."
    },

    {
        question: "Mit welchem Algorithmus kann eine topologische Sortierung durchgeführt werden?",
        options: [
            { text: "Nur mit DFS", correct: false },
            { text: "Nur mit BFS", correct: false },
            { text: "Mit DFS (Finish-Zeiten) oder mit Kahn's Algorithmus (BFS/In-Degrees)", correct: true },
            { text: "Mit Dijkstra", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Zwei gängige Verfahren: DFS nach absteigender Abschlusszeit oder Kahn's Algorithmus (BFS-basiert via In-Degrees)."
    },

// ==================== PRIM ALGORITHMUS ====================

    {
        question: "Was berechnet der Algorithmus von Prim?",
        options: [
            { text: "Kürzeste Wege", correct: false },
            { text: "Minimalen Spannbaum (MST)", correct: true },
            { text: "Maximalen Fluss", correct: false },
            { text: "Euler-Tour", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Prim berechnet einen minimalen Spannbaum (Minimum Spanning Tree, MST) in einem gewichteten, zusammenhängenden, ungerichteten Graphen."
    },

    {
        question: "Welche Datenstruktur wird bei Prim verwendet?",
        options: [
            { text: "Stack", correct: false },
            { text: "Queue", correct: false },
            { text: "Priority Queue", correct: true },
            { text: "Linked List", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Prim verwendet eine Priority Queue, um immer die günstigste Kante zum Baum hinzuzufügen."
    },

    {
        question: "Was ist das Grundprinzip von Prim?",
        options: [
            { text: "Sortiere alle Kanten und füge die günstigsten hinzu", correct: false },
            { text: "Beginne mit einem Knoten und füge immer die günstigste Kante zwischen Baum und Nicht-Baum hinzu", correct: true },
            { text: "Finde den kürzesten Weg von einem Startknoten", correct: false },
            { text: "Teile den Graphen rekursiv", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Prim beginnt mit einem beliebigen Knoten und erweitert den Baum schrittweise um die günstigste Kante, die einen Knoten des Baumes mit einem noch nicht aufgenommenen Knoten verbindet."
    },

    {
        question: "Welche Laufzeit hat Prim bei Verwendung einer Priority Queue?",
        options: [
            { text: "O(n²)", correct: false },
            { text: "O(m·log n)", correct: true },
            { text: "O(n·m)", correct: false },
            { text: "O(n + m)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Mit binärem Heap: O(m·log n)."
    },

    {
        question: "Warum entstehen bei Prim keine Kreise?",
        options: [
            { text: "Weil in jedem Schritt genau eine Kante gewählt wird, die einen neuen (noch nicht im Baum enthaltenen) Knoten anbindet", correct: true },
            { text: "Weil nur sortierte Kanten verwendet werden", correct: false },
            { text: "Weil DFS verwendet wird", correct: false },
            { text: "Weil nur ungerichtete Graphen erlaubt sind", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Prim wählt stets die günstigste Kante über dem Schnitt (Baum vs. Rest) und fügt damit genau einen neuen Knoten hinzu – dadurch kann kein Zyklus entstehen."
    },

// ==================== NETZWERKFLÜSSE (FORD-FULKERSON) ====================

    {
        question: "Was berechnet der Ford-Fulkerson Algorithmus?",
        options: [
            { text: "Minimalen Spannbaum", correct: false },
            { text: "Kürzesten Weg", correct: false },
            { text: "Maximalen Fluss", correct: true },
            { text: "Euler-Tour", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ford-Fulkerson berechnet den maximalen Fluss von einer Quelle s zu einer Senke t in einem Flussnetzwerk."
    },

    {
        question: "Was ist ein Residualgraph?",
        options: [
            { text: "Der ursprüngliche Graph", correct: false },
            { text: "Ein Graph mit den Restkapazitäten", correct: true },
            { text: "Ein minimaler Spannbaum", correct: false },
            { text: "Ein sortierter Graph", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Der Residualgraph zeigt die Restkapazitäten (Differenz zwischen maximaler Kapazität und aktuellem Fluss) und erlaubt Rückflüsse."
    },

    {
        question: "Was sind die beiden Bedingungen für einen zulässigen Fluss?",
        options: [
            { text: "Kapazitätsbedingung und Flusserhaltungsbedingung", correct: true },
            { text: "Minimalbedingung und Maximalbedingung", correct: false },
            { text: "Sortier- und Suchbedingung", correct: false },
            { text: "Richtungs- und Gewichtsbedingung", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ein zulässiger Fluss muss die Kapazitätsbedingung (0 ≤ f ≤ u) und die Flusserhaltungsbedingung (Einfluss = Ausfluss außer bei Quelle/Senke) erfüllen."
    },

    {
        question: "Wann terminiert Ford-Fulkerson garantiert?",
        options: [
            { text: "Immer", correct: false },
            { text: "Bei rationalen Kapazitäten", correct: true },
            { text: "Nur bei ungerichteten Graphen", correct: false },
            { text: "Nur bei balancierten Graphen", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ford-Fulkerson terminiert garantiert bei rationalen Kapazitäten. Bei irrationalen Werten kann es zu Nicht-Terminierung kommen."
    },

    {
        question: "Was bedeutet 'fluss-augmentierender Weg'?",
        options: [
            { text: "Ein Weg, auf dem der Fluss erhöht werden kann", correct: true },
            { text: "Ein Weg mit maximaler Kapazität", correct: false },
            { text: "Ein kürzester Weg", correct: false },
            { text: "Ein Weg ohne Rückflüsse", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ein fluss-augmentierender Weg ist ein Weg von der Quelle zur Senke im Residualgraphen, auf dem der Fluss noch erhöht werden kann."
    },

// ==================== O-NOTATION / LAUFZEITANALYSE ====================

    {
        question: "Was bedeutet O(n²)?",
        options: [
            { text: "Lineare Laufzeit", correct: false },
            { text: "Quadratische Laufzeit", correct: true },
            { text: "Logarithmische Laufzeit", correct: false },
            { text: "Konstante Laufzeit", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "O(n²) bedeutet quadratische Laufzeit - bei doppelter Eingabegröße vervierfacht sich die Laufzeit."
    },

    {
        question: "Welche Aussagen zur O-Notation sind korrekt? (Mehrfachauswahl)",
        options: [
            { text: "Konstante Faktoren werden ignoriert", correct: true },
            { text: "Additive Konstanten werden ignoriert", correct: true },
            { text: "Nur der am schnellsten wachsende Term zählt", correct: true },
            { text: "Alle Terme müssen berücksichtigt werden", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Bei der O-Notation werden konstante Faktoren und additive Konstanten ignoriert. Nur der dominante (am schnellsten wachsende) Term bleibt übrig."
    },

    {
        question: "Ordnen Sie folgende Komplexitätsklassen von schnell nach langsam: O(n!), O(1), O(n²), O(log n), O(2ⁿ), O(n), O(n·log n), O(n³)",
        write: true,
        solution: `
    <strong>Richtige Reihenfolge von schnell nach langsam:</strong>
    <ol>
        <li>O(1) - konstant</li>
        <li>O(log n) - logarithmisch</li>
        <li>O(n) - linear</li>
        <li>O(n·log n) - linear-logarithmisch</li>
        <li>O(n²) - quadratisch</li>
        <li>O(n³) - kubisch</li>
        <li>O(2ⁿ) - exponentiell</li>
        <li>O(n!) - faktoriell</li>
    </ol>
    `,
        topic: "Algorithmen",
        feedback: "Die Reihenfolge von schnell nach langsam: O(1) < O(log n) < O(n) < O(n·log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)."
    },

    {
        question: "Welche Laufzeit hat Merge Sort im Worst Case?",
        options: [
            { text: "O(n)", correct: false },
            { text: "O(n²)", correct: false },
            { text: "O(n·log n)", correct: true },
            { text: "O(log n)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Merge Sort hat im Best, Average und Worst Case immer O(n·log n) Laufzeit."
    },

    {
        question: "Welche Laufzeit hat Quick Sort im Average Case?",
        options: [
            { text: "O(n)", correct: false },
            { text: "O(n·log n)", correct: true },
            { text: "O(n²)", correct: false },
            { text: "O(log n)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Quick Sort hat im Average Case O(n·log n), im Worst Case jedoch O(n²)."
    },

// ==================== DATENSTRUKTUREN ====================

    {
        question: "Was ist der Unterschied zwischen Stack und Queue?",
        options: [
            { text: "Stack: LIFO (last in, first out), Queue: FIFO (first in, first out)", correct: true },
            { text: "Stack: FIFO, Queue: LIFO", correct: false },
            { text: "Beide sind LIFO", correct: false },
            { text: "Beide sind FIFO", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Stack folgt dem LIFO-Prinzip (Last In, First Out), Queue dem FIFO-Prinzip (First In, First Out)."
    },

    {
        question: "Was ist ein Vorteil von verketteten Listen gegenüber Arrays?",
        options: [
            { text: "Direkter Zugriff auf Elemente", correct: false },
            { text: "Flexible Größe", correct: true },
            { text: "Schnellerer Zugriff", correct: false },
            { text: "Weniger Speicherverbrauch", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Verkettete Listen haben eine flexible Größe und können dynamisch wachsen/schrumpfen. Arrays haben eine feste Größe."
    },

    {
        question: "Welche Laufzeit hat der Zugriff auf das i-te Element in einem Array?",
        options: [
            { text: "O(1)", correct: true },
            { text: "O(n)", correct: false },
            { text: "O(log n)", correct: false },
            { text: "O(n²)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Arrays bieten direkten Zugriff in O(1) Zeit über die Berechnung: Startadresse + i * Elementgröße."
    },

    {
        question: "Was ist ein Ringspeicher?",
        options: [
            { text: "Ein Array, das im Kreis läuft und alte Daten überschreibt", correct: true },
            { text: "Eine verkettete Liste", correct: false },
            { text: "Ein Baum", correct: false },
            { text: "Ein Hash Table", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ein Ringspeicher (Ring Buffer) ist ein Array mit fester Größe, bei dem die Zeiger im Kreis laufen und älteste Daten überschrieben werden."
    },

// ==================== GRAPHENTHEORIE ====================

    {
        question: "Was bedeutet 'adjazent' in der Graphentheorie?",
        options: [
            { text: "Zwei Knoten sind durch eine Kante verbunden", correct: true },
            { text: "Zwei Knoten haben den gleichen Grad", correct: false },
            { text: "Zwei Kanten kreuzen sich", correct: false },
            { text: "Ein Knoten hat keine Nachbarn", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Zwei Knoten sind adjazent (benachbart), wenn sie durch eine Kante direkt miteinander verbunden sind."
    },

    {
        question: "Wann existiert in einem (ungerichteten) Graphen eine Eulertour?",
        options: [
            { text: "Wenn der Graph zusammenhängend ist und alle Knotengrade gerade sind", correct: true },
            { text: "Wenn alle Knotengrade ungerade sind", correct: false },
            { text: "Wenn der Graph vollständig ist", correct: false },
            { text: "Immer", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Eine Eulertour existiert genau dann, wenn der Graph (abgesehen von isolierten Knoten) zusammenhängend ist und alle Knoten geraden Grad haben."
    },

    {
        question: "Was ist ein zusammenhängender Graph?",
        options: [
            { text: "Ein Graph, in dem je zwei Knoten verbunden sind", correct: true },
            { text: "Ein Graph ohne Kreise", correct: false },
            { text: "Ein vollständiger Graph", correct: false },
            { text: "Ein Graph mit geraden Knotengraden", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ein Graph ist zusammenhängend, wenn es zwischen je zwei Knoten einen Weg gibt."
    },

    {
        question: "Was ist ein DAG?",
        options: [
            { text: "Directed Acyclic Graph (gerichteter kreisfreier Graph)", correct: true },
            { text: "Directed Array Graph", correct: false },
            { text: "Data Access Graph", correct: false },
            { text: "Double Adjacency Graph", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "DAG steht für Directed Acyclic Graph - ein gerichteter Graph ohne Kreise."
    },

    {
        question: "Was ist ein Spannbaum?",
        options: [
            { text: "Ein Baum, der alle Knoten des Graphen enthält", correct: true },
            { text: "Ein Graph ohne Kanten", correct: false },
            { text: "Ein vollständiger Graph", correct: false },
            { text: "Ein Graph mit maximaler Kantenzahl", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Ein Spannbaum (spanning tree) ist ein Teilgraph, der alle Knoten enthält und ein Baum ist (zusammenhängend und kreisfrei)."
    },

// ==================== OFFENE FRAGEN (AKTUALISIERT) ====================

    {
        question: "Erklären Sie den Unterschied zwischen Best Case, Average Case und Worst Case bei der Laufzeitanalyse.",
        write: true,
        solution: `
    <ul>
        <li><b>Best Case:</b> Die günstigste Eingabe, bei der der Algorithmus am schnellsten ist (z.B. bereits sortiertes Array bei Insertion Sort).</li>
        <li><b>Average Case:</b> Die durchschnittliche Laufzeit über alle möglichen Eingaben.</li>
        <li><b>Worst Case:</b> Die ungünstigste Eingabe, bei der der Algorithmus am längsten braucht. Dieser Fall ist meist am wichtigsten für die Analyse.</li>
    </ul>
    `,
        topic: "Algorithmen",
        feedback: "Der Worst Case ist meist am relevantesten, da er eine obere Schranke garantiert - der Algorithmus wird nie länger brauchen."
    },

    {
        question: "Beschreiben Sie die Funktionsweise der Breitensuche (BFS) in eigenen Worten.",
        write: true,
        solution: `
    <ul>
        <li>BFS durchläuft den Graphen <b>ebenenweise</b> (erst alle Nachbarn, dann deren Nachbarn usw.).</li>
        <li><b>Vorgehen:</b> Starte beim Knoten, markiere ihn, lege ihn in eine <b>Queue</b>; entnimm vorn, besuche alle unbesuchten Nachbarn, füge sie hinten an.</li>
        <li>In ungewichteten Graphen liefert BFS <b>kürzeste Wege</b> (nach Kantenanzahl) vom Startknoten und bildet einen <b>BFS-Baum</b>.</li>
        <li><b>Laufzeit:</b> O(n+m)</li>
    </ul>
    `,
        topic: "Algorithmen",
        feedback: "Denke an Wellen, die sich vom Start ausbreiten: zuerst die nächste Ebene, dann die nächste usw."
    },

    {
        question: "Warum ist Insertion Sort stabil? Geben Sie ein Beispiel.",
        write: true,
        solution: `
    <ul>
        <li><b>Definition stabil:</b> Elemente mit gleichem Schlüssel behalten ihre relative Reihenfolge.</li>
        <li><b>Insertion Sort ist stabil</b>, weil beim Einfügen nach links nur so weit verschoben wird, bis ein <i>kleineres</i> Element gefunden wird. <i>Gleiche</i> Schlüssel werden nicht überholt.</li>
        <li><b>Beispiel:</b> [5a, 2, 5b, 1] → Beim Einfügen von 5b wird es hinter 5a einsortiert; die Reihenfolge der 5er bleibt 5a vor 5b.</li>
    </ul>
    `,
        topic: "Algorithmen",
        feedback: "Beim Einfügen vergleicht man strikt mit '<', nicht mit '≤'. Dadurch bleibt die relative Reihenfolge gleicher Schlüssel erhalten."
    },

    {
        question: "Berechnen Sie die Laufzeit von folgendem Code-Fragment in O-Notation:\n\nfor (i=0; i<n; i++)\n  for (j=0; j<n; j++)\n    for (k=0; k<n; k++)\n      print(i+j+k)",
        write: true,
        solution: `
    <ul>
        <li><b>Äußere Schleife:</b> läuft n-mal</li>
        <li><b>Mittlere Schleife:</b> läuft n-mal (für jede Iteration der äußeren Schleife)</li>
        <li><b>Innere Schleife:</b> läuft n-mal (für jede Iteration der mittleren Schleife)</li>
        <li><b>Gesamt:</b> n × n × n = n³ Durchläufe</li>
        <li><b>Antwort:</b> <b>O(n³)</b> - kubische Laufzeit</li>
    </ul>
    `,
        topic: "Algorithmen",
        feedback: "Drei verschachtelte Schleifen, die jeweils n-mal laufen, ergeben O(n³)."
    },

    {
        question: "Nennen Sie drei Anwendungsbeispiele für Graphenalgorithmen.",
        write: true,
        solution: `
    <ul>
        <li><b>Navigation/Routenplanung:</b> Kürzeste Wege (Dijkstra)</li>
        <li><b>Netzwerkplanung:</b> Minimale Spannbäume (Prim/Kruskal) für Versorgungsnetze</li>
        <li><b>Abhängigkeiten:</b> Topologische Sortierung für Build-Systeme oder Studienpläne</li>
        <li><b>Soziale Netzwerke:</b> Zusammenhangskomponenten finden (BFS/DFS)</li>
        <li><b>Logistik:</b> Maximaler Fluss (Ford-Fulkerson) für Transportnetzwerke</li>
        <li><b>Tourenplanung:</b> Euler-Tour für Müllabfuhr oder Postboten</li>
    </ul>
    `,
        topic: "Algorithmen",
        feedback: "Graphenalgorithmen haben vielfältige praktische Anwendungen in Navigation, Netzwerkplanung, Logistik und mehr."
    },

// ==================== ZUSÄTZLICHE MULTIPLE CHOICE ====================

    {
        question: "Welche Sortieralgorithmen haben O(n·log n) Laufzeit im Average Case? (Mehrfachauswahl)",
        options: [
            { text: "Merge Sort", correct: true },
            { text: "Quick Sort", correct: true },
            { text: "Heap Sort", correct: true },
            { text: "Insertion Sort", correct: false },
            { text: "Bubble Sort", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Merge Sort, Quick Sort (Average) und Heap Sort haben alle O(n·log n) Laufzeit. Insertion Sort und Bubble Sort haben im Average/Worst Case O(n²)."
    },

    {
        question: "Was ist der Unterschied zwischen DFS und BFS?",
        options: [
            { text: "DFS: Tiefe zuerst (Stack), BFS: Breite zuerst (Queue)", correct: true },
            { text: "DFS: Breite zuerst (Queue), BFS: Tiefe zuerst (Stack)", correct: false },
            { text: "Beide verwenden Stacks", correct: false },
            { text: "Beide verwenden Queues", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "DFS geht erst in die Tiefe (Stack/Rekursion), BFS geht erst in die Breite (Queue)."
    },

    {
        question: "Welche Eigenschaft muss ein Graph für Prim/Kruskal haben?",
        options: [
            { text: "Gerichtet", correct: false },
            { text: "Ungerichtet, zusammenhängend, gewichtet", correct: true },
            { text: "Kreisfrei", correct: false },
            { text: "Vollständig", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Prim und Kruskal arbeiten auf ungerichteten, zusammenhängenden, gewichteten Graphen, um einen MST zu finden."
    },

    {
        question: "Was bedeutet 'in-situ' bei Sortieralgorithmen?",
        options: [
            { text: "Kein zusätzlicher Speicher außer konstantem Hilfsspeicher wird benötigt", correct: true },
            { text: "Der Algorithmus ist rekursiv", correct: false },
            { text: "Der Algorithmus ist stabil", correct: false },
            { text: "Der Algorithmus ist schnell", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "In-situ bedeutet, dass die Sortierung direkt im ursprünglichen Array erfolgt ohne zusätzlichen Speicher (außer konstantem Hilfsspeicher)."
    },

    {
        question: "Welche Laufzeit hat die binäre Suche in einem sortierten Array?",
        options: [
            { text: "O(1)", correct: false },
            { text: "O(log n)", correct: true },
            { text: "O(n)", correct: false },
            { text: "O(n·log n)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Binäre Suche halbiert den Suchraum in jedem Schritt, daher O(log n) Laufzeit."
    },

    {
        question: "Was ist der Knotengrad in einem Graphen?",
        options: [
            { text: "Die Anzahl der inzidenten Kanten", correct: true },
            { text: "Die Anzahl der adjazenten Knoten mal 2", correct: false },
            { text: "Die Anzahl der Wege zu anderen Knoten", correct: false },
            { text: "Die Tiefe des Knotens", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Der Knotengrad ist die Anzahl der Kanten, die an diesem Knoten anliegen (inzident sind)."
    },

    {
        question: "Was bedeutet 'disjunkt' bei Mengen?",
        options: [
            { text: "Die Mengen haben keine gemeinsamen Elemente", correct: true },
            { text: "Die Mengen sind gleich groß", correct: false },
            { text: "Die Mengen sind sortiert", correct: false },
            { text: "Die Mengen sind leer", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Zwei Mengen sind disjunkt, wenn ihre Schnittmenge leer ist - sie haben kein gemeinsames Element."
    },

    {
        question: "Welche Aussage über Greedy-Algorithmen ist korrekt?",
        options: [
            { text: "Sie treffen in jedem Schritt die lokal beste Entscheidung", correct: true },
            { text: "Sie garantieren immer die global optimale Lösung", correct: false },
            { text: "Sie verwenden Backtracking", correct: false },
            { text: "Sie sind immer langsamer als andere Algorithmen", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Greedy-Algorithmen treffen in jedem Schritt die lokal beste Wahl. Sie liefern nur bei Problemen mit optimaler Substruktur garantiert die optimale Lösung."
    },

    {
        question: "Was ist die Kapazitätsbedingung bei Netzwerkflüssen?",
        options: [
            { text: "Der Fluss muss zwischen 0 und der Kapazität liegen", correct: true },
            { text: "Der Fluss muss maximal sein", correct: false },
            { text: "Einfluss = Ausfluss", correct: false },
            { text: "Alle Kanten müssen benutzt werden", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "Die Kapazitätsbedingung besagt: 0 ≤ f(u,v) ≤ u(u,v) - der Fluss darf die Kapazität nicht überschreiten."
    },

    {
        question: "Welche der folgenden Komplexitäten ist am langsamsten für große n?",
        options: [
            { text: "O(n²)", correct: false },
            { text: "O(n·log n)", correct: false },
            { text: "O(2ⁿ)", correct: true },
            { text: "O(n³)", correct: false }
        ],
        topic: "Algorithmen",
        feedback: "O(2ⁿ) ist exponentiell und wächst viel schneller als polynomielle Laufzeiten wie O(n²) oder O(n³)."
    }

];

// Export als ES6-Modul
export default algorithmenQuestions;
