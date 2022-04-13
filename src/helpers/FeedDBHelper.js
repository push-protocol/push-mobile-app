import SQLite from 'react-native-sqlite-2'

import AppBadgeHelper from 'src/helpers/AppBadgeHelper'
import MetaStorage from 'src/singletons/MetaStorage'

// FeedDB Helper Function
const FeedDBHelper = {
  // To Get DB Connection
  getDB: function () {
    const db = SQLite.openDatabase(
      'feedDB.db',
      '1.0',
      'Feed DB',
      1,
      FeedDBHelper.openCB,
      FeedDBHelper.errorCB,
    )
    return db
  },
  // To Get the table name
  getTable: () => {
    const tableName = 'feed'
    return tableName
  },
  // To Create Table, can also be used to purge
  createTable: async (db) => {
    const table = FeedDBHelper.getTable()

    // Prepare statement
    const nid = 'nid INTEGER PRIMARY KEY NOT NULL'
    const sid = 'sid INTEGER'
    const type = 'type INTEGER NOT NULL'
    const app = 'app TEXT NOT NULL'
    const icon = 'icon TEXT NOT NULL'
    const url = 'url TEXT NOT NULL'
    const appbot = 'appbot BOOL'
    const secret = 'secret INTEGER'
    const asub = 'asub TEXT'
    const amsg = 'amsg TEXT NOT NULL'
    const acta = 'acta TEXT'
    const aimg = 'aimg TEXT'
    const hidden = 'hidden INTEGER'
    const epoch = 'epoch INTEGER'

    const dropTable = `DROP TABLE IF EXISTS ${table}`
    const createTable = `CREATE TABLE IF NOT EXISTS ${table} (${nid}, ${sid}, ${type}, ${app}, ${icon}, ${url}, ${appbot}, ${secret}, ${asub}, ${amsg}, ${acta}, ${aimg}, ${hidden}, ${epoch})`

    await FeedDBHelper.runQuery(db, dropTable)
    await FeedDBHelper.runQuery(db, createTable)
  },

  // To get Feeds, return Object of Objects
  getFeeds: async (db, startIndex, numRows, isHistorical) => {
    // RETURN ARRAY OF OBJECTS (JSON) or empty array if no feed remaining
    // JSON FORMAT OF OBJECT
    // {
    //   notificationID: String
    //   notificationType: Integer (1 - normal notification, 2 - encrypted)
    //   appName: String
    //   appIcon: String
    //   appURL: String
    //   appbot: Bool
    //   secret: String (is the encrypted secret that needs to be used to decrypt msgData if notification type is 2)
    //   msgData: JSON String, can be encrypted or unencrpyted as per notificationType
    //   timeInEpoch: Integer
    // }

    const table = FeedDBHelper.getTable()

    let response = []

    // Prepare statement | Pulling forward
    let order = 'DESC'
    let query = `SELECT * FROM ${table} ORDER BY nid ${order}, epoch ${order} LIMIT ${numRows} OFFSET ${startIndex}`

    // Pulling history
    if (isHistorical) {
      order = 'ASC' // Pulling history
      query = `SELECT * FROM ${table} ORDER BY epoch ${order}, nid ${order} LIMIT ${numRows} OFFSET ${startIndex}`
      console.log(query)
    }

    const res = await FeedDBHelper.runQuery(db, query, response)

    const feedItems = res.rows
    for (let i = 0; i < feedItems.length; ++i) {
      const feedItem = feedItems.item(i)
      response.push(feedItem)
    }

    //console.log(feedItems.length);

    return response
  },
  // To add Feed from Payload Object
  addFeedFromPayloadObject: async (db, payload) => {
    FeedDBHelper.addFeedFromPayload(
      db,
      payload.sid,
      payload.type,
      payload.app,
      payload.icon,
      payload.url,
      payload.appbot,
      payload.secret,
      payload.sub,
      payload.msg,
      payload.cta,
      payload.img,
      payload.hidden,
      payload.epoch,
    )
  },
  // To Add Feed coming from Notification or Appbot
  addFeedFromPayload: async (
    db,
    sidV,
    typeV,
    appV,
    iconV,
    urlV,
    appbotV,
    secretV,
    asubV,
    amsgV,
    actaV,
    aimgV,
    hiddenV,
    epochV,
  ) => {
    await FeedDBHelper.addRawFeed(
      db,
      sidV,
      typeV,
      appV,
      iconV,
      urlV,
      appbotV,
      secretV,
      asubV,
      amsgV,
      actaV,
      aimgV,
      hiddenV,
      epochV,
    )
  },
  // To Add Raw Feed
  addRawFeed: async (
    db,
    sidV,
    typeV,
    appV,
    iconV,
    urlV,
    appbotV,
    secretV,
    asubV,
    amsgV,
    actaV,
    aimgV,
    hiddenV,
    epochV,
  ) => {
    // Everything is assumed as string so convert them if undefined
    sidV = sidV == undefined ? 0 : parseInt(sidV)
    typeV = typeV == undefined ? 0 : parseInt(typeV)
    appV = appV == undefined ? '' : appV
    iconV = iconV == undefined ? '' : iconV
    urlV = urlV == undefined ? '' : urlV
    appbotV = appbotV == undefined || parseInt(appbotV) == 0 ? 0 : 1
    secretV = secretV == undefined ? '' : secretV
    asubV = asubV == undefined ? '' : asubV
    amsgV = amsgV == undefined ? '' : amsgV
    actaV = actaV == undefined ? '' : actaV
    aimgV = aimgV == undefined ? '' : aimgV
    hiddenV = hiddenV == undefined || parseInt(hiddenV) == 0 ? 0 : 1
    epochV =
      epochV == undefined
        ? parseInt(new Date().getTime() / 1000)
        : parseInt(epochV)

    // Checks first
    let shouldProceed = true
    if (
      appV.length == 0 ||
      iconV.length == 0 ||
      urlV.length == 0 ||
      amsgV.length == 0
    ) {
      shouldProceed = false
    }

    // DB Related
    const table = FeedDBHelper.getTable()

    // prepare
    const sid = 'sid'
    const type = 'type'
    const app = 'app'
    const icon = 'icon'
    const url = 'url'
    const appbot = 'appbot'
    const secret = 'secret'
    const asub = 'asub'
    const amsg = 'amsg'
    const acta = 'acta'
    const aimg = 'aimg'
    const hidden = 'hidden'
    const epoch = 'epoch'

    const insertRows = `${sid}, ${type}, ${app}, ${icon}, ${url}, ${appbot}, ${secret}, ${asub}, ${amsg}, ${acta}, ${aimg}, ${hidden}, ${epoch}`

    const query = `INSERT INTO ${table} (${insertRows}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    if (shouldProceed) {
      const res = await FeedDBHelper.runQuery(db, query, [
        sidV,
        typeV,
        appV,
        iconV,
        urlV,
        appbotV,
        secretV,
        asubV,
        amsgV,
        actaV,
        aimgV,
        hiddenV,
        epochV,
      ])

      if (res) {
        // Finally update badge
        const currentBadge = await MetaStorage.instance.getBadgeCount()
        const newBadge = currentBadge + 1
        await MetaStorage.instance.setBadgeCount(newBadge)

        // And App Badge as well
        await AppBadgeHelper.setAppBadgeCount(newBadge)
      } else {
        shouldProceed = false
      }
    }

    if (!shouldProceed) {
      console.log('Valdiation Failed!!!')
      console.log('--------------------')

      console.log("sid ==> '" + sidV + "' (" + typeof sidV + ')')
      console.log("type ==> '" + typeV + "' (" + typeof typeV + ')')
      console.log(
        "app ==> '" +
          appV +
          "' (" +
          typeof appV +
          ')' +
          '(Length: ' +
          appV.length +
          ')',
      )
      console.log(
        "icon ==> '" +
          iconV +
          "' (" +
          typeof iconV +
          ')' +
          '(Length: ' +
          iconV.length +
          ')',
      )
      console.log(
        "url ==> '" +
          urlV +
          "' (" +
          typeof urlV +
          ')' +
          '(Length: ' +
          urlV.length +
          ')',
      )
      console.log("appbot ==> '" + appbotV + "' (" + typeof appbotV + ')')
      console.log("secret ==> '" + secretV + "' (" + typeof secretV + ')')
      console.log("asub ==> '" + asubV + "' (" + typeof asubV + ')')
      console.log(
        "amsg ==> '" +
          amsgV +
          "' (" +
          typeof amsgV +
          ')' +
          '(Length: ' +
          amsgV.length +
          ')',
      )
      console.log("acta ==> '" + actaV + "' (" + typeof actaV + ')')
      console.log("aimg ==> '" + aimgV + "' (" + typeof aimgV + ')')
      console.log("hidden ==> '" + hiddenV + "' (" + typeof hiddenV + ')')
      console.log("epoch ==> '" + epochV + "' (" + typeof epochV + ')')
    }
  },
  // To hide a specific feed Item
  hideFeedItem: async (db, nid) => {
    const table = FeedDBHelper.getTable()

    const query = `UPDATE ${table} SET hidden=1 WHERE nid=${nid}`
    await FeedDBHelper.runQuery(db, query)
  },
  // To unhide a specific feed Item
  unhideFeedItem: async (db, nid) => {
    const table = FeedDBHelper.getTable()

    const query = `UPDATE ${table} SET hidden=0 WHERE nid=${nid}`
    await FeedDBHelper.runQuery(db, query)
  },
  // to unhide all feeds
  unhideAllFeedItems: async (db) => {
    const table = FeedDBHelper.getTable()

    // prepare
    const query = `UPDATE ${table} SET hidden=0 WHERE hidden=1`
    await FeedDBHelper.runQuery(db, query)
  },
  // to delete specific feed
  deleteFeed: async (db, nid) => {
    const table = FeedDBHelper.getTable()

    // prepare
    const query = `DELETE FROM ${table} WHERE nid=${nid}`
    await FeedDBHelper.runQuery(db, query)
  },
  // to create dummy feed
  createDummyFeed: async (db) => {},
  // Helper Function to validate item, check empty, trim, null, etc
  validateItem: (item) => {
    const str = item.trim()
    return str && str.length > 0
  },
  // Helper function to return promise of sql statement, 1 transaction only
  runQuery(db, query, args = []) {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(query, args, (tx, res) => resolve(res), reject)
      })
    })
  },
  // Logging and testing functions below
  addLog: (msg, info) => {
    console.log(msg)

    if (info) {
      console.log(info)
    }
  },
  // error callback
  errorCB: (err) => {
    console.error('error:', err)
    FeedDBHelper.addLog('Error: ', err.message || err)

    return false
  },
  // On success callback
  successCB: () => {
    //FeedDBHelper.addLog('SQL Executed...')
  },
  // On open callback
  openCB: () => {
    //FeedDBHelper.addLog('Database OPEN')
  },
}

export default FeedDBHelper
