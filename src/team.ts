export interface Club {
    ground?: string
    name: string
}

export const opposition: Club[] = [
    { ground: '', name: 'Harrogate Pythons' },
    { ground: '', name: 'Fire Service' },
    { ground: '', name: 'Heath' },
    { ground: '', name: 'Old Crossleyans' },
    { ground: '', name: 'Goole' },
    { ground: '', name: 'Rochdale' },
    { ground: '', name: 'Scarborough' },
    { ground: '', name: 'Selby' },
    { ground: '', name: 'Glossop' },
    { ground: '', name: 'Bridlington' },
    { ground: '', name: 'Dronfield' },
    { ground: '', name: 'Malton & Norton' },
    { ground: '', name: 'Moortown' },
    { ground: '', name: 'Old Brodleians' },
    { ground: '', name: 'Pontefract' },
    { ground: '', name: 'Doncaster Phoenix' },
    { ground: '', name: 'Keighley' },
    { ground: '', name: 'Wetherby' },
    { ground: '', name: 'Huddersfield' },
    { ground: '', name: 'Cleckheaton' },
];

export const findTeam = (team: string): Club => {
    throw new Error('cound not find the right club');
};

export const home = 'Morley Rugby Football Club, Scatcherd Lane, Morley, Leeds, LS27 0JJ';