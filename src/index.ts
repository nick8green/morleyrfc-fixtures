import moment from 'moment';
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { createEvents, DateArray } from 'ics';
import { join } from 'path';

const main = () => {
  const filePath = join(__dirname, '/in/MRFC-FIXTURES-2023-24.xlsx');
  const rows = readSpreadsheet(filePath);

  const firstRow = 4;

  let fixtures: Match[] = [];

  for (let i = (firstRow - 1); i < rows.length; i++) {
    fixtures = [...fixtures, ...rowToFixtures(rows[i] as any[])];
  }

  outputCsvToConsole(fixtures);
  outputToIsc(fixtures);
};

const outputCsvToConsole = (fixtures: Match[]): void => {
  fixtures.forEach((match: Match) => {
      // console.log(moment(match.date).format('DD/MM/YYYY'));
      // console.log(moment(match.date).format('MM/DD/YYYY'));
      const m = {
      StartDate: moment(match.date).format('DD/MM/YYYY'),
      StartTime: moment(match.date).format('HH:mm'),
      MeetUp: moment(match.meet).format('HH:mm'),
      EndDate: null,
      EndTime: null,
      MatchType: match.venue,
      HomeTeam: match.venue === Venue.HOME ? match.team : match.opposition.name,
      AwayTeam: match.venue === Venue.AWAY ? match.team : match.opposition.name,
      Description: match.type,
      Place: `"${match.venue === Venue.HOME ? home : match.opposition.ground}"`,
    };
    console.log(Object.values(m).join(','));
  });
};

const outputToIsc = (fixtures: Match[]): void => {
  const events: any[] = [];

  fixtures.forEach((f: Match) => {
    const title = `${f.venue === Venue.HOME ? f.team : f.opposition.name} vs. ${f.venue === Venue.AWAY ? f.team : f.opposition.name}`;
    const duration = { hours: 5, minutes: 30 };
    let start = moment(f.meet).format('YYYY-M-D-H-m').split("-").map(v => parseInt(v));
    let end = moment(f.meet).add(duration).format("YYYY-M-D-H-m").split("-").map(v => parseInt(v));

    const event = {
      title,
      start,
      // end,
      duration,
      description: `${title}\n${f.type}\nMeet: ${moment(f.meet).format('H:mma')}\nKick Off: ${moment(f.date).format('H:mma')}`,
      location: f.venue === Venue.HOME ? home : f.opposition.ground,
    };

    events.push(event);
  });

  createEvents(events, (err, value) => {
    if (err) {
      console.error(err);
      return;
    }
    writeFileSync(`./fixtures.ics`, value);
  });
};

// Function to read rows from the spreadsheet
const readSpreadsheet = (filePath: string) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  return rows;
}

interface Match {
  date: Date
  meet: Date
  opposition: Club
  team: Team
  type: MatchType
  venue: Venue
}

enum MatchType {
  YORKSHIRE = 'Yorkshire Cup',
  NATIONAL = 'Papa John\'s National Cup',
  FIRST_TEAM = 'Regional 2 North East',
  SECOND_TEAM = 'Yorkshire Merit League Championship',
  FRIENDLY = 'Friendly',
}

enum Team {
  MAROONS = 'Maroons',
  CAVALIERS = 'Cavaliers',
}

enum Venue {
  AWAY = 'Away match',
  HOME = 'Home match',
}

const rowToFixtures = (row: any[]): Match[] => {
  const matches: Match[] = [];

  if (row[1] === 'CHRISTMAS' || row[1] === 'NEW YEAR' || !row[0] || row.length < 2) {
    return matches;
  }

  const opposition = findTeam(row[1]);
  const [type, venue] = getDetails(Team.MAROONS, row);
  const [date, meet] = getTimings(row[0])
  matches.push({
      date,
      meet,
      opposition,
      team: Team.MAROONS,
      type: getType(opposition, type),
      venue,
  });

  if (row[3]) {
    const opposition = findTeam(row[3]);
    const [type, venue] = getDetails(Team.CAVALIERS, row);
    const [date, meet] = getTimings(row[0])
    matches.push({
        date,
        meet,
        opposition,
        team: Team.CAVALIERS,
        type: getType(opposition, type),
        venue,
    });
  }

  return matches;
};

const findTeam = (team: string): Club => {
  if (/Y Cup/.exec(team)) {
    return {
      name: 'Yorkshire Cup Reserve Date',
    };
  } else if (team === 'BREAK' || team === 'Reserve') {
    return {
      name: 'League Reserve Date',
    };
  } else if (team === 'RFU CUP 1') {
    return {
      name: 'National Cup Reserve Date',
    };
  }

  if (!team) {
    throw new Error('no opposition specified');
  }
  const oppo = opposition.find((club: Club) => club.name === team.replace(/ 2\??/, ''));
  if (!oppo) {
    throw new Error(`could not find the right club "${team}"`);
  }
  return oppo;
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

const excelDateToJSDate = (date: number): Date => {
  return new Date(Math.round((date - 25569)*86400*1000));
};

const getTimings = (time: number): [Date, Date] => {
  const date = excelDateToJSDate(time);
  date.setHours(15);

  if ([0,1,10,11].includes(date.getMonth())) {
    date.setHours(14, 15);
  }

  const meet = new Date(date.getTime());;
  meet.setHours(date.getHours() - 2)

  return [date, meet];
};

const getType = (opposition: Club, type: MatchType): MatchType => {
  switch (opposition.name) {
    case 'Yorkshire Cup Reserve Date':
      return MatchType.YORKSHIRE;
    case 'National Cup Reserve Date':
      return MatchType.NATIONAL;
    default:
      return type;
  }
};

interface Club {
  ground?: string
  name: string
}

const opposition: Club[] = [
  { ground: 'The Jim Saynor Ground, Station View, Harrogate, HG2 7JA', name: 'Harrogate Pythons' },
  { ground: 'none', name: 'Fire Service' },
  { ground: 'The Clubhouse, North Dean, Stainland Rd, Greetland, Halifax, HX4 8LS', name: 'Heath' },
  { ground: 'Standeven House, Broomfield Avenue, Halifax, West Yorkshire, HX3 0JE', name: 'Old Crossleyans' },
  { ground: 'Westfield Banks, Westfield Lane, Goole, East Yorkshire', name: 'Goole' },
  { ground: 'Rochdale RUFC Clubhouse, Moorgate Avenue, off Bury Road, Rochdale, Lancashire, OL11 5LU', name: 'Rochdale' },
  { ground: 'Silver Royd, 569 Scalby Rd, Scalby, Scarborough, YO13 0NL', name: 'Scarborough' },
  { ground: 'Sandhill Lane, Selby, North Yorkshire, YO8 4JP', name: 'Selby' },
  { ground: 'Glossop RUFC, Hargate Hill Lane, Charlesworth, Glossop, Derbyshire, SK13 5HG', name: 'Glossop' },
  { ground: 'Dukes Park Queensgate, Bridlington, YO16 7LN', name: 'Bridlington' },
  { ground: 'Gosforth Fields, Bubnell Rd, Dronfield Woodhouse, Dronfield, S18 8QY', name: 'Dronfield' },
  { ground: 'The Gannock, Old Malton Road, Malton, United Kingdom, North Yorkshire, YO17 7EY', name: 'Malton & Norton' },
  { ground: 'Moss Valley, Leeds, LS17 7NT', name: 'Moortown' },
  { ground: 'Woodhead, Hipperholme, Halifax, West Yorkshire, HX3 8JU', name: 'Old Brodleians' },
  { ground: 'Moor Lane, Carleton, Pontefract, West Yorkshire, WF8 3RX', name: 'Pontefract' },
  { ground: 'Doncaster Rugby Club, Castle Park, Doncaster, South Yorkshire, DN2 5QB', name: 'Doncaster Phoenix' },
  { ground: 'Skipton Road, Utley, Keighley, West Yorkshire, BD20 6DT', name: 'Keighley' },
  { ground: 'Wetherby RUFC, Grange Park, Wetherby, West Yorkshire, LS22 5NB', name: 'Wetherby' },
  { ground: 'Lockwood Park, Brewery Drive, Huddersfield, HD4 6EN', name: 'Huddersfield' },
  { ground: 'The Pavilion, Moorend, Cleckheaton, West Yorkshire, BD19 3UD', name: 'Cleckheaton' },
  { ground: 'Warminster Rd, Sheffield, South Yorkshire, S8 8PQ', name: 'Sheffield Engineers' },
];

const home = 'Morley Rugby Football Club, Scatcherd Lane, Morley, Leeds, LS27 0JJ';

main();