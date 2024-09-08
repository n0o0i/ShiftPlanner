const { google } = require('googleapis');
// const config = require('../config/config');
const GOOGLE_FOLDER_ID = process.env.GOOGLE_FOLDER_ID;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
// const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const auth = new google.auth.GoogleAuth({
    keyFile: '/app/backend/config/google_drive_credentials.json',
    // keyFile: './config/google_drive_credentials.json',
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
    ]
})

const drive = google.drive({version: 'v3', auth: auth});
const spreadSheet = google.sheets({version: 'v4', auth: auth});
const gmail = google.gmail({version: 'v1', auth: auth});

exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            // audience: config.GOOGLE_CLIENT_ID,
            audience: GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const name = payload['name'];
        const email = payload['email'];

        res.status(200).json({message: 'User authenticated', name, email});
    } catch (error) {
        res.status(400).json({message: 'Invalid token'});
    }
}

exports.getAllFilesFromGDrive = async () => {
    const params = {
        // q: `'${config.GOOGLE_FOLDER_ID}' in parents and trashed =  false`,
        q: `'${GOOGLE_FOLDER_ID}' in parents and trashed =  false`,
        fields: "nextPageToken, files(id, name)",
    }
    try {
        const res = await drive.files.list(params);
        const files = res.data.files;
        return files;
    } catch (e) {
        throw e;
    }
}

exports.getSekouEvents = async (spreadSheetID) => {
    const sekouEvents = [];
    const today = new Date();
    const thisMonth = today.getMonth();
    const targetMonth = ('0' + (thisMonth + 2)).slice(-2);
    today.setMonth(targetMonth);
    const targetYear = today.getFullYear();
    try {
        const res = await spreadSheet.spreadsheets.values.get({
            spreadsheetId: spreadSheetID,
            range: '案件集計一覧 !B4:E'
        })
        res.data.values.map(event => {
            if (event.length == 4) {
                const date = ('0' + event[0]).slice(-2);
                const place = event[3];
                const backgound = getEventColor(event[3]);
                sekouEvents.push({
                    start: targetYear + '-' + targetMonth + '-' + date,
                    title: place,
                    editable: false,
                    backgroundColor: backgound
                })
            }
        })
        return sekouEvents;
    } catch (e) {
        throw e;
    }
}

const getEventColor = (place) => {
    switch (place) {
        case 'G':
        case 'G1':
        case 'G2':
            return '#247c50'
        case 'L':
        case 'L1':
        case 'L2':
            return '#ffbc00';
        default:
            console.error('unrecognized place: ' + place);
    }   
}

exports.createNewSpreadSheet = async (year, month) => {
    const request = {
        resource: {
            properties: {
                title: year + '　' + month + '月キャストシフト提出'
            }
        }
    };
    const newFile = await spreadSheet.spreadsheets.create(request);
    console.log('new spreadsheet created successfully named ' + newFile.data.properties.title);
    // await moveSpreadsheetToFolder(newFile.data.spreadsheetId, config.GOOGLE_FOLDER_ID);
    await moveSpreadsheetToFolder(newFile.data.spreadsheetId, GOOGLE_FOLDER_ID);
    console.log(newFile.data.spreadsheetId);
    return (newFile.data.spreadsheetId);
}

const moveSpreadsheetToFolder = async (spreadSheetId, folderId) => {
    try {
        await drive.files.update({
            fileId : spreadSheetId,
            addParents: folderId,
            removeParents: 'root',
            fields: 'id, parents'
        });
        console.log('spreadsheet moved successfully');
        return;
    } catch (e) {
        throw e;
    }
}

exports.createHeader = async (spreadSheetId, date) => {
    date.setMonth(date.getMonth() + 1, 0);
    const values = [['タイムスタンプ', 'メールアドレス', '氏名']];
    const dayOfWeek = '日月火水木金土';
    const lastDay = date.getDate();
    for (var i = 1; i <= lastDay; ++i) {
        date.setDate(i);
        const day = date.getDay();
        values[0].push(i + '日(' +  dayOfWeek[day] + ')');
        values[0].push('備考');
    }
    values[0].push('お伝えしたいことがあればご記入ください');
    await spreadSheet.spreadsheets.values.update({
        spreadsheetId: spreadSheetId,
        range: 'A1',
        valueInputOption: 'RAW',
        resource: {
            values: values
        }
    })
}

exports.getSheetId = async (spreadSheetId) => {
    try {
        const res = await spreadSheet.spreadsheets.get({
            spreadsheetId: spreadSheetId,
        })
        const files = res.data.sheets;
        console.log(files);
    } catch (e) {
        throw e;
    }
}

exports.getLastLine = async (spreadSheetId) => {
    const range =  'A:A';
    try { 
        const res = await spreadSheet.spreadsheets.values.get({
            spreadsheetId: spreadSheetId,
            range,
        });
        const values = res.data.values;
        if (!values || values.length === 0) {
            console.log('no data found');
        } else {
            console.log('last line: ' + values.length);
            return values.length;
        }
    } catch (e) {
        throw e;
    }
}

exports.inputSpreadsheet = async (spreadSheetId, range, values) => {
    spreadSheet.spreadsheets.values.update({
        spreadsheetId: spreadSheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values: values
        }
    }, (err, response) => {
        if (err) {
            throw err;
        }
        console.log('updated cells: ', response.data.updatedCells);
    })
}

exports.getSubmittedEmailList = async (spreadSheetId) => {
    const range = 'B:B';
    try { 
        const res = await spreadSheet.spreadsheets.values.get({
            spreadsheetId: spreadSheetId,
            range,
        });
        const values = res.data.values;
        return values;
    } catch (e) {
        throw e;
    }
}

exports.getSubmittedShift = async (spreadSheetId, emailIndex) => {
    try {
        const sheetTitle = await getSheetTitleByIndex(spreadSheetId, 0);
        const sheetValues = await getSheetValuesBySheetTitleAndRowIndex(spreadSheetId, sheetTitle, emailIndex);
        const shiftWithBikou = sheetValues.slice(3, sheetValues.length - 1);
        const shiftWOBikou = shiftWithBikou.filter((shift, index) => {
            if(index % 2 == 0) {
                return shift;
            }
        })
        return shiftWOBikou;
    } catch (e) {
        throw new Error('failed to get values for getSubmittedShift; ' + e);
    }
}

const getSheetTitleByIndex = async (spreadSheetId, index) => {
    try {
        const res = await spreadSheet.spreadsheets.get({
            spreadsheetId:spreadSheetId,
            fields: "sheets/properties/title"
        });
        const sheetTitle = res.data.sheets[index].properties.title;
        return sheetTitle;
    } catch (e) {
        throw new Error('failed to get values for getSheetTitleByIndex; ' + e);
    }
}

/**
 * 
 * @param {*} spreadSheetId 
 * @param {*} sheetTitle 
 * @param {*} index 
 * @returns {*} - rowValues
 * 
 * Notes; index starts from 0
 */
const getSheetValuesBySheetTitleAndRowIndex = async (spreadSheetId, sheetTitle, index) => {
    const res = await spreadSheet.spreadsheets.values.batchGet({
        spreadsheetId: spreadSheetId,
        ranges: sheetTitle 
    })
    const rowIndex = index;
    return res.data.valueRanges[0].values[rowIndex];
}