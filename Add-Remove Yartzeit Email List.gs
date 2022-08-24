const sheet = SpreadsheetApp.openById(/*Insert ID Here*/);
const formSheet = sheet.getSheets()[2];
const formData = formSheet.getDataRange().getValues();
const emailsSheet = sheet.getSheets()[0];
const emailsData = emailsSheet.getDataRange().getValues();

function main(e) {
  // ScriptApp.newTrigger("main").forSpreadsheet(sheet).onFormSubmit().create(); //trigger
  var latestEntry = [];
  var values = e.values;
  for (var i = 1; i < values.length; i++) {if (values[i] != "") {latestEntry.push(values[i]);}}
  latestEntry[1] = latestEntry[1].split(", ");
  latestEntry[0] == "Subscribe" ? addEmail(latestEntry[1], latestEntry[2]) : removeEmail(latestEntry[1], latestEntry[2]);  
}

function addEmail(family, email) {
var location, lastRow, col;
for (var i in family) {
  col = getFamilyCol(family[i]);
  lastRow = getFirstBlankRowInCol(col);
  location = isEmailPresent(col, lastRow, email);
  if (location == -1) {
    emailsSheet.getRange(col + lastRow).setValue(email);
    console.log(`Added ${email} to ${family[i]}`);
    }
  else {
    console.log(`Did not add ${email} to ${family[i]}, already subscribed`);
  }
  }
}

function getFamilyCol(family) {
  var cellRow;
  for (var i = 0; i < emailsSheet.getLastColumn(); i++) {
    if (emailsData[0][i].toString().includes(family)) {
      cellRow = i;
      break;
    }
  }
  return String.fromCharCode('A'.charCodeAt(0) + cellRow);
}

function getFirstBlankRowInCol(col) {
  for (var i = 1; i <= emailsSheet.getLastRow(); i++) {
    if (emailsSheet.getRange(col + i).getValue() == "") {
      return i;
    }
  }
  return emailsSheet.getLastRow() + 1;
}

function removeEmail(family, email){
var location, lastRow, col;
  for (var i in family) {
    col = getFamilyCol(family[i]);
    lastRow = getFirstBlankRowInCol(col);
    location = isEmailPresent(col, lastRow, email);
    if (location != -1) {
      emailsSheet.getRange(col + location).clearContent();
      console.log(`Removed ${email} from ${family[i]}`);
      while (location < lastRow) {
      emailsSheet.getRange(col + (location + 1)).moveTo(emailsSheet.getRange(col + location++));
      }
    }
    else {
      console.log(`Did not remove ${email} from ${family[i]}, was not subscribed`);
    }
  }
}

function isEmailPresent(col, lastRow, email) {
  for (var i = 1; i <= lastRow; i++) {
    if (emailsSheet.getRange(col + i).getValue() == email) {
      return i;
    }
  }
  return -1;
}
