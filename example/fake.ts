export const games = [
    "Chess", "Cross and Circle", "Daldos", "Downfall", "DVONN", "Fanorona", "Game of the Generals", "Ghosts",
    "Abalone", "Agon", "Backgammon", "Battleship", "Blockade", "Blood Bowl", "Bul", "Camelot", "Checkers",
    "Go", "Gipf", "Guess Who?", "Hare and Hounds", "Hex", "Hijara", "Isola", "Janggi (Korean Chess)", "Le Jeu de la Guerre",
    "Patolli", "Plateau", "PUNCT", "Rithmomachy", "Sahkku", "Senet", "Shogi", "Space Hulk", "Stratego", "Sugoroku",
    "Tab", "Tablut", "Tantrix", "Wari", "Xiangqi (Chinese chess)", "YINSH", "ZERTZ", "Kalah", "Kamisado", "Liu po",
    "Lost Cities", "Mad Gab", "Master Mind", "Nine Men's Morris", "Obsession", "Othello"
];

export const countries = [
    { country: "Ireland", continent: "Europe", language: "English" },
    { country: "Spain", continent: "Europe", language: "Spanish" },
    { country: "United Kingdom", continent: "Europe", language: "English" },
    { country: "France", continent: "Europe", language: "French" },
    { country: "Germany", continent: "Europe", language: "German" },
    { country: "Luxembourg", continent: "Europe", language: "French" },
    { country: "Sweden", continent: "Europe", language: "Swedish" },
    { country: "Norway", continent: "Europe", language: "Norwegian" },
    { country: "Italy", continent: "Europe", language: "Italian" },
    { country: "Greece", continent: "Europe", language: "Greek" },
    { country: "Iceland", continent: "Europe", language: "Icelandic" },
    { country: "Portugal", continent: "Europe", language: "Portuguese" },
    { country: "Malta", continent: "Europe", language: "Maltese" },
    { country: "Brazil", continent: "South America", language: "Portuguese" },
    { country: "Argentina", continent: "South America", language: "Spanish" },
    { country: "Colombia", continent: "South America", language: "Spanish" },
    { country: "Peru", continent: "South America", language: "Spanish" },
    { country: "Venezuela", continent: "South America", language: "Spanish" },
    { country: "Uruguay", continent: "South America", language: "Spanish" },
    { country: "Belgium", continent: "Europe", language: "French" }
];

export const languageOptions = {
    "English": {bgColor: "#2096f3", fgColor: "#ffffff"},
    "Spanish": {bgColor: "#0dc9c9", fgColor: "#ffffff"},
    "French": {bgColor: "#00c345", fgColor: "#ffffff"},
    "German": {bgColor: "#fad714", fgColor: "#ffffff"},
    "Swedish": {bgColor: "#ff9301", fgColor: "#ffffff"},
    "Norwegian": {bgColor: "#e9594f", fgColor: "#ffffff"},
    "Italian": {bgColor: "#ff708b", fgColor: "#ffffff"},
    "Greek": {bgColor: "#8b7af0", fgColor: "#ffffff"},
    "Icelandic": {bgColor: "#5586ff", fgColor: "#ffffff"},
    "Portuguese": {bgColor: "#7a67ee", fgColor: "#ffffff"},
    "Maltese": {bgColor: "#009688", fgColor: "#ffffff"},
}

export const firstNames = [
    "Tony", "Andrew", "Kevin", "Bricker", "Dimple", "Gil", "Sophie", "Isabelle", "Emily", "Olivia", "Lily", "Chloe", "Isabella",
    "Amelia", "Jessica", "Sophia", "Ava", "Charlotte", "Mia", "Lucy", "Grace", "Ruby",
    "Ella", "Evie", "Freya", "Isla", "Poppy", "Daisy", "Layla"
];

export const lastNames = [
    "Smith", "Connell", "Flanagan", "McGee", "Unalkat", "Lopes", "Beckham", "Black", "Braxton", "Brennan", "Brock", "Bryson", "Cadwell",
    "Cage", "Carson", "Chandler", "Cohen", "Cole", "Corbin", "Dallas", "Dalton", "Dane",
    "Donovan", "Easton", "Fisher", "Fletcher", "Grady", "Greyson", "Griffin", "Gunner",
    "Hayden", "Hudson", "Hunter", "Jacoby", "Jagger", "Jaxon", "Jett", "Kade", "Kane",
    "Keating", "Keegan", "Kingston", "Kobe"
];

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const monthOptions = {
    "Jan": {name: "January", bgColor: "#c9e6fc"},
    "Feb": {name: "February", bgColor: "#c3f2f2"},
    "Mar": {name: "March", bgColor: "#c3f1d2"},
    "Apr": {name: "April", bgColor: "#fdf6c6"},
    "May": {name: "May", bgColor: "#ffe5c2"},
    "Jun": {name: "June", bgColor: "#fdcaca"},
    "Jul": {name: "July", bgColor: "#facde6"},
    "Aug": {name: "August", bgColor: "#dec2fa"},
    "Sep": {name: "September", bgColor: "#ccd2f1"},
    "Oct": {name: "October", bgColor: "#ffd2a8"},
    "Nov": {name: "November", bgColor: "#dcd6ff"},
    "Dec": {name: "December", bgColor: "#c7f5b1"}
}

// taken from http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
var seed = 123456789;
var m = Math.pow(2, 32);
var a = 1103515245;
var c = 12345;

function pseudoRandom() {
    seed = (a * seed + c) % m;
    return seed / m;
}

function numeric(max: number = 100) {
    return Math.floor(pseudoRandom() * max);
}

function game(seed?: number): string {
    seed = seed || numeric();
    return games[seed % games.length];
}

function country(seed?: number) {
    seed = seed || numeric();
    return countries[seed % countries.length];
}

function name(seed?: number): string {
    seed = seed || numeric();

    const firstName = firstNames[seed % firstNames.length];
    const lastName = lastNames[seed % lastNames.length];

    return firstName + " " + lastName;
}

function month(seed?: number): string {
    seed = seed || numeric();
    return months[seed % months.length];
}

// modified from: https://stackoverflow.com/questions/31378526/generate-random-date-between-two-dates-and-times-in-javascript/
function date(start: Date, end: Date, startHour: number = 0, endHour: number = 24): Date {
    var date = new Date(+start + Math.random() * (end.valueOf() - start.valueOf()));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
}

export {
    name,
    country,
    game,
    month,
    date,
    numeric
}
