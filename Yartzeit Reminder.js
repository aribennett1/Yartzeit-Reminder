function main() {  
  var today = new Date("11/11/2022");  // date format: "3/29/2022" (with quotes)
  var data = SpreadsheetApp.openById("1dwd73mDGAOcbA_cjX-e76zgi-8nX9WiFE0pRDHpd794").getSheets()[0].getDataRange().getValues();
  var yartzeit = [];
  const hebrewDate = getHebrewDate(addDays(today, 1));
  console.log(`${hebrewDate.get("Day")} ${hebrewDate.get("Month")}`);
  for (var i in data) {
    if (i == 0) {continue;}
    //In a non-leap year, send yartziets of a leap year. Does not have Adar itself, will be processed in last if statement.
    if (hebrewDate.get("Month") == "Adar" && (data[i][2] == "Adar I" || data[i][2] == "Adar II") && hebrewDate.get("Day") == data[i][3]) {
      yartzeit = pushInfo(yartzeit, data, i, `(The yartzeit is really on ${data[i][3]} ${data[i][2]}, but this year is not a leap year).`);
    }
    //In leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav.
    if (hebrewDate.get("Month") == "Adar I" && data[i][2] == "Adar" && hebrewDate.get("Day") == data[i][3]) {
      yartzeit = pushInfo(yartzeit, data, i, `The Yartziet is really on ${hebrewDate.get("Day")} Adar. In a leap year, yartziets for non-leap years are observed in Adar I. However, this is a big machlokes, so ask a rav what you should do.`);
    }
    // According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat of a non-leap year
    if (hebrewDate.get("Month") == "Shvat" && !isLeapYear(hebrewDate.get("Year"))) {
      if (data[i][2] == "Adar I" && hebrewDate.get("Day") == data[i][3]) {
      yartzeit = pushInfo(yartzeit, data, i, `The Yartzeit is really on ${hebrewDate.get("Day")} Adar I. However, According to the Piskei Teshuvos, some "Chassidim" observe the yartzits of Adar I in Shvat in a non-leap year.`);
      }
    }
    //send 30 cheshvon on 1 kilev if this year there is no 30 cheshvon
    if (hebrewDate.get("Month") == "Kislev" && hebrewDate.get("Day") == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" && data[i][2] == "Cheshvan" && data[i][3] == 30) {
        yartzeit = pushInfo(yartzeit, data, i,`The Yartzeit is really on 30 Cheshvan. However, this year there is no 30 Cheshvan, so the Yartziet is observed on 1 Kislev.`);
      }
    }
    //send 30 kislev on 1 teves if this year there is no 30 kislev
    if (hebrewDate.get("Month") == "Teves" && hebrewDate.get("Day") == "1") {
      let hebrewDate = getHebrewDate(today);
      if (hebrewDate.get("Day") == "29" && data[i][2] == "Kislev" && data[i][3] == 30) {
         yartzeit = pushInfo(yartzeit, data, i, `The Yartzeit is really on 30 Kislev. However, this year there is no 30 Kislev, so the Yartziet is observed on 1 Teves.`);
      }
    }
    // send 30 Adar I on 1 Adar in a non - leap year
    if (hebrewDate.get("Month") == "Adar" && hebrewDate.get("Day") == "1") {
      if (data[i][2] == "Adar I" && data[i][3] == 30) {
       yartzeit = pushInfo(yartzeit, data, i, `The Yartzeit is really on 30 Adar I. However, this year isn't a leap year, so the Yartziet is observed on 1 Adar.`);
      }
    }
    //last if statement, 
    if (hebrewDate.get("Month") == data[i][2] && hebrewDate.get("Day") == data[i][3]) {
      for (var j = 5; j < 9; j++) {
        yartzeit.push(data[i][j]);
      }
    }
  }
  if (yartzeit.length != 0) {
    emailYartzeit(yartzeit, today, (`${hebrewDate.get("Day")} ${hebrewDate.get("Month")}`), data);
  }
  else {
    console.log("No Yartzeit Tomorrow");
  }
}

function pushInfo(yartzeit, data, i, note) {
 for (var j = 5; j < 8; j++) {
    yartzeit.push(data[i][j]);
  }
  yartzeit.push(". " + note);
  yartzeit.push(data[i][8]); //Family Name
  return yartzeit;
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

function emailYartzeit(yartzeit, tonight, hebrewDate, data) {

  tonight = getReadable(tonight);
  var row;
  var bodyHead = `Tonight, ${tonight} night, (${hebrewDate}) is the yartzeit of `;
  var body = ``;
  for (var i = 0; i < yartzeit.length; i++) {
    if (yartzeit[i] == "" ) {
      continue;
    }
    if (yartzeit[i] == "Bennett" || yartzeit[i] == "Greenberg" ) {
      if (yartzeit[i] == "Bennett") {
        row = 0;
      }
      if (yartzeit[i] == "Greenberg") {
        row = 1;
      }
      if (body.charAt(body.length - 1) == " ") {
      body = body.slice(0, -2) + ".";
      }
      for (var j in data) {
        if (j == 0 || data[j][0] == "") {continue;}
        GmailApp.sendEmail(data[j][row], "Yartzeit Reminder", bodyHead + body, {
          from: "aribennett1@gmail.com",
          name: "Yartzeit Reminder"
        });
      }
      console.log(hebrewDate);
      console.log("Sent: " + bodyHead + body);
      body = ``;
      continue;
    }
    else {
      if (yartzeit[i].charAt(0) != ".") {
      body += `${yartzeit[i]}, `;
      }
      else {
        body = body.slice(0, -2)
        body += yartzeit[i];
      }
    }
  }
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
