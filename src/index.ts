import moment from 'moment';
import XLSX from 'xlsx';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { createEvents } from 'ics';
import { join } from 'path';

import { home, Team } from './team';
import { getFixture, Match, Venue } from './fixture';

const main = () => {
  const root = join(__dirname, '../in/');

  const firstRow = 4;

  let fixtures: Match[] = [];

  readdirSync(root).forEach((file: string) => {
    console.log(`reading ${file}`);
    const filePath = join(root, file);
    const rows = readSpreadsheet(filePath);
    for (let i = (firstRow - 1); i < rows.length; i++) {
      fixtures = [...fixtures, ...rowToFixtures(rows[i] as any[])];
    }
  });

  // uncomment the line below to filter out past matches
  // fixtures = fixtures.filter((fixture: any) => fixture.date > new Date());

  outputCsvToConsole(fixtures);
  outputToIsc(fixtures);
};

const outputCsvToConsole = (fixtures: Match[]): void => {
  fixtures.forEach((match: Match) => {
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
    const duration = { hours: 1, minutes: 30 };
    let date = f.date;
    if (parseInt(moment(date).format('M')) > 3 && parseInt(moment(date).format('M')) < 11) {
      date = moment(date).subtract(1, 'hours').toDate();
    }
    let start = moment(date).format('YYYY-M-D-H-m').split("-").map(v => parseInt(v));
    // let end = moment(f.meet).add(duration).format("YYYY-M-D-H-m").split("-").map(v => parseInt(v));

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
    if (!existsSync('./out')) {
      mkdirSync('./out');
    }
    writeFileSync(`./out/fixtures.ics`, value);
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

const rowToFixtures = (row: any[]): Match[] => {
  const matches: Match[] = [];

  if (row[1] === 'CHRISTMAS' || row[1] === 'NEW YEAR' || !row[0] || row.length < 2) {
    return matches;
  }

  [Team.MAROONS, Team.CAVALIERS].forEach((team: Team) => {
    try {
      const oppo = row[team === Team.MAROONS ? 1 : 3];
      if (!oppo) {
        return;
      }
      matches.push(getFixture(team, row, oppo));
    } catch (e: any) {
      console.error(e);
      if (e.message !== 'no fixture!') {
        throw e;
      }
    }
  });

  return matches;
};

main();