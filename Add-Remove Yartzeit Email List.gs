const sheet = SpreadsheetApp.openById("1dwd73mDGAOcbA_cjX-e76zgi-8nX9WiFE0pRDHpd794");
const formSheet = sheet.getSheets()[2];
const formData = formSheet.getDataRange().getValues();
const emailsSheet = sheet.getSheets()[0];
const emailsData = emailsSheet.getDataRange().getValues();

function main(e) {
  // ScriptApp.newTrigger("main").forSpreadsheet(sheet).onFormSubmit().create(); //trigger
  e.values[1] == "Subscribe" ? addEmail(e.values[4].split(", "), e.values[5]) : removeEmail(e.values[2].split(", "), e.values[3]);  
}

function addEmail(family, email) {
var location, lastRow, col;
for (var i in family) {
  col = getFamilyCol(family[i]);
  lastRow = getFirstBlankRowInCol(col) + 1;
  location = isEmailPresent(col, lastRow, email);
  if (location == -1) {
    emailsSheet.getRange((String.fromCharCode('A'.charCodeAt(0) + col)) + lastRow).setValue(email);
    console.log(`Added ${email} to ${family[i]}`);
    }
  else {
    console.log(`Did not add ${email} to ${family[i]}, already subscribed`);
  }
 }
}

function getFamilyCol(family) {
  for (var i = 0; i < emailsSheet.getLastColumn(); i++) {
    if (emailsData[0][i].toString().includes(family)) {
      return i;
    }
  }
}

function getFirstBlankRowInCol(col) {
  for (var row = 1; row < emailsSheet.getLastRow(); row++) {
    if (emailsData[row][col].toString() == "") {
      return row;
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
      col = String.fromCharCode('A'.charCodeAt(0) + col);
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
  for (var row = 1; row < lastRow; row++) {
    if (emailsData[row][col].toString() == email) {
      return row + 1;
    }
  }
  return -1;
}
