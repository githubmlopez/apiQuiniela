import axios from 'axios';

// Definición de interfaz para referencia del tipo de objeto
export interface I_EspnPartido {
    ID_EVENTO_ESPN: number;
    ID_PERIODO: string;
    EQUIPO_1: string;
    EQUIPO_2: string;
    MARCADOR_1: number | null;
    MARCADOR_2: number | null;
    STATUS_PARTIDO: string | null;
    HORA: string;
    ESTADIO: string | null;
    F_PARTIDO: string;
    F_TEXTO: string;
}

// 1. Mapeo por ID numérico de ESPN
const TEAM_BY_ID: Record<string, string> = {
    '1':  'Atlanta Falcons',
    '2':  'Buffalo Bills',
    '3':  'Chicago Bears',
    '4':  'Cincinnati Bengals',
    '5':  'Cleveland Browns',
    '6':  'Dallas Cowboys',
    '7':  'Denver Broncos',
    '8':  'Detroit Lions',
    '9':  'Green Bay Packers',
    '10': 'Tennessee Titans',
    '11': 'Indianapolis Colts',
    '12': 'Kansas City Chiefs',
    '13': 'Las Vegas Raiders',
    '14': 'Los Angeles Rams',
    '15': 'Miami Dolphins',
    '16': 'Minnesota Vikings',
    '17': 'New England Patriots',
    '18': 'New Orleans Saints',
    '19': 'New York Giants',
    '20': 'New York Jets',
    '21': 'Philadelphia Eagles',
    '22': 'Arizona Cardinals',
    '23': 'Pittsburgh Steelers',
    '24': 'Los Angeles Chargers',
    '25': 'San Francisco 49ers',
    '26': 'Seattle Seahawks',
    '27': 'Tampa Bay Buccaneers',
    '28': 'Washington Commanders',
    '29': 'Carolina Panthers',
    '30': 'Jacksonville Jaguars',
    '33': 'Baltimore Ravens',
    '34': 'Houston Texans'
};

// 2. Mapeo por Abreviación Oficial y variantes
const TEAM_BY_ABREV: Record<string, string> = {
    'ATL': 'Atlanta Falcons',
    'BUF': 'Buffalo Bills',
    'CHI': 'Chicago Bears',
    'CIN': 'Cincinnati Bengals',
    'CLE': 'Cleveland Browns',
    'DAL': 'Dallas Cowboys',
    'DEN': 'Denver Broncos',
    'DET': 'Detroit Lions',
    'GB':  'Green Bay Packers',
    'TEN': 'Tennessee Titans',
    'IND': 'Indianapolis Colts',
    'KC':  'Kansas City Chiefs',
    'LV':  'Las Vegas Raiders',
    'LAR': 'Los Angeles Rams',
    'MIA': 'Miami Dolphins',
    'MIN': 'Minnesota Vikings',
    'NE':  'New England Patriots',
    'NO':  'New Orleans Saints',
    'NYG': 'New York Giants',
    'NYJ': 'New York Jets',
    'PHI': 'Philadelphia Eagles',
    'ARI': 'Arizona Cardinals',
    'PIT': 'Pittsburgh Steelers',
    'LAC': 'Los Angeles Chargers',
    'SF':  'San Francisco 49ers',
    'SEA': 'Seattle Seahawks',
    'TB':  'Tampa Bay Buccaneers',
    'TAM': 'Tampa Bay Buccaneers',
    'TBU': 'Tampa Bay Buccaneers',
    'WSH': 'Washington Commanders',
    'WAS': 'Washington Commanders',
    'CAR': 'Carolina Panthers',
    'JAX': 'Jacksonville Jaguars',
    'BAL': 'Baltimore Ravens',
    'HOU': 'Houston Texans'
};

// 3. Diccionario para reparar directamente strings con textos pegados devueltos por ESPN
const NOMBRES_PEGADOS_MAP: Record<string, string> = {
    'AtlantaFalcons': 'Atlanta Falcons',
    'Tampa BayBuccaneers': 'Tampa Bay Buccaneers',
    'TampaBayBuccaneers': 'Tampa Bay Buccaneers',
    'GreenBayPackers': 'Green Bay Packers',
    'KansasCityChiefs': 'Kansas City Chiefs',
    'LasVegasRaiders': 'Las Vegas Raiders',
    'LosAngelesRams': 'Los Angeles Rams',
    'LosAngelesChargers': 'Los Angeles Chargers',
    'NewEnglandPatriots': 'New England Patriots',
    'NewOrleansSaints': 'New Orleans Saints',
    'NewYorkGiants': 'New York Giants',
    'NewYorkJets': 'New York Jets',
    'SanFrancisco49ers': 'San Francisco 49ers',
    'WashingtonCommanders': 'Washington Commanders'
};

// Función de limpieza avanzada a prueba de palabras pegadas
function sanitizarNombre(nombre: string | null | undefined): string {
    if (!nombre) return 'TBD';
    
    const textoTrim = nombre.trim();
    if (NOMBRES_PEGADOS_MAP[textoTrim]) {
        return NOMBRES_PEGADOS_MAP[textoTrim];
    }

    return textoTrim
        .replace(/([a-z])([A-Z])/g, '$1 $2')        // Separa "AtlantaFalcons" -> "Atlanta Falcons"
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // Separa mayúsculas seguidas de minúsculas
        .replace(/\s+/g, ' ')                        // Limpia espacios múltiples
        .trim();
}

export async function obtenerPartidosESPN(semana: number): Promise<I_EspnPartido[]> {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${semana}`;
    const response = await axios.get(url, { timeout: 30000 });
    const events = response.data?.events ?? [];

    return events.map((event: Record<string, any>): I_EspnPartido => {
        const competition = event.competitions?.[0];
        const competitors = competition?.competitors ?? [];

        const visitante = competitors.find((c: any) => c.homeAway === 'away');
        const local = competitors.find((c: any) => c.homeAway === 'home');

        // Extraer ID y Abreviación de visitante
        const idVis = visitante?.team?.id ? String(visitante.team.id) : null;
        const abrevVis = visitante?.team?.abbreviation?.trim()?.toUpperCase();

        // Extraer ID y Abreviación de local
        const idLoc = local?.team?.id ? String(local.team.id) : null;
        const abrevLoc = local?.team?.abbreviation?.trim()?.toUpperCase();

        // Resolución prioritaria: 1) ID -> 2) Abreviación -> 3) DisplayName -> 4) Abbrev
        const nombreVisRaw = (idVis ? TEAM_BY_ID[idVis] : null) 
            ?? (abrevVis ? TEAM_BY_ABREV[abrevVis] : null) 
            ?? visitante?.team?.displayName 
            ?? abrevVis;

        const nombreLocRaw = (idLoc ? TEAM_BY_ID[idLoc] : null) 
            ?? (abrevLoc ? TEAM_BY_ABREV[abrevLoc] : null) 
            ?? local?.team?.displayName 
            ?? abrevLoc;

        const fecha = new Date(event.date);

        return {
            ID_EVENTO_ESPN: Number(event.id),
            ID_PERIODO: String(response.data?.week?.number ?? semana),

            EQUIPO_1: sanitizarNombre(nombreVisRaw),
            EQUIPO_2: sanitizarNombre(nombreLocRaw),

            MARCADOR_1: visitante?.score !== undefined && visitante?.score !== null 
                ? Number(visitante.score) 
                : null,
            MARCADOR_2: local?.score !== undefined && local?.score !== null 
                ? Number(local.score) 
                : null,

            STATUS_PARTIDO: event.status?.type?.name ?? null,
            HORA: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
            ESTADIO: competition?.venue?.fullName ?? null,
            F_PARTIDO: fecha.toLocaleDateString('sv-SE'),
            F_TEXTO: fecha.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    });
}

// --- EJECUCIÓN DE LA RUTINA ---
const partidos = await obtenerPartidosESPN(10);
const jsonResultado = JSON.stringify(partidos, null, 2);
console.log(jsonResultado);
