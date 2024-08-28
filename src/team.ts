export interface Club {
    ground?: string
    name: string
}

export enum Team {
  MAROONS = 'Maroons',
  CAVALIERS = 'Cavaliers',
}

const opposition: Club[] = [
    { ground: 'The Jim Saynor Ground, Station View, Harrogate, HG2 7JA', name: 'Harrogate Pythons' },
    { ground: 'none', name: 'Fire Service' },
    { ground: 'The Clubhouse, North Dean, Stainland Road, Greetland, Halifax, HX4 8LS', name: 'Heath' },
    { ground: 'Standeven House, Broomfield Avenue, Halifax, West Yorkshire, HX3 0JE', name: 'Old Crossleyans' },
    { ground: 'Westfield Banks, Westfield Lane, Goole, East Yorkshire', name: 'Goole' },
    { ground: 'Rochdale RUFC Clubhouse, Moorgate Avenue, off Bury Road, Rochdale, Lancashire, OL11 5LU', name: 'Rochdale' },
    { ground: 'Silver Royd, 569 Scalby Road, Scalby, Scarborough, YO13 0NL', name: 'Scarborough' },
    { ground: 'Sandhill Lane, Selby, North Yorkshire, YO8 4JP', name: 'Selby' },
    { ground: 'Glossop RUFC, Hargate Hill Lane, Charlesworth, Glossop, Derbyshire, SK13 5HG', name: 'Glossop' },
    { ground: 'Dukes Park Queensgate, Bridlington, YO16 7LN', name: 'Bridlington' },
    { ground: 'Gosforth Fields, Bubnell Road, Dronfield Woodhouse, Dronfield, S18 8QY', name: 'Dronfield' },
    { ground: 'The Gannock, Old Malton Road, Malton, United Kingdom, North Yorkshire, YO17 7EY', name: 'Malton & Norton' },
    { ground: 'Moss Valley, Leeds, LS17 7NT', name: 'Moortown' },
    { ground: 'Woodhead, Hipperholme, Halifax, West Yorkshire, HX3 8JU', name: 'Old Brodleians' },
    { ground: 'Moor Lane, Carleton, Pontefract, West Yorkshire, WF8 3RX', name: 'Pontefract' },
    { ground: 'Doncaster Rugby Club, Castle Park, Doncaster, South Yorkshire, DN2 5QB', name: 'Doncaster Phoenix' },
    { ground: 'Skipton Road, Utley, Keighley, West Yorkshire, BD20 6DT', name: 'Keighley' },
    { ground: 'Wetherby RUFC, Grange Park, Wetherby, West Yorkshire, LS22 5NB', name: 'Wetherby' },
    { ground: 'Lockwood Park, Brewery Drive, Huddersfield, HD4 6EN', name: 'Huddersfield' },
    { ground: 'The Pavilion, Moorend, Cleckheaton, West Yorkshire, BD19 3UD', name: 'Cleckheaton' },
    { ground: 'Warminster Road, Sheffield, South Yorkshire, S8 8PQ', name: 'Sheffield Engineers' },
    { ground: 'Standbridge Lane, Sandal Magna, Wakefield, WF2 7DY', name: 'Sandal' },
    { ground: '124 Ashby Road, Scunthorpe, DN16 2AG', name: 'Scunthorpe' },
    { ground: 'Grove Park, Lower Greenfoot, Settle, BD24 9RB', name: 'North Ribblesdale' },
    { ground: '116 Northfield Rd, Sheffield, S10 1QS', name: 'Hallamshire' },
    { ground: '1 Shay Lane, Bradford, BD9 6SL', name: 'Bradford Salem' },
  ];

  export const findTeam = (team: string): Club => {
    if (/Y Cup|YC \?/.exec(team)) {
      return {
        name: 'Yorkshire Cup Reserve Date',
      };
    } else if (team === 'BREAK' || team === 'Reserve') {
      return {
        name: 'League Reserve Date',
      };
    } else if (/RFU CUP 1|PJ Cup/.exec(team)) {
      return {
        name: 'National Cup Reserve Date',
      };
    }

    if (!team) {
      throw new Error('no opposition specified');
    }
    if (team === 'TBC') {
      throw new Error('no fixture!');
    }
    const oppo = opposition.find((club: Club) => club.name === team.replace(/ 2\??/, ''));
    if (!oppo) {
      throw new Error(`could not find the right club "${team}"`);
    }
    return oppo;
  };

export const home = 'Morley Rugby Football Club, Scatcherd Lane, Morley, Leeds, LS27 0JJ';