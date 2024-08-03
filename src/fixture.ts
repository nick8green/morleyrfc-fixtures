import { Club, findTeam, Team } from "./team"

export interface Match {
    date: Date;
    meet: Date;
    opposition: Club;
    team: Team;
    type: MatchType;
    venue: Venue;
}

export enum MatchType {
    YORKSHIRE = 'Yorkshire Cup',
    NATIONAL = 'Papa John\'s National Cup',
    FIRST_TEAM = 'Regional 2 North East',
    SECOND_TEAM = 'Yorkshire Merit League Championship',
    FRIENDLY = 'Friendly',
}

export enum Venue {
    AWAY = 'Away match',
    HOME = 'Home match',
}

export const getFixture = (team: Team, row: any, opposition: string) => {
    const oppo = findTeam(opposition);
    const [type, venue] = getDetails(team, row);
    const [date, meet] = getTimings(row[0])
    return {
        date,
        meet,
        opposition: oppo,
        team,
        type: getType(oppo, type),
        venue,
    };
};

const getDetails = (team: Team, row: any[]): [MatchType, Venue] => {
    const index = team === Team.MAROONS ? 2 : 4;

    let comp = MatchType.FRIENDLY;
    let venue = Venue.HOME;

    if (/\*$/.exec(row[index])) {
        comp = team === Team.MAROONS ? MatchType.FIRST_TEAM : MatchType.SECOND_TEAM;
    }

    if (/^[Aa]/.exec(row[index])) {
        venue = Venue.AWAY;
    }

    return [comp, venue];
};

const getTimings = (time: number): [Date, Date] => {
    const date = excelDateToJSDate(time);
    date.setHours(15);

    if ([0, 1, 10, 11].includes(date.getMonth())) {
        date.setHours(14, 15);
    }
    if (date.getDay() === 4) {
        date.setHours(19, 30);
    }

    const meet = new Date(date.getTime());;
    meet.setHours(date.getHours() - 2)

    return [date, meet];
};

const excelDateToJSDate = (date: number): Date => {
    return new Date(Math.round((date - 25569) * 86400 * 1000));
};

const getType = (opposition: Club, type: MatchType): MatchType => {
    switch (opposition.name) {
        case 'Yorkshire Cup Reserve Date':
        case 'YC ?':
            return MatchType.YORKSHIRE;
        case 'National Cup Reserve Date':
            return MatchType.NATIONAL;
        default:
            return type;
    }
};
