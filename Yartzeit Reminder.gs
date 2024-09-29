const sheet = SpreadsheetApp.openById("1dwd73mDGAOcbA_cjX-e76zgi-8nX9WiFE0pRDHpd794");
const data = sheet.getSheets()[1].getDataRange().getValues();
const emails = sheet.getSheets()[0].getDataRange().getValues();
var yartzeit = [];
var isTomorrow = true;
var today = new Date();  // date format: "3/29/2022" (with quotes)
function main() {
   if (PropertiesService.getScriptProperties().getProperty("lastDaySent") == today.getDay()) {
console.log("Yartzeit was sent for today, exiting...");
return; //this should be "continue" when testing! (not "return")
}
else {
  PropertiesService.getScriptProperties().setProperty("lastDaySent", today.getDay());  
console.log("lastDaySent: " + PropertiesService.getScriptProperties().getProperty("lastDaySent"));
}
    if (PropertiesService.getScriptProperties().getProperty("sentUntil") > 0) {
    PropertiesService.getScriptProperties().setProperty("sentUntil", PropertiesService.getScriptProperties().getProperty("sentUntil") - 1);
    console.log("Today's yartzeit were already sent, exiting...");
    return; 
  }
  for (var x = 1; x < 3; x++) {
    if (x == 2) {isTomorrow = false; today = addDays(today, 1);} 
  var tomorrow = addDays(today, 1);
  const tomorrowHebrewDate = getHebrewDate(tomorrow);
  var tomorrowHebrewDay = tomorrowHebrewDate.get("Day");
  var tomorrowHebrewMonth = tomorrowHebrewDate.get("Month");
  var tomorrowHebrewYear = tomorrowHebrewDate.get("Year");  
  console.log(`${tomorrowHebrewDay} ${tomorrowHebrewMonth}`);
  const defaultHead = `Tonight, ${getReadable(today)}, (${tomorrowHebrewDay} ${tomorrowHebrewMonth})`;
  for (var i in data) {
    if (i == 0) {continue;}
    // if erev Pesach, erev Shmini Shel Pesach, or erev Shavuos is Shabbos, send next three days on Friday (Rosh Hashana Sukkos, and Shmini Atzeres can't be on a Sunday)
    if ((tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 14 && tomorrow.getDay() == 6 && data[i][1] == "Nissan") ||
    (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 20 && tomorrow.getDay() == 6 && data[i][1] == "Nissan") ||
    (tomorrowHebrewMonth == "Sivan" && tomorrowHebrewDay == 5 && tomorrow.getDay() == 6 && data[i][1] == "Sivan"))  {
      if (data[i][0] == 15 || data[i][0] == 21 || data[i][0] == 6) {
        pushInfo(`Tomorrow night, ${getReadable(tomorrow)}, (${data[i][0]} ${data[i][1]})`, i, tomorrowHebrewYear);
      }
      if (data[i][0] == 16 || data[i][0] == 22 || data[i][0] == 7) {
        pushInfo(`This coming ${getReadable(addDays(tomorrow, 1))}, (${data[i][0]} ${data[i][1]})`, i, tomorrowHebrewYear);
      }
      setSentUntil(2);
    }
    // send the 2nd day of Yom Tov on Erev Yom (Rosh Hashana, Sukkos, Shmini Atzeres, Pesach, Shmini Shel Pesach, and Shavuos)
    else {
      if ((tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 1 && data[i][1] == "Tishrei" && data[i][0] == 2) ||
        (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 15 && data[i][1] == "Tishrei" && data[i][0] == 16) ||
        (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 22 && data[i][1] == "Tishrei" && data[i][0] == 23) ||
        (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 15 && data[i][1] == "Nissan" && data[i][0] == 16) ||
        (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 21 && data[i][1] == "Nissan" && data[i][0] == 22) ||
        (tomorrowHebrewMonth == "Sivan" && tomorrowHebrewDay == 6 && data[i][1] == "Sivan" && data[i][0] == 7)) {
          pushInfo(`Tomorrow night, ${getReadable(tomorrow)}, (${data[i][0]} ${data[i][1]})`, i, tomorrowHebrewYear);
          if (PropertiesService.getScriptProperties().getProperty("sentUntil") != 2) {
            setSentUntil(1);
          }
          //if the day after Yom Tov is Shabbos, send three days after yom tov (Shavuos can't fall out on Thursday)
          if (today.getDay() == 3) {
            if ((tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 1 && data[i][1] == "Tishrei" && data[i][0] == 3) ||
        (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 15 && data[i][1] == "Tishrei" && data[i][0] == 17) ||
        (tomorrowHebrewMonth == "Tishrei" && tomorrowHebrewDay == 22 && data[i][1] == "Tishrei" && data[i][0] == 24) ||
        (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 15 && data[i][1] == "Nissan" && data[i][0] == 17) ||
        (tomorrowHebrewMonth == "Nissan" && tomorrowHebrewDay == 21 && data[i][1] == "Nissan" && data[i][0] == 23)) {
          pushInfo(`This coming ${getReadable(addDays(tomorrow, 1))}, (${data[i][0]} ${data[i][1]})`, i, tomorrowHebrewYear);
          setSentUntil(2);
          }
        }
      }
    }    
    //In a non-leap year, send yartziets of a leap year. Does not have Adar itself, will be processed in last if statement.
    if (tomorrowHebrewMonth == "Adar" && (data[i][1] == "Adar I" || data[i][1] == "Adar II") && tomorrowHebrewDay == data[i][0]) {
      pushInfoWithNote(defaultHead, i, tomorrowHebrewYear, `(The yartzeit is really on ${data[i][0]} ${data[i][1]}, but this year is not a leap year)`);
    }
    //If type of Adar is unknown
    if ((tomorrowHebrewMonth == "Adar" || tomorrowHebrewMonth == "Adar II") && data[i][1] == "Adar ?" && tomorrowHebrewDay == data[i][0]) {
      pushInfo(defaultHead, i, tomorrowHebrewYear);
    }
    //In leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav.
    if (tomorrowHebrewMonth == "Adar I" && data[i][1] == "Adar" && tomorrowHebrewDay == data[i][0]) {
      pushInfoWithNote(defaultHead, i, tomorrowHebrewYear, `The Yartziet is really on ${tomorrowHebrewDay} Adar. In a leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav what you should do`);
    }
    // According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat of a non-leap year
    if (tomorrowHebrewMonth == "Shvat" && !isLeapYear(tomorrowHebrewDate.get("Year"))) {
      if (data[i][1] == "Adar I" && tomorrowHebrewDay == data[i][0]) {
      pushInfoWithNote(defaultHead, i, tomorrowHebrewYear, `The Yartzeit is really on ${tomorrowHebrewDay} Adar I. However, According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat in a non-leap year`);
      }
    }
    //send 30 cheshvon/kislev/ on 1 kilev/teves if this year there is no 30 cheshvon/kislev
    if ((tomorrowHebrewMonth == "Kislev" || tomorrowHebrewMonth == "Teves") && tomorrowHebrewDay == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" /*not 30*/ && (data[i][1] == "Cheshvan" || data[i][1] == "Kislev") && data[i][0] == 30) {
        pushInfoWithNote(defaultHead, i, tomorrowHebrewYear,`The Yartzeit is really on 30 ${data[i][1]}. However, this year there is no 30 ${data[i][1]}, so the Yartziet is observed on 1 ${tomorrowHebrewMonth}`);
      }
    }
    // send 30 Adar I on 1 Adar in a non - leap year
    if (tomorrowHebrewMonth == "Adar" && tomorrowHebrewDay == "1") {
      if (data[i][1] == "Adar I" && data[i][0] == 30) {
       pushInfoWithNote(defaultHead, i, tomorrowHebrewYear, `The Yartzeit is really on 30 Adar I. However, this year isn't a leap year, so the Yartziet is observed on 1 Adar`);
      }
    }
    //last if statement, does regular yartzeit
    if (tomorrowHebrewMonth == data[i][1] && tomorrowHebrewDay == data[i][0]) {
      pushInfo(defaultHead, i, tomorrowHebrewYear);
    }
  }
  if (yartzeit.length != 0) {
    buildEmail();
  }
  else {
    console.log(`No Yartzeit ${isTomorrow ? "Tomorrow" : "in two days"}`);
  }
  }
}

function pushInfo(head, i, thisYear, note = '') {
    yartzeit.push(head);
    for (var j = 2; j < 8; j++) {
        if (j == 2) {
            yartzeit.push(getNumOfYear(data[i][j], thisYear));
            continue;
        }
        if (j == 5 && note !== '') {
            yartzeit.push(`${data[i][j]}^`);
            continue;
        }
        yartzeit.push(data[i][j]);
    }
    if (note !== '') {
        yartzeit.push(note);
    }
        yartzeit.push(data[i][8]); // Family Name
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

function buildEmail() {
  var body = ``;
  var vidUrls = [];
  var picUrls = [];
  for (var i = 0; i < yartzeit.length; i++) {
    if (yartzeit[i] == "" ) {
      continue;
    }    
    if (yartzeit[i].includes("|")) {
      sendEmail(yartzeit[i], body, picUrls, vidUrls)
      body = ``;
      picUrls = [];
      vidUrls = [];
      continue;
    }
    else {
      if (yartzeit[i].charAt(0) == "*" || yartzeit[i].charAt(0) == "#") {
        if (yartzeit[i].charAt(0) == "*") {
        picUrls = getUrls(yartzeit[i].substring(1), "*");
        }
        if (yartzeit[i].charAt(0) == "#") {
        vidUrls = getUrls(yartzeit[i].substring(1), "#");
          for (var j in vidUrls) {
            vidUrls[j] = vidUrls[j].replace(/([^:]+): ([^ ]+) Alternate Link: ([^ ]+)/g, '$1: <a href="$2">$2</a> Alternate Link: <a href="$3">$3</a>');
          }        
        }
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
  yartzeit = [];
}

function sendEmail(yartzeit, body, picUrls, vidUrls) {
const row = parseInt(yartzeit.substring(0,yartzeit.indexOf("|")));
body = body.slice(0, -2) + ".";
var  html = buildHtml(body, picUrls, vidUrls);
if (!isTomorrow) {
  GmailApp.sendEmail("slot700@gmail.com", "TEST Yartzeit Reminder", "", {
          from: "aribennett1@gmail.com",
          htmlBody: html,
          name: "Yartzeit Reminder"
        });
  console.log("Sent email for in 2 days");
}
else {
      for (var j in emails) {
        if (j == 0 || emails[j][row] == "") {continue;};
        GmailApp.sendEmail(emails[j][row], "Yartzeit Reminder", "", {
          from: "aribennett1@gmail.com",
          htmlBody: html,
          name: "Yartzeit Reminder"
        });
      }
      console.log("Sent email for tomorrow");
}         
      console.log("html:" + html);
      console.log("Sent: " + body);
      console.log(`RemainingDailyQuota: ${MailApp.getRemainingDailyQuota()}`);
}

function getReadable(day) {
  if (day.getDay() == 6) {
    return `Motzei Shabbos`;}  
  else {
    return `${new Date(day).toLocaleDateString('en-us', { weekday:"long"})} night`;
  }
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isLeapYear(year) {
    return (((year * 7) + 1) % 19) < 7;
}

function getUrls(str, delimiter) {  
  !str.includes(delimiter) ? str = [str] : str = str.split(delimiter);
  if (delimiter == "*") {
  for (var i = 0; i < str.length; i++) {
    str[i] = `https://lh3.googleusercontent.com/d/${str[i].substring(str[i].indexOf("d/") + 2, str[i].indexOf("/view"))}=s750?authuser=0`;
  }
  }
  return str;
}

function setSentUntil(days) {
  if (isTomorrow) {PropertiesService.getScriptProperties().setProperty("sentUntil", days);}
}

function buildHtml(body, picUrlArr, vidUrlArr) {
var html = `<p>${body}</p>`;
vidUrlArr.length == 1 ? html += `<p>1 Video</p>` : html += `<p>${vidUrlArr.length} Videos</p>`;
html += "<ul>";
for (var i in vidUrlArr) {
  html += `<li>${vidUrlArr[i]}</li>`;
}
html += `</ul><p>If you'd like to record a video (or just record audio) for someone's yartzeit, please email me at <a href="mailto:aribennett1@gmail.com">aribennett1@gmail.com.</a></p>`;
picUrlArr.length == 1 ? html += `<p>1 Picture</p>` : html += `<p>${picUrlArr.length} Pictures</p>`;
for (var i in picUrlArr) {
  html += `<p><img src="${picUrlArr[i]}"></p>`;
}
html += `<p>To update your email preferences, click here: <a href="bit.ly/familyYartzeits">bit.ly/familyYartzeits</a>`;
return html;
}

function getNumOfYear(yartzeitYear, thisYear) {
  if (yartzeitYear == "") {
    return `is the yartzeit of~`
  }
  const num = thisYear - parseInt(yartzeitYear.substring(yartzeitYear.indexOf("/") + 1));
  return `is the ${num}${getSuffix(num)} yartzeit of~`;
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
