import axios from 'axios';
import { I_NflNews, I_EspnPartido} from '@modelos/index.js';

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

const PALABRAS_LESION: RegExp[] = [
    /\binjur(y|ed|ies)\b/i,   // injury, injured, injuries
];

function esNoticiaLesion(headline: string | null, summary: string | null): boolean {
    const texto = `${headline ?? ''} ${summary ?? ''}`;
    return PALABRAS_LESION.some((regex) => regex.test(texto));
}

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

        const teamId = teamCategory?.teamId ?? null;
        const teamCode = teamId ? TEAM_BY_ID[String(teamId)] ?? null : null;

        const playerName =
            athleteCategory?.description ?? null;

        const esLesion =
            esNoticiaLesion(article.headline, article.description);

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

            CATEGORY: esLesion ? 1 : null,

            TEAM_CODE: teamCode,

            PLAYER_NAME: playerName,

            IMPACT_LEVEL: 1,

            IS_PUBLISHED: true,

            IS_ACTIVE: true
        };

    });
}