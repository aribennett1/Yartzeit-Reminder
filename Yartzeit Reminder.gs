const sheet = SpreadsheetApp.openById("1dwd73mDGAOcbA_cjX-e76zgi-8nX9WiFE0pRDHpd794");
const data = sheet.getSheets()[1].getDataRange().getValues();
const emails = sheet.getSheets()[0].getDataRange().getValues();
var yartzeit = [];
var today = new Date();  // date format: "3/29/2022" (with quotes)
function main() {
  var tomorrow = addDays(today, 1);
  if (PropertiesService.getScriptProperties().getProperty("sentUntil") > 0) {
    PropertiesService.getScriptProperties().setProperty("sentUntil", PropertiesService.getScriptProperties().getProperty("sentUntil") - 1);
    console.log("Today's yartzeit were already sent, exiting...");
    return; 
  }  
  const tomorrowHebrewDate = getHebrewDate(tomorrow);
  console.log(`${tomorrowHebrewDate.get("Day")} ${tomorrowHebrewDate.get("Month")}`);
  const defaultHead = `Tonight, ${getReadable(today)} night, (${tomorrowHebrewDate.get("Day")} ${tomorrowHebrewDate.get("Month")}) is the yartzeit of~`;
  for (var i in data) {
    if (i == 0) {continue;}
    // if erev Pesach, erev Shmini Shel Pesach, or erev Shavuos is Shabbos, send next three days on Friday (Rosh Hashana Sukkos, and Shmini Atzeres can't be on a Sunday)
    if ((tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 14 && tomorrow.getDay() == 6 && data[i][1] == "Nissan") ||
    (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 20 && tomorrow.getDay() == 6 && data[i][1] == "Nissan") ||
    (tomorrowHebrewDate.get("Month") == "Sivan" && tomorrowHebrewDate.get("Day") == 5 && tomorrow.getDay() == 6 && data[i][1] == "Sivan"))  {
      if (data[i][0] == 15 || data[i][0] == 21 || data[i][0] == 6) {
        pushInfo(`Tomorrow night, ${getReadable(tomorrow)} night, (${data[i][0]} ${data[i][1]}) is the yartzeit of~`, i);
      }
      if (data[i][0] == 16 || data[i][0] == 22 || data[i][0] == 7) {
        pushInfo(`This coming ${getReadable(addDays(tomorrow, 1))} night, (${data[i][0]} ${data[i][1]}) is the yartzeit of~`, i);
      }
      PropertiesService.getScriptProperties().setProperty("sentUntil", 2);
    }
    // send the 2nd day of Yom Tov on Erev Yom (Rosh Hashana, Sukkos, Shmini Atzeres, Pesach, Shmini Shel Pesach, and Shavuos)
    else {
      if ((tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 1 && data[i][1] == "Tishrei" && data[i][0] == 2) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 15 && data[i][1] == "Tishrei" && data[i][0] == 16) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 22 && data[i][1] == "Tishrei" && data[i][0] == 23) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 15 && data[i][1] == "Nissan" && data[i][0] == 16) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 21 && data[i][1] == "Nissan" && data[i][0] == 22) ||
        (tomorrowHebrewDate.get("Month") == "Sivan" && tomorrowHebrewDate.get("Day") == 6 && data[i][1] == "Sivan" && data[i][0] == 7)) {
          pushInfo(`Tomorrow night, ${getReadable(tomorrow)} night, (${data[i][0]} ${data[i][1]}) is the yartzeit of~`, i);
          if (PropertiesService.getScriptProperties().getProperty("sentUntil") != 2) {
            PropertiesService.getScriptProperties().setProperty("sentUntil", 1);
          }
          //if the day after Yom Tov is Shabbos, send three days after yom tov (Shavuos can't fall out on Thursday)
          if (today.getDay() == 3) {
            if ((tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 1 && data[i][1] == "Tishrei" && data[i][0] == 3) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 15 && data[i][1] == "Tishrei" && data[i][0] == 17) ||
        (tomorrowHebrewDate.get("Month") == "Tishrei" && tomorrowHebrewDate.get("Day") == 22 && data[i][1] == "Tishrei" && data[i][0] == 24) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 15 && data[i][1] == "Nissan" && data[i][0] == 17) ||
        (tomorrowHebrewDate.get("Month") == "Nissan" && tomorrowHebrewDate.get("Day") == 21 && data[i][1] == "Nissan" && data[i][0] == 23)) {
          pushInfo(`This coming ${getReadable(addDays(tomorrow, 1))} night, (${data[i][0]} ${data[i][1]}) is the yartzeit of~`, i);
          PropertiesService.getScriptProperties().setProperty("sentUntil", 2);
          }
        }
      }
    }    
    //In a non-leap year, send yartziets of a leap year. Does not have Adar itself, will be processed in last if statement.
    if (tomorrowHebrewDate.get("Month") == "Adar" && (data[i][1] == "Adar I" || data[i][1] == "Adar II") && tomorrowHebrewDate.get("Day") == data[i][0]) {
      pushInfoWithNote(defaultHead, i, `(The yartzeit is really on ${data[i][0]} ${data[i][1]}, but this year is not a leap year).`);
    }
    //If type of Adar is unknown
    if ((tomorrowHebrewDate.get("Month") == "Adar" || tomorrowHebrewDate.get("Month") == "Adar II") && data[i][1] == "Adar ?" && tomorrowHebrewDate.get("Day") == data[i][0]) {
      pushInfo(defaultHead, i);
    }
    //In leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav.
    if (tomorrowHebrewDate.get("Month") == "Adar I" && data[i][1] == "Adar" && tomorrowHebrewDate.get("Day") == data[i][0]) {
      pushInfoWithNote(defaultHead, i, `The Yartziet is really on ${tomorrowHebrewDate.get("Day")} Adar. In a leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav what you should do`);
    }
    // According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat of a non-leap year
    if (tomorrowHebrewDate.get("Month") == "Shvat" && !isLeapYear(tomorrowHebrewDate.get("Year"))) {
      if (data[i][1] == "Adar I" && tomorrowHebrewDate.get("Day") == data[i][0]) {
      pushInfoWithNote(defaultHead, i, `The Yartzeit is really on ${tomorrowHebrewDate.get("Day")} Adar I. However, According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat in a non-leap year`);
      }
    }
    //send 30 cheshvon on 1 kilev if this year there is no 30 cheshvon
    if (tomorrowHebrewDate.get("Month") == "Kislev" && tomorrowHebrewDate.get("Day") == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" && data[i][1] == "Cheshvan" && data[i][0] == 30) {
        pushInfoWithNote(defaultHead, i,`The Yartzeit is really on 30 Cheshvan. However, this year there is no 30 Cheshvan, so the Yartziet is observed on 1 Kislev`);
      }
    }
    //send 30 kislev on 1 teves if this year there is no 30 kislev
    if (tomorrowHebrewDate.get("Month") == "Teves" && tomorrowHebrewDate.get("Day") == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" && data[i][1] == "Kislev" && data[i][0] == 30) {
         pushInfoWithNote(defaultHead, i, `The Yartzeit is really on 30 Kislev. However, this year there is no 30 Kislev, so the Yartziet is observed on 1 Teves`);
      }
    }
    // send 30 Adar I on 1 Adar in a non - leap year
    if (tomorrowHebrewDate.get("Month") == "Adar" && tomorrowHebrewDate.get("Day") == "1") {
      if (data[i][1] == "Adar I" && data[i][0] == 30) {
       pushInfoWithNote(defaultHead, i, `The Yartzeit is really on 30 Adar I. However, this year isn't a leap year, so the Yartziet is observed on 1 Adar`);
      }
    }
    //last if statement, 
    if (tomorrowHebrewDate.get("Month") == data[i][1] && tomorrowHebrewDate.get("Day") == data[i][0]) {
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
  for (var j = 3; j < 8; j++) {
   yartzeit.push(data[i][j]);
  }
}

function pushInfoWithNote(head, i, note) {
  yartzeit.push(head);
 for (var j = 3; j < 7; j++) {
   if (j == 5) {yartzeit.push(`${data[i][j]}^`); continue;}
   else {yartzeit.push(data[i][j]);}
 }
  yartzeit.push(note);
  yartzeit.push(data[i][7]); //Family Name
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
  var row, html,body = ``;
  var picUrls = [];
  for (var i = 0; i < yartzeit.length; i++) {
    if (yartzeit[i] == "" ) {
      continue;
    }
    if (yartzeit[i].includes("|")) {
      row = parseInt(yartzeit[i].substring(0,yartzeit[i].indexOf("|")));
      body = body.slice(0, -2) + ".";
      html = buildHtml(body, picUrls);
      for (var j in emails) {
        if (j == 0 || emails[j][row] == "") {continue;};
        GmailApp.sendEmail(emails[j][row], "Yartzeit Reminder", "", {
          from: "aribennett1@gmail.com",
          htmlBody: html,
          name: "Yartzeit Reminder"
        });
      }
      console.log("html:" + html);
      console.log("Sent: " + body);
      body = ``; html = ``; row = ``;
      picUrls = [];
      continue;
    }
    else {
      if (yartzeit[i].charAt(0) == "*") {
        picUrls = getUrls(yartzeit[i].substring(1));
      }
      else {
        if (yartzeit[i].charAt(yartzeit[i].length - 1) == "^") {
         yartzeit[i] = yartzeit[i].slice(0, -1);
         body += `${yartzeit[i]}. `;
         continue;
        }
        if (yartzeit[i].charAt(yartzeit[i].length - 1) != "~") {
         body += `${yartzeit[i]}, `;
        }
        else {
          yartzeit[i] = yartzeit[i].slice(0, -1);
          body += `${yartzeit[i]} `;
        }
      }
    }
  }
  yartzeit = []; //reset array, only really here for testing
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

function getUrls(str) {
  return (!str.includes("*") ? [str] : str.split("*"));
}

function buildHtml(body, urlArr) {
var html = `<p>${body}</p>`;
urlArr.length == 1 ? html += `<br /><p>(1 Picture)</p>` : html += `<br /><p>(${urlArr.length} Pictures)</p>`;
for (var i in urlArr) {
  html += `<br /><img src="${urlArr[i]}">`;
}
html += `<p>To update your email preferences, click here: <a href="bit.ly/familyYartzeits">bit.ly/familyYartzeits</a>`;
return html;
}
