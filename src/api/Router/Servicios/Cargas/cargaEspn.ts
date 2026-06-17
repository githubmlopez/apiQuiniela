import axios from 'axios';
import { I_NflNews, I_EspnPartido} from '@modelos/index.js';

const TEAM_MAP: Record<string, string> = {
    'Arizona Cardinals': 'ARI',
    'Atlanta Falcons': 'ATL',
    'Baltimore Ravens': 'BAL',
    'Buffalo Bills': 'BUF',
    'Carolina Panthers': 'CAR',
    'Chicago Bears': 'CHI',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Dallas Cowboys': 'DAL',
    'Denver Broncos': 'DEN',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Miami Dolphins': 'MIA',
    'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE',
    'New Orleans Saints': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Philadelphia Eagles': 'PHI',
    'Pittsburgh Steelers': 'PIT',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
    'Tampa Bay Buccaneers': 'TB',
    'Tennessee Titans': 'TEN',
    'Washington Commanders': 'WAS'
};

/*
export async function obtenerNoticiasESPN(): Promise<I_NflNews[]> {

    const url =
        'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news';

    const response = await axios.get(url, {
        timeout: 30000
    });

    const articles = response.data?.articles ?? [];

    return articles.map((article: any) => ({

        SOURCE: 'ESPN',

        SOURCE_NEWS_ID: `ESPN-${article.id}`,

        HEADLINE: article.headline ?? null,

        SUMMARY: article.description ?? null,

        ARTICLE_URL:
            article.links?.web?.href ??
            article.links?.mobile?.href ??
            null,

        IMAGE_URL:
            article.images?.length > 0
                ? article.images[0].url
                : null,

        PUBLISHED_DATE:
            article.published ?? null,

        CATEGORY: null,

        TEAM_CODE: null,

        PLAYER_NAME: null,

        IMPACT_LEVEL: 1,

        IS_PUBLISHED: false,

        IS_ACTIVE: false
    }));
}
    */
   export async function obtenerNoticiasESPN(): Promise<I_NflNews[]> {

    const url =
        'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news';

    const response = await axios.get(url, {
        timeout: 30000
    });

    const articles = response.data?.articles ?? [];

    return articles.map((article: any) => {

        const categories = article.categories ?? [];

        const teamCategory = categories.find(
            (c: any) => c.type === 'team'
        );

        const athleteCategory = categories.find(
            (c: any) => c.type === 'athlete'
        );

        const teamName =
            teamCategory?.description ?? null;

        const teamCode =
            teamName
                ? TEAM_MAP[teamName] ?? null
                : null;

        const playerName =
            athleteCategory?.description ?? null;

        return {

            SOURCE: 'ESPN',

            SOURCE_NEWS_ID: `ESPN-${article.id}`,

            HEADLINE: article.headline ?? null,

            SUMMARY: article.description ?? null,

            ARTICLE_URL:
                article.links?.web?.href ??
                article.links?.mobile?.href ??
                null,

            IMAGE_URL:
                article.images?.length > 0
                    ? article.images[0].url
                    : null,

            PUBLISHED_DATE:
                article.published ?? null,

            CATEGORY: null,

            TEAM_CODE: teamCode,

            PLAYER_NAME: playerName,

            IMPACT_LEVEL: 1,

            IS_PUBLISHED: false,

            IS_ACTIVE: true
        };

    });
}

export async function obtenerPartidosESPN(
    semana: number
): Promise<I_EspnPartido[]> {

    const url =
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${semana}`;

    const response = await axios.get(url, {
        timeout: 30000
    });

    const events = response.data?.events ?? [];

    return events.map((event: any) => {

        const competition =
            event.competitions?.[0];

        const competitors =
            competition?.competitors ?? [];

        const visitante =
            competitors.find(
                (c: any) => c.homeAway === 'away'
            );

        const local =
            competitors.find(
                (c: any) => c.homeAway === 'home'
            );

        const fecha =
            new Date(event.date);

        return {

            ID_EVENTO_ESPN:
                Number(event.id),

            ID_PERIODO:
                String(
                    response.data?.week?.number ??
                    semana
                ),

            EQUIPO_1:
                visitante?.team?.abbreviation ?? null,

            EQUIPO_2:
                local?.team?.abbreviation ?? null,

            MARCADOR_1:
                visitante?.score
                    ? Number(visitante.score)
                    : null,

            MARCADOR_2:
                local?.score
                    ? Number(local.score)
                    : null,

            STATUS_PARTIDO:
                event.status?.type?.name ?? null,

            HORA:
                fecha.toLocaleTimeString(
                    'es-MX',
                    {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }
                ),

            ESTADIO:
                competition?.venue?.fullName ?? null,

            F_PARTIDO:
                fecha.toISOString().substring(0, 10),

            F_TEXTO:
                fecha.toLocaleDateString(
                    'es-MX',
                    {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }
                )
        };

    });

}