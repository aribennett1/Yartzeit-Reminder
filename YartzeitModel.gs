const FamilyEnum = {
  BENNETT: 0,
  GREENBERG: 1,
  WEISS: 2,
  WETSTEIN: 3,
  WIESNER: 4,
  ADLER: 5,
  ZEIDYFAMILY: 6
};

class Yartzeit {
  constructor(day, month, year, englishName, hebrewName, notes, pictures = [], videos = [], family) {
    this.day = day;                     // int
    this.month = month;                 // string
    this.year = year;                   // int
    this.englishName = englishName;     // string
    this.hebrewName = hebrewName;       // string
    this.notes = notes;                 // string
    this.pictures = pictures;             // array of strings
    this.videos = videos;                 // array of strings
    this.family = family;               // enum (int represented by name)
    this.note = '';                     // Initialize note internally
    this.inHowManyDays = 0;             // Initialize inHowManyDays internally
  }

  // Setters to assign values to `note` and `inHowManyDays`
  setNote(note) {
    this.note = note;
  }

  setInHowManyDays(days) {
    this.inHowManyDays = days;
  }
}
