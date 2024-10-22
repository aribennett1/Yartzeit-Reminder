const yartzeitsToSend = [];
const yartzeits = [];
let thisHebrewYear = '';
let isTest, emails;
let today = new Date();  // date format: "3/29/2022" (with quotes)
function main() {
  const sheet = SpreadsheetApp.openById("1dwd73mDGAOcbA_cjX-e76zgi-8nX9WiFE0pRDHpd794");
  getYartzeitListFromSheet(sheet);
  emails = sheet.getSheets()[0].getDataRange().getValues();
  if (PropertiesService.getScriptProperties().getProperty("lastDaySent") == today.getDay()) {
    console.log("Yartzeit was sent for today, exiting...");
    return; //this should be "continue" when testing! (not "return")
  }
  else {
    PropertiesService.getScriptProperties().setProperty("lastDaySent", today.getDay());
    console.log("lastDaySent: " + PropertiesService.getScriptProperties().getProperty("lastDaySent"));
  }
  if (PropertiesService.getScriptProperties().getProperty("sentUntil") > 0) {
    const toSet = PropertiesService.getScriptProperties().getProperty("sentUntil") - 1;
    console.log(`Setting sentUntil to ${toSet}...`);
    PropertiesService.getScriptProperties().setProperty("sentUntil", toSet);
    console.log("Today's yartzeit were sent in advace, exiting...");
    return; //this should be "continue" when testing! (not "return")
  }
  for (let x = 1; x < 3; x++) {
    if (x == 2) { today = addDays(today, 1); }
    isTest = x == 2;
    let tomorrow = addDays(today, 1);
    const tomorrowHebrewDate = getHebrewDate(tomorrow);
    getYartzeitsToSend(tomorrowHebrewDate.get("Month"), tomorrowHebrewDate.get("Day"));
    for (let yartzeit of yartzeitsToSend) {
      sendEmail(buildEmail(yartzeit), yartzeit.family);
    }
    if (yartzeitsToSend.length == 0) {
      console.log(`No Yartzeit ${isTest ? "in two days" : "Tomorrow"}`);
    }
    yartzeitsToSend.length = 0;
  }
}

function getYartzeitListFromSheet(sheet) {
  const data = sheet.getSheets()[1].getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {

    const row = data[i];

    const day = row[0];
    const month = row[1];
    const year = row[2];
    const englishName = row[3];
    const hebrewName = row[4];
    const notes = row[5];
    const pictures = row[6] ? row[6].split(",").map(str => {
      return `https://lh3.googleusercontent.com/d/${str.substring(str.indexOf("d/") + 2, str.indexOf("/view"))}=s750?authuser=0`;
    }) : [];
    let videos = row[7] ? row[7].split("#").map(str => {
      return str.replace(/([^:]+): ([^ ]+) Alternate Link: ([^ ]+)/g, '$1: <a href="$2">$2</a> Alternate Link: <a href="$3">$3</a>');
    }) : [];

    const family = FamilyEnum[row[8].toUpperCase()];
    yartzeits.push(new Yartzeit(day, month, year, englishName, hebrewName, notes, pictures, videos, family));

  }
}

function getYartzeitsToSend(tomorrowHebrewMonth, tomorrowHebrewDay) {
  console.log(`${tomorrowHebrewDay} ${tomorrowHebrewMonth}`);
  for (let yartzeit of yartzeits) {
    // if erev Pesach, erev Shmini Shel Pesach, or erev Shavuos is Shabbos, send next three days on Friday (Rosh Hashana Sukkos, and Shmini Atzeres can't be on a Sunday)
    if ((tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 14 && tomorrow.getDay() == 6 && yartzeit.month == "Nissan") ||
      (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 20 && tomorrow.getDay() == 6 && yartzeit.month == "Nissan") ||
      (tomorrowHebrewMonth == "Sivan" && tomorrowHebrewDay == 5 && tomorrow.getDay() == 6 && yartzeit.month == "Sivan")) {
      if (yartzeit.day == 15 || yartzeit.day == 21 || yartzeit.day == 6) {
        addYartzeit(yartzeit, "", 1);
      }
      if (yartzeit.day == 16 || yartzeit.day == 22 || yartzeit.day == 7) {
        addYartzeit(yartzeit, "", 2);
      }
    }
    // send the 2nd day of Yom Tov on Erev Yom (Rosh Hashana, Sukkos, Shmini Atzeres, Pesach, Shmini Shel Pesach, and Shavuos)
    else {
      if ((tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 1 && yartzeit.month == "Tishrei" && yartzeit.day == 2) ||
        (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 15 && yartzeit.month == "Tishrei" && yartzeit.day == 16) ||
        (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 22 && yartzeit.month == "Tishrei" && yartzeit.day == 23) ||
        (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 15 && yartzeit.month == "Nissan" && yartzeit.day == 16) ||
        (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 21 && yartzeit.month == "Nissan" && yartzeit.day == 22) ||
        (tomorrowHebrewMonth == "Sivan" && tomorrowHebrewDay == 6 && yartzeit.month == "Sivan" && yartzeit.day == 7)) {
        addYartzeit(yartzeit, "", 1);
      }
      //if the day after Yom Tov is Shabbos, send three days after yom tov (Shavuos can't fall out on Thursday)
      if (today.getDay() == 3) {
        if ((tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 1 && yartzeit.month == "Tishrei" && yartzeit.day == 3) ||
          (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 15 && yartzeit.month == "Tishrei" && yartzeit.day == 17) ||
          (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 22 && yartzeit.month == "Tishrei" && yartzeit.day == 24) ||
          (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 15 && yartzeit.month == "Nissan" && yartzeit.day == 17) ||
          (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 21 && yartzeit.month == "Nissan" && yartzeit.day == 23)) {
          addYartzeit(yartzeit, "", 2);
        }
      }
    }

    //In a non-leap year, send yartziets of a leap year. Does not have Adar itself, will be processed in last if statement.
    if (tomorrowHebrewMonth == "Adar" && (yartzeit.month == "Adar I" || yartzeit.month == "Adar II") && tomorrowHebrewDay == yartzeit.day) {
      addYartzeit(yartzeit, `(The yartzeit is really on ${yartzeit.day} ${yartzeit.month}, but this year is not a leap year)`);
    }
    //If type of Adar is unknown
    if ((tomorrowHebrewMonth == "Adar" || tomorrowHebrewMonth == "Adar II") && yartzeit.month == "Adar ?" && tomorrowHebrewDay == yartzeit.day) {
      addYartzeit(yartzeit);
    }
    //In leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav.
    if (tomorrowHebrewMonth == "Adar I" && yartzeit.month == "Adar" && tomorrowHebrewDay == yartzeit.day) {
      addYartzeit(yartzeit, `The Yartziet is really on ${tomorrowHebrewDay} Adar. In a leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav what you should do`);
    }
    // According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat of a non-leap year
    if (tomorrowHebrewMonth == "Shvat" && !isLeapYear(tomorrowHebrewDate.get("Year"))) {
      if (yartzeit.month == "Adar I" && tomorrowHebrewDay == yartzeit.day) {
        addYartzeit(yartzeit, `The Yartzeit is really on ${tomorrowHebrewDay} Adar I. However, According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat in a non-leap year`);
      }
    }
    //send 30 cheshvon/kislev/ on 1 kilev/teves if this year there is no 30 cheshvon/kislev
    if ((tomorrowHebrewMonth == "Kislev" || tomorrowHebrewMonth == "Teves") && tomorrowHebrewDay == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" /*not 30*/ && (yartzeit.month == "Cheshvan" || yartzeit.month == "Kislev") && yartzeit.day == 30) {
        addYartzeit(yartzeit, `The Yartzeit is really on 30 ${yartzeit.month}. However, this year there is no 30 ${yartzeit.month}, so the Yartziet is observed on 1 ${tomorrowHebrewMonth}`);
      }
    }
    // send 30 Adar I on 1 Adar in a non - leap year
    if (tomorrowHebrewMonth == "Adar" && tomorrowHebrewDay == "1") {
      if (yartzeit.month == "Adar I" && yartzeit.day == 30) {
        addYartzeit(yartzeit, `The Yartzeit is really on 30 Adar I. However, this year isn't a leap year, so the Yartziet is observed on 1 Adar`);
      }
    }
    //last if statement, does regular yartzeit
    if (tomorrowHebrewMonth == yartzeit.month && tomorrowHebrewDay == yartzeit.day) {
      addYartzeit(yartzeit);
    }
  }
}

function addYartzeit(yartzeit, note = "", inHowManyDays = 0) {
  yartzeit.setNote(note);
  yartzeit.setInHowManyDays(inHowManyDays);
  yartzeitsToSend.push(yartzeit);
  if (inHowManyDays != 0) {
    setSentUntil(inHowManyDays);
  }
}

function getHebrewDate(d) {
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (month.toString().length != 2) {
    month = "0" + month;
  }
  let day = d.getDate();
  if (day.toString().length != 2) {
    day = "0" + day;
  }
  let hebcal = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`).getContentText());
  thisHebrewYear = hebcal.hy;
  let hebrewMonth = hebcal.hm;
  hebrewMonth = hebrewMonth.replaceAll("Nisan", "Nissan").replaceAll("Iyyar", "Iyar").replaceAll("Tevet", "Teves").replaceAll("Sh'vat", "Shvat");
  let hewbrewDay = hebcal.hd;
  const hebrewDate = new Map();
  hebrewDate.set("Month", hebrewMonth);
  hebrewDate.set("Day", hewbrewDay);
  return hebrewDate;
}

function buildEmail(yartzeit) {
  let html = `<p>${getStarter(yartzeit.inHowManyDays)} ${getReadable(addDays(today, yartzeit.inHowManyDays))}, (${yartzeit.day} ${yartzeit.month}) ${getNumOfYear(yartzeit.year)} ${yartzeit.englishName}${yartzeit.englishName ? ',' : ''} ${yartzeit.hebrewName}. ${yartzeit.note}${yartzeit.note ? '.' : ''}</p>`;

  yartzeit.videos.length == 1 ? html += `<p>1 Video</p>` : html += `<p>${yartzeit.videos.length} Videos</p>`;
  html += "<ul>";
  for (let videoUrl of yartzeit.videos) {
    html += `<li>${videoUrl}</li>`;
  }
  html += `</ul><p>If you'd like to record a video (or just record audio) for someone's yartzeit, please email me at <a href="mailto:aribennett1@gmail.com">aribennett1@gmail.com.</a></p>`;
  yartzeit.pictures.length == 1 ? html += `<p>1 Picture</p>` : html += `<p>${yartzeit.pictures.length} Pictures</p>`;
  for (let picUrl of yartzeit.pictures) {
    html += `<p><img src="${picUrl}"></p>`;
  }
  html += `<p>To update your email preferences, click here: <a href="bit.ly/familyYartzeits">bit.ly/familyYartzeits</a>`;
  return html;
}

function sendEmail(html, row) {
  console.log("row: " + row);
  if (isTest) {
    GmailApp.sendEmail("aribennett1@gmail.com", "TEST Yartzeit Reminder", "", {
      htmlBody: html,
      name: "Yartzeit Reminder"
    });
    console.log("Sent test email");
  }
  else {
    for (let j in emails) {
      if (j == 0 || emails[j][row] == "") { continue; };
      GmailApp.sendEmail(emails[j][row], "Yartzeit Reminder", "", {
        from: "aribennett1@gmail.com",
        htmlBody: html,
        name: "Yartzeit Reminder"
      });
    }
    console.log("Sent main email");
  }
  console.log("html:" + html);
  console.log(`RemainingDailyQuota: ${MailApp.getRemainingDailyQuota()}`);
}

function getReadable(day) {
  if (day.getDay() == 6) {
    return `Motzei Shabbos`;
  }
  else {
    return `${new Date(day).toLocaleDateString('en-us', { weekday: "long" })} night`;
  }
}

function addDays(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isLeapYear(year) {
  return (((year * 7) + 1) % 19) < 7;
}

function getStarter(inHowManyDays) {
  switch (inHowManyDays) {
    case 0:
      return "Tonight,";
    case 1:
      return "Tomorrow night,";
    default:
      return "This upcoming";
  }
}

function setSentUntil(days) {
  if (!isTest) {
    const sentUntil = PropertiesService.getScriptProperties().getProperty("sentUntil");
    if (days > sentUntil) {
      PropertiesService.getScriptProperties().setProperty("sentUntil", days);
      console.log(`setUntil was set to ${days}`);
    }
  }
}

function getNumOfYear(yartzeitYear) {
  if (yartzeitYear == "") {
    return `is the yartzeit of`
  }
  const num = thisHebrewYear - parseInt(yartzeitYear.substring(yartzeitYear.indexOf("/") + 1));
  return `is the ${num}${getSuffix(num)} yartzeit of`;
}

function getSuffix(number) {
  if (number % 100 >= 11 && number % 100 <= 13) {
    return "th";
  }

  switch (number % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
