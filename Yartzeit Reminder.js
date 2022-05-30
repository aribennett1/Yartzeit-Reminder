const spreadsheetID = "" //insert your spreadsheet ID between the quotes
const data = SpreadsheetApp.openById(spreadsheetID).getSheets()[0].getDataRange().getValues();
var yartzeit = [];
var today = new Date();  // date format: "3/29/2022" (with quotes)
function main() {
  var tomorrow = addDays(today, 1);
  if (PropertiesService.getScriptProperties().getProperty("sentUntil") > 0) {
    PropertiesService.getScriptProperties().setProperty("sentUntil", PropertiesService.getScriptProperties().getProperty("sentUntil") - 1);
    console.log("Today's yartziet were already sent, exiting...");
    return; 
  }  
  const tomorrowHebrewDate = getHebrewDate(tomorrow);
  console.log(`${hebrewDate.get("Day")} ${hebrewDate.get("Month")}`);
  const defaultHead = `Tonight, ${getReadable(today)} night, (${tomorrowHebrewDate.get("Day")} ${tomorrowHebrewDate.get("Month")}) is the yartzeit of~`;
  for (var i in data) {
    if (i == 0) {continue;}
    // if erev Pesach, erev Shmini Shel Pesach, or erev Shavuos is Shabbos, send next three days on Friday (Rosh Hashana Sukkos, and Shmini Atzeres can't be on a Sunday)
    if ((tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 14 && tomorrow.getDay() == 6 && data[i][2] == "Nissan") ||
    (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 20 && tomorrow.getDay() == 6 && data[i][2] == "Nissan") ||
    (tomorrowHebrewDate.get("Month") == "Sivan" && tomorrowHebrewDate.get("Day") == 5 && tomorrow.getDay() == 6 && data[i][2] == "Sivan"))  {
      if (data[i][3] == 15 || data[i][3] == 21 || data[i][3] == 6) {
        pushInfo(`Tomorrow night, ${getReadable(tomorrow)} night, (${data[i][3]} ${data[i][2]}) is the yartzeit of~`, i);
      }
      if (data[i][3] == 16 || data[i][3] == 22 || data[i][3] == 7) {
        pushInfo(`This coming ${getReadable(addDays(tomorrow, 1))} night, (${data[i][3]} ${data[i][2]}) is the yartzeit of~`, i);
      }
      PropertiesService.getScriptProperties().setProperty("sentUntil", 2);
    }
    // send the 2nd day of Yom Tov on Erev Yom (Rosh Hashana, Sukkos, Shmini Atzeres, Pesach, Shmini Shel Pesach, and Shavuos)
    else {
      if ((tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 1 && data[i][2] == "Tishrei" && data[i][3] == 2) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 15 && data[i][2] == "Tishrei" && data[i][3] == 16) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 22 && data[i][2] == "Tishrei" && data[i][3] == 23) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 15 && data[i][2] == "Nissan" && data[i][3] == 16) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 21 && data[i][2] == "Nissan" && data[i][3] == 22) ||
        (tomorrowHebrewDate.get("Month") == "Sivan" && tomorrowHebrewDate.get("Day") == 6 && data[i][2] == "Sivan" && data[i][3] == 7)) {
          pushInfo(`Tomorrow night, ${getReadable(tomorrow)} night, (${data[i][3]} ${data[i][2]}) is the yartzeit of~`, i);
          if (PropertiesService.getScriptProperties().getProperty("sentUntil") != 2) {
            PropertiesService.getScriptProperties().setProperty("sentUntil", 1);
          }
          //if the day after Yom Tov is Shabbos, send three days after yom tov (Shavuos can't fall out on Thursday)
          if (today.getDay() == 3) {
            if ((tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 1 && data[i][2] == "Tishrei" && data[i][3] == 3) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 15 && data[i][2] == "Tishrei" && data[i][3] == 17) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 22 && data[i][2] == "Tishrei" && data[i][3] == 24) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 15 && data[i][2] == "Nissan" && data[i][3] == 17) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 21 && data[i][2] == "Nissan" && data[i][3] == 23)) {
          pushInfo(`This coming ${getReadable(addDays(tomorrow, 1))} night, (${data[i][3]} ${data[i][2]}) is the yartzeit of~`, i);
          PropertiesService.getScriptProperties().setProperty("sentUntil", 2);
          }
        }
      }
    }    
    //In a non-leap year, send yartziets of a leap year. Does not have Adar itself, will be processed in last if statement.
    if (tomorrowHebrewDate.get("Month") == "Adar" && (data[i][2] == "Adar I" || data[i][2] == "Adar II") && tomorrowHebrewDate.get("Day") == data[i][3]) {
      pushInfoWithNote(defaultHead, i, `(The yartzeit is really on ${data[i][3]} ${data[i][2]}, but this year is not a leap year).`);
    }
    //In leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav.
    if (tomorrowHebrewDate.get("Month") == "Adar I" && data[i][2] == "Adar" && tomorrowHebrewDate.get("Day") == data[i][3]) {
      pushInfoWithNote(defaultHead, i, `The Yartziet is really on ${tomorrowHebrewDate.get("Day")} Adar. In a leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav what you should do.`);
    }
    // According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat of a non-leap year
    if (tomorrowHebrewDate.get("Month") == "Shvat" && !isLeapYear(tomorrowHebrewDate.get("Year"))) {
      if (data[i][2] == "Adar I" && tomorrowHebrewDate.get("Day") == data[i][3]) {
      pushInfoWithNote(defaultHead, i, `The Yartzeit is really on ${tomorrowHebrewDate.get("Day")} Adar I. However, According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat in a non-leap year.`);
      }
    }
    //send 30 cheshvon on 1 kilev if this year there is no 30 cheshvon
    if (tomorrowHebrewDate.get("Month") == "Kislev" && tomorrowHebrewDate.get("Day") == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" && data[i][2] == "Cheshvan" && data[i][3] == 30) {
        pushInfoWithNote(defaultHead, i,`The Yartzeit is really on 30 Cheshvan. However, this year there is no 30 Cheshvan, so the Yartziet is observed on 1 Kislev.`);
      }
    }
    //send 30 kislev on 1 teves if this year there is no 30 kislev
    if (tomorrowHebrewDate.get("Month") == "Teves" && tomorrowHebrewDate.get("Day") == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" && data[i][2] == "Kislev" && data[i][3] == 30) {
         pushInfoWithNote(defaultHead, i, `The Yartzeit is really on 30 Kislev. However, this year there is no 30 Kislev, so the Yartziet is observed on 1 Teves.`);
      }
    }
    // send 30 Adar I on 1 Adar in a non - leap year
    if (tomorrowHebrewDate.get("Month") == "Adar" && tomorrowHebrewDate.get("Day") == "1") {
      if (data[i][2] == "Adar I" && data[i][3] == 30) {
       pushInfoWithNote(defaultHead, i, `The Yartzeit is really on 30 Adar I. However, this year isn't a leap year, so the Yartziet is observed on 1 Adar.`);
      }
    }
    //last if statement, 
    if (tomorrowHebrewDate.get("Month") == data[i][2] && tomorrowHebrewDate.get("Day") == data[i][3]) {
      pushInfo(defaultHead, i);
    }
  }
  if (yartzeit.length != 0) {
    emailYartzeit();
  }
  else {
    console.log("No Yartzeit Tomorrow");
  }
}

function pushInfo(head, i) {
  yartzeit.push(head);
  for (var j = 5; j < 9; j++) {
   yartzeit.push(data[i][j]);
  }
}

function pushInfoWithNote(head, i, note) {
  yartzeit.push(head);
 for (var j = 5; j < 8; j++) {
    yartzeit.push(data[i][j]);
  }
  yartzeit.push(". " + note);
  yartzeit.push(data[i][8]); //Family Name
}

function getHebrewDate(d) {
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  if (month.toString().length != 2) {    
    month = "0" + month;
  }
  var day = d.getDate();
  if (day.toString().length != 2) {    
    day = "0" + day;
  }
  var hebcal = UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`).getContentText();
  var hebrewYear = hebcal.substring(hebcal.indexOf(`"hy":`) + 5, hebcal.indexOf(`,"hm"`));
  var hebrewMonth = hebcal.substring(hebcal.indexOf(`"hm":"`) + 6, hebcal.indexOf(`","hd"`));
  hebrewMonth = hebrewMonth.replaceAll("Nisan", "Nissan").replaceAll("Iyyar", "Iyar").replaceAll("Tevet", "Teves").replaceAll("Sh'vat", "Shvat");
  var hewbrewDay = hebcal.substring(hebcal.indexOf(`","hd":`) + 7, hebcal.indexOf(`,"hebrew":"`));
  const hebrewDate = new Map();
  hebrewDate.set("Year", hebrewYear);
  hebrewDate.set("Month", hebrewMonth);
  hebrewDate.set("Day", hewbrewDay);
  return hebrewDate;  
}

function emailYartzeit() {
  var row;
  var body = ``;
  for (var i = 0; i < yartzeit.length; i++) {
    if (yartzeit[i] == "" ) {
      continue;
    }
    if (yartzeit[i] == "Bennett" || yartzeit[i] == "Greenberg" || yartzeit[i] == "Wetstein") {
      if (yartzeit[i] == "Bennett") {
        row = 0;
      }
      if (yartzeit[i] == "Greenberg") {
        row = 1;
      }
      if (yartzeit[i] == "Wetstein") {
        row = 9;
      }
      body = body.slice(0, -2) + ".";
      for (var j in data) {
        if (j == 0 || data[j][0] == "") {continue;}
        GmailApp.sendEmail(data[j][row], "Yartzeit Reminder", body, {
          name: "Yartzeit Reminder"
        });
      }
      console.log("Sent: " + body);
      body = ``;
      continue;
    }
    else {
      if (yartzeit[i].charAt(yartzeit[i].length - 1) != "~") {
      body += `${yartzeit[i]}, `;
      }
      else {
        yartzeit[i] = yartzeit[i].slice(0, -1);
        body += `${yartzeit[i]} `;
      }
    }
  }
  yartzeit = []; //reset array
}

function getReadable(day) {
  return new Date(day).toLocaleDateString('en-us', { weekday:"long"});
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isLeapYear(year) {
  var yearInCycle = year % 19;
  return (yearInCycle < 7 && yearInCycle % 3 == 0) || (yearInCycle > 6 && yearInCycle % 3 == 2);
}
